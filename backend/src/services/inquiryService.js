const prisma = require('../config/db');

class InquiryService {
  // ─── Service Inquiries ───
  async createServiceInquiry({data}) {
    if (!prisma.serviceInquiry) throw new Error("Prisma model 'serviceInquiry' is not initialized.");
    return await prisma.serviceInquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        serviceType: data.serviceType,
        isPaid: data.isPaid ? "true" : "false",
        freeServiceId: data.freeServiceId || null,
      },
    });
  }

  async getAllServiceInquiries() {
    return await prisma.serviceInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Sales Inquiries ───
  async createSalesInquiry({data}) {
    if (!prisma.salesInquiry) throw new Error("Prisma model 'salesInquiry' is not initialized.");
    console.log('Creating sales inquiry with data:', data);
    return await prisma.salesInquiry.create({
      data : {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        model: data.model,
      }
    });
  }

  async getAllSalesInquiries() {
    return await prisma.salesInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = new InquiryService();