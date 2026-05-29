const crypto = require('crypto');
const prisma = require('../config/db');
const invoiceService = require('./invoiceService');

class SalesService {
  async generateSaleNumber() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = String(crypto.randomInt(1000000000, 10000000000));
      const existingSale = await prisma.sale.findFirst({
        where: { saleNumber: candidate },
        select: { id: true },
      });

      if (!existingSale) {
        return candidate;
      }
    }

    throw new Error('Unable to generate a unique sale number');
  }

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

    if (item.itemType === 'BIKE') {
      if (!item.bikeId && (!item.modelId || !item.color)) {
        errors.push({
          field: `items[${index}].modelId`,
          message: 'Bike Model and Color are required for PDI stage if no specific bike is selected',
        });
      }
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
      let totalRtoOverall = 0;
      let totalInsuranceOverall = 0;
      let totalOtherOverall = 0;

      for (const item of saleData.items) {
        // For BIKE items, quantity is always 1
        const quantity = item.itemType === 'BIKE' ? 1 : item.quantity;

        let unitPrice = parseFloat(item.unitPrice) || 0;
        let cgstRate = 0;
        let sgstRate = 0;
        let igstRate = 0;
        let cessRate = 0;
        let rtoCharges = 0;
        let insuranceCharges = 0;
        let otherCharges = 0;

        // Verify bike/model/accessory exists
        if (item.itemType === 'BIKE') {
          if (item.bikeId) {
            const bike = await prisma.bike.findUnique({
              where: { id: item.bikeId },
              include: { model: true }
            });
            if (!bike || bike.isDeleted) {
              throw { field: 'items.bikeId', message: `Bike with ID ${item.bikeId} not found` };
            }
            // Use bike model details
            const model = bike.model;
            unitPrice = model.exShowroomPrice || unitPrice;
            cgstRate = model.cgstRate || 0;
            sgstRate = model.sgstRate || 0;
            igstRate = model.igstRate || 0;
            cessRate = model.cessRate || 0;
            // RTO is percentage in model, convert to absolute amount for SaleItem
            rtoCharges = (unitPrice * (model.rtoCharges || 0)) / 100;
            insuranceCharges = model.insuranceCharges || 0;
            otherCharges = model.otherCharges || 0;
          } else if (item.modelId) {
            const model = await prisma.bikeModel.findUnique({
              where: { id: item.modelId }
            });
            if (!model || model.isDeleted) {
              throw { field: 'items.modelId', message: `Model with ID ${item.modelId} not found` };
            }
            unitPrice = model.exShowroomPrice || unitPrice;
            cgstRate = model.cgstRate || 0;
            sgstRate = model.sgstRate || 0;
            igstRate = model.igstRate || 0;
            cessRate = model.cessRate || 0;
            // RTO is percentage in model, convert to absolute amount for SaleItem
            rtoCharges = (unitPrice * (model.rtoCharges || 0)) / 100;
            insuranceCharges = model.insuranceCharges || 0;
            otherCharges = model.otherCharges || 0;
          }
        } else {
          const accessory = await prisma.accessories.findUnique({
            where: { id: item.accessoryId },
          });
          if (!accessory || accessory.isDeleted) {
            throw { field: 'items.accessoryId', message: `Accessory with ID ${item.accessoryId} not found` };
          }
          unitPrice = accessory.price || unitPrice;
        }

        const discountAmount = parseFloat(item.discountAmount) || 0;
        const totalTaxRate = (cgstRate + sgstRate + igstRate + cessRate) / 100;

        const itemSubtotal = unitPrice * quantity;
        const itemDiscountTotal = discountAmount * quantity;
        const taxableValue = (unitPrice - discountAmount) * quantity;
        const itemTaxAmount = taxableValue * totalTaxRate;
        const lineTotal = taxableValue + itemTaxAmount + rtoCharges + insuranceCharges + otherCharges;

        subtotal += itemSubtotal;
        totalDiscountAmount += itemDiscountTotal;
        totalTaxAmount += itemTaxAmount;
        totalRtoOverall += rtoCharges;
        totalInsuranceOverall += insuranceCharges;
        totalOtherOverall += otherCharges;

        saleItemsData.push({
          itemType: item.itemType,
          bikeId: item.itemType === 'BIKE' ? item.bikeId : null,
          modelId: item.itemType === 'BIKE' ? (item.modelId || null) : null,
          color: item.itemType === 'BIKE' ? (item.color || null) : null,
          accessoryId: item.itemType === 'ACCESSORY' ? item.accessoryId : null,
          quantity,
          unitPrice,
          discountAmount,
          cgstRate,
          sgstRate,
          igstRate,
          cessRate,
          rtoCharges,
          insuranceCharges,
          otherCharges,
          taxRate: (cgstRate + sgstRate + igstRate + cessRate),
          lineTotal,
          notes: item.notes || null,
        });
      }

      // Apply global discount if provided
      let globalDiscountAmount = 0;
      if (saleData.discountId) {
        if (!prisma.discount) throw new Error("Prisma model 'discount' is not initialized. Please restart the server.");
        const discount = await prisma.discount.findUnique({ where: { id: saleData.discountId } });
        if (discount && !discount.isDeleted && discount.isActive) {
          if (discount.type === 'FLAT') {
            globalDiscountAmount = discount.value;
          } else if (discount.type === 'PERCENTAGE') {
            globalDiscountAmount = (subtotal * discount.value) / 100;
            if (discount.upToLimit && globalDiscountAmount > discount.upToLimit) {
              globalDiscountAmount = discount.upToLimit;
            }
          }
        }
      }

      totalDiscountAmount += globalDiscountAmount;

      const totalAmount = (subtotal - totalDiscountAmount) + totalTaxAmount + 
                         totalRtoOverall + totalInsuranceOverall + totalOtherOverall;
      
      const pendingAmount = parseFloat(saleData.pendingAmount) || 0;
      const paidAmount = totalAmount - pendingAmount;
      const isPaid = pendingAmount === 0;

      // Status logic: if any item has no bikeId, it's PDI
      const isPDI = saleItemsData.some(it => it.itemType === 'BIKE' && !it.bikeId);
      const status = isPDI ? 'PDI' : (pendingAmount === 0 ? 'CONFIRMED' : 'PENDING');
      const saleNumber = await this.generateSaleNumber();

      // Create sale with items
      const sale = await prisma.sale.create({
        data: {
          saleNumber,
          customerId: saleData.customerId,
          discountId: saleData.discountId || null,
          subtotal,
          discountAmount: totalDiscountAmount,
          taxAmount: totalTaxAmount,
          totalAmount,
          pendingAmount,
          paidAmount,
          financeCompany: saleData.financeCompany || null,
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
              model: true,
              accessory: true,
            },
          },
        },
      });

      // Update inventory and bike status after sale is created
      for (const item of saleItemsData) {
        if (item.itemType === 'BIKE' && item.bikeId) {
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
              model: true,
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
              model: true,
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

      const totalAmount = sale.totalAmount;
      const calculatedPaid = totalAmount - pendingAmount;
      const isPaid = pendingAmount <= 0;
      
      // Keep status as PDI if it was PDI, otherwise toggle between PENDING/CONFIRMED
      const status = sale.status === 'PDI' ? 'PDI' : (isPaid ? 'CONFIRMED' : 'PENDING');

      const updatedSale = await prisma.sale.update({
        where: { id },
        data: {
          pendingAmount: Math.max(0, pendingAmount),
          paidAmount: Math.max(0, calculatedPaid),
          isPaid,
          status,
        },
        include: {
          customer: { include: { address: true } },
          items: {
            include: {
              bike: { include: { model: true } },
              model: true,
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

  async assignBikeToSaleItem(id, bikeId) {
    try {
      const saleItem = await prisma.saleItem.findUnique({
        where: { id },
        include: { sale: true }
      });

      if (!saleItem || saleItem.itemType !== 'BIKE') {
        throw { statusCode: 400, message: 'Invalid sale item' };
      }

      const bike = await prisma.bike.findUnique({
        where: { id: bikeId }
      });

      if (!bike || bike.status !== 'AVAILABLE') {
        throw { statusCode: 400, message: 'Bike is not available or already assigned' };
      }

      // Verify model and color if set in PDI
      if (saleItem.modelId && bike.modelId !== saleItem.modelId) {
        throw { statusCode: 400, message: 'Selected bike model does not match the sale model' };
      }
      // if (saleItem.color && bike.color !== saleItem.color) {
      //   throw { statusCode: 400, message: 'Selected bike color does not match the sale color' };
      // }

      // Update sale item and bike in a transaction
      const updatedSaleItem = await prisma.$transaction(async (tx) => {
        const si = await tx.saleItem.update({
          where: { id },
          data: { bikeId },
          include: { 
            sale: {
              include: {
                customer: { include: { address: true } },
                items: {
                  include: {
                    bike: { include: { model: true } },
                    model: true,
                    accessory: true,
                  },
                },
              },
            }
          }
        });

        await tx.bike.update({
          where: { id: bikeId },
          data: { status: 'SOLD' }
        });

        // Check if all bikes in this sale are now assigned
        const pendingBikesCount = await tx.saleItem.count({
          where: {
            saleId: si.saleId,
            itemType: 'BIKE',
            bikeId: null
          }
        });

        let updatedSale = si.sale;
        if (pendingBikesCount === 0) {
          // If all bikes assigned, update sale status from PDI to PENDING/CONFIRMED
          if (si.sale.status === 'PDI') {
            const newStatus = si.sale.pendingAmount === 0 ? 'CONFIRMED' : 'PENDING';
            updatedSale = await tx.sale.update({
              where: { id: si.saleId },
              data: { status: newStatus },
              include: {
                customer: { include: { address: true } },
                items: {
                  include: {
                    bike: { include: { model: true } },
                    model: true,
                    accessory: true,
                  },
                },
              },
            });
          }
        }

        // Regenerate Invoice with actual bike info (engine/chassis)
        const invoiceInfo = await invoiceService.saveInvoice(updatedSale);
        await tx.sale.update({
          where: { id: updatedSale.id },
          data: { invoiceUrl: invoiceInfo.url }
        });

        return si;
      });

      return updatedSaleItem;
    } catch (error) {
      if (error.statusCode) throw error;
      throw new Error(`Failed to assign bike: ${error.message}`);
    }
  }

  async generatePDISlip(id) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: { include: { address: true } },
        items: {
          include: {
            bike: { include: { model: true } },
            model: true,
            accessory: true,
          },
        },
      },
    });

    if (!sale) throw { message: 'Sale not found', statusCode: 404 };

    const pdiInfo = await invoiceService.savePDISlip(sale);
    return pdiInfo;
  }
}

module.exports = new SalesService();
