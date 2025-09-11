import AdfinResource from '../AdfinResource.js';
const adfinMethod = AdfinResource.method;

const Invoices = AdfinResource.extend({
  create: adfinMethod({method: 'POST', fullPath: '/api/invoices'}),
  retrieve(invoiceId) {
    const path = `/api/invoices/${invoiceId}`;
    return this._client._request('GET', path);
  },
  getInvoicesByFilter: adfinMethod({method: 'GET', fullPath: '/api/invoices'}),
  activateDirectDebitPayment(invoiceId, {customMessage} = {}) {
    const path = `/api/invoices/${invoiceId}:activate`;
    const data = {
      collectionMethod: 'DIRECT_DEBIT_PAYMENT',
      ...(customMessage ? {customMessage} : {})
    };
    return this._client._request('PUT', path, data);
  },
  activateOneTimePayment(invoiceId, {customMessage} = {}) {
    const path = `/api/invoices/${invoiceId}:activate`;
    const data = {
      collectionMethod: 'ONE_TIME_PAYMENT',
      ...(customMessage ? {customMessage} : {})
    };
    return this._client._request('PUT', path, data);
  },
});

export default Invoices;
