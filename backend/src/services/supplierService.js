const prisma = require('../config/db');
const addressService = require('./addressService');

const VALID_SUPPLIER_TYPES = ['MANUFACTURER', 'DEALER', 'WHOLESALER', 'RETAILER', 'OTHER'];

class SupplierService {
  validateSupplierData(data) {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required and cannot be empty' });
    }

    if (!data.email || data.email.trim() === '') {
      errors.push({ field: 'email', message: 'Email is required and cannot be empty' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: 'Email must be a valid email address' });
    }

    if (!data.phone || data.phone.trim() === '') {
      errors.push({ field: 'phone', message: 'Phone is required and cannot be empty' });
    } else if (!/^\d{10,}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.push({ field: 'phone', message: 'Phone must be at least 10 digits' });
    }

    if (!data.companyName || data.companyName.trim() === '') {
      errors.push({ field: 'companyName', message: 'Company Name is required and cannot be empty' });
    }

    if (!data.supplierType || !VALID_SUPPLIER_TYPES.includes(data.supplierType)) {
      errors.push({
        field: 'supplierType',
        message: `Supplier Type must be one of: ${VALID_SUPPLIER_TYPES.join(', ')}`,
      });
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

  async createSupplier(supplierData, addressData) {
    const supplierErrors = this.validateSupplierData(supplierData);
    const addressErrors = this.validateAddressData(addressData);

    const allErrors = [...supplierErrors, ...addressErrors];
    if (allErrors.length > 0) {
      throw { validationErrors: allErrors, message: 'Validation failed' };
    }

    try {
      // Create address first
      const address = await addressService.createAddress(addressData);

      // Then create supplier with address
      const supplier = await prisma.supplier.create({
        data: {
          name: supplierData.name,
          email: supplierData.email,
          phone: supplierData.phone,
          companyName: supplierData.companyName,
          supplierType: supplierData.supplierType,
          addressId: address.id,
        },
        include: { address: true },
      });

      return supplier;
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta.target[0];
        throw {
          message: `Supplier with this ${field} already exists`,
          field,
        };
      }
      throw error;
    }
  }

  async updateSupplier(id, supplierData, addressData) {
    const supplierErrors = this.validateSupplierData(supplierData);
    const addressErrors = addressData ? this.validateAddressData(addressData) : [];

    const allErrors = [...supplierErrors, ...addressErrors];
    if (allErrors.length > 0) {
      throw { validationErrors: allErrors, message: 'Validation failed' };
    }

    try {
      const existingSupplier = await prisma.supplier.findUnique({
        where: { id },
      });

      if (!existingSupplier || existingSupplier.isDeleted) {
        throw { message: 'Supplier not found', statusCode: 404 };
      }

      // Update address if provided
      if (addressData) {
        await addressService.updateAddress(existingSupplier.addressId, addressData);
      }

      // Update supplier
      const supplier = await prisma.supplier.update({
        where: { id },
        data: {
          name: supplierData.name,
          email: supplierData.email,
          phone: supplierData.phone,
          companyName: supplierData.companyName,
          supplierType: supplierData.supplierType,
        },
        include: { address: true },
      });

      return supplier;
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Supplier not found', statusCode: 404 };
      }
      if (error.code === 'P2002') {
        const field = error.meta.target[0];
        throw {
          message: `Supplier with this ${field} already exists`,
          field,
        };
      }
      throw error;
    }
  }

  async deleteSupplier(id) {
    try {
      const supplier = await prisma.supplier.update({
        where: { id },
        data: { isDeleted: true },
      });

      return { message: 'Supplier deleted successfully', id: supplier.id };
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Supplier not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async getSupplier(id) {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: { address: true },
      });

      if (!supplier || supplier.isDeleted) {
        throw { message: 'Supplier not found', statusCode: 404 };
      }

      return supplier;
    } catch (error) {
      throw error;
    }
  }

  async getAllSuppliers() {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: { isDeleted: false },
        include: { address: true },
      });

      return suppliers;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SupplierService();
