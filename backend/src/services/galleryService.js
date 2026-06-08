const prisma = require('../config/db');

class GalleryService {
  async createGallery(data, file) {
    if (!prisma.gallary) {
      throw new Error("Prisma model 'gallary' is not initialized. Please restart the server.");
    }

    const imageUrl = file ? `/uploads/${file.filename}` : null;

    return await prisma.gallary.create({
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: imageUrl,
      },
    });
  }

  async getAllGalleries() {
    if (!prisma.gallary) {
      throw new Error("Prisma model 'gallary' is not initialized. Please restart the server.");
    }

    return await prisma.gallary.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteGallery(id) {
    try {
      // Hard delete approach based on schema (no isDeleted field in gallary schema)
      return await prisma.gallary.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw { message: 'Gallery item not found', statusCode: 404 };
      }
      throw error;
    }
  }
}

module.exports = new GalleryService();