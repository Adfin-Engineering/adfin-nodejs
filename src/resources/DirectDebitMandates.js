import AdfinResource from '../AdfinResource.js';

const DirectDebitMandates = AdfinResource.extend({
  create(customerId, data = {}) {
    const path = `/api/customers/${customerId}/directdebitmandates`;
    return this._client._request('PUT', path, data);
  },

  retrieve(mandateId) {
    const path = `/api/customers/directdebitmandates/${mandateId}`;
    return this._client._request('GET', path);
  },
});

export default DirectDebitMandates;
