import fetch from 'node-fetch';
import {promises as fs} from 'fs';
import Customers from './resources/Customers.js';
import DirectDebitMandates from './resources/DirectDebitMandates.js';
import Invoices from './resources/Invoices.js';
import * as errors from './Error.js';

export default class Adfin {
  constructor(config = {}) {
    // OAuth2 configuration
    this.clientId = config.client_id;
    this.clientSecret = config.client_secret;
    this.code = config.code;
    this.redirectUri = config.redirect_uri;

    const apiUrl = new URL(config.url || 'https://api.adfin.com');
    if (apiUrl.protocol !== 'https:') {
      throw new Error('Adfin API base URL must use HTTPS');
    }
    this.baseURL = apiUrl.origin;

    // Fetch implementation (allows overriding for tests)
    this.fetch = config.fetch || fetch;
    
    // Token storage
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;

    // Pluggable persistence layer
    this.loadToken = async () => null;
    this.saveToken = async () => {};

    if (config.tokenFile) {
      this.loadToken = async () => {
        try {
          const raw = await fs.readFile(config.tokenFile, 'utf8');
          return JSON.parse(raw);
        } catch (e) {
          return null;
        }
      };
      this.saveToken = async (data) => {
        await fs.writeFile(
          config.tokenFile,
          JSON.stringify(data),
          {encoding: 'utf8', mode: 0o600}
        );
      };
    } else {
      if (typeof config.loadToken === 'function') {
        this.loadToken = config.loadToken;
      }
      if (typeof config.saveToken === 'function') {
        this.saveToken = config.saveToken;
      }
    }
    
    // Initialize resources
    this.customers = new Customers(this);
    this.directDebitMandates = new DirectDebitMandates(this);
    this.invoices = new Invoices(this);
    this.errors = errors;

    // Load stored token and optionally fetch initial token
    this._initialized = this._init();
  }

  async _init() {
    try {
      const stored = await this.loadToken();
      if (stored && stored.access_token && stored.refresh_token && stored.expires_at) {
        this.accessToken = stored.access_token;
        this.refreshToken = stored.refresh_token;
        this.tokenExpiresAt = new Date(stored.expires_at);
        return;
      }
    } catch (e) {
      // Ignore storage errors on load
    }

    if (this.clientId && this.clientSecret && this.code) {
      await this._getInitialToken();
    }
  }

  async _getInitialToken() {
    try {
      const tokenData = await this._fetchToken({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: this.code,
        redirect_uri: this.redirectUri
      });
      
      await this._setTokenData(tokenData);
      return tokenData;
    } catch (error) {
      throw new Error(`Failed to get initial OAuth2 token: ${error.message}`);
    }
  }

  async _fetchToken(params) {
    const url = `${this.baseURL}/api/oauth2/token`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    const body = new URLSearchParams(params).toString();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await this.fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OAuth2 token request failed: ${response.status} ${text}`);
    }
    
    return response.json();
  }

  async _setTokenData(tokenData) {
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    // Calculate expiration time (subtract 60 seconds for safety buffer)
    this.tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in - 60) * 1000);
    await this.saveToken({
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      expires_at: this.tokenExpiresAt.toISOString(),
    });
  }

  async _refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const tokenData = await this._fetchToken({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken
      });
      
      await this._setTokenData(tokenData);
      return tokenData;
    } catch (error) {
      throw new Error(`Failed to refresh OAuth2 token: ${error.message}`);
    }
  }

  async _ensureValidToken() {
    // Wait for initial token if still pending
    if (this._initialized) {
      await this._initialized;
    }
    
    // Check if token is expired or about to expire
    if (!this.accessToken || (this.tokenExpiresAt && new Date() >= this.tokenExpiresAt)) {
      await this._refreshAccessToken();
    }
  }

  async _request(method, path, data, queryParams = {}) {
    // Ensure we have a valid access token
    await this._ensureValidToken();
    
    // Build URL with query parameters
    let url = this.baseURL + path;
    if (Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams);
      url += '?' + searchParams.toString();
    }
    
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
    
    const options = { method, headers };
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await this.fetch(url, {...options, signal: controller.signal});
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Adfin API request failed: ${response.status} ${text}`);
    }
    
    // Check if response has content before trying to parse JSON
    const contentType = response.headers?.get?.('content-type');
    const contentLength = response.headers?.get?.('content-length');
    
    // If no content or empty response, return null
    const isJson = contentType ? contentType.includes('application/json') : typeof response.json === 'function';
    if (contentLength === '0' || !isJson) {
      return null;
    }
    
    // Try to parse JSON, but handle empty responses gracefully
    try {
      if (typeof response.text === 'function') {
        const text = await response.text();
        if (!text || text.trim() === '') {
          return null;
        }
        return JSON.parse(text);
      }
      // Fallback to response.json if text() is not available (test stubs)
      return await response.json();
    } catch (error) {
      // If JSON parsing fails, return null for empty responses
      if (error instanceof SyntaxError && error.message.includes('Unexpected end of JSON input')) {
        return null;
      }
      throw error;
    }
  }

  // Method to manually refresh token if needed
  async refreshToken() {
    return this._refreshAccessToken();
  }

  // Method to check if client is properly authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Method to get current token info
  getTokenInfo() {
    return {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      expiresAt: this.tokenExpiresAt,
      isExpired: this.tokenExpiresAt ? new Date() >= this.tokenExpiresAt : null
    };
  }
}

Adfin.errors = errors;
