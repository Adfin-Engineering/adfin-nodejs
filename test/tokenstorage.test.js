import {test} from 'node:test';
import assert from 'node:assert';
import Adfin from '../index.js';

const sampleToken = {
  access_token: 'stored_access',
  refresh_token: 'stored_refresh',
  expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
};

test('loads token data from storage on initialization', async () => {
  const adfin = new Adfin({
    loadToken: async () => sampleToken,
  });
  await adfin._initialized;
  assert.strictEqual(adfin.accessToken, sampleToken.access_token);
  assert.strictEqual(adfin.refreshToken, sampleToken.refresh_token);
  assert.strictEqual(adfin.tokenExpiresAt.toISOString(), sampleToken.expires_at);
});

test('persists token data when _setTokenData runs', async () => {
  let saved = null;
  const adfin = new Adfin({
    saveToken: async (data) => { saved = data; },
  });
  const tokenData = {
    access_token: 'new_access',
    refresh_token: 'new_refresh',
    expires_in: 3600,
  };
  await adfin._setTokenData(tokenData);
  assert(saved);
  assert.strictEqual(saved.access_token, 'new_access');
  assert.strictEqual(saved.refresh_token, 'new_refresh');
  assert(saved.expires_at);
});
