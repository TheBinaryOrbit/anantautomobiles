const prisma = require('../config/db');

class AddressService {
  validateAddressData(data) {
    const errors = [];

    if (!data.addressLine1 || data.addressLine1.trim() === '') {
      errors.push({ field: 'addressLine1', message: 'Address Line 1 is required and cannot be empty' });
    }

    if (!data.city || data.city.trim() === '') {
      errors.push({ field: 'city', message: 'City is required and cannot be empty' });
    }

    if (!data.state || data.state.trim() === '') {
      errors.push({ field: 'state', message: 'State is required and cannot be empty' });
    }

    if (!data.postalCode || data.postalCode.trim() === '') {
      errors.push({ field: 'postalCode', message: 'Postal Code is required and cannot be empty' });
    }

    if (!data.country || data.country.trim() === '') {
      errors.push({ field: 'country', message: 'Country is required and cannot be empty' });
    }

    return errors;
  }

  async createAddress(data) {
    const validationErrors = this.validateAddressData(data);
    if (validationErrors.length > 0) {
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      const address = await prisma.address.create({
        data: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
      });

      return address;
    } catch (error) {
      throw error;
    }
  }

  async updateAddress(id, data) {
    const validationErrors = this.validateAddressData(data);
    if (validationErrors.length > 0) {
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      const address = await prisma.address.update({
        where: { id },
        data,
      });

      return address;
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Address not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async getAddress(id) {
    try {
      const address = await prisma.address.findUnique({
        where: { id },
      });

      if (!address) {
        throw { message: 'Address not found', statusCode: 404 };
      }

      return address;
    } catch (error) {
      throw error;
    }
  }

  async deleteAddress(id) {
    try {
      const address = await prisma.address.delete({
        where: { id },
      });

      return { message: 'Address deleted successfully', id };
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Address not found', statusCode: 404 };
      }
      throw error;
    }
  }
}

module.exports = new AddressService();
