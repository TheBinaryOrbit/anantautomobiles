const prisma = require('../config/db');
const invoiceService = require('./invoiceService');

// Challan numbers must follow the physical challan book, which starts at 2199.
const CHALLAN_COUNTER_ID = 'CHALLAN_NUMBER';
const CHALLAN_START_NUMBER = 2199;

const EDITABLE_PAYMENT_TYPES = [
  'FULL_PAYMENT',
  'PARTIAL_PAYMENT_AND_PENDING',
  'PARTIAL_PAYMENT_AND_PENDING_AND_FINANCE',
  'DOWN_PAYMENT_AND_FINANCE',
  'FULL_FINANCE',
  'OTHER',
];

const EDITABLE_PAYMENT_METHODS = [
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'UPI',
  'CHEQUE',
  'NET_BANKING',
  'FINANCE',
  'OTHER',
];

const SALE_INCLUDE = {
  customer: { include: { address: true } },
  exchange: true,
  items: {
    include: {
      bike: { include: { model: true } },
      model: true,
      accessory: true,
    },
  },
};

class SalesService {
  /**
   * Seeds the challan counter at (start - 1) so the very first increment hands
   * out CHALLAN_START_NUMBER itself. Runs on the base client on purpose: the row
   * should survive even if the surrounding sale transaction rolls back.
   */
  async ensureChallanCounter() {
    const existing = await prisma.counter.findUnique({ where: { id: CHALLAN_COUNTER_ID } });
    if (existing) return existing;

    try {
      return await prisma.counter.create({
        data: { id: CHALLAN_COUNTER_ID, value: CHALLAN_START_NUMBER - 1 },
      });
    } catch (error) {
      // Another request seeded it first
      if (error.code === 'P2002') {
        return prisma.counter.findUnique({ where: { id: CHALLAN_COUNTER_ID } });
      }
      throw error;
    }
  }

