const prisma = require('../config/db');

const VALID_BIKE_STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD', 'IN_SERVICE'];
const VALID_MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

class BikeService {
  validateCreateData(data) {
    const errors = [];

    if (!data.modelId || data.modelId.trim() === '') {
      errors.push({ field: 'modelId', message: 'Model ID is required and cannot be empty' });
    }

    if (!data.color || data.color.trim() === '') {
      errors.push({ field: 'color', message: 'Color is required and cannot be empty' });
    }

    if (!data.engineNumber || data.engineNumber.trim() === '') {
      errors.push({ field: 'engineNumber', message: 'Engine Number is required and cannot be empty' });
    }

    if (!data.chassisNumber || data.chassisNumber.trim() === '') {
      errors.push({ field: 'chassisNumber', message: 'Chassis Number is required and cannot be empty' });
    }

    if (!data.manufactureMonth || !VALID_MONTHS.includes(data.manufactureMonth)) {
      errors.push({
        field: 'manufactureMonth',
        message: `Manufacture Month must be one of: ${VALID_MONTHS.join(', ')}`,
      });
    }

    if (!data.manufactureYear || typeof data.manufactureYear !== 'number' || data.manufactureYear < 1900) {
      errors.push({ field: 'manufactureYear', message: 'Manufacture Year must be a valid year (>= 1900)' });
    }

    return errors;
  }

  async createBike(data) {
    const validationErrors = this.validateCreateData(data);
    if (validationErrors.length > 0) {
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      // Check if model exists
      const model = await prisma.bikeModel.findUnique({
        where: { id: data.modelId },
      });

      if (!model || model.isDeleted) {
        throw {
          field: 'modelId',
          message: 'BikeModel with this ID does not exist',
        };
      }

      const bike = await prisma.bike.create({
        data: {
          engineNumber: data.engineNumber,
          chassisNumber: data.chassisNumber,
          modelId: data.modelId,
          color: data.color,
          status: data.status || 'AVAILABLE',
          manufactureYear: data.manufactureYear,
          manufactureMonth: data.manufactureMonth,
          registrationNumber: data.registrationNumber || null,
          purchaseId: data.purchaseId || null,
        },
        include: { model: true },
      });

      return bike;
    } catch (error) {
      if (error.code === 'P2002') {
        throw {
          field: error.meta.target[0],
          message: `Bike with this ${error.meta.target[0]} already exists`,
        };
      }
      throw error;
    }
  }

  async updateBike(id, data) {
    try {
      if (data.modelId) {
        const model = await prisma.bikeModel.findUnique({
          where: { id: data.modelId },
        });

        if (!model || model.isDeleted) {
          throw {
            field: 'modelId',
            message: 'BikeModel with this ID does not exist',
          };
        }
      }

      const bike = await prisma.bike.update({
        where: { id },
        data: {
          engineNumber: data.engineNumber,
          chassisNumber: data.chassisNumber,
          modelId: data.modelId,
          color: data.color,
          status: data.status,
          manufactureYear: data.manufactureYear,
          manufactureMonth: data.manufactureMonth,
          registrationNumber: data.registrationNumber !== undefined ? data.registrationNumber : undefined,
          isRcArrived: data.isRcArrived !== undefined ? data.isRcArrived : undefined,
          isNumberPlateReady: data.isNumberPlateReady !== undefined ? data.isNumberPlateReady : undefined,
          isInsuranceRecived: data.isInsuranceRecived !== undefined ? data.isInsuranceRecived : undefined,
        },
        include: { model: true },
      });

      return bike;
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Bike not found', statusCode: 404 };
      }
      if (error.code === 'P2002') {
        throw {
          field: error.meta.target[0],
          message: `Bike with this ${error.meta.target[0]} already exists`,
        };
      }
      throw error;
    }
  }

  async updateStatus(id, status) {
    {
      try {
        if (!VALID_BIKE_STATUSES.includes(status)) {
          throw {
            field: 'status',
            message: `Status must be one of: ${VALID_BIKE_STATUSES.join(', ')}`,
          };
        }
        const bike = await prisma.bike.update({
          where: { id },
          data: { status },
          include: { model: true },
        });

        return bike;
      } catch (error) {
        if (error.code === 'P2025') {
          throw { message: 'Bike not found', statusCode: 404 };
        }
        if (error.code === 'P2002') {
          throw {
            field: error.meta.target[0],
            message: `Bike with this ${error.meta.target[0]} already exists`,
          };
        }
        throw error;
      }
    }
  }


  async deleteBike(id) {
    try {
      const bike = await prisma.bike.update({
        where: { id },
        data: { isDeleted: true },
      });

      return { message: 'Bike deleted successfully', id: bike.id };
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Bike not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async getBike(id) {
    try {
      const bike = await prisma.bike.findUnique({
        where: { id },
        include: {
          model: true,
          sale: {
            include: {
              customer: {
                include: {
                  address: true
                }
              }
            }
          },
          saleItems: {
            where: {
              sale: {
                isDeleted: false
              }
            },
            include: {
              sale: {
                include: {
                  customer: {
                    include: {
                      address: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
      });

      if (!bike || bike.isDeleted) {
        throw { message: 'Bike not found', statusCode: 404 };
      }

      return bike;
    } catch (error) {
      throw error;
    }
  }

  async getAllBikes(filters) {
    const appliedFilters = {};

    if (filters?.status === 'AVAILABLE') {
      appliedFilters.status = {
        in: ['AVAILABLE', 'EXCHANGED']
      };
    }

    if (filters?.modelId) {
      appliedFilters.modelId = filters.modelId;
    }
    try {
      const bikes = await prisma.bike.findMany({
        where: { isDeleted: false, ...appliedFilters },
        include: { model: true },
      });

      console.log(bikes)

      return bikes;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BikeService();
