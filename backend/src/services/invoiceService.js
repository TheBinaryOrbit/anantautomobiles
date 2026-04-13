const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// ─── Layout constants ──────────────────────────────────────────────────────
const MARGIN = 40;
const PAGE_W = 595.28;           // A4 width in pts
const CONTENT_W = PAGE_W - MARGIN * 2;
const RED = '#CC0000';
const BLACK = '#000000';
const DARK_GRAY = '#444444';
const LIGHT_GRAY = '#f2f2f2';
const MID_GRAY = '#cccccc';


const COL = {
  sno: MARGIN,
  model: MARGIN + 30,
  color: MARGIN + 180,
  hsn: MARGIN + 240,
  engine: MARGIN + 320,
  chassis: MARGIN + 430,   // pushed right
  unitPrice: MARGIN + 560, // pushed more right
  gst: MARGIN + 620,
  amount: PAGE_W - MARGIN  // right edge
};

/** Format raw phone digits → +91 XXXXX XXXXX */
function formatPhone(raw) {
    if (!raw) return '';
    const d = String(raw).replace(/\D/g, '');
    const local = d.length === 12 && d.startsWith('91') ? d.slice(2)
        : d.length === 11 && d.startsWith('0') ? d.slice(1)
            : d;
    return local.length === 10
        ? `+91 ${local.slice(0, 5)} ${local.slice(5)}`
        : raw;
}

class InvoiceService {

    // ─── Helpers ───────────────────────────────────────────────────────────────