  /**
   * Hands out the next challan number in sequence. `client` may be a transaction
   * client so the number is rolled back with the sale it was reserved for.
   */
  async generateSaleNumber(client = prisma) {
    await this.ensureChallanCounter();

    for (let attempt = 0; attempt < 25; attempt += 1) {
      const counter = await client.counter.update({
        where: { id: CHALLAN_COUNTER_ID },
        data: { value: { increment: 1 } },
      });

      const candidate = String(Math.max(counter.value, CHALLAN_START_NUMBER));
      const existingSale = await client.sale.findFirst({
        where: { saleNumber: candidate },
        select: { id: true },
      });

      // Skip over numbers already used by sales created before the sequence existed
      if (!existingSale) {
        return candidate;
      }
    }

    throw new Error('Unable to generate a unique challan number');
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
      const paidAmount = saleData.paidAmount;
      const isPaid = pendingAmount === 0;

      const isPDI = saleItemsData.some(it => it.itemType === 'BIKE' && !it.bikeId);
      const status = isPDI ? 'PDI' : (pendingAmount === 0 ? 'CONFIRMED' : 'PENDING');

      // Wrapped execution inside transaction blocks to couple sale creation & exchange validation securely
      const resultSale = await prisma.$transaction(async (tx) => {
        // Reserved inside the transaction so a failed sale does not burn a challan number
        const saleNumber = await this.generateSaleNumber(tx);

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
        orderBy : {
          createdAt: 'desc'
        }
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
    const validStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED', 'REFUNDED' ,'EXCHANGED'];

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

  /**
   * A booked sale can only be corrected, never restructured: amounts, customer
   * details, nominee, finance details and payment mode are editable, sale items
   * are not.
   */
  validateSaleUpdate(data) {
    const errors = [];

    if (data.paymentType !== undefined && !EDITABLE_PAYMENT_TYPES.includes(data.paymentType)) {
      errors.push({
        field: 'paymentType',
        message: `Payment Type must be one of: ${EDITABLE_PAYMENT_TYPES.join(', ')}`,
      });
    }

    if (data.paymentMethod !== undefined && !EDITABLE_PAYMENT_METHODS.includes(data.paymentMethod)) {
      errors.push({
        field: 'paymentMethod',
        message: `Payment Method must be one of: ${EDITABLE_PAYMENT_METHODS.join(', ')}`,
      });
    }

    ['paidAmount', 'pendingAmount', 'disbursementAmount'].forEach((field) => {
      if (data[field] === undefined || data[field] === null || data[field] === '') return;
      const value = Number(data[field]);
      if (Number.isNaN(value) || value < 0) {
        errors.push({ field, message: `${field} must be a non-negative number` });
      }
    });

    if (data.nomineeAge !== undefined && data.nomineeAge !== null && data.nomineeAge !== '') {
      const age = Number(data.nomineeAge);
      if (Number.isNaN(age) || age < 0) {
        errors.push({ field: 'nomineeAge', message: 'Nominee Age must be a non-negative number' });
      }
    }

    if (data.customer) {
      if (data.customer.name !== undefined && String(data.customer.name).trim() === '') {
        errors.push({ field: 'customer.name', message: 'Customer Name cannot be empty' });
      }
      if (data.customer.phone !== undefined && String(data.customer.phone).replace(/\D/g, '').length < 10) {
        errors.push({ field: 'customer.phone', message: 'Customer Phone must be at least 10 digits' });
      }
    }

    return errors;
  }

  async updateSale(id, updateData) {
    const validationErrors = this.validateSaleUpdate(updateData);
    if (validationErrors.length > 0) {
      throw { validationErrors, message: 'Validation failed' };
    }

    const existingSale = await prisma.sale.findUnique({ where: { id } });

    if (!existingSale || existingSale.isDeleted) {
      throw { message: 'Sale not found', statusCode: 404 };
    }

    const nullableString = (v) => (v === null || String(v).trim() === '' ? null : String(v).trim());
    const nullableNumber = (v) => (v === null || v === '' ? null : Number(v));

    const data = {};
    const setIfPresent = (field, transform = (v) => v) => {
      if (updateData[field] !== undefined) data[field] = transform(updateData[field]);
    };

    setIfPresent('paymentType');
    setIfPresent('paymentMethod');
    setIfPresent('financeCompany', nullableString);
    setIfPresent('financeExecutiveName', nullableString);
    setIfPresent('financeExecutivePhone', nullableString);
    setIfPresent('disbursementAmount', nullableNumber);
    setIfPresent('nomineeName', nullableString);
    setIfPresent('nomineeRelation', nullableString);
    setIfPresent('nomineeAge', (v) => (v === null || v === '' ? null : parseInt(v, 10)));
    setIfPresent('notes', nullableString);

    if (updateData.paidAmount !== undefined || updateData.pendingAmount !== undefined) {
      const totalAmount = existingSale.totalAmount;
      const paidAmount = updateData.paidAmount !== undefined
        ? Number(updateData.paidAmount)
        : existingSale.paidAmount;
      const pendingAmount = updateData.pendingAmount !== undefined
        ? Number(updateData.pendingAmount)
        : Math.max(0, totalAmount - paidAmount);

      if (pendingAmount > totalAmount) {
        throw { field: 'pendingAmount', message: 'Pending Amount cannot exceed the sale total' };
      }

      data.paidAmount = Math.max(0, paidAmount);
      data.pendingAmount = Math.max(0, pendingAmount);
      data.isPaid = data.pendingAmount === 0;

      // Only the payment-driven statuses are recalculated; PDI / CANCELLED / EXCHANGED stay as they are
      if (['PENDING', 'CONFIRMED'].includes(existingSale.status)) {
        data.status = data.isPaid ? 'CONFIRMED' : 'PENDING';
      }
    }

    // Re-point the sale at a different customer record
    if (updateData.customerId && updateData.customerId !== existingSale.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: updateData.customerId } });
      if (!customer || customer.isDeleted) {
        throw { field: 'customerId', message: 'Customer not found' };
      }
      data.customerId = updateData.customerId;
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Correct the details of the customer this sale is billed to
        if (updateData.customer) {
          const customerId = data.customerId || existingSale.customerId;
          const incoming = updateData.customer;
          const customerData = {};

          if (incoming.name !== undefined) customerData.name = String(incoming.name).trim();
          if (incoming.phone !== undefined) customerData.phone = String(incoming.phone).trim();
          if (incoming.aadhaarNumber !== undefined) customerData.aadhaarNumber = nullableString(incoming.aadhaarNumber);
          if (incoming.panNumber !== undefined) customerData.panNumber = nullableString(incoming.panNumber);
          if (incoming.dob !== undefined) customerData.dob = incoming.dob ? new Date(incoming.dob) : null;
          if (incoming.marriageAnniversary !== undefined) {
            customerData.marriageAnniversary = incoming.marriageAnniversary ? new Date(incoming.marriageAnniversary) : null;
          }

          if (Object.keys(customerData).length > 0) {
            await tx.customer.update({ where: { id: customerId }, data: customerData });
          }

          if (incoming.address) {
            const target = await tx.customer.findUnique({
              where: { id: customerId },
              select: { addressId: true },
            });

            const addressData = {};
            ['addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country'].forEach((field) => {
              if (incoming.address[field] !== undefined) addressData[field] = incoming.address[field];
            });

            if (target && Object.keys(addressData).length > 0) {
              await tx.address.update({ where: { id: target.addressId }, data: addressData });
            }
          }
        }

        if (Object.keys(data).length > 0) {
          await tx.sale.update({ where: { id }, data });
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'value';
        throw { field, message: `Another record with this ${field} already exists` };
      }
      if (error.code === 'P2025') {
        throw { message: 'Sale not found', statusCode: 404 };
      }
      throw error;
    }

    // Every editable field is printed on the challan, so it has to be rebuilt
    return this.regenerateInvoice(id);
  }

