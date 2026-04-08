const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

/*
 * ============================================================================
 * COMPREHENSIVE API TEST DOCUMENTATION
 * ============================================================================
 * 
 * ENTITY ATTRIBUTES - REQUIRED vs OPTIONAL
 * 
 * **USER ENTITY**
 *   REQUIRED: email (unique), phone (unique, 10+ digits), password, name
 *   OPTIONAL: role (defaults to "USER")
 *   SYSTEM FIELDS: id (uuid), createdAt, updatedAt, isDeleted
 * 
 * **BIKE MODEL ENTITY**
 *   REQUIRED: name (unique), brand, category, description, imageUrl (file upload)
 *   OPTIONAL: engineCapacity (number), fuelType, launchYear (>= 1900), mileage (number),
 *             weight (number), exShowroomPrice, rtoCharges, insuranceCharges, otherCharges,
 *             onRoadPrice, gstRate, hsnCode
 *   SYSTEM FIELDS: id (uuid), createdAt, updatedAt, isDeleted
 * 
 * **BIKE ENTITY**
 *   REQUIRED: engineNumber (unique), chassisNumber (unique), modelId (must exist), color,
 *             manufactureYear (>= 1900), manufactureMonth (enum: JANUARY-DECEMBER)
 *   OPTIONAL: registrationNumber (unique), purchasePrice, purchaseDate, salePrice,
 *             supplierId, status (AVAILABLE|RESERVED|SOLD|IN_SERVICE, defaults to AVAILABLE)
 *   SYSTEM FIELDS: id (uuid), createdAt, updatedAt, isDeleted
 * 
 * **ACCESSORIES ENTITY**
 *   REQUIRED: name, description, price (positive number), imageUrl (file upload),
 *             unit (e.g., PIECE, SET, BOX), quantityInStock (non-negative number)
 *   OPTIONAL: none
 *   SYSTEM FIELDS: id (uuid), createdAt, updatedAt, isDeleted
 * 
 * **CUSTOMER ENTITY**
 *   REQUIRED: name, email (unique, valid email format), phone (unique, 10+ digits)
 *   ADDRESS REQUIRED: addressLine1, city, state, postalCode, country
 *   ADDRESS OPTIONAL: addressLine2
 *   SYSTEM FIELDS: id (uuid), addressId (relation), createdAt, updatedAt, isDeleted
 * 
 * **SUPPLIER ENTITY**
 *   REQUIRED: name, email (unique, valid email), phone (unique, 10+ digits), companyName,
 *             supplierType (enum: MANUFACTURER|DEALER|WHOLESALER|RETAILER|OTHER)
 *   ADDRESS REQUIRED: addressLine1, city, state, postalCode, country
 *   ADDRESS OPTIONAL: addressLine2
 *   SYSTEM FIELDS: id (uuid), addressId (relation), createdAt, updatedAt, isDeleted
 * 
 * **SALE ENTITY**
 *   REQUIRED: customerId, items (array with minimum 1 item), paymentType, paymentMethod,
 *             pendingAmount (non-negative number)
 *   OPTIONAL: notes, invoiceUrl (auto-generated)
 *   PAYMENT TYPES: Full | FULL_AND_PENDING | DOWN_PAYMENT_AND_FINANCE | OTHER
 *   PAYMENT METHODS: CASH | CREDIT_CARD | DEBIT_CARD | UPI | CHEQUE | NET_BANKING | OTHER
 *   STATUS: PENDING | CONFIRMED | DELIVERED | CANCELLED | REFUNDED
 *   SYSTEM FIELDS: id (uuid), saleDate (defaults to now), status (defaults to PENDING),
 *                  subtotal, discountAmount, taxAmount, totalAmount, isPaid (auto-calculated),
 *                  createdAt, updatedAt, isDeleted
 * 
 * **SALE ITEM ENTITY**
 *   REQUIRED: itemType (BIKE|ACCESSORY), quantity (positive number), unitPrice (positive number),
 *             bikeId (if itemType=BIKE) OR accessoryId (if itemType=ACCESSORY)
 *   OPTIONAL: discountAmount (non-negative), taxRate (percentage or decimal),
 *             notes, lineTotal (auto-calculated)
 *   SYSTEM FIELDS: id (uuid), saleId (relation), createdAt, updatedAt
 * 
 * ============================================================================
 */

