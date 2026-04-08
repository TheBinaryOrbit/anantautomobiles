const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

class AccessoriesService {
  validateCreateData(data, file) {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required and cannot be empty' });
    }

    if (!data.description || data.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description is required and cannot be empty' });
    }

    if (!data.price || data.price <= 0) {
      // console.log('Price is missing or invalid:', data.price);
      errors.push({ field: 'price', message: 'Price must be a positive number' });
    }

    if (!file) {
      errors.push({ field: 'imageUrl', message: 'Image file is required' });
    }

    if (!data.unit || data.unit.trim() === '') {
      errors.push({ field: 'unit', message: 'Unit is required (e.g., PIECE, SET, BOX)' });
    }

    if (!data.quantityInStock || data.quantityInStock < 0) {
      errors.push({ field: 'quantityInStock', message: 'Quantity in Stock must be a non-negative number' });
    }

    return errors;
  }

  async createAccessory(data, file) {
    const validationErrors = this.validateCreateData(data, file);
    if (validationErrors.length > 0) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      throw { validationErrors, message: 'Validation failed' };
    }

    try {
      const imageUrl = `/uploads/${file.filename}`;

      const accessory = await prisma.accessories.create({
        data: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          imageUrl,
          unit: data.unit.toUpperCase(),
          quantityInStock: parseInt(data.quantityInStock),
        },
      });

      return accessory;
    } catch (error) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      if (error.code === 'P2002') {
        throw {
          message: `Accessory with this name already exists`,
          field: 'name',
        };
      }
      throw error;
    }
  }

  async updateAccessory(id, data, file) {
    const updateData = {};

    if (data.name) {
      if (data.name.trim() === '') {
        if (file) fs.unlinkSync(file.path);
        throw {
          field: 'name',
          message: 'Name cannot be empty',
        };
      }
      updateData.name = data.name;
    }

    if (data.description) {
      if (data.description.trim() === '') {
        if (file) fs.unlinkSync(file.path);
        throw {
          field: 'description',
          message: 'Description cannot be empty',
        };
      }
      updateData.description = data.description;
    }

    if (data.price !== undefined) {
      if (data.price <= 0) {
        if (file) fs.unlinkSync(file.path);
        throw {
          field: 'price',
          message: 'Price must be a positive number',
        };
      }
      updateData.price = parseFloat(data.price);
    }

    if (data.unit) {
      if (data.unit.trim() === '') {
        if (file) fs.unlinkSync(file.path);
        throw {
          field: 'unit',
          message: 'Unit cannot be empty',
        };
      }
      updateData.unit = data.unit.toUpperCase();
    }

    if (data.quantityInStock !== undefined) {
      if (data.quantityInStock < 0) {
        if (file) fs.unlinkSync(file.path);
        throw {
          field: 'quantityInStock',
          message: 'Quantity in Stock must be a non-negative number',
        };
      }
      updateData.quantityInStock = parseInt(data.quantityInStock);
    }

    try {
      // If new file is provided, update image and delete old one
      if (file) {
        const existingAccessory = await prisma.accessories.findUnique({
          where: { id },
        });

        if (existingAccessory && existingAccessory.imageUrl) {
          const oldImagePath = path.join(__dirname, '../../upload', existingAccessory.imageUrl.replace('/uploads/', ''));
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        updateData.imageUrl = `/uploads/${file.filename}`;
      }

      const accessory = await prisma.accessories.update({
        where: { id },
        data: updateData,
      });

      return accessory;
    } catch (error) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      if (error.code === 'P2025') {
        throw { message: 'Accessory not found', statusCode: 404 };
      }
      if (error.code === 'P2002') {
        throw {
          message: `Accessory with this name already exists`,
          field: 'name',
        };
      }
      throw error;
    }
  }

  async updateQuantity(id, quantityInStock) {
    try {
      if (quantityInStock < 0) {
        throw {
          field: 'quantityInStock',
          message: 'Quantity in Stock must be a non-negative number',
        };
      }

      const accessory = await prisma.accessories.update({
        where: { id },
        data: { quantityInStock: parseInt(quantityInStock) },
      });

      return accessory;
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Accessory not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async deleteAccessory(id) {
    try {
      const accessory = await prisma.accessories.findUnique({
        where: { id },
      });

      if (!accessory) {
        throw { message: 'Accessory not found', statusCode: 404 };
      }

      // Delete image file if exists
      if (accessory.imageUrl) {
        const imagePath = path.join(__dirname, '../../upload', accessory.imageUrl.replace('/uploads/', ''));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      const deletedAccessory = await prisma.accessories.update({
        where: { id },
        data: { isDeleted: true },
      });

      return { message: 'Accessory deleted successfully', id: deletedAccessory.id };
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Accessory not found', statusCode: 404 };
      }
      throw error;
    }
  }

  async getAccessory(id) {
    try {
      const accessory = await prisma.accessories.findUnique({
        where: { id },
      });

      if (!accessory || accessory.isDeleted) {
        throw { message: 'Accessory not found', statusCode: 404 };
      }

      return accessory;
    } catch (error) {
      throw error;
    }
  }

  async getAllAccessories() {
    try {
      const accessories = await prisma.accessories.findMany({
        where: { isDeleted: false },
      });

      return accessories;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AccessoriesService();
