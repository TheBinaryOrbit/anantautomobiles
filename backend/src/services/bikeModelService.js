const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

/** Removes half-uploaded files when a request is rejected. */
function discardUploads(...files) {
  files.filter(Boolean).forEach((file) => {
    try {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (error) {
      console.error('Error discarding upload:', error.message);
    }
  });
}

/** Deletes a previously stored /uploads/<name> file, if it is still on disk. */
function removeStoredFile(storedUrl) {
  if (!storedUrl) return;
  try {
    const filePath = path.join(UPLOAD_DIR, storedUrl.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error removing stored file:', error.message);
  }
}

class BikeModelService {
  validateCreateData(data, file) {
    const errors = [];

    const mandatoryFields = [
      { field: 'name', label: 'Name' },
      { field: 'modelName', label: 'Model Name' },
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
      { field: 'purchasePrice', label: 'Purchase Price' },
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

  async createBikeModel(data, file, brochureFile) {
    const validationErrors = this.validateCreateData(data, file);
    if (validationErrors.length > 0) {
      discardUploads(file, brochureFile);
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      const imageUrl = `/uploads/${file.filename}`;

      const bikeModel = await prisma.bikeModel.create({
        data: {
          name: data.name,
          modelName: data.modelName,
          brand: data.brand,
          category: data.category,
          imageUrl,
          brochureUrl: brochureFile ? `/uploads/${brochureFile.filename}` : null,
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
          purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
          cgstRate: data.cgstRate ? parseFloat(data.cgstRate) : 0,
          sgstRate: data.sgstRate ? parseFloat(data.sgstRate) : 0,
          igstRate: data.igstRate ? parseFloat(data.igstRate) : 0,
          cessRate: data.cessRate ? parseFloat(data.cessRate) : 0,
          hsnCode: data.hsnCode || null,
        },
      });

      return bikeModel;
    } catch (error) {
      discardUploads(file, brochureFile);
      if (error.code === 'P2002') {
        throw {
          message: `BikeModel with this ${error.meta.target[0]} already exists`,
          field: error.meta.target[0],
        };
      }
      throw error;
    }
  }

  async updateBikeModel(id, data, file, brochureFile) {
    const validationErrors = this.validateCreateData(data, file || { filename: 'existing' });
    if (validationErrors.length > 0) {
      discardUploads(file, brochureFile);
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      const updateData = {
        name: data.name,
        modelName: data.modelName,
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
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
        cgstRate: data.cgstRate ? parseFloat(data.cgstRate) : 0,
        sgstRate: data.sgstRate ? parseFloat(data.sgstRate) : 0,
        igstRate: data.igstRate ? parseFloat(data.igstRate) : 0,
        cessRate: data.cessRate ? parseFloat(data.cessRate) : 0,
        hsnCode: data.hsnCode || null,
      };

      // If new files are provided, swap them in and delete the ones they replace
      if (file || brochureFile) {
        const existingBikeModel = await prisma.bikeModel.findUnique({
          where: { id },
        });

        if (file) {
          removeStoredFile(existingBikeModel?.imageUrl);
          updateData.imageUrl = `/uploads/${file.filename}`;
        }

        if (brochureFile) {
          removeStoredFile(existingBikeModel?.brochureUrl);
          updateData.brochureUrl = `/uploads/${brochureFile.filename}`;
        }
      }

      const bikeModel = await prisma.bikeModel.update({
        where: { id },
        data: updateData,
      });

      return bikeModel;
    } catch (error) {
      discardUploads(file, brochureFile);
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

      // Delete the image and brochure files if they exist
      removeStoredFile(bikeModel.imageUrl);
      removeStoredFile(bikeModel.brochureUrl);

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