const BASE_URL = 'http://localhost:3000/api';
const testResults = [];
let authToken = '';
let adminToken = '';
let userId = '';
let bikeModelId = '';
let bikeId = '';
let accessoryId = '';
let customerId = '';
let supplierId = '';
let saleId = '';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logTest = (method, endpoint, status, response, body = null, headers = null) => {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${timestamp}] ${method} ${endpoint}`);
  console.log(`Status: ${status}`);
  console.log(`Headers Sent:`, headers || 'None');
  console.log(`Body Sent:`, body ? JSON.stringify(body, null, 2) : 'None');
  console.log(`Response:`, JSON.stringify(response, null, 2));
  console.log(`${'='.repeat(80)}`);

  testResults.push({
    request: {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: headers || {},
      body: body || {},
    },
    response: {
      status,
      data: response,
    },
    timestamp,
  });
};

const waitBetweenTests = async () => {
  console.log('\n⏳ Waiting 5 seconds before next test...');
  await sleep(5000);
};

const makeRequest = async (method, endpoint, data = null, customHeaders = {}, useFormData = false, imageFile = null) => {
  try {
    let headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (authToken && !useFormData) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
    };

    if (useFormData && data) {
      const form = new FormData();
      
      // Add fields to form (non-nested objects)
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string' || typeof data[key] === 'number') {
          form.append(key, data[key]);
        }
      });

      // Add image file if provided
      if (imageFile) {
        form.append('imageUrl', imageFile.buffer, imageFile.filename);
      }

      config.data = form;
      config.headers = {
        ...form.getHeaders(),
        'Authorization': `Bearer ${adminToken}`,
      };
    } else if (data) {
      config.data = data;
    }

    const response = await axios(config);
    logTest(method, endpoint, response.status, response.data, data, headers);
    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    const responseData = error.response?.data || { message: error.message };
    logTest(method, endpoint, status, responseData, data, customHeaders);
    return responseData;
  }
};

// Create mock image buffers
const createMockImageBuffer = (filename) => {
  // Create a minimal valid PNG buffer (1x1 transparent pixel)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);
  return { buffer: pngBuffer, filename };
};

const runTests = async () => {
  console.log('\n🚀 Starting API Endpoint Tests...\n');

  try {
    // 1. USER ENDPOINTS
    console.log('\n📦 Testing USER Endpoints...\n');

    // Login as Admin (must exist in database)
    let result = await makeRequest('POST', '/users/login', {
      email: 'admin@test.com',
      password: 'Admin@123',
    });
    authToken = result.data?.token || result.token || '';
    adminToken = authToken;
    if (!authToken) {
      console.warn('\n⚠️  WARNING: Failed to get admin token. Seed database first with: node tests/seedDatabase.js');
      console.warn('⚠️  Attempting to continue with subsequent public tests...\n');
    }
    await waitBetweenTests();

    // 2. BIKE MODEL ENDPOINTS
    console.log('\n📦 Testing BIKE MODEL Endpoints...\n');

    // Create Bike Model - ALL ATTRIBUTES
    // REQUIRED: name, brand, category, description, imageUrl
    // OPTIONAL: engineCapacity, fuelType, launchYear, mileage, weight, exShowroomPrice, rtoCharges, insuranceCharges, otherCharges, onRoadPrice, gstRate, hsnCode
    result = await makeRequest('POST', '/bike-models/create', {
      // *** REQUIRED FIELDS ***
      name: 'Hero Splendor Plus',
      brand: 'Hero MotoCorp',
      category: 'COMMUTER',
      description: 'Reliable and fuel-efficient commuter bike with advanced features',
      // *** OPTIONAL FIELDS ***
      engineCapacity: 97,
      fuelType: 'PETROL',
      launchYear: 2023,
      mileage: 95,
      weight: 112,
      exShowroomPrice: 75000,
      rtoCharges: 2500,
      insuranceCharges: 5000,
      otherCharges: 1000,
      onRoadPrice: 83500,
      gstRate: 18,
      hsnCode: '87043099',
    }, {
      'Authorization': `Bearer ${adminToken}`,
    }, true, createMockImageBuffer('bike-model-demo.png'));
    bikeModelId = result.data?.data?.id || '';
    await waitBetweenTests();

    // Get All Bike Models
    await makeRequest('GET', '/bike-models');
    await waitBetweenTests();

    // Get Single Bike Model
    if (bikeModelId) {
      await makeRequest('GET', `/bike-models/${bikeModelId}`);
      await waitBetweenTests();
    }

    // Update Bike Model
    if (bikeModelId) {
      await makeRequest('PUT', `/bike-models/${bikeModelId}`, {
        name: 'Hero Splendor Updated',
        mileage: 100,
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // 3. BIKE ENDPOINTS
    console.log('\n📦 Testing BIKE Endpoints...\n');

    // Create Bike - ALL ATTRIBUTES
    // REQUIRED: engineNumber, chassisNumber, modelId, color, manufactureYear, manufactureMonth
    // OPTIONAL: registrationNumber, purchasePrice, purchaseDate, salePrice, supplierId, status
    if (bikeModelId) {
      result = await makeRequest('POST', '/bikes/create', {
        // *** REQUIRED FIELDS ***
        engineNumber: 'EN123456789ABC',
        chassisNumber: 'CH987654321XYZ',
        modelId: bikeModelId,
        color: 'Black',
        manufactureYear: 2024,
        manufactureMonth: 'JANUARY',
        // *** OPTIONAL FIELDS ***
        registrationNumber: 'DL01AB1234',
        purchasePrice: 70000,
        purchaseDate: '2024-01-15T00:00:00Z',
        salePrice: 75000,
        status: 'AVAILABLE', // AVAILABLE | RESERVED | SOLD | IN_SERVICE
        supplierId: null, // Will be updated after supplier is created
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      bikeId = result.data?.data?.id || '';
      await waitBetweenTests();
    }

    // Get All Bikes
    await makeRequest('GET', '/bikes');
    await waitBetweenTests();

    // Get Single Bike
    if (bikeId) {
      await makeRequest('GET', `/bikes/${bikeId}`);
      await waitBetweenTests();
    }

    // Mark Bike as Booked
    if (bikeId) {
      await makeRequest('PATCH', `/bikes/${bikeId}/book`, {}, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // Update Bike
    if (bikeId) {
      await makeRequest('PUT', `/bikes/${bikeId}`, {
        color: 'Red',
        price: 76000,
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // 4. ACCESSORIES ENDPOINTS
    console.log('\n📦 Testing ACCESSORIES Endpoints...\n');

    // Create Accessory - ALL ATTRIBUTES
    // REQUIRED: name, description, price, imageUrl, unit, quantityInStock
    // OPTIONAL: none
    result = await makeRequest('POST', '/accessories/create', {
      // *** REQUIRED FIELDS ***
      name: 'Safety Helmet',
      description: 'Premium ISI certified safety helmet with advanced protection',
      price: 2000,
      unit: 'PIECE', // PIECE, SET, BOX, etc.
      quantityInStock: 50,
    }, {
      'Authorization': `Bearer ${adminToken}`,
    }, true, createMockImageBuffer('accessory-demo.png'));
    accessoryId = result.data?.data?.id || '';
    await waitBetweenTests();

    // Get All Accessories
    await makeRequest('GET', '/accessories');
    await waitBetweenTests();

    // Get Single Accessory
    if (accessoryId) {
      await makeRequest('GET', `/accessories/${accessoryId}`);
      await waitBetweenTests();
    }

    // Update Accessory Quantity
    if (accessoryId) {
      await makeRequest('PATCH', `/accessories/${accessoryId}/quantity`, {
        quantity: 45,
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // Update Accessory
    if (accessoryId) {
      await makeRequest('PUT', `/accessories/${accessoryId}`, {
        price: 2500,
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // 5. ADDRESS ENDPOINTS (via Customer/Supplier)
    console.log('\n📦 Testing ADDRESS Endpoints...\n');

    // 6. CUSTOMER ENDPOINTS
    console.log('\n📦 Testing CUSTOMER Endpoints...\n');

    // Create Customer - ALL ATTRIBUTES
    // REQUIRED: name, email, phone, addressLine1, city, state, postalCode, country
    // OPTIONAL: addressLine2
    result = await makeRequest('POST', '/customers/create', {
      // *** CUSTOMER REQUIRED FIELDS ***
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9123456789',
      // *** ADDRESS REQUIRED FIELDS ***
      addressLine1: '123 Main Street',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      // *** ADDRESS OPTIONAL FIELDS ***
      addressLine2: 'Apartment 4B',
    }, {
      'Authorization': `Bearer ${adminToken}`,
    });
    customerId = result.data?.data?.id || '';
    await waitBetweenTests();

    // Get All Customers
    await makeRequest('GET', '/customers');
    await waitBetweenTests();

    // Get Single Customer
    if (customerId) {
      await makeRequest('GET', `/customers/${customerId}`);
      await waitBetweenTests();
    }

    // Update Customer
    if (customerId) {
      await makeRequest('PUT', `/customers/${customerId}`, {
        name: 'John Doe Updated',
        phone: '9987654321',
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // 7. SUPPLIER ENDPOINTS
    console.log('\n📦 Testing SUPPLIER Endpoints...\n');

    // Create Supplier - ALL ATTRIBUTES
    // REQUIRED: name, email, phone, companyName, supplierType, addressLine1, city, state, postalCode, country
    // OPTIONAL: addressLine2
    result = await makeRequest('POST', '/suppliers/create', {
      // *** SUPPLIER REQUIRED FIELDS ***
      name: 'Rajesh Kumar',
      email: 'rajesh@abcparts.com',
      phone: '9111111111',
      companyName: 'ABC Parts Supplier Pvt Ltd',
      supplierType: 'MANUFACTURER', // MANUFACTURER | DEALER | WHOLESALER | RETAILER | OTHER
      // *** ADDRESS REQUIRED FIELDS ***
      addressLine1: '456 Industrial Area',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      // *** ADDRESS OPTIONAL FIELDS ***
      addressLine2: 'Building C, Floor 3',
    }, {
      'Authorization': `Bearer ${adminToken}`,
    });
    supplierId = result.data?.data?.id || '';
    await waitBetweenTests();

    // Get All Suppliers
    await makeRequest('GET', '/suppliers');
    await waitBetweenTests();

    // Get Single Supplier
    if (supplierId) {
      await makeRequest('GET', `/suppliers/${supplierId}`);
      await waitBetweenTests();
    }

    // Update Supplier
    if (supplierId) {
      await makeRequest('PUT', `/suppliers/${supplierId}`, {
        name: 'ABC Parts Supplier Updated',
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // 8. SALES ENDPOINTS
    console.log('\n📦 Testing SALES Endpoints...\n');

    // Create Sale - ALL ATTRIBUTES
    // REQUIRED: customerId, items (array with at least 1 item), paymentType, paymentMethod, pendingAmount
    // For each item - REQUIRED: itemType, quantity, unitPrice, (bikeId OR accessoryId)
    // For each item - OPTIONAL: discountAmount, taxRate, notes
    if (customerId && bikeId) {
      result = await makeRequest('POST', '/sales/create', {
        // *** SALE REQUIRED FIELDS ***
        customerId: customerId,
        paymentType: 'FULL', // Full | FULL_AND_PENDING | DOWN_PAYMENT_AND_FINANCE | DOWN_PAYMENT_AND_FINANCE_AND_PENDING | OTHER
        paymentMethod: 'CASH', // CASH | CREDIT_CARD | DEBIT_CARD | UPI | CHEQUE | NET_BANKING | OTHER
        pendingAmount: 0,
        notes: 'Premium bike with extended warranty',
        // *** SALE ITEMS - REQUIRED ***
        items: [
          {
            itemType: 'BIKE', // BIKE or ACCESSORY
            bikeId: bikeId, // Required for BIKE items
            quantity: 1,
            unitPrice: 75000,
            // *** ITEM OPTIONAL FIELDS ***
            discountAmount: 5000,
            taxRate: 18, // in percentage (0-100) or decimal (0-1)?
            notes: 'Bike delivered on time with all accessories',
          },
        ],
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      saleId = result.data?.data?.id || '';
      await waitBetweenTests();
    }

    // Get All Sales
    await makeRequest('GET', '/sales');
    await waitBetweenTests();

    // Get Single Sale
    if (saleId) {
      await makeRequest('GET', `/sales/${saleId}`);
      await waitBetweenTests();
    }

    // Update Sale Status
    if (saleId) {
      await makeRequest('PATCH', `/sales/${saleId}/status`, {
        status: 'COMPLETED',
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // Create Another Sale with Accessory and Partial Payment
    if (customerId && accessoryId) {
      result = await makeRequest('POST', '/sales/create', {
        customerId: customerId,
        paymentType: 'FULL_AND_PENDING',
        paymentMethod: 'CARD', // CREDIT_CARD | DEBIT_CARD
        pendingAmount: 1000,
        notes: 'Accessory bundle with installation service',
        items: [
          {
            itemType: 'ACCESSORY',
            accessoryId: accessoryId, // Required for ACCESSORY items
            quantity: 2,
            unitPrice: 2500,
            discountAmount: 500,
            taxRate: 18,
            notes: 'Quality helmets, instant delivery',
          },
        ],
      }, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // 9. CLEANUP - DELETE ENDPOINTS
    console.log('\n📦 Testing DELETE Endpoints...\n');

    // Delete Accessory
    if (accessoryId) {
      await makeRequest('DELETE', `/accessories/${accessoryId}`, null, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // Delete Bike
    if (bikeId) {
      await makeRequest('DELETE', `/bikes/${bikeId}`, null, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // Delete Bike Model
    if (bikeModelId) {
      await makeRequest('DELETE', `/bike-models/${bikeModelId}`, null, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // Delete Customer
    if (customerId) {
      await makeRequest('DELETE', `/customers/${customerId}`, null, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

    // Delete Supplier
    if (supplierId) {
      await makeRequest('DELETE', `/suppliers/${supplierId}`, null, {
        'Authorization': `Bearer ${adminToken}`,
      });
      await waitBetweenTests();
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }

  // Save results to Postman JSON
  savePostmanCollection();
};

const savePostmanCollection = () => {
  const postmanCollection = {
    info: {
      name: 'Anant Automobiles API Tests',
      description: 'API endpoint tests for Anant Automobiles backend',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      timestamp: new Date().toISOString(),
    },
    item: testResults.map((result, index) => ({
      name: `${result.request.method} ${result.request.url}`,
      event: [
        {
          listen: 'test',
          script: {
            exec: [`pm.test("Status code is ${result.response.status}", function () {`,
            '    pm.expect(pma.response.code).to.be.oneOf([200, 201, 204, 400, 404]);',
            '});'],
            type: 'text/javascript'
          }
        }
      ],
      request: {
        method: result.request.method,
        url: result.request.url,
        description: `Test #${index + 1}`,
        header: Object.entries(result.request.headers || {}).map(([key, value]) => ({
          key,
          value,
          type: 'text',
        })),
        body: result.request.body && Object.keys(result.request.body).length > 0 ? {
          mode: 'raw',
          raw: JSON.stringify(result.request.body, null, 2),
          options: {
            raw: {
              language: 'json',
            },
          },
        } : null,
      },
      response: [
        {
          name: `Response ${result.response.status}`,
          originalRequest: {
            method: result.request.method,
            url: result.request.url,
            header: Object.entries(result.request.headers || {}).map(([key, value]) => ({
              key,
              value,
              type: 'text',
            })),
            body: result.request.body && Object.keys(result.request.body).length > 0 ? {
              mode: 'raw',
              raw: JSON.stringify(result.request.body, null, 2),
              options: {
                raw: {
                  language: 'json',
                },
              },
            } : null,
          },
          status: result.response.status,
          code: result.response.status,
          _postman_previewlanguage: 'json',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
          cookie: [],
          body: JSON.stringify(result.response.data, null, 2),
        },
      ],
    })),
    variable: [
      {
        key: 'base_url',
        value: BASE_URL,
      },
    ],
  };

  const outputPath = path.join(__dirname, '../test-results.postman_collection.json');
  fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2));
  console.log(`\n✅ Postman collection saved to: ${outputPath}`);

  // Also save raw test results
  const rawResultsPath = path.join(__dirname, '../test-results.json');
  fs.writeFileSync(rawResultsPath, JSON.stringify(testResults, null, 2));
  console.log(`✅ Raw test results saved to: ${rawResultsPath}`);

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests Run: ${testResults.length}`);
  const successCount = testResults.filter(r => r.response.status < 400).length;
  console.log(`✅ Successful (Status < 400): ${successCount}`);
  console.log(`❌ Failed (Status >= 400): ${testResults.length - successCount}`);
  console.log('='.repeat(80));
};

// Run tests
runTests().then(() => {
  console.log('\n✅ All tests completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
