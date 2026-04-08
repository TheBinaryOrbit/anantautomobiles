const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

class BikeModelService {
  validateCreateData(data, file) {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required and cannot be empty' });
    }

    if (!data.brand || data.brand.trim() === '') {
      errors.push({ field: 'brand', message: 'Brand is required and cannot be empty' });
    }

    if (!data.category || data.category.trim() === '') {
      errors.push({ field: 'category', message: 'Category is required and cannot be empty' });
    }

    if (!file) {
      errors.push({ field: 'imageUrl', message: 'Image file is required' });
    }

    if (!data.description || data.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description is required and cannot be empty' });
    }

    // if (data.engineCapacity !== undefined && typeof data.engineCapacity !== 'number') {
    //   errors.push({ field: 'engineCapacity', message: 'Engine Capacity must be a number' });
    // }

    // if (data.launchYear !== undefined && (typeof data.launchYear !== 'number' || data.launchYear < 1900)) {
    //   errors.push({ field: 'launchYear', message: 'Launch Year must be a valid year (>= 1900)' });
    // }

    // if (data.mileage !== undefined && typeof data.mileage !== 'number') {
    //   errors.push({ field: 'mileage', message: 'Mileage must be a number' });
    // }

    // if (data.weight !== undefined && typeof data.weight !== 'number') {
    //   errors.push({ field: 'weight', message: 'Weight must be a number' });
    // }

    // if (data.exShowroomPrice !== undefined && typeof data.exShowroomPrice !== 'number') {
    //   errors.push({ field: 'exShowroomPrice', message: 'Ex-Showroom Price must be a number' });
    // }

    // if (data.rtoCharges !== undefined && typeof data.rtoCharges !== 'number') {
    //   errors.push({ field: 'rtoCharges', message: 'RTO Charges must be a number' });
    // }

    // if (data.insuranceCharges !== undefined && typeof data.insuranceCharges !== 'number') {
    //   errors.push({ field: 'insuranceCharges', message: 'Insurance Charges must be a number' });
    // }

    // if (data.otherCharges !== undefined && typeof data.otherCharges !== 'number') {
    //   errors.push({ field: 'otherCharges', message: 'Other Charges must be a number' });
    // }

    // if (data.onRoadPrice !== undefined && typeof data.onRoadPrice !== 'number') {
    //   errors.push({ field: 'onRoadPrice', message: 'On-Road Price must be a number' });
    // }

    // if (data.gstRate !== undefined && typeof data.gstRate !== 'number') {
    //   errors.push({ field: 'gstRate', message: 'GST Rate must be a number' });
    // }

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
          description: data.description,
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
          gstRate: data.gstRate ? parseFloat(data.gstRate) : null,
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
        description: data.description,
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
        gstRate: data.gstRate ? parseFloat(data.gstRate) : null,
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
      });

      return bikeModels;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BikeModelService();
