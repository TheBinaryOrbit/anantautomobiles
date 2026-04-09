const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

class InvoiceService {
  generateInvoicePDF(sale, filePath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(`Invoice #: ${sale.id}`, { align: 'center' });
        doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString('en-IN')}`, { align: 'center' });
        doc.moveDown(1);

        // Bill To
        doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
        doc.fontSize(10).font('Helvetica');
        doc.text(sale.customer.name);
        doc.text(`Email: ${sale.customer.email}`);
        doc.text(`Phone: ${sale.customer.phone}`);
        doc.text(`${sale.customer.address.addressLine1}${sale.customer.address.addressLine2 ? ', ' + sale.customer.address.addressLine2 : ''}`);
        doc.text(`${sale.customer.address.city}, ${sale.customer.address.state} ${sale.customer.address.postalCode}`);
        doc.text(sale.customer.address.country);
        doc.moveDown(0.5);

        // Payment Details
        const pageWidth = doc.page.width - 100;
        doc.fontSize(12).font('Helvetica-Bold').text('Payment Details:', { x: pageWidth / 2 + 50 });
        doc.fontSize(10).font('Helvetica');
        doc.text(`Payment Type: ${sale.paymentType}`, { x: pageWidth / 2 + 50 });
        doc.text(`Payment Method: ${sale.paymentMethod}`, { x: pageWidth / 2 + 50 });
        doc.text(`Status: ${sale.status}`, { x: pageWidth / 2 + 50 });
        doc.moveDown(1);

        // Items Table Header
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 120;
        const col3 = 250;
        const col4 = 320;
        const col5 = 390;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('#', col1, tableTop);
        doc.text('Item', col2, tableTop);
        doc.text('Qty', col3, tableTop, { align: 'right' });
        doc.text('Unit Price', col4, tableTop, { align: 'right' });
        doc.text('Line Total', col5, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(pageWidth + 100, tableTop + 15).stroke();
        doc.moveDown(0.7);

        // Items
        doc.fontSize(9).font('Helvetica');
        sale.items.forEach((item, index) => {
          const itemName = item.itemType === 'BIKE' 
            ? `${item.bike.model.brand} ${item.bike.model.name} (${item.bike.color})`
            : item.accessory.name;

          doc.text(`${index + 1}`, col1);
          doc.text(itemName, col2);
          doc.text(item.quantity.toString(), col3, doc.y - 12, { align: 'right' });
          doc.text(`₹${item.unitPrice.toFixed(2)}`, col4, doc.y + 12, { align: 'right' });
          doc.text(`₹${item.lineTotal.toFixed(2)}`, col5, doc.y, { align: 'right' });
          
          if (item.discountAmount > 0) {
            doc.fontSize(8).text(`Discount: -₹${(item.discountAmount * item.quantity).toFixed(2)} (${item.taxRate}% tax)`, col2);
          } else {
            doc.fontSize(8).text(`Tax: ${item.taxRate}%`, col2);
          }
          doc.moveDown(0.5);
        });

        doc.moveTo(50, doc.y).lineTo(pageWidth + 100, doc.y).stroke();
        doc.moveDown(0.5);

        // Summary
        const summaryX = 320;
        doc.fontSize(10).font('Helvetica');
        doc.text('Subtotal:', summaryX, doc.y, { width: 80 });
        doc.text(`₹${sale.subtotal.toFixed(2)}`, summaryX + 80, doc.y - 12, { align: 'right' });

        doc.moveDown(0.4);
        doc.text('Discount:', summaryX, doc.y, { width: 80 });
        doc.text(`-₹${sale.discountAmount.toFixed(2)}`, summaryX + 80, doc.y - 12, { align: 'right' });

        doc.moveDown(0.4);
        doc.text('Tax:', summaryX, doc.y, { width: 80 });
        doc.text(`₹${sale.taxAmount.toFixed(2)}`, summaryX + 80, doc.y - 12, { align: 'right' });

        doc.moveDown(0.6);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Total:', summaryX, doc.y, { width: 80 });
        doc.text(`₹${sale.totalAmount.toFixed(2)}`, summaryX + 80, doc.y - 12, { align: 'right' });

        doc.moveDown(0.4);
        doc.fontSize(10).font('Helvetica');
        doc.text('Pending:', summaryX, doc.y, { width: 80 });
        doc.text(`₹${sale.pendingAmount.toFixed(2)}`, summaryX + 80, doc.y - 12, { align: 'right' });

        doc.moveDown(1.5);
        doc.fontSize(9).text('Thank you for your purchase!', { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

        // New Page - Gate Pass
        doc.addPage();
        doc.fontSize(20).font('Helvetica-Bold').text('GATE PASS', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(`Invoice #: ${sale.id}`, { align: 'center' });
        doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString('en-IN')}`, { align: 'center' });
        doc.moveDown(1.2);

        // Customer Details Section
        doc.fontSize(12).font('Helvetica-Bold').text('CUSTOMER DETAILS');
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica-Bold').text('Name:');
        doc.fontSize(10).font('Helvetica').text(sale.customer.name);
        
        doc.fontSize(10).font('Helvetica-Bold').text('Email:');
        doc.fontSize(10).font('Helvetica').text(sale.customer.email);
        
        doc.fontSize(10).font('Helvetica-Bold').text('Phone:');
        doc.fontSize(10).font('Helvetica').text(sale.customer.phone);
        
        doc.fontSize(10).font('Helvetica-Bold').text('Address:');
        doc.fontSize(10).font('Helvetica').text(
          `${sale.customer.address.addressLine1}${sale.customer.address.addressLine2 ? ', ' + sale.customer.address.addressLine2 : ''}, ${sale.customer.address.city}, ${sale.customer.address.state} ${sale.customer.address.postalCode}, ${sale.customer.address.country}`
        );
        
        doc.moveDown(1);

        // Gate Pass Items Table
        const gatePageWidth = doc.page.width - 100;
        const gateTableTop = doc.y;
        const gateCol1 = 50;
        const gateCol2 = 100;
        const gateCol3 = 250;
        const gateCol4 = 420;

        doc.fontSize(11).font('Helvetica-Bold').text('ITEMS', 50, gateTableTop);
        doc.moveDown(0.6);

        const gateItemTableTop = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('#', gateCol1, gateItemTableTop);
        doc.text('Description', gateCol2, gateItemTableTop);
        doc.text('Details', gateCol3, gateItemTableTop);
        doc.text('Qty', gateCol4, gateItemTableTop, { align: 'right' });

        doc.moveTo(50, gateItemTableTop + 18).lineTo(gatePageWidth + 100, gateItemTableTop + 18).stroke();
        doc.moveDown(0.8);

        // Gate Pass Items with Details
        doc.fontSize(9).font('Helvetica');
        sale.items.forEach((item, index) => {
          const itemName = item.itemType === 'BIKE' 
            ? `${item.bike.model.brand} ${item.bike.model.name} (${item.bike.color})`
            : item.accessory.name;

          doc.text(`${index + 1}`, gateCol1, doc.y);
          doc.text(itemName, gateCol2, doc.y - 0, { width: 140 });
          
          // Details column
          if (item.itemType === 'BIKE') {
            const detailsText = `Engine: ${item.bike.engineNumber}\nChassis: ${item.bike.chassisNumber}`;
            doc.text(detailsText, gateCol3, doc.y - 0, { width: 150 });
          } else {
            doc.text('—', gateCol3, doc.y - 0);
          }
          
          doc.text(item.quantity.toString(), gateCol4, doc.y - (item.itemType === 'BIKE' ? 12 : 0), { align: 'right' });
          
          doc.moveDown(item.itemType === 'BIKE' ? 1 : 0.4);
        });

        doc.moveTo(50, doc.y).lineTo(gatePageWidth + 100, doc.y).stroke();
        doc.moveDown(1.5);

        // Signature Area
        doc.fontSize(10).font('Helvetica-Bold').text('Authorized Signature:', { align: 'left' });
        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(250, doc.y).stroke();
        doc.fontSize(9).text('(Gate Officer)', 50, doc.y + 5);

        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveInvoice(sale) {
    try {
      const invoicesDir = path.join(__dirname, '../../uploads/invoices');

      // Create invoices directory if it doesn't exist
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice-${sale.id}-${Date.now()}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      await this.generateInvoicePDF(sale, filePath);

      return {
        fileName,
        url: `uploads/invoices/${fileName}`,
        fullPath: filePath,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteInvoice(invoiceUrl) {
    try {
      if (!invoiceUrl) return;

      const fileName = invoiceUrl.replace('uploads/invoices/', '');
      const filePath = path.join(__dirname, '../../uploads/invoices', fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  }
}

module.exports = new InvoiceService();
