const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

class BikeModelService {
  validateCreateData(data, file) {
    const errors = [];

    const mandatoryFields = [
      { field: 'name', label: 'Name' },
      { field: 'brand', label: 'Brand' },
      { field: 'category', label: 'Category' },
      { field: 'fuelType', label: 'Fuel Type' },
      { field: 'engineCapacity', label: 'Engine Capacity' },
      { field: 'launchYear', label: 'Launch Year' },
      { field: 'mileage', label: 'Mileage' },
      { field: 'exShowroomPrice', label: 'Ex-Showroom Price' },
      { field: 'rtoCharges', label: 'RTO Charges' },
      { field: 'insuranceCharges', label: 'Insurance Charges' },
      { field: 'otherCharges', label: 'Other Charges' },
      { field: 'onRoadPrice', label: 'On-Road Price' },
      { field: 'cgstRate', label: 'CGST' },
      { field: 'sgstRate', label: 'SGST' },
      { field: 'igstRate', label: 'IGST' },
      { field: 'cessRate', label: 'Cess' },
      { field: 'hsnCode', label: 'HSN Code' },
    ];

    mandatoryFields.forEach(({ field, label }) => {
      if (data[field] === undefined || data[field] === null || data[field].toString().trim() === '') {
        errors.push({ field, message: `${label} is required` });
      }
    });

    if (!file) {
      errors.push({ field: 'imageUrl', message: 'Image file is required' });
    }

    // Percentage validation (max 100)
    const percentageFields = ['rtoCharges', 'cgstRate', 'sgstRate', 'igstRate', 'cessRate'];
    percentageFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        const val = parseFloat(data[field]);
        if (isNaN(val)) {
          errors.push({ field, message: `${field} must be a number` });
        } else if (val > 100) {
          errors.push({ field, message: `${field} cannot exceed 100%` });
        } else if (val < 0) {
          errors.push({ field, message: `${field} cannot be negative` });
        }
      }
    });

    return errors;
  }

  async createBikeModel(data, file) {
    const validationErrors = this.validateCreateData(data, file);
    if (validationErrors.length > 0) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      const imageUrl = `/uploads/${file.filename}`;

      const bikeModel = await prisma.bikeModel.create({
        data: {
          name: data.name,
          brand: data.brand,
          category: data.category,
          imageUrl,
          remark: data.remark || data.description || null,
          engineCapacity: data.engineCapacity ? parseInt(data.engineCapacity) : null,
          fuelType: data.fuelType || null,
          launchYear: data.launchYear ? parseInt(data.launchYear) : null,
          mileage: data.mileage ? parseFloat(data.mileage) : null,
          weight: data.weight ? parseFloat(data.weight) : null,
          exShowroomPrice: data.exShowroomPrice ? parseFloat(data.exShowroomPrice) : null,
          rtoCharges: data.rtoCharges ? parseFloat(data.rtoCharges) : null,
          insuranceCharges: data.insuranceCharges ? parseFloat(data.insuranceCharges) : null,
          otherCharges: data.otherCharges ? parseFloat(data.otherCharges) : null,
          onRoadPrice: data.onRoadPrice ? parseFloat(data.onRoadPrice) : null,
          cgstRate: data.cgstRate ? parseFloat(data.cgstRate) : 0,
          sgstRate: data.sgstRate ? parseFloat(data.sgstRate) : 0,
          igstRate: data.igstRate ? parseFloat(data.igstRate) : 0,
          cessRate: data.cessRate ? parseFloat(data.cessRate) : 0,
          hsnCode: data.hsnCode || null,
        },
      });

      return bikeModel;
    } catch (error) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      if (error.code === 'P2002') {
        throw {
          message: `BikeModel with this ${error.meta.target[0]} already exists`,
          field: error.meta.target[0],
        };
      }
      throw error;
    }
  }

  async updateBikeModel(id, data, file) {
    const validationErrors = this.validateCreateData(data, file || { filename: 'existing' });
    if (validationErrors.length > 0) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      const updateData = {
        name: data.name,
        brand: data.brand,
        category: data.category,
        remark: data.remark || data.description || null,
        engineCapacity: data.engineCapacity ? parseInt(data.engineCapacity) : null,
        fuelType: data.fuelType || null,
        launchYear: data.launchYear ? parseInt(data.launchYear) : null,
        mileage: data.mileage ? parseFloat(data.mileage) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        exShowroomPrice: data.exShowroomPrice ? parseFloat(data.exShowroomPrice) : null,
        rtoCharges: data.rtoCharges ? parseFloat(data.rtoCharges) : null,
        insuranceCharges: data.insuranceCharges ? parseFloat(data.insuranceCharges) : null,
        otherCharges: data.otherCharges ? parseFloat(data.otherCharges) : null,
        onRoadPrice: data.onRoadPrice ? parseFloat(data.onRoadPrice) : null,
        cgstRate: data.cgstRate ? parseFloat(data.cgstRate) : 0,
        sgstRate: data.sgstRate ? parseFloat(data.sgstRate) : 0,
        igstRate: data.igstRate ? parseFloat(data.igstRate) : 0,
        cessRate: data.cessRate ? parseFloat(data.cessRate) : 0,
        hsnCode: data.hsnCode || null,
      };

      // If new file is provided, update image and delete old one
      if (file) {
        const existingBikeModel = await prisma.bikeModel.findUnique({
          where: { id },
        });

        if (existingBikeModel && existingBikeModel.imageUrl) {
          const oldImagePath = path.join(__dirname, '../../upload', existingBikeModel.imageUrl.replace('/uploads/', ''));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        updateData.imageUrl = `/uploads/${file.filename}`;
      }

      const bikeModel = await prisma.bikeModel.update({
        where: { id },
        data: updateData,
      });

      return bikeModel;
    } catch (error) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      if (error.code === 'P2025') {
        throw { message: 'BikeModel not found', statusCode: 404 };
      }
      if (error.code === 'P2002') {
        throw {
          message: `BikeModel with this ${error.meta.target[0]} already exists`,
          field: error.meta.target[0],
        };
      }
      throw error;
    }
  }

  async deleteBikeModel(id) {
    try {
      const bikeModel = await prisma.bikeModel.findUnique({
        where: { id },
      });

      if (!bikeModel) {
        throw { message: 'BikeModel not found', statusCode: 404 };
      }

      // Delete image file if exists
      if (bikeModel.imageUrl) {
        const imagePath = path.join(__dirname, '../../upload', bikeModel.imageUrl.replace('/uploads/', ''));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      const deletedBikeModel = await prisma.bikeModel.update({
        where: { id },
        data: { isDeleted: true },
      });

      return { message: 'BikeModel deleted successfully', id: deletedBikeModel.id };
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'BikeModel not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async getBikeModel(id) {
    try {
      const bikeModel = await prisma.bikeModel.findUnique({
        where: { id },
      });

      if (!bikeModel || bikeModel.isDeleted) {
        throw { message: 'BikeModel not found', statusCode: 404 };
      }

      return bikeModel;
    } catch (error) {
      throw error;
    }
  }

  async getAllBikeModels() {
    try {
      const bikeModels = await prisma.bikeModel.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' }
      });

      return bikeModels;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BikeModelService();
