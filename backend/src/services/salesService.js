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

    // Exchange data payload level validation
    if (data.exchangeData) {
      const ex = data.exchangeData;
      if (!ex.oldBikeName || ex.oldBikeName.trim() === '') errors.push({ field: 'exchangeData.oldBikeName', message: 'Exchange bike name is required' });
      if (!ex.oldBikeBrand || ex.oldBikeBrand.trim() === '') errors.push({ field: 'exchangeData.oldBikeBrand', message: 'Exchange bike brand is required' });
      if (!ex.oldBikeModel || ex.oldBikeModel.trim() === '') errors.push({ field: 'exchangeData.oldBikeModel', message: 'Exchange bike model is required' });
      if (!ex.oldBikeColor || ex.oldBikeColor.trim() === '') errors.push({ field: 'exchangeData.oldBikeColor', message: 'Exchange bike color is required' });
      if (!ex.oldBikeYear || typeof ex.oldBikeYear !== 'number') errors.push({ field: 'exchangeData.oldBikeYear', message: 'Valid exchange bike manufacturing year is required' });
      if (ex.exchangeValue === undefined || typeof ex.exchangeValue !== 'number' || ex.exchangeValue < 0) {
        errors.push({ field: 'exchangeData.exchangeValue', message: 'Exchange valuation must be a valid non-negative number' });
      }
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
        message: 'Discount/Exchange Amount must be a non-negative number',
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
      const customer = await prisma.customer.findUnique({
        where: { id: saleData.customerId },
      });

      if (!customer || customer.isDeleted) {
        throw { field: 'customerId', message: 'Customer not found' };
      }
      

      // Check unique constraints for exchange bike strings before executing transaction blocks
      if (saleData.exchangeData) {
        if (!prisma.excahgebikes) throw new Error("Prisma model 'excahgebikes' is not initialized.");
        

        if (saleData.exchangeData.oldBikeEngineNumber) {
          const exEngine = await prisma.excahgebikes.findUnique({ where: { oldBikeEngineNumber: saleData.exchangeData.oldBikeEngineNumber } });
          if (exEngine) throw { field: 'exchangeData.oldBikeEngineNumber', message: 'Exchange bike engine number already exists' };
          
        }
        if (saleData.exchangeData.oldBikeChassisNumber) {
          const exChassis = await prisma.excahgebikes.findUnique({ where: { oldBikeChassisNumber: saleData.exchangeData.oldBikeChassisNumber } });
          if (exChassis) throw { field: 'exchangeData.oldBikeChassisNumber', message: 'Exchange bike chassis number already exists' };
          
        }
      }

      let subtotal = 0;
      let totalDiscountAmount = 0;
      let totalTaxAmount = 0;

      const saleItemsData = [];
      let totalRtoOverall = 0;
      let totalInsuranceOverall = 0;
      let totalOtherOverall = 0;

      for (const item of saleData.items) {
        

        const quantity = item.itemType === 'BIKE' ? 1 : item.quantity;
        let unitPrice = parseFloat(item.unitPrice) || 0;
        let cgstRate = 0;
        let sgstRate = 0;
        let igstRate = 0;
        let cessRate = 0;
        let rtoCharges = 0;
        let insuranceCharges = 0;
        let otherCharges = 0;

        if (item.itemType === 'BIKE') {
          if (item.bikeId) {
            const bike = await prisma.bike.findUnique({
              where: { id: item.bikeId },
              include: { model: true }
            });
            if (!bike || bike.isDeleted) {
              throw { field: 'items.bikeId', message: `Bike with ID ${item.bikeId} not found` };
            }
            const model = bike.model;
            unitPrice = item.unitPrice || model.exShowroomPrice || unitPrice;
            cgstRate = model.cgstRate || 0;
            sgstRate = model.sgstRate || 0;
            igstRate = model.igstRate || 0;
            cessRate = model.cessRate || 0;
            
          } else if (item.modelId) {
            const model = await prisma.bikeModel.findUnique({
              where: { id: item.modelId }
            });
            if (!model || model.isDeleted) {
              throw { field: 'items.modelId', message: `Model with ID ${item.modelId} not found` };
            }
            unitPrice = item.unitPrice || model.exShowroomPrice || unitPrice;
            cgstRate = model.cgstRate || 0;
            sgstRate = model.sgstRate || 0;
            igstRate = model.igstRate || 0;
            cessRate = model.cessRate || 0;
            
          }
        } else {
          const accessory = await prisma.accessories.findUnique({
            where: { id: item.accessoryId },
          });
          if (!accessory || accessory.isDeleted) {
            throw { field: 'items.accessoryId', message: `Accessory with ID ${item.accessoryId} not found` };
          }
          unitPrice = item.unitPrice || accessory.price || unitPrice;
          
        }

        const discountAmount = parseFloat(item.discountAmount) || 0;
        const totalTaxRate = (cgstRate + sgstRate + igstRate + cessRate) / 100;

        const itemSubtotal = unitPrice * quantity;
        const itemDiscountTotal = discountAmount * quantity;

        const inclusivePrice = unitPrice - discountAmount;
        const basePrice = inclusivePrice / (1 + totalTaxRate);
        const itemTaxAmount = (inclusivePrice - basePrice) * quantity;
        const lineTotal = (inclusivePrice * quantity) + rtoCharges + insuranceCharges + otherCharges;

        subtotal += itemSubtotal;
        totalDiscountAmount += itemDiscountTotal;
        totalTaxAmount += itemTaxAmount;

        

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
          
        } else {
          
        }
      }

      totalDiscountAmount += globalDiscountAmount;

      const totalAmount = (subtotal - totalDiscountAmount) + totalRtoOverall + totalInsuranceOverall + totalOtherOverall;
      const pendingAmount = parseFloat(saleData.pendingAmount) || 0;
      const paidAmount = totalAmount - pendingAmount;
      const isPaid = pendingAmount === 0;

      const isPDI = saleItemsData.some(it => it.itemType === 'BIKE' && !it.bikeId);
      const status = isPDI ? 'PDI' : (pendingAmount === 0 ? 'CONFIRMED' : 'PENDING');
      const saleNumber = await this.generateSaleNumber();

      console.log(saleData);

      // Wrapped execution inside transaction blocks to couple sale creation & exchange validation securely
      const resultSale = await prisma.$transaction(async (tx) => {

        const sale = await tx.sale.create({
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
            financeExecutiveName: saleData.financeExecutiveName || null,
            financeExecutivePhone: saleData.financeExecutivePhone || null,
            disbursementAmount: saleData.disbursementAmount || null,
            nomineeName: saleData.nomineeName || null,
            nomineeAge: saleData.nomineeAge ? parseInt(saleData.nomineeAge) : null,
            nomineeRelation: saleData.nomineeRelation || null,
            isPaid,
            status,
            paymentType: saleData.paymentType,
            paymentMethod: saleData.paymentMethod,
            notes: saleData.notes || null,
            items: {
              create: saleItemsData,
            },
          },
        });
        

        // If the user checked the exchange toggle, bind the parameters directly to this sale item
        if (saleData.exchangeData) {
          await tx.excahgebikes.create({
            data: {
              oldBikeName: saleData.exchangeData.oldBikeName,
              oldBikeBrand: saleData.exchangeData.oldBikeBrand,
              oldBikeModel: saleData.exchangeData.oldBikeModel,
              oldBikeColor: saleData.exchangeData.oldBikeColor,
              oldBikeYear: saleData.exchangeData.oldBikeYear,
              oldBikeEngineNumber: saleData.exchangeData.oldBikeEngineNumber || null,
              oldBikeChassisNumber: saleData.exchangeData.oldBikeChassisNumber || null,
              exchangeValue: saleData.exchangeData.exchangeValue,
              notes: saleData.exchangeData.notes || null,
              isOldRCAvailable: saleData.exchangeData.isOldRCAvailable || false,
              isNocAvailable: saleData.exchangeData.isNocAvailable || false,
              isOwnerDocumentAvailable: saleData.exchangeData.isOwnerDocumentAvailable || false,
              isChallanAvailable: saleData.exchangeData.isChallanAvailable || false,
              isStatmentAvailable: saleData.exchangeData.isStatmentAvailable || false,
              saleId: sale.id // Linked mapping 
            }
          });
          
        }

        return sale;
      });
      

      // Update inventory configuration maps
      for (const item of saleItemsData) {
        if (item.itemType === 'BIKE' && item.bikeId) {
          await prisma.bike.update({
            where: { id: item.bikeId },
            data: { status: 'SOLD', saleId: resultSale.id },
          });
          
        } else if (item.itemType === 'ACCESSORY') {
          await prisma.accessories.update({
            where: { id: item.accessoryId },
            data: { quantityInStock: { decrement: item.quantity } },
          });
          
        }
      }

      // Re-fetch complete database object structure for invoice integration mappings
      const fullyLoadedSale = await prisma.sale.findUnique({
        where: { id: resultSale.id },
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
      

      const invoiceInfo = await invoiceService.saveInvoice(fullyLoadedSale);
      

      const updatedSale = await prisma.sale.update({
        where: { id: fullyLoadedSale.id },
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

  async getAllSales() {
    try {
      const sales = await prisma.sale.findMany({
        where: { isDeleted: false },
        include: {
          // Correct mapping from your schema
          exchange: true, 
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
async getSale(id) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
          customer: { include: { address: true } },
          // Correct placement: Root level of Sale
          exchange: true, 
          items: {
            include: {
              bike: { include: { model: true } },
              model: true,
              accessory: true,
              // Removed exchange from here since SaleItem doesn't have an exchange relation
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

      for (const item of sale.items) {
        if (item.bikeId) {
          await prisma.bike.update({
            where: { id: item.bikeId },
            data: { status: 'AVAILABLE' },
          });
        }

        if (item.accessoryId) {
          await prisma.accessories.update({
            where: { id: item.accessoryId },
            data: { quantityInStock: { increment: item.quantity } },
          });
        }
      }

      // If a linked exchange entry is found, remove it along with the cascade sequence 
      if (prisma.excahgebikes) {
        const exchangeRecord = await prisma.excahgebikes.findUnique({ where: { saleId: id } });
        if (exchangeRecord) {
          await prisma.excahgebikes.delete({ where: { saleId: id } });
        }
      }

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

      if (saleItem.modelId && bike.modelId !== saleItem.modelId) {
        throw { statusCode: 400, message: 'Selected bike model does not match the sale model' };
      }

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
          data: { 
            status: 'SOLD',
            saleId: si.saleId
          }
        });

        const pendingBikesCount = await tx.saleItem.count({
          where: {
            saleId: si.saleId,
            itemType: 'BIKE',
            bikeId: null
          }
        });

        let updatedSale = si.sale;
        if (pendingBikesCount === 0) {
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