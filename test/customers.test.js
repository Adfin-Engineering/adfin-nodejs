import {test} from 'node:test';
import assert from 'node:assert';
import Adfin from '../index.js';

test('customers.create sends POST request with OAuth2', async () => {
  let fetchCallCount = 0;
  const customFetch = async (url, options) => {
    fetchCallCount++;
    
    if (fetchCallCount === 1) {
      // First call should be to get OAuth2 token
      assert.strictEqual(url, 'https://example.com/api/oauth2/token');
      assert.strictEqual(options.method, 'POST');
      assert.strictEqual(options.headers['Content-Type'], 'application/x-www-form-urlencoded');
      return {
        ok: true, 
        json: async () => ({
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          expires_in: 3600,
          token_type: 'Bearer'
        })
      };
    } else if (fetchCallCount === 2) {
      // Second call should be the actual API request
      assert.strictEqual(url, 'https://example.com/api/customers');
      assert.strictEqual(options.method, 'POST');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      assert.deepStrictEqual(JSON.parse(options.body), {name: 'Alice'});
      return {ok: true, json: async () => ({id: 'cus_123'})};
    }
  };
  
  const adfin = new Adfin({
    client_id: 'test_client_id',
    client_secret: 'test_client_secret',
    code: 'test_code',
    redirect_uri: 'https://example.com/callback',
    url: 'https://example.com',
    fetch: customFetch
  });

  const result = await adfin.customers.create({name: 'Alice'});
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, {id: 'cus_123'});
});

test('customers.update sends PUT request with OAuth2', async () => {
  let fetchCallCount = 0;
  const body = {
    id: '066b7125-cc80-40f1-a220-3ef297b979db',
    name: 'Adfin Financial Services Ltd',
    people: [
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'ciprian+john@adfin.com',
        phoneNo: '+44567123456'
      }
    ],
    addresses: [
      {
        city: 'London',
        postalCode: '12456',
        country: 'UK',
        addressLine1: 'Street 2'
      }
    ]
  };

  const customFetch = async (url, options) => {
    fetchCallCount++;

    if (fetchCallCount === 1) {
      // OAuth2 token request
      return {
        ok: true,
        json: async () => ({
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          expires_in: 3600,
          token_type: 'Bearer'
        })
      };
    } else if (fetchCallCount === 2) {
      // Customers API request
      assert.strictEqual(url, 'https://example.com/api/customers');
      assert.strictEqual(options.method, 'PUT');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      assert.deepStrictEqual(JSON.parse(options.body), body);
      return {ok: true, json: async () => ({id: body.id})};
    }
  };

  const adfin = new Adfin({
    client_id: 'test_client_id',
    client_secret: 'test_client_secret',
    code: 'test_code',
    redirect_uri: 'https://example.com/callback',
    url: 'https://example.com',
    fetch: customFetch
  });

  const result = await adfin.customers.update(body);
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, {id: body.id});
});

test('customers.listWithFinancialDetails sends GET request with query params', async () => {
  let fetchCallCount = 0;
  const customFetch = async (url, options) => {
    fetchCallCount++;
    
    if (fetchCallCount === 1) {
      // OAuth2 token request
      return {
        ok: true, 
        json: async () => ({
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          expires_in: 3600,
          token_type: 'Bearer'
        })
      };
    } else if (fetchCallCount === 2) {
      // Customers API request with query parameters
      assert.strictEqual(url, 'https://example.com/api/customers?includeCustomerFinancialDetails=true');
      assert.strictEqual(options.method, 'GET');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      return {ok: true, json: async () => ([{id: 'cus_123', financialDetails: {}}])};
    }
  };
  
  const adfin = new Adfin({
    client_id: 'test_client_id',
    client_secret: 'test_client_secret',
    code: 'test_code',
    redirect_uri: 'https://example.com/callback',
    url: 'https://example.com',
    fetch: customFetch
  });

  const result = await adfin.customers.listWithFinancialDetails();
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, [{id: 'cus_123', financialDetails: {}}]);
});

test('OAuth2 token refresh when expired', async () => {
  let fetchCallCount = 0;
  const customFetch = async (url, options) => {
    fetchCallCount++;
    
    if (fetchCallCount === 1) {
      // Initial OAuth2 token request
      return {
        ok: true, 
        json: async () => ({
          access_token: 'initial_access_token',
          refresh_token: 'test_refresh_token',
          expires_in: 1, // Very short expiry for testing
          token_type: 'Bearer'
        })
      };
    } else if (fetchCallCount === 2) {
      // Token refresh request
      assert.strictEqual(url, 'https://example.com/api/oauth2/token');
      assert.strictEqual(options.method, 'POST');
      const body = options.body;
      assert(body.includes('grant_type=refresh_token'));
      assert(body.includes('refresh_token=test_refresh_token'));
      return {
        ok: true, 
        json: async () => ({
          access_token: 'refreshed_access_token',
          refresh_token: 'test_refresh_token',
          expires_in: 3600,
          token_type: 'Bearer'
        })
      };
    } else if (fetchCallCount === 3) {
      // API request with refreshed token
      assert.strictEqual(options.headers['Authorization'], 'Bearer refreshed_access_token');
      return {ok: true, json: async () => ([{id: 'cus_123'}])};
    }
  };
  
  const adfin = new Adfin({
    client_id: 'test_client_id',
    client_secret: 'test_client_secret',
    code: 'test_code',
    redirect_uri: 'https://example.com/callback',
    url: 'https://example.com',
    fetch: customFetch
  });

  // Wait for initial token and let it expire
  await new Promise(resolve => setTimeout(resolve, 1100));

  const result = await adfin.customers.list();
  assert.strictEqual(fetchCallCount, 3);
  assert.deepStrictEqual(result, [{id: 'cus_123'}]);
});
