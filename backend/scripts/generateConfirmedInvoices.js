const prisma = require('../src/config/db');
const invoiceService = require('../src/services/invoiceService');

async function main() {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        isDeleted: false,
        status: 'CONFIRMED',
      },
      include: {
        customer: { include: { address: true } },
        items: {
          include: {
            bike: { include: { model: true } },
            model: true,
            accessory: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${sales.length} confirmed, non-deleted sale(s) to process.`);

    let generated = 0;
    let skipped = 0;

    for (const sale of sales) {
      try {
        // if (sale.invoiceUrl) {
        //   skipped += 1;
        //   console.log(`Skipping sale ${sale.id} (${sale.saleNumber || 'N/A'}) because it already has an invoice URL.`);
        //   continue;
        // }

        const invoiceInfo = await invoiceService.saveInvoice(sale);

        await prisma.sale.update({
          where: { id: sale.id },
          data: { invoiceUrl: invoiceInfo.url },
        });

        generated += 1;
        console.log(`Generated invoice for sale ${sale.id} (${sale.saleNumber || 'N/A'}): ${invoiceInfo.url}`);
      } catch (error) {
        console.error(`Failed for sale ${sale.id}:`, error.message);
      }
    }

    console.log(`Done. Generated: ${generated}, skipped: ${skipped}`);
  } catch (error) {
    console.error('Batch invoice generation failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
