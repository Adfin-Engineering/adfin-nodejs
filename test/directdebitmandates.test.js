import {test} from 'node:test';
import assert from 'node:assert';
import Adfin from '../index.js';

test('directDebitMandates.create sends PUT request with OAuth2', async () => {
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
      // Mandate API request
      assert.strictEqual(url, 'https://example.com/api/customers/cus_abc/directdebitmandates');
      assert.strictEqual(options.method, 'PUT');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      assert.strictEqual(options.body, '{}');
      return {
        ok: true,
        json: async () => ({
          id: 'WiGr3EBGuORksFWPEj',
          creationTime: '2024-11-05T04:50:32.132UTC',
          status: 'CREATED',
          customer: {
            id: '54e2ffc3-560e-413d-aadb-bfd8f8af4de6',
            name: 'Adfin financial services Ltd',
            people: [
              {
                firstName: 'John',
                lastName: 'Doe',
                email: 'ciprian+john@adfin.com',
                phoneNo: '+44567123456'
              }
            ],
            addresses: [
              {
                city: 'London',
                postalCode: '1245',
                country: 'UK',
                addressLine1: 'Street'
              }
            ],
            directDebitMandate: {
              status: 'CREATED'
            },
            timezone: 'Europe/London'
          },
          url: 'https://console.adfin.com/dd-mandate/WiGr3EBGuORksFWPEj',
          sender: {name: 'JS CAD SERVICES LIMITED'},
          bankAccountNumber: ''
        })
      };
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

  const expected = {
    id: 'WiGr3EBGuORksFWPEj',
    creationTime: '2024-11-05T04:50:32.132UTC',
    status: 'CREATED',
    customer: {
      id: '54e2ffc3-560e-413d-aadb-bfd8f8af4de6',
      name: 'Adfin financial services Ltd',
      people: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'ciprian+john@adfin.com',
          phoneNo: '+44567123456'
        }
      ],
      addresses: [
        {
          city: 'London',
          postalCode: '1245',
          country: 'UK',
          addressLine1: 'Street'
        }
      ],
      directDebitMandate: {status: 'CREATED'},
      timezone: 'Europe/London'
    },
    url: 'https://console.adfin.com/dd-mandate/WiGr3EBGuORksFWPEj',
    sender: {name: 'JS CAD SERVICES LIMITED'},
    bankAccountNumber: ''
  };

  const result = await adfin.directDebitMandates.create('cus_abc');
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, expected);
});

test('directDebitMandates.retrieve sends GET request with OAuth2', async () => {
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
      // Mandate API request
      assert.strictEqual(url, 'https://example.com/api/customers/directdebitmandates/WiGr3EBGuORksFWPEj');
      assert.strictEqual(options.method, 'GET');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      return {
        ok: true,
        json: async () => ({
          id: 'WiGr3EBGuORksFWPEj',
          creationTime: '2024-11-05T08:18:26.068UTC',
          lastUpdateTime: '2024-11-05T08:31:36.053UTC',
          status: 'CREATED',
          failureReason: 'INCORRECT_BANK_DETAILS',
          customer: {
            id: '54e2ffc3-560e-413d-aadb-bfd8f8af4de6',
            name: 'Adfin financial services Ltd',
            people: [
              {
                firstName: 'John',
                lastName: 'Doe',
                email: 'ciprian+john@adfin.com',
                phoneNo: '+44567123456'
              }
            ],
            addresses: [
              {
                city: 'London',
                postalCode: '1245',
                country: 'UK',
                addressLine1: 'Street'
              }
            ],
            directDebitMandate: {status: 'CREATED'},
            timezone: 'Europe/London'
          },
          lastSeenTime: '2024-11-05T08:31:36.053UTC',
          url: 'https://localhost:5173/dd-mandate/WiGr3EBGuORksFWPEj',
          sender: {name: 'JS CAD SERVICES LIMITED'},
          bankAccountNumber: ''
        })
      };
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

  const expected = {
    id: 'WiGr3EBGuORksFWPEj',
    creationTime: '2024-11-05T08:18:26.068UTC',
    lastUpdateTime: '2024-11-05T08:31:36.053UTC',
    status: 'CREATED',
    failureReason: 'INCORRECT_BANK_DETAILS',
    customer: {
      id: '54e2ffc3-560e-413d-aadb-bfd8f8af4de6',
      name: 'Adfin financial services Ltd',
      people: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'ciprian+john@adfin.com',
          phoneNo: '+44567123456'
        }
      ],
      addresses: [
        {
          city: 'London',
          postalCode: '1245',
          country: 'UK',
          addressLine1: 'Street'
        }
      ],
      directDebitMandate: {status: 'CREATED'},
      timezone: 'Europe/London'
    },
    lastSeenTime: '2024-11-05T08:31:36.053UTC',
    url: 'https://localhost:5173/dd-mandate/WiGr3EBGuORksFWPEj',
    sender: {name: 'JS CAD SERVICES LIMITED'},
    bankAccountNumber: ''
  };

  const result = await adfin.directDebitMandates.retrieve('WiGr3EBGuORksFWPEj');
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, expected);
});
