const prisma = require('../config/db');

class ExchangeBikeService {
  async createExchangeBike(data) {
    if (!prisma.excahgebikes) throw new Error("Prisma model 'excahgebikes' is not initialized. Please restart the server.");

    if (data.oldBikeEngineNumber) {
      const existingEngine = await prisma.excahgebikes.findUnique({
        where: { oldBikeEngineNumber: data.oldBikeEngineNumber },
      });
      if (existingEngine) throw new Error(`Exchange bike with engine number "${data.oldBikeEngineNumber}" already exists`);
    }

    if (data.oldBikeChassisNumber) {
      const existingChassis = await prisma.excahgebikes.findUnique({
        where: { oldBikeChassisNumber: data.oldBikeChassisNumber },
      });
      if (existingChassis) throw new Error(`Exchange bike with chassis number "${data.oldBikeChassisNumber}" already exists`);
    }

    const existingSaleId = await prisma.excahgebikes.findUnique({
      where: { saleId: data.saleId },
    });
    if (existingSaleId) throw new Error(`An exchange entry for sale ID "${data.saleId}" already exists`);

    return await prisma.excahgebikes.create({
      data: {
        oldBikeName: data.oldBikeName,
        oldBikeModel: data.oldBikeModel,
        oldBikeBrand: data.oldBikeBrand,
        oldBikeColor: data.oldBikeColor,
        oldBikeYear: parseInt(data.oldBikeYear),
        oldBikeEngineNumber: data.oldBikeEngineNumber || null,
        oldBikeChassisNumber: data.oldBikeChassisNumber || null,
        exchangeValue: parseFloat(data.exchangeValue),
        // Optional sold price field (defaults to null if not provided during creation)
        oldBikeSoldPrice: data.oldBikeSoldPrice !== undefined && data.oldBikeSoldPrice !== null ? parseFloat(data.oldBikeSoldPrice) : null,
        notes: data.notes || null,
        saleId: data.saleId,
        isOldRCAvailable: data.isOldRCAvailable !== undefined ? data.isOldRCAvailable : false,
        isNocAvailable: data.isNocAvailable !== undefined ? data.isNocAvailable : false,
        isOwnerDocumentAvailable: data.isOwnerDocumentAvailable !== undefined ? data.isOwnerDocumentAvailable : false,
        isChallanAvailable: data.isChallanAvailable !== undefined ? data.isChallanAvailable : false,
        isStatmentAvailable: data.isStatmentAvailable !== undefined ? data.isStatmentAvailable : false,
      },
    });
  }

  async getAllExchangeBikes() {
    if (!prisma.excahgebikes) throw new Error("Prisma model 'excahgebikes' is not initialized. Please restart the server.");
    return await prisma.excahgebikes.findMany({
      orderBy: { createdAt: 'desc' },
      include: { sale: true }
    });
  }

  async getExchangeBike(id) {
    const exchangeBike = await prisma.excahgebikes.findUnique({
      where: { id },
      include: { sale: true }
    });

    if (!exchangeBike) {
      throw { message: 'Exchange bike record not found', statusCode: 404 };
    }

    return exchangeBike;
  }

  async updateExchangeBike(id, data) {
    try {
      return await prisma.excahgebikes.update({
        where: { id },
        data: {
          oldBikeName: data.oldBikeName,
          oldBikeModel: data.oldBikeModel,
          oldBikeBrand: data.oldBikeBrand,
          oldBikeColor: data.oldBikeColor,
          oldBikeYear: data.oldBikeYear !== undefined ? parseInt(data.oldBikeYear) : undefined,
          oldBikeEngineNumber: data.oldBikeEngineNumber,
          oldBikeChassisNumber: data.oldBikeChassisNumber,
          exchangeValue: data.exchangeValue !== undefined ? parseFloat(data.exchangeValue) : undefined,
          // Handles updating the sold price later on
          oldBikeSoldPrice: data.oldBikeSoldPrice !== undefined 
            ? (data.oldBikeSoldPrice !== null ? parseFloat(data.oldBikeSoldPrice) : null) 
            : undefined,
          notes: data.notes,
          saleId: data.saleId,
          isOldRCAvailable: data.isOldRCAvailable,
          isNocAvailable: data.isNocAvailable,
          isOwnerDocumentAvailable: data.isOwnerDocumentAvailable,
          isChallanAvailable: data.isChallanAvailable,
          isStatmentAvailable: data.isStatmentAvailable,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Exchange bike record not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async deleteExchangeBike(id) {
    try {
      return await prisma.excahgebikes.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Exchange bike record not found', statusCode: 404 };
      }
      throw error;
    }
  }
}

module.exports = new ExchangeBikeService();