import AdfinResource from '../AdfinResource.js';
const adfinMethod = AdfinResource.method;

const Customers = AdfinResource.extend({
  create: adfinMethod({method: 'POST', fullPath: '/api/customers'}),
  update: adfinMethod({method: 'PUT', fullPath: '/api/customers'}),
  list: adfinMethod({method: 'GET', fullPath: '/api/customers'}),
  retrieve: adfinMethod({method: 'GET', fullPath: '/api/customers'}), // Will need customer ID appended
  
  // Convenience method for getting customers with financial details
  listWithFinancialDetails: function() {
    return this.list(null, { includeCustomerFinancialDetails: true });
  },
});

export default Customers;
