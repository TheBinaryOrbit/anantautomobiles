const prisma = require('../config/db');
const invoiceService = require('./invoiceService');

class SalesService {
  validateSalesData(data) {
    const errors = [];

    if (!data.customerId || data.customerId.trim() === '') {
      errors.push({ field: 'customerId', message: 'Customer ID is required' });
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push({ field: 'items', message: 'At least one sale item is required' });
    }

    if (!data.paymentType || data.paymentType.trim() === '') {
      errors.push({ field: 'paymentType', message: 'Payment Type is required' });
    }

    if (!data.paymentMethod || data.paymentMethod.trim() === '') {
      errors.push({ field: 'paymentMethod', message: 'Payment Method is required' });
    }

    if (data.pendingAmount === undefined || typeof data.pendingAmount !== 'number' || data.pendingAmount < 0) {
      errors.push({ field: 'pendingAmount', message: 'Pending Amount must be a non-negative number' });
    }

    return errors;
  }

  validateSaleItem(item, index) {
    const errors = [];

    if (!item.itemType || !['BIKE', 'ACCESSORY'].includes(item.itemType)) {
      errors.push({
        field: `items[${index}].itemType`,
        message: 'Item Type must be BIKE or ACCESSORY',
      });
    }

    if (item.itemType === 'BIKE' && (!item.bikeId || item.bikeId.trim() === '')) {
      errors.push({
        field: `items[${index}].bikeId`,
        message: 'Bike ID is required for BIKE items',
      });
    }

    if (item.itemType === 'ACCESSORY' && (!item.accessoryId || item.accessoryId.trim() === '')) {
      errors.push({
        field: `items[${index}].accessoryId`,
        message: 'Accessory ID is required for ACCESSORY items',
      });
    }

    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: 'Quantity must be a positive number',
      });
    }

    if (!item.unitPrice || typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
      errors.push({
        field: `items[${index}].unitPrice`,
        message: 'Unit Price must be a positive number',
      });
    }

    if (item.discountAmount === undefined || typeof item.discountAmount !== 'number' || item.discountAmount < 0) {
      errors.push({
        field: `items[${index}].discountAmount`,
        message: 'Discount Amount must be a non-negative number',
      });
    }

    if (item.taxRate === undefined || typeof item.taxRate !== 'number' || item.taxRate < 0) {
      errors.push({
        field: `items[${index}].taxRate`,
        message: 'Tax Rate must be a non-negative number (0-1 or 0-100)',
      });
    }

    return errors;
  }

  calculateLineTotal(unitPrice, discountAmount, quantity, taxRate) {
    const priceAfterDiscount = unitPrice - discountAmount;
    const taxAmount = priceAfterDiscount * quantity * taxRate;
    const lineTotal = priceAfterDiscount * quantity + taxAmount;
    return lineTotal;
  }

  async createSale(saleData) {
    const validationErrors = this.validateSalesData(saleData);

    // Validate each item
    if (saleData.items) {
      for (let i = 0; i < saleData.items.length; i++) {
        const itemErrors = this.validateSaleItem(saleData.items[i], i);
        validationErrors.push(...itemErrors);
      }
    }

    if (validationErrors.length > 0) {
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      // Check if customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: saleData.customerId },
      });

      if (!customer || customer.isDeleted) {
        throw {
          field: 'customerId',
          message: 'Customer not found',
        };
      }

      // Calculate totals
      let subtotal = 0;
      let totalDiscountAmount = 0;
      let totalTaxAmount = 0;

      // Prepare sale items with line totals
      const saleItemsData = [];

      for (const item of saleData.items) {
        // For BIKE items, quantity is always 1
        const quantity = item.itemType === 'BIKE' ? 1 : item.quantity;

        // Verify bike/accessory exists
        if (item.itemType === 'BIKE') {
          const bike = await prisma.bike.findUnique({
            where: { id: item.bikeId },
          });
          if (!bike || bike.isDeleted) {
            throw {
              field: 'items.bikeId',
              message: `Bike with ID ${item.bikeId} not found`,
            };
          }
        } else {
          const accessory = await prisma.accessories.findUnique({
            where: { id: item.accessoryId },
          });
          if (!accessory || accessory.isDeleted) {
            throw {
              field: 'items.accessoryId',
              message: `Accessory with ID ${item.accessoryId} not found`,
            };
          }
        }

        const unitPrice = parseFloat(item.unitPrice);
        const discountAmount = parseFloat(item.discountAmount) || 0;
        const taxRate = parseFloat(item.taxRate) / 100; // Convert percentage to decimal

        const itemSubtotal = unitPrice * quantity;
        const itemDiscountTotal = discountAmount * quantity;
        const itemTaxAmount = (unitPrice - discountAmount) * quantity * taxRate;
        const lineTotal = itemSubtotal - itemDiscountTotal + itemTaxAmount;

        subtotal += itemSubtotal;
        totalDiscountAmount += itemDiscountTotal;
        totalTaxAmount += itemTaxAmount;

        saleItemsData.push({
          itemType: item.itemType,
          bikeId: item.itemType === 'BIKE' ? item.bikeId : null,
          accessoryId: item.itemType === 'ACCESSORY' ? item.accessoryId : null,
          quantity,
          unitPrice,
          discountAmount,
          taxRate: parseFloat(item.taxRate),
          lineTotal,
          notes: item.notes || null,
        });
      }

      const totalAmount = subtotal - totalDiscountAmount + totalTaxAmount;
      const pendingAmount = parseFloat(saleData.pendingAmount) || 0;
      const isPaid = pendingAmount === 0;
      const status = pendingAmount === 0 ? 'CONFIRMED' : 'PENDING';

      // Create sale with items
      const sale = await prisma.sale.create({
        data: {
          customerId: saleData.customerId,
          subtotal,
          discountAmount: totalDiscountAmount,
          taxAmount: totalTaxAmount,
          totalAmount,
          pendingAmount,
          isPaid,
          status,
          paymentType: saleData.paymentType,
          paymentMethod: saleData.paymentMethod,
          notes: saleData.notes || null,
          items: {
            create: saleItemsData,
          },
        },
        include: {
          customer: { include: { address: true } },
          items: {
            include: {
              bike: { include: { model: true } },
              accessory: true,
            },
          },
        },
      });

      // Update inventory and bike status after sale is created
      for (const item of saleItemsData) {
        if (item.itemType === 'BIKE') {
          // Update bike status to SOLD
          await prisma.bike.update({
            where: { id: item.bikeId },
            data: { status: 'SOLD' },
          });
        } else if (item.itemType === 'ACCESSORY') {
          // Decrease accessory quantity
          await prisma.accessories.update({
            where: { id: item.accessoryId },
            data: {
              quantityInStock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Generate and save invoice
      const invoiceInfo = await invoiceService.saveInvoice(sale);

      // Update sale with invoice URL
      const updatedSale = await prisma.sale.update({
        where: { id: sale.id },
        data: { invoiceUrl: invoiceInfo.url },
        include: {
          customer: { include: { address: true } },
          items: {
            include: {
              bike: { include: { model: true } },
              accessory: true,
            },
          },
        },
      });

      return updatedSale;
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Related record not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async getSale(id) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
          customer: { include: { address: true } },
          items: {
            include: {
              bike: { include: { model: true } },
              accessory: true,
            },
          },
        },
      });

      if (!sale || sale.isDeleted) {
        throw { message: 'Sale not found', statusCode: 404 };
      }

      return sale;
    } catch (error) {
      throw error;
    }
  }

  async getAllSales() {
    try {
      const sales = await prisma.sale.findMany({
        where: { isDeleted: false },
        include: {
          customer: { include: { address: true } },
          items: {
            include: {
              bike: { include: { model: true } },
              accessory: true,
            },
          },
        },
      });

      return sales;
    } catch (error) {
      throw error;
    }
  }

  async updateSaleStatus(id, status) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

    if (!validStatuses.includes(status)) {
      throw {
        field: 'status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      };
    }

    try {
      const sale = await prisma.sale.update({
        where: { id },
        data: { status },
        include: {
          customer: { include: { address: true } },
          items: {
            include: {
              bike: { include: { model: true } },
              accessory: true,
            },
          },
        },
      });

      return sale;
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Sale not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async updatePendingAmount(id, pendingAmount) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id },
      });

      if (!sale) {
        throw { message: 'Sale not found', statusCode: 404 };
      }

      const isPaid = pendingAmount === 0;
      const status = pendingAmount === 0 ? 'CONFIRMED' : 'PENDING';

      const updatedSale = await prisma.sale.update({
        where: { id },
        data: {
          pendingAmount,
          isPaid,
          status,
        },
        include: {
          customer: { include: { address: true } },
          items: {
            include: {
              bike: { include: { model: true } },
              accessory: true,
            },
          },
        },
      });

      return updatedSale;
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Sale not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async deleteSale(id) {
    try {
      // First check if sale exists with all items
      const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              bike: true,
              accessory: true,
            },
          },
        },
      });

      if (!sale || sale.isDeleted) {
        throw { message: 'Sale not found', statusCode: 404 };
      }

      // Update bikes status to AVAILABLE
      for (const item of sale.items) {
        if (item.bikeId) {
          await prisma.bike.update({
            where: { id: item.bikeId },
            data: { status: 'AVAILABLE' },
          });
        }

        // Increase accessory quantity
        if (item.accessoryId) {
          await prisma.accessories.update({
            where: { id: item.accessoryId },
            data: { quantityInStock: { increment: item.quantity } },
          });
        }
      }

      // Soft delete the sale
      const deletedSale = await prisma.sale.update({
        where: { id },
        data: { isDeleted: true },
        include: {
          customer: { include: { address: true } },
          items: {
            include: {
              bike: { include: { model: true } },
              accessory: true,
            },
          },
        },
      });

      return deletedSale;
    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw { message: 'Sale not found', statusCode: 404 };
      }
      throw error;
    }
  }
}

module.exports = new SalesService();
