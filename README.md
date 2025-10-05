# Adfin Node.js SDK

A Node.js client library for the Adfin API with OAuth2 authentication support.

## Installation

```bash
npm i @adfin/nodejs
```

## Quick Start

### OAuth2 Authentication

The Adfin SDK uses OAuth2 for authentication. You'll need to initialize the client with your OAuth2 credentials:

```javascript
import Adfin from 'adfin-nodejs';

const adfin = new Adfin({
  client_id: 'your_client_id',
  client_secret: 'your_client_secret',
  code: 'authorization_code_from_oauth_flow',
  redirect_uri: 'https://yourapp.com/callback',
  url: 'https://api.adfin.com' // or your custom Adfin API URL
});
```

### Automatic Token Management

The SDK automatically handles:
- Initial token exchange using the authorization code
- Access token refresh when expired
- Including Bearer tokens in all API requests

```javascript
// The SDK will automatically get the initial token and refresh as needed
const customers = await adfin.customers.list();
console.log('Customers:', customers);
```

### Manual Token Management

You can also manually control token operations:

```javascript
// Check authentication status
console.log('Is authenticated:', adfin.isAuthenticated());

// Get token information
console.log('Token info:', adfin.getTokenInfo());

// Manually refresh token
await adfin.refreshToken();
```

## API Usage

### Customers

#### List Customers

```javascript
// Basic customer list
const customers = await adfin.customers.list();

// List customers with financial details
const customersWithFinancials = await adfin.customers.listWithFinancialDetails();

// List customers with custom query parameters
const filteredCustomers = await adfin.customers.list(null, {
  includeCustomerFinancialDetails: true,
  limit: 50,
  offset: 0
});
```

#### Create Customer

```javascript
const newCustomer = await adfin.customers.create({
  name: 'John Doe',
  email: 'john@example.com',
  // ... other customer data
});
```

#### Update Customer

```javascript
const updatedCustomer = await adfin.customers.update({
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
});
```

#### Create Direct Debit Mandate

Create a mandate for an existing customer by passing the customer's ID.

```javascript
const mandate = await adfin.directDebitMandates.create(
  '54e2ffc3-560e-413d-aadb-bfd8f8af4de6' // customerId
);
```

#### Retrieve Direct Debit Mandate

Fetch a mandate by providing its unique ID.

```javascript
const mandate = await adfin.directDebitMandates.retrieve(
  'WiGr3EBGuORksFWPEj' // mandateId
);
```

#### Create Invoice

```javascript
const invoice = await adfin.invoices.create({
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
});
```

The SDK sends a POST request to the `/api/invoices` endpoint.

#### Retrieve Invoice

Fetch an invoice by its unique ID.

```javascript
const invoice = await adfin.invoices.retrieve(
  'INV-123' // invoiceId
);
```

The SDK sends a GET request to the `/api/invoices/INV-123` endpoint.

#### Activate Invoice (Direct Debit Payment)

```javascript
const invoice = await adfin.invoices.activateDirectDebitPayment(
  'INV-123', // invoiceId
  { customMessage: 'Thank you for doing business with us!' }
);
```

#### Activate Invoice (One Time Payment)

```javascript
const invoice = await adfin.invoices.activateOneTimePayment(
  'INV-123', // invoiceId
  { customMessage: 'Thank you for doing business with us!' }
);
```

The SDK sends a PUT request to the `/api/invoices/INV-123:activate` endpoint.

## Error Handling

```javascript
try {
  const customers = await adfin.customers.list();
} catch (error) {
  if (error.message.includes('OAuth2 token')) {
    console.error('Authentication error:', error.message);
  } else if (error.message.includes('Adfin API request failed')) {
    console.error('API error:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## OAuth2 Flow Integration

### Step 1: Redirect to Authorization Server

```javascript
const authUrl = `https://your-adfin-auth-server.com/oauth2/authorize?` +
  `client_id=${clientId}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `response_type=code&` +
  `scope=openid profile email phone offline_access`;

// Redirect user to authUrl
```

### Step 2: Handle Callback and Initialize SDK

```javascript
// In your callback route handler
app.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const adfin = new Adfin({
      client_id: process.env.ADFIN_CLIENT_ID,
      client_secret: process.env.ADFIN_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.ADFIN_REDIRECT_URI,
      url: process.env.ADFIN_API_URL
    });
    
    // SDK will automatically exchange code for tokens
    await adfin.customers.list(); // This will trigger token exchange
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Configuration Options

| Option | Required | Description |
|--------|----------|-------------|
| `client_id` | Yes | OAuth2 client ID |
| `client_secret` | Yes | OAuth2 client secret |
| `code` | Yes | Authorization code from OAuth2 flow |
| `redirect_uri` | Yes | Redirect URI used in OAuth2 flow |
| `url` | No | Adfin API base URL (defaults to https://api.adfin.com) |

## Token Storage

By default tokens are kept in memory. You can persist them by providing storage callbacks or a file path:

```javascript
const adfin = new Adfin({
  client_id: 'id',
  client_secret: 'secret',
  code: 'auth_code',
  redirect_uri: 'https://example.com/callback',
  // persist tokens to disk
  tokenFile: './tokens.json'
});

// or provide custom persistence
const adfin2 = new Adfin({
  loadToken: async () => db.load('tokens'),
  saveToken: async (data) => db.save('tokens', data)
});
```

On startup the SDK attempts to load stored tokens and uses them if valid. When token data is updated it is automatically saved through the configured storage layer.

## Examples

### Complete Example with Error Handling

```javascript
import Adfin from 'adfin-nodejs';

async function fetchCustomerData() {
  const adfin = new Adfin({
    client_id: process.env.ADFIN_CLIENT_ID,
    client_secret: process.env.ADFIN_CLIENT_SECRET,
    code: process.env.ADFIN_AUTH_CODE,
    redirect_uri: process.env.ADFIN_REDIRECT_URI,
    url: process.env.ADFIN_API_URL
  });

  try {
    // Check if client is authenticated
    if (!adfin.isAuthenticated()) {
      console.log('Waiting for authentication...');
    }

    // Fetch customers with financial details
    const customers = await adfin.customers.listWithFinancialDetails();
    console.log(`Found ${customers.length} customers`);
    
    // Create a new customer
    const newCustomer = await adfin.customers.create({
      name: 'Jane Doe',
      email: 'jane@example.com'
    });
    console.log('Created customer:', newCustomer.id);
    
    return customers;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

fetchCustomerData()
  .then(customers => console.log('Success:', customers.length))
  .catch(error => console.error('Failed:', error.message));
```

## License

MIT