  /** Rebuilds the challan PDF from the current sale record, replacing the old file. */
  async regenerateInvoice(id) {
    const sale = await prisma.sale.findUnique({ where: { id }, include: SALE_INCLUDE });

    if (!sale) {
      throw { message: 'Sale not found', statusCode: 404 };
    }

    if (sale.invoiceUrl) {
      await invoiceService.deleteInvoice(sale.invoiceUrl);
    }

    const invoiceInfo = await invoiceService.saveInvoice(sale);

    return prisma.sale.update({
      where: { id },
      data: { invoiceUrl: invoiceInfo.url },
      include: SALE_INCLUDE,
    });
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

      console.log(bike.status)

      if (!bike || (bike.status !== 'AVAILABLE' && bike.status !== 'EXCHANGED')) {
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


  async updateSaleItem(id, updateData) {
    try {
      const saleItem = await prisma.saleItem.findUnique({
        where: { id },
        include: { sale: true }
      });

      if (!saleItem) {
        throw { message: 'Sale item not found', statusCode: 404 };
      }

      const updatedSaleItem = await prisma.saleItem.update({
        where: { id },
        data: updateData
      });

      return updatedSaleItem;
    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      throw new Error(`Failed to update sale item: ${error.message}`);
    }
  }


  async exchangeSaleItem(saleItemId, reqBody) {
    const { newItemType, newItemId, newColor, newUnitPrice, newDiscountAmount, newNotes } = reqBody;

    if (!saleItemId) {
      throw { statusCode: 400, message: 'Sale Item ID is required' };
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current sale item and its parent sale structure
      const oldSaleItem = await tx.saleItem.findUnique({
        where: { id: saleItemId },
        include: { sale: true }
      });

      if (!oldSaleItem) {
        throw { statusCode: 44, message: 'Original Sale Item not found' };
      }
      if (oldSaleItem.SaleItemStatus === 'EXCHANGED') {
        throw { statusCode: 400, message: 'This item has already been exchanged' };
      }

      const saleId = oldSaleItem.saleId;

      // 2. Rollback/Update Old Item Statuses
      if (oldSaleItem.itemType === 'BIKE') {
        if (oldSaleItem.bikeId) {
          // Change specific old bike status back to EXCHANGED (re-entering pool or marked away)
          await tx.bike.update({
            where: { id: oldSaleItem.bikeId },
            data: { status: 'EXCHANGED', saleId: null }
          });
        }
      } else if (oldSaleItem.itemType === 'ACCESSORY') {
        // Restock old accessory quantities
        await tx.accessories.update({
          where: { id: oldSaleItem.accessoryId },
          data: { quantityInStock: { increment: oldSaleItem.quantity } }
        });
      }

      // Mark the old sale item structure as EXCHANGED
      await tx.saleItem.update({
        where: { id: saleItemId },
        data: { SaleItemStatus: 'EXCHANGED' }
      });

      // 3. Initialize & Validate New Item Data
      let unitPrice = parseFloat(newUnitPrice) || 0;
      let cgstRate = 0, sgstRate = 0, igstRate = 0, cessRate = 0;
      let bikeId = null;
      let modelId = null;
      let accessoryId = null;
      let quantity = newItemType === 'BIKE' ? 1 : (parseInt(reqBody.quantity) || 1);

      if (newItemType === 'BIKE') {
        // Assume newItemId passed could be a specific Bike ID or BikeModel ID depending on PDI stage
        // Let's check if it's a concrete specific bike unit first
        const bikeUnit = await tx.bike.findUnique({
          where: { id: newItemId },
          include: { model: true }
        });

        if (bikeUnit) {
          if (bikeUnit.status !== 'AVAILABLE') {
            throw { statusCode: 400, message: 'The requested new bike unit is not AVAILABLE' };
          }
          bikeId = bikeUnit.id;
          modelId = bikeUnit.modelId;
          unitPrice = newUnitPrice || bikeUnit.model.exShowroomPrice || 0;
          cgstRate = bikeUnit.model.cgstRate || 0;
          sgstRate = bikeUnit.model.sgstRate || 0;
          igstRate = bikeUnit.model.igstRate || 0;
          cessRate = bikeUnit.model.cessRate || 0;

          // Update new bike to SOLD linked directly to this sale
          await tx.bike.update({
            where: { id: bikeId },
            data: { status: 'SOLD', saleId }
          });
        } else {
          // Treat as Model ID allocation during initial phase
          const bikeModel = await tx.bikeModel.findUnique({ where: { id: newItemId } });
          if (!bikeModel || bikeModel.isDeleted) {
            throw { statusCode: 404, message: 'New Bike Model choice not found' };
          }
          modelId = bikeModel.id;
          unitPrice = newUnitPrice || bikeModel.exShowroomPrice || 0;
          cgstRate = bikeModel.cgstRate || 0;
          sgstRate = bikeModel.sgstRate || 0;
          igstRate = bikeModel.igstRate || 0;
          cessRate = bikeModel.cessRate || 0;
        }
      } else if (newItemType === 'ACCESSORY') {
        const accessory = await tx.accessories.findUnique({ where: { id: newItemId } });
        if (!accessory || accessory.isDeleted) {
          throw { statusCode: 404, message: 'New Accessory variant not found' };
        }
        if (accessory.quantityInStock < quantity) {
          throw { statusCode: 400, message: `Insufficient accessory inventory. Available: ${accessory.quantityInStock}` };
        }
        accessoryId = accessory.id;
        unitPrice = newUnitPrice || accessory.price || 0;

        // Decrement physical stock allocations
        await tx.accessories.update({
          where: { id: accessoryId },
          data: { quantityInStock: { decrement: quantity } }
        });
      }

      // Calculate taxes & totals for the new line item
      const discountAmount = parseFloat(newDiscountAmount) || 0;
      const totalTaxRate = (cgstRate + sgstRate + igstRate + cessRate) / 100;
      const itemSubtotal = unitPrice * quantity;
      const itemDiscountTotal = discountAmount * quantity;
      const inclusivePrice = unitPrice - discountAmount;
      const basePrice = inclusivePrice / (1 + totalTaxRate);
      const itemTaxAmount = (inclusivePrice - basePrice) * quantity;
      const lineTotal = (inclusivePrice * quantity); // Assuming rto/insurance defaults to 0 for additions unless added.

      // 4. Create the New Sale Item row mapping
      await tx.saleItem.create({
        data: {
          saleId,
          itemType: newItemType,
          bikeId,
          modelId,
          color: newItemType === 'BIKE' ? (newColor || 'Any') : null,
          accessoryId,
          quantity,
          unitPrice,
          discountAmount,
          cgstRate,
          sgstRate,
          igstRate,
          cessRate,
          taxRate: (cgstRate + sgstRate + igstRate + cessRate),
          lineTotal,
          SaleItemStatus: 'SOLD',
          notes: newNotes || `Exchanged with item ID: ${saleItemId}`
        }
      });

      // 5. Recalculate Entire Sale Financial Snapshot
      const allUpdatedItems = await tx.saleItem.findMany({ where: { saleId } });
      
      let newSubtotal = 0;
      let newDiscountAmountTotal = 0;
      let newTaxAmountTotal = 0;
      let newTotalAmount = 0;

      // Filter active items for financial footprinting vs old items marked EXCHANGED
      allUpdatedItems.forEach((it) => {
        if (it.SaleItemStatus !== 'EXCHANGED') {
          const qty = it.quantity;
          const taxRatePercent = it.taxRate / 100;
          newSubtotal += it.unitPrice * qty;
          newDiscountAmountTotal += it.discountAmount * qty;
          
          const incPrice = it.unitPrice - it.discountAmount;
          const bPrice = incPrice / (1 + taxRatePercent);
          newTaxAmountTotal += (incPrice - bPrice) * qty;
          newTotalAmount += it.lineTotal;
        }
      });

      // Recalculate pending vs paid values based on existing parameters adjustments
      const currentPending = oldSaleItem.sale.pendingAmount;
      const runningPaidAmount = oldSaleItem.sale.paidAmount;
      const updatedPendingAmount = Math.max(0, newTotalAmount - runningPaidAmount);
      // const updatedPaidAmount = newTotalAmount - updatedPendingAmount;

      // 6. Push global transformations updates directly onto target Sale record
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          subtotal: newSubtotal,
          discountAmount: newDiscountAmountTotal,
          taxAmount: newTaxAmountTotal,
          totalAmount: newTotalAmount,
          pendingAmount: updatedPendingAmount,
          status: 'EXCHANGED' // Enforce parent status update mutation step
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

      // 7. Re-trigger generation pipeline for clean, unified invoices 
      const invoiceInfo = await invoiceService.saveInvoice(updatedSale);
      
      return await tx.sale.update({
        where: { id: saleId },
        data: { invoiceUrl: invoiceInfo.url },
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
    });
  }

}

module.exports = new SalesService();