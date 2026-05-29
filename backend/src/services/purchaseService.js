const crypto = require('crypto');
const prisma = require('../config/db');

class PurchaseService {
  async generatePurchaseNumber() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = `PUR-${crypto.randomInt(100000, 999999)}`;
      const existing = await prisma.purchase.findFirst({
        where: { purchaseNumber: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }
    }
    throw new Error('Unable to generate a unique purchase number');
  }

  async createPurchase(data) {
    const { supplierId, purchaseDate, notes, bikes } = data;

    if (!supplierId) {
      throw { field: 'supplierId', message: 'Supplier is required' };
    }

    if (!bikes || !Array.isArray(bikes) || bikes.length === 0) {
      throw { field: 'bikes', message: 'At least one bike is required for a purchase' };
    }

    // Validate bikes
    bikes.forEach((bike, index) => {
      if (!bike.modelId) throw { field: `bikes[${index}].modelId`, message: 'Model is required' };
      if (!bike.engineNumber) throw { field: `bikes[${index}].engineNumber`, message: 'Engine Number is required' };
      if (!bike.chassisNumber) throw { field: `bikes[${index}].chassisNumber`, message: 'Chassis Number is required' };
      if (!bike.manufactureYear) throw { field: `bikes[${index}].manufactureYear`, message: 'Manufacture Year is required' };
      if (!bike.color) throw { field: `bikes[${index}].color`, message: 'Color is required' };
    });

    const purchaseNumber = await this.generatePurchaseNumber();

    try {
      const result = await prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.create({
          data: {
            purchaseNumber,
            supplierId,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
            notes,
          },
        });

        // Create bikes linked to this purchase
        const bikePromises = bikes.map((bike) =>
          tx.bike.create({
            data: {
              engineNumber: bike.engineNumber,
              chassisNumber: bike.chassisNumber,
              modelId: bike.modelId,
              color: bike.color,
              manufactureYear: parseInt(bike.manufactureYear),
              manufactureMonth: bike.manufactureMonth || 'JANUARY',
              purchaseId: purchase.id,
              status: 'AVAILABLE',
            },
          })
        );

        await Promise.all(bikePromises);

        return purchase;
      });

      return result;
    } catch (error) {
      if (error.code === 'P2002') {
        throw {
          message: `Bike with this ${error.meta.target[0]} already exists`,
          field: error.meta.target[0],
        };
      }
      throw error;
    }
  }

  async getAllPurchases() {
    return prisma.purchase.findMany({
      where: { isDeleted: false },
      include: {
        supplier: true,
        _count: {
          select: { bikes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPurchase(id) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        bikes: {
          include: { model: true },
        },
      },
    });

    if (!purchase || purchase.isDeleted) {
      throw { message: 'Purchase not found', statusCode: 404 };
    }

    return purchase;
  }

  async deletePurchase(id) {
    // Soft delete purchase and associated bikes? 
    // Usually, we just delete the purchase record if it's a mistake, 
    // but the bikes should probably be marked as deleted too if they haven't been sold.
    
    return prisma.purchase.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

module.exports = new PurchaseService();