    _hr(doc, y, color = MID_GRAY, thickness = 0.5) {
        doc.save()
            .strokeColor(color).lineWidth(thickness)
            .moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y)
            .stroke().restore();
    }

    /** Right-aligned text whose right edge is at x */
    _rtxt(doc, text, x, y, width = 65) {
        doc.text(String(text), x - width, y, { width, align: 'right' });
    }

    _drawLogo(doc, x, y, w = 130, h = 40) {
        const logoPath = path.join(__dirname, 'anant-hero-logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, x, y, { width: w, height: h });
        } else {
            doc.font('Helvetica-Bold').fontSize(18).fillColor(RED)
                .text('Anant', x, y + 8, { continued: true })
                .fillColor(BLACK).text('Hero');
        }
    }

    // ─── PAGE 1: TAX INVOICE ──────────────────────────────────────────────────
    _buildInvoicePage(doc, sale) {
        const pgTop = 30;

        // ── Logo ──────────────────────────────────────────────────────────────────
        this._drawLogo(doc, MARGIN, pgTop, 120, 38);

        // ── Dealership block (top-left) ───────────────────────────────────────────
        const addrTop = pgTop + 44;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BLACK)
            .text('ANANT HERO AUTOMOBILES', MARGIN, addrTop);
        doc.font('Helvetica').fontSize(8).fillColor(DARK_GRAY)
            .text('Authorized Dealer: Hero MotoCorp Ltd.', MARGIN, doc.y);



        // ── Invoice # / Date (top-right) ─────────────────────────────────────────
        const invInfoY = pgTop + 36;
        const invLblX = PAGE_W - MARGIN - 200;
        const invValX = PAGE_W - MARGIN - 130;

        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK)
            .text('Invoice #', invLblX, invInfoY, { width: 65, align: 'right' });
        doc.font('Helvetica').fontSize(8)
            .text(String(sale.saleNumber || sale.id || ''), invValX, invInfoY, { width: 130, align: 'right' });

        doc.font('Helvetica-Bold').fontSize(8)
            .text('Date', invLblX, invInfoY + 13, { width: 65, align: 'right' });
        doc.font('Helvetica').fontSize(8)
            .text(new Date(sale.saleDate).toLocaleString('en-IN'),
                invValX, invInfoY + 13, { width: 130, align: 'right' });


        // ── Red divider ───────────────────────────────────────────────────────────
        const divY = addrTop + 52;
        this._hr(doc, divY, RED, 1.5);

        // ── Customer info grid ────────────────────────────────────────────────────
        const gridTop = divY + 7;
        const LBL_W = 105;
        const VAL_W = 175;

        const addr = sale.customer?.address || {};

        console.log(addr);
        const addrStr = [
            addr.addressLine1, addr.addressLine2,
            addr.city, addr.state, addr.postalCode,
        ].filter(Boolean).join(', ');

        const rows = [
            ['Place of Supply', `${addr.state || ''}${addr.postalCode ? ', ' + addr.postalCode : ''}`],
            ['Name of the Customer', sale.customer?.name || ''],
            ['Address', addrStr],
            ['Mobile / Home Ph #', formatPhone(sale.customer?.phone)],
            ['Payment Type', sale.paymentType || ''],
            ['Payment Method', sale.paymentMethod || ''],
            ['Status', sale.status || ''],
        ];

        let gy = gridTop;
        rows.forEach(([lbl, val]) => {
            doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK_GRAY)
                .text(lbl, MARGIN, gy, { width: LBL_W });
            doc.font('Helvetica').fontSize(8).fillColor(BLACK)
                .text(val, MARGIN + LBL_W + 4, gy, { width: VAL_W });
            gy += 13;
        });

        this._hr(doc, gy + 3, MID_GRAY);

        // ── Items table header ────────────────────────────────────────────────────
        const tblHdrY = gy + 8;
        doc.fillColor(LIGHT_GRAY).rect(MARGIN, tblHdrY - 2, CONTENT_W, 14).fill();

        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(BLACK);
        doc.text('S.No', COL.sno, tblHdrY, { width: 25 });
        doc.text('Model', COL.model, tblHdrY, { width: 138 });
        doc.text('Color', COL.color, tblHdrY, { width: 44 });
        doc.text('HSN No', COL.hsn, tblHdrY, { width: 52 });
        doc.text('Engine#', COL.engine, tblHdrY, { width: 82 });
        doc.text('Chassis#', COL.chassis, tblHdrY, { width: 84 });
        doc.text('Price', COL.price, tblHdrY, { width: 40 });
        doc.text('GST%', COL.gst, tblHdrY, { width: 30 });
        this._rtxt(doc, 'Amount', COL.amount, tblHdrY);

        this._hr(doc, tblHdrY + 14, MID_GRAY);

        // ── Items rows ────────────────────────────────────────────────────────────
        let rowY = tblHdrY + 18;
        doc.font('Helvetica').fontSize(7.5).fillColor(BLACK);

        sale.items.forEach((item, idx) => {
            const isBike = item.itemType === 'BIKE';
            // BikeModel.brand + BikeModel.name
            const modelName = isBike
                ? `${item.bike?.model?.brand || ''} ${item.bike?.model?.name || ''}`.trim()
                : item.accessory?.name || '';
            // Bike fields
            const color = isBike ? item.bike?.color || '' : '';
            const engine = isBike ? item.bike?.engineNumber || '' : '—';
            const chassis = isBike ? item.bike?.chassisNumber || '' : '—';
            // BikeModel.hsnCode
            const hsn = isBike ? item.bike?.model?.hsnCode || '' : '';
            // BikeModel.gstRate (single combined rate)
            const gstRate = item?.taxRate;

            doc.text(`${idx + 1}`, COL.sno, rowY, { width: 25 });
            doc.text(modelName, COL.model, rowY, { width: 138 });
            doc.text(color, COL.color, rowY, { width: 44 });
            doc.text(hsn, COL.hsn, rowY, { width: 52 });
            doc.text(engine, COL.engine, rowY, { width: 82 });
            doc.text(chassis, COL.chassis, rowY, { width: 84 });
            doc.text(`${gstRate}%`, COL.gst, rowY, { width: 30 });
            doc.text(`${item.unitPrice.toFixed(2)}`, COL.price, rowY, { width: 40 });
            this._rtxt(doc, (item.lineTotal || 0).toFixed(2), COL.amount, rowY);

            rowY += 12;
            // Discount sub-line if applicable
            if ((item.discountAmount || 0) > 0) {
                doc.font('Helvetica').fontSize(7).fillColor(DARK_GRAY)
                    .text(`Discount: -₹${(item.discountAmount * item.quantity).toFixed(2)}`,
                        COL.model, rowY, { width: 200 });
                doc.font('Helvetica').fontSize(7.5).fillColor(BLACK);
                rowY += 10;
            }
            rowY += 4;
        });

        this._hr(doc, rowY, MID_GRAY);
        rowY += 7;

        // ── Summary block ─────────────────────────────────────────────────────────
        const sumLblX = MARGIN + 248;
        const sumValX = PAGE_W - MARGIN;
        const sumLblW = sumValX - sumLblX - 68;

        const taxableVal = (sale.subtotal || 0) - (sale.discountAmount || 0);

        const summaryRows = [
            { lbl: 'Sub Total', val: (sale.subtotal || 0).toFixed(2) },
            { lbl: 'Discount', val: `-${(sale.discountAmount || 0).toFixed(2)}` },
            { lbl: 'Taxable Value', val: taxableVal.toFixed(2) },
            { lbl: `Tax on ${taxableVal.toFixed(2)}`, val: (sale.taxAmount || 0).toFixed(2) },
            { lbl: 'Net Amount', val: (sale.totalAmount || 0).toFixed(2) },
        ];

        doc.font('Helvetica').fontSize(8).fillColor(BLACK);
        summaryRows.forEach(({ lbl, val }) => {
            doc.text(lbl, sumLblX, rowY, { width: sumLblW });
            this._rtxt(doc, val, sumValX, rowY);
            rowY += 13;
        });

        this._hr(doc, rowY, MID_GRAY);
        rowY += 4;

        // Grand Total highlighted row
        doc.fillColor(LIGHT_GRAY).rect(MARGIN, rowY - 2, CONTENT_W, 17).fill();
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK)
            .text('Grand Total', sumLblX, rowY, { width: sumLblW });
        this._rtxt(doc, (sale.totalAmount || 0).toFixed(2), sumValX, rowY);
        rowY += 17;

        // Round Off


        this._hr(doc, rowY, RED, 1);
        rowY += 7;

        // ── Amount in words ───────────────────────────────────────────────────────
        doc.font('Helvetica').fontSize(8).fillColor(DARK_GRAY)
            .text(`Rupees ${sale.totalAmount.toFixed(2)} Only`, MARGIN, rowY, { width: CONTENT_W });
        doc.font('Helvetica').fontSize(7.5).fillColor(DARK_GRAY)
            .text('Vehicle cost is inclusive of toolkit, owner\'s manual and first aid kit.',
                MARGIN, rowY + 11);
        rowY += 26;

        // ── Reg # row (Bike.registrationNumber) ──────────────────────────────────
        this._hr(doc, rowY, MID_GRAY);
        rowY += 7;
        doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK_GRAY)
            .text('Reg #', MARGIN, rowY, { width: 40 });
        const regNums = (sale.items || [])
            .filter(i => i.itemType === 'BIKE' && i.bike?.registrationNumber)
            .map(i => i.bike.registrationNumber)
            .join(', ');
        doc.font('Helvetica').fontSize(8).fillColor(BLACK)
            .text(regNums || '', MARGIN + 42, rowY, { width: 200 });
        rowY += 18;

        // ── Signature area ────────────────────────────────────────────────────────
        this._hr(doc, rowY, MID_GRAY);
        rowY += 7;
        const sigY = rowY;
        doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK_GRAY)
            .text("Customer's Signatures", MARGIN, sigY);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK)
            .text('For ANANT HERO AUTOMOBILES',
                PAGE_W - MARGIN - 175, sigY, { width: 175, align: 'right' });

        rowY = sigY + 42;
        this._hr(doc, rowY, MID_GRAY, 0.5);
        rowY += 5;
        doc.font('Helvetica').fontSize(7.5).fillColor(DARK_GRAY)
            .text('Authorized Signatory',
                PAGE_W - MARGIN - 120, rowY, { width: 120, align: 'right' });
        rowY += 18;

        // ── Go Green banner ───────────────────────────────────────────────────────
        this._hr(doc, rowY, RED, 1);
        rowY += 6;
        doc.fillColor('#1a7a3c').rect(MARGIN, rowY, CONTENT_W, 18).fill();
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
            .text('Go paperless for a greener tomorrow.   #GoGreenWithHero',
                MARGIN + 6, rowY + 4, { width: CONTENT_W - 12 });
        rowY += 26;

        // ── Terms & Conditions ────────────────────────────────────────────────────
        this._hr(doc, rowY, MID_GRAY);
        rowY += 5;
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK)
            .text('Terms & Conditions', MARGIN, rowY);
        rowY += 11;
        const terms = [
            'Kindly visit HMCL dealership within 15 days of receipt of Registration Number to get HSRP affixed to the vehicle.',
            'Goods once sold will not be returned or exchanged under any circumstances.',
            'The vehicle/documents has been thoroughly inspected, tested and is free of any kind of defect and is upto my satisfaction.',
            'I have also read the warranty terms and conditions as explained in the owner\'s manual.',
            'Registration and insurance will be done at the owner\'s risk and liability.',
            'I have checked my particulars and they are correct to the best of my knowledge.',
        ];
        doc.font('Helvetica').fontSize(6.5).fillColor(DARK_GRAY);
        terms.forEach((t, i) => {
            doc.text(`${i + 1}. ${t}`, MARGIN + 4, rowY, { width: CONTENT_W - 8 });
            rowY += 9;
        });
    }

    // ─── PAGE 2: GATE PASS ────────────────────────────────────────────────────
    _buildGatePassPage(doc, sale) {
        const pgTop = 30;

        // ── Logo + Title ──────────────────────────────────────────────────────────
        this._drawLogo(doc, MARGIN, pgTop, 100, 30);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(BLACK)
            .text('GATE PASS', MARGIN, pgTop + 6, { width: CONTENT_W, align: 'center' });
        doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY)
            .text(`Invoice #: ${sale.saleNumber || sale.id}`, MARGIN, pgTop + 28,
                { width: CONTENT_W, align: 'center' });
        doc.font('Helvetica').fontSize(9)
            .text(`Date: ${new Date(sale.saleDate).toLocaleDateString('en-IN')}`,
                MARGIN, pgTop + 40, { width: CONTENT_W, align: 'center' });

        const divY = pgTop + 58;
        this._hr(doc, divY, RED, 1.5);

        // ── Customer Details ──────────────────────────────────────────────────────
        let y = divY + 10;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BLACK)
            .text('CUSTOMER DETAILS', MARGIN, y);
        y += 14;
        this._hr(doc, y, MID_GRAY);
        y += 8;

        const addr = sale.customer?.address || {};
        const addrStr = [
            addr.addressLine1, addr.addressLine2,
            addr.city, addr.state, addr.postalCode, addr.country,
        ].filter(Boolean).join(', ');

        const custFields = [
            ['Name', sale.customer?.name || ''],
            ['Email', sale.customer?.email || ''],
            ['Phone', formatPhone(sale.customer?.phone)],
            ['Address', addrStr],
        ];
        custFields.forEach(([lbl, val]) => {
            doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK_GRAY)
                .text(`${lbl}:`, MARGIN, y, { width: 55 });
            doc.font('Helvetica').fontSize(9).fillColor(BLACK)
                .text(val, MARGIN + 58, y, { width: CONTENT_W - 58 });
            y += 15;
        });

        this._hr(doc, y, MID_GRAY);
        y += 10;

        // ── Items Table ───────────────────────────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BLACK).text('ITEMS', MARGIN, y);
        y += 14;

        // Gate pass columns: # | Description | Engine# | Chassis# | Qty
        const gC1 = MARGIN;          // #
        const gC2 = MARGIN + 28;     // Description
        const gC3 = MARGIN + 190;    // Engine #
        const gC4 = MARGIN + 330;    // Chassis #
        const gC5 = PAGE_W - MARGIN; // Qty (right-aligned)

        doc.fillColor(LIGHT_GRAY).rect(MARGIN, y - 2, CONTENT_W, 16).fill();
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK);
        doc.text('#', gC1, y, { width: 24 });
        doc.text('Description', gC2, y, { width: 158 });
        doc.text('Engine #', gC3, y, { width: 136 });
        doc.text('Chassis #', gC4, y, { width: 140 });
        this._rtxt(doc, 'Qty', gC5, y, 35);
        y += 18;
        this._hr(doc, y - 2, MID_GRAY);

        doc.font('Helvetica').fontSize(9).fillColor(BLACK);
        sale.items.forEach((item, idx) => {
            const isBike = item.itemType === 'BIKE';

            // Description: brand + model name + color
            const desc = isBike
                ? `${item.bike?.model?.brand || ''} ${item.bike?.model?.name || ''} (${item.bike?.color || ''})`.trim()
                : item.accessory?.name || '';

            // Engine # and Chassis # in their own columns; accessories get a dash
            const engineNo = isBike ? (item.bike?.engineNumber || '') : '—';
            const chassisNo = isBike ? (item.bike?.chassisNumber || '') : '—';

            const rowStart = y;
            doc.text(`${idx + 1}`, gC1, y, { width: 24 });
            doc.text(desc, gC2, y, { width: 158 });
            doc.text(engineNo, gC3, y, { width: 136 });
            doc.text(chassisNo, gC4, y, { width: 140 });
            this._rtxt(doc, String(item.quantity || 1), gC5, rowStart, 35);

            y = Math.max(doc.y, rowStart + 14);
            y += 5;
            this._hr(doc, y, '#eeeeee', 0.3);
            y += 4;
        });

        this._hr(doc, y, MID_GRAY);
        y += 22;

        // ── Signature ─────────────────────────────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK_GRAY)
            .text('Authorized Signature:', MARGIN, y);
        y += 36;
        this._hr(doc, y, BLACK, 0.5);
        y += 5;
        doc.font('Helvetica').fontSize(8).fillColor(DARK_GRAY)
            .text('(Gate Officer)', MARGIN, y);

        // ── Footer ────────────────────────────────────────────────────────────────
        doc.font('Helvetica').fontSize(7).fillColor(DARK_GRAY)
            .text(`Generated on ${new Date().toLocaleString('en-IN')}`,
                MARGIN, y + 22, { width: CONTENT_W, align: 'right' });
        this._hr(doc, y + 36, RED, 1);
    }

    // ─── Main PDF generation ───────────────────────────────────────────────────
    generateInvoicePDF(sale, filePath) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 0, size: 'A4' });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                this._buildInvoicePage(doc, sale);

                doc.addPage({ margin: 0, size: 'A4' });
                this._buildGatePassPage(doc, sale);

                doc.end();
                stream.on('finish', resolve);
                stream.on('error', reject);
            } catch (err) {
                reject(err);
            }
        });
    }

    async saveInvoice(sale) {
        try {
            const invoicesDir = path.join(__dirname, '../../uploads/invoices');
            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
            }
            const fileName = `invoice-${sale.id}-${Date.now()}.pdf`;
            const filePath = path.join(invoicesDir, fileName);
            await this.generateInvoicePDF(sale, filePath);
            return { fileName, url: `uploads/invoices/${fileName}`, fullPath: filePath };
        } catch (err) {
            throw err;
        }
    }

    async deleteInvoice(invoiceUrl) {
        try {
            if (!invoiceUrl) return;
            const fileName = invoiceUrl.replace('uploads/invoices/', '');
            const filePath = path.join(__dirname, '../../uploads/invoices', fileName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
            console.error('Error deleting invoice:', err);
        }
    }
}

module.exports = new InvoiceService();