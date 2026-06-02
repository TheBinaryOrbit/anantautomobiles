const prisma = require('../config/db');
const addressService = require('./addressService');

class CustomerService {
  validateCustomerData(data) {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required and cannot be empty' });
    }

    if (!data.phone || data.phone.trim() === '') {
      errors.push({ field: 'phone', message: 'Phone is required and cannot be empty' });
    } else if (!/^\d{10,}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.push({ field: 'phone', message: 'Phone must be at least 10 digits' });
    }

    if (!data.dob) {
      errors.push({ field: 'dob', message: 'Date of Birth is required' });
    }

    if (!data.aadhaarNumber && !data.panNumber) {
      errors.push({ field: 'identity', message: 'Either Aadhaar or PAN number is required' });
    }

    return errors;
  }

  validateAddressData(data) {
    const errors = [];

    if (!data.addressLine1 || data.addressLine1.trim() === '') {
      errors.push({ field: 'addressLine1', message: 'Address Line 1 is required' });
    }

    if (!data.city || data.city.trim() === '') {
      errors.push({ field: 'city', message: 'City is required' });
    }

    if (!data.state || data.state.trim() === '') {
      errors.push({ field: 'state', message: 'State is required' });
    }

    if (!data.postalCode || data.postalCode.trim() === '') {
      errors.push({ field: 'postalCode', message: 'Postal Code is required' });
    }

    if (!data.country || data.country.trim() === '') {
      errors.push({ field: 'country', message: 'Country is required' });
    }

    return errors;
  }

  async createCustomer(customerData, addressData) {
    const customerErrors = this.validateCustomerData(customerData);
    const addressErrors = this.validateAddressData(addressData);

    const allErrors = [...customerErrors, ...addressErrors];
    if (allErrors.length > 0) {
      throw { validationErrors: allErrors, message: 'Validation failed' };
    }

    try {
      // Create address first
      const address = await addressService.createAddress(addressData);

      // Then create customer with address
      const customer = await prisma.customer.create({
        data: {
          name: customerData.name,
          phone: customerData.phone,
          dob: customerData.dob ? new Date(customerData.dob) : null,
          marriageAnniversary: customerData.marriageAnniversary ? new Date(customerData.marriageAnniversary) : null,
          aadhaarNumber: customerData.aadhaarNumber || null,
          panNumber: customerData.panNumber || null,
          addressId: address.id,
        },
        include: { address: true },
      });

      return customer;
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta.target[0];
        throw {
          message: `Customer with this ${field} already exists`,
          field,
        };
      }
      throw error;
    }
  }

  async updateCustomer(id, customerData, addressData) {
    const customerErrors = this.validateCustomerData(customerData);
    const addressErrors = addressData ? this.validateAddressData(addressData) : [];

    const allErrors = [...customerErrors, ...addressErrors];
    if (allErrors.length > 0) {
      throw { validationErrors: allErrors, message: 'Validation failed' };
    }

    try {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id },
      });

      if (!existingCustomer || existingCustomer.isDeleted) {
        throw { message: 'Customer not found', statusCode: 404 };
      }

      // Update address if provided
      if (addressData) {
        await addressService.updateAddress(existingCustomer.addressId, addressData);
      }

      // Update customer
      const customer = await prisma.customer.update({
        where: { id },
        data: {
          name: customerData.name,
          phone: customerData.phone,
          dob: customerData.dob ? new Date(customerData.dob) : null,
          marriageAnniversary: customerData.marriageAnniversary ? new Date(customerData.marriageAnniversary) : null,
          aadhaarNumber: customerData.aadhaarNumber || null,
          panNumber: customerData.panNumber || null,
        },
        include: { address: true },
      });

      return customer;
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Customer not found', statusCode: 404 };
      }
      if (error.code === 'P2002') {
        const field = error.meta.target[0];
        throw {
          message: `Customer with this ${field} already exists`,
          field,
        };
      }
      throw error;
    }
  }

  async deleteCustomer(id) {
    try {
      const customer = await prisma.customer.update({
        where: { id },
        data: { isDeleted: true },
      });

      return { message: 'Customer deleted successfully', id: customer.id };
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Customer not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async getCustomer(id) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: { address: true },
      });

      if (!customer || customer.isDeleted) {
        throw { message: 'Customer not found', statusCode: 404 };
      }

      return customer;
    } catch (error) {
      throw error;
    }
  }

  async getAllCustomers() {
    try {
      const customers = await prisma.customer.findMany({
        where: { isDeleted: false },
        include: { address: true },
      });

      return customers;
    } catch (error) {
      throw error;
    }
  }

  async searchCustomers(query) {
    try {
      const customers = await prisma.customer.findMany({
        where: {
          isDeleted: false,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { address: true },
      });

      return customers;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CustomerService();
