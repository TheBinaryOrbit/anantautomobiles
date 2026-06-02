const prisma = require('../config/db');

class DiscountService {
  async createDiscount(data) {
    if (!prisma.discount) throw new Error("Prisma model 'discount' is not initialized. Please restart the server.");
    const existing = await prisma.discount.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      if (existing.isDeleted) {
        return await prisma.discount.update({
          where: { id: existing.id },
          data: { ...data, isDeleted: false, isActive: true },
        });
      }
      throw new Error(`Discount with name "${data.name}" already exists`);
    }

    return await prisma.discount.create({
      data: {
        name: data.name,
        description: data.description || null,
        terms: data.terms || null,
        type: data.type,
        value: parseFloat(data.value),
        upToLimit: data.upToLimit ? parseFloat(data.upToLimit) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async getAllDiscounts() {
    if (!prisma.discount) throw new Error("Prisma model 'discount' is not initialized. Please restart the server.");
    return await prisma.discount.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveDiscounts() {
    if (!prisma.discount) throw new Error("Prisma model 'discount' is not initialized. Please restart the server.");
    return await prisma.discount.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getDiscount(id) {
    const discount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!discount || discount.isDeleted) {
      throw { message: 'Discount not found', statusCode: 404 };
    }

    return discount;
  }

  async updateDiscount(id, data) {
  try {
    return await prisma.discount.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        terms: data.terms,
        type: data.type,
        value: data.value !== undefined
          ? parseFloat(data.value)
          : undefined,
        upToLimit: data.upToLimit !== undefined
          ? (data.upToLimit ? parseFloat(data.upToLimit) : null)
          : undefined,
        isActive: data.isActive,
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw { message: 'Discount not found', statusCode: 404 };
    }
    throw error;
  }
}

  async deleteDiscount(id) {
    try {
      return await prisma.discount.update({
        where: { id },
        data: { isDeleted: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Discount not found', statusCode: 404 };
      }
      throw error;
    }
  }
}

module.exports = new DiscountService();
