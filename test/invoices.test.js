import {test} from 'node:test';
import assert from 'node:assert';
import Adfin from '../index.js';

test('invoices.create sends POST request with OAuth2', async () => {
  let fetchCallCount = 0;
  const body = {
    invoiceNo: 'INV-6666',
    customer: {
      id: '5874f3a4-2125-4c1c-bb5f-950955250121',
      externalId: ''
    },
    description: 'A Great Invoice',
    dueDate: '2024-12-04T00:00:00.000Z',
    issueDate: '2024-11-04T00:00:00.000Z',
    items: [
      {
        description: '1st Line Item',
        quantity: '1',
        unitAmount: '2',
        taxRate: '10.0'
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
      // Invoice API request
      assert.strictEqual(url, 'https://example.com/api/invoices');
      assert.strictEqual(options.method, 'POST');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      assert.deepStrictEqual(JSON.parse(options.body), body);
      return {
        ok: true,
        json: async () => ({
          id: '0d2616e5-5e38-4e23-9755-ab37d30dae08',
          invoiceNo: 'INV-6666',
          description: 'A Great Invoice',
          totalAmount: '2.2',
          taxAmount: '0.2',
          dueAmount: '2.2',
          dueDate: '2024-12-04T00:00:00.000UTC',
          issueDate: '2024-11-04T00:00:00.000UTC',
          creationTime: '2024-11-14T12:05:51.966UTC',
          lastUpdatedTime: '2024-11-14T12:05:51.966UTC',
          status: 'DRAFT',
          statusReasonCode: 'PENDING_ACTIVATION',
          customer: {
            id: '5874f3a4-2125-4c1c-bb5f-950955250121',
            name: 'Chris Carty',
            creationTime: '2024-11-14T11:52:50.517UTC',
            people: [
              {
                firstName: 'Chris',
                lastName: 'Carty',
                email: 'chris@adfin.com',
                phoneNo: '+447654432234'
              }
            ],
            addresses: [
              {
                city: 'London',
                postalCode: '12456',
                country: 'UK',
                addressLine1: '8 Street'
              }
            ],
            directDebitMandate: {
              status: 'CREATED'
            },
            timezone: 'Europe/London'
          },
          items: [
            {
              description: '1st Line Item',
              quantity: 1,
              unitAmount: 2,
              taxRate: 10,
              taxAmount: 0.2,
              totalAmount: 2.2,
              externalData: []
            }
          ],
          paymentRequests: [
            {
              description: 'A Great Invoice',
              amount: 2.2,
              payByDate: '2024-12-04T00:00:00.000UTC',
              creationTime: '2024-11-14T12:05:51.966UTC',
              lastUpdatedTime: '2024-11-14T12:05:51.966UTC',
              statusReasonCode: 'PENDING_ACTIVATION',
              paymentLink: { url: 'https://app.staging.adfin.com/pay/hHFo0nlT8Aev9kp2u0' }
            }
          ],
          creditNotes: []
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
    id: '0d2616e5-5e38-4e23-9755-ab37d30dae08',
    invoiceNo: 'INV-6666',
    description: 'A Great Invoice',
    totalAmount: '2.2',
    taxAmount: '0.2',
    dueAmount: '2.2',
    dueDate: '2024-12-04T00:00:00.000UTC',
    issueDate: '2024-11-04T00:00:00.000UTC',
    creationTime: '2024-11-14T12:05:51.966UTC',
    lastUpdatedTime: '2024-11-14T12:05:51.966UTC',
    status: 'DRAFT',
    statusReasonCode: 'PENDING_ACTIVATION',
    customer: {
      id: '5874f3a4-2125-4c1c-bb5f-950955250121',
      name: 'Chris Carty',
      creationTime: '2024-11-14T11:52:50.517UTC',
      people: [
        {
          firstName: 'Chris',
          lastName: 'Carty',
          email: 'chris@adfin.com',
          phoneNo: '+447654432234'
        }
      ],
      addresses: [
        {
          city: 'London',
          postalCode: '12456',
          country: 'UK',
          addressLine1: '8 Street'
        }
      ],
      directDebitMandate: {status: 'CREATED'},
      timezone: 'Europe/London'
    },
    items: [
      {
        description: '1st Line Item',
        quantity: 1,
        unitAmount: 2,
        taxRate: 10,
        taxAmount: 0.2,
        totalAmount: 2.2,
        externalData: []
      }
    ],
    paymentRequests: [
      {
        description: 'A Great Invoice',
        amount: 2.2,
        payByDate: '2024-12-04T00:00:00.000UTC',
        creationTime: '2024-11-14T12:05:51.966UTC',
        lastUpdatedTime: '2024-11-14T12:05:51.966UTC',
        statusReasonCode: 'PENDING_ACTIVATION',
        paymentLink: {url: 'https://app.staging.adfin.com/pay/hHFo0nlT8Aev9kp2u0'}
      }
    ],
    creditNotes: []
  };

  const result = await adfin.invoices.create(body);
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, expected);
});

test('invoices.retrieve sends GET request with OAuth2', async () => {
  let fetchCallCount = 0;
  const customFetch = async (url, options) => {
    fetchCallCount++;

    if (fetchCallCount === 1) {
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
      assert.strictEqual(url, 'https://example.com/api/invoices/INV-123');
      assert.strictEqual(options.method, 'GET');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      return {
        ok: true,
        json: async () => ({id: 'INV-123', status: 'DRAFT'})
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

  const result = await adfin.invoices.retrieve('INV-123');
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, {id: 'INV-123', status: 'DRAFT'});
});

test('invoices.activateDirectDebitPayment sends PUT request with OAuth2', async () => {
  let fetchCallCount = 0;
  const body = {collectionMethod: 'DIRECT_DEBIT_PAYMENT', customMessage: 'Thank you for doing business with us!'};
  const customFetch = async (url, options) => {
    fetchCallCount++;

    if (fetchCallCount === 1) {
      return { ok: true, json: async () => ({ access_token: 'test_access_token', refresh_token: 'test_refresh_token', expires_in: 3600, token_type: 'Bearer' }) };
    } else if (fetchCallCount === 2) {
      assert.strictEqual(url, 'https://example.com/api/invoices/INV-123:activate');
      assert.strictEqual(options.method, 'PUT');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      assert.deepStrictEqual(JSON.parse(options.body), body);
      return { ok: true, json: async () => ({id: 'INV-123', status: 'ACTIVE'}) };
    }
  };

  const adfin = new Adfin({ client_id: 'test_client_id', client_secret: 'test_client_secret', code: 'test_code', redirect_uri: 'https://example.com/callback', url: 'https://example.com', fetch: customFetch });

  const result = await adfin.invoices.activateDirectDebitPayment('INV-123', {customMessage: 'Thank you for doing business with us!'});
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, {id: 'INV-123', status: 'ACTIVE'});
});

test('invoices.activateOneTimePayment sends PUT request with OAuth2', async () => {
  let fetchCallCount = 0;
  const body = {collectionMethod: 'ONE_TIME_PAYMENT', customMessage: 'Thank you for doing business with us!'};
  const customFetch = async (url, options) => {
    fetchCallCount++;

    if (fetchCallCount === 1) {
      return { ok: true, json: async () => ({ access_token: 'test_access_token', refresh_token: 'test_refresh_token', expires_in: 3600, token_type: 'Bearer' }) };
    } else if (fetchCallCount === 2) {
      assert.strictEqual(url, 'https://example.com/api/invoices/INV-123:activate');
      assert.strictEqual(options.method, 'PUT');
      assert.strictEqual(options.headers['Authorization'], 'Bearer test_access_token');
      assert.deepStrictEqual(JSON.parse(options.body), body);
      return { ok: true, json: async () => ({id: 'INV-123', status: 'ACTIVE'}) };
    }
  };

  const adfin = new Adfin({ client_id: 'test_client_id', client_secret: 'test_client_secret', code: 'test_code', redirect_uri: 'https://example.com/callback', url: 'https://example.com', fetch: customFetch });

  const result = await adfin.invoices.activateOneTimePayment('INV-123', {customMessage: 'Thank you for doing business with us!'});
  assert.strictEqual(fetchCallCount, 2);
  assert.deepStrictEqual(result, {id: 'INV-123', status: 'ACTIVE'});
});
