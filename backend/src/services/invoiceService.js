const fs = require('fs');
const path = require('path');

class InvoiceService {
  generateInvoiceHTML(sale) {
    const saleId = sale.id;
    const saleDate = new Date(sale.saleDate).toLocaleDateString();
    const customer = sale.customer;

    let itemsHTML = '';
    sale.items.forEach((item, index) => {
      const itemName =
        item.itemType === 'BIKE'
          ? `${item.bike.model.brand} ${item.bike.model.name} (${item.bike.color})`
          : item.accessory.name;

      itemsHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${itemName}</td>
          <td style="text-align: right">${item.quantity}</td>
          <td style="text-align: right">₹${item.unitPrice.toFixed(2)}</td>
          <td style="text-align: right">₹${(item.discountAmount * item.quantity).toFixed(2)}</td>
          <td style="text-align: right">${item.taxRate.toFixed(2)}%</td>
          <td style="text-align: right">₹${item.lineTotal.toFixed(2)}</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${saleId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          .details-row { display: flex; gap: 40px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { float: right; width: 300px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .summary-row.total { font-weight: bold; font-size: 1.2em; border-top: 2px solid black; margin-top: 10px; }
          .footer { clear: both; margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Invoice #: <strong>${saleId}</strong></p>
          <p>Date: <strong>${saleDate}</strong></p>
        </div>

        <div class="details">
          <div class="details-row">
            <div>
              <h3>Bill To:</h3>
              <p><strong>${customer.name}</strong></p>
              <p>Email: ${customer.email}</p>
              <p>Phone: ${customer.phone}</p>
              <p>${customer.address.addressLine1}${customer.address.addressLine2 ? ', ' + customer.address.addressLine2 : ''}</p>
              <p>${customer.address.city}, ${customer.address.state} ${customer.address.postalCode}</p>
              <p>${customer.address.country}</p>
            </div>
            <div>
              <h3>Payment Details:</h3>
              <p>Payment Type: <strong>${sale.paymentType}</strong></p>
              <p>Payment Method: <strong>${sale.paymentMethod}</strong></p>
              <p>Status: <strong>${sale.status}</strong></p>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th style="text-align: right">Qty</th>
              <th style="text-align: right">Unit Price</th>
              <th style="text-align: right">Discount</th>
              <th style="text-align: right">Tax %</th>
              <th style="text-align: right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${sale.subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Discount:</span>
            <span>-₹${sale.discountAmount.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax:</span>
            <span>₹${sale.taxAmount.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>₹${sale.totalAmount.toFixed(2)}</span>
          </div>
          <div class="summary-row" style="color: ${sale.isPaid ? 'green' : 'red'}; font-weight: bold;">
            <span>Pending:</span>
            <span>₹${sale.pendingAmount.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  async saveInvoice(sale) {
    try {
      const invoicesDir = path.join(__dirname, '../../upload/invoices');

      // Create invoices directory if it doesn't exist
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const invoiceHTML = this.generateInvoiceHTML(sale);
      const fileName = `invoice-${sale.id}-${Date.now()}.html`;
      const filePath = path.join(invoicesDir, fileName);

      fs.writeFileSync(filePath, invoiceHTML);

      return {
        fileName,
        url: `/uploads/invoices/${fileName}`,
        fullPath: filePath,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteInvoice(invoiceUrl) {
    try {
      if (!invoiceUrl) return;

      const fileName = invoiceUrl.replace('/uploads/invoices/', '');
      const filePath = path.join(__dirname, '../../upload/invoices', fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  }
}

module.exports = new InvoiceService();
