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
  model: MARGIN + 25,
  hsn: MARGIN + 180,
  engine: MARGIN + 235,
  chassis: MARGIN + 335,
  price: MARGIN + 435, // Ex-showroom
  gst: MARGIN + 505,   // Combined GST %
  amount: PAGE_W - MARGIN  // lineTotal
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
            ['Finance Company', sale.financeCompany || 'N/A'],
            ['Payment Type', sale.paymentType || ''],
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
        doc.text('Model / Color', COL.model, tblHdrY, { width: 150 });
        doc.text('HSN', COL.hsn, tblHdrY, { width: 50 });
        doc.text('Engine#', COL.engine, tblHdrY, { width: 95 });
        doc.text('Chassis#', COL.chassis, tblHdrY, { width: 95 });
        doc.text('Ex-Showroom', COL.price, tblHdrY, { width: 65 });
        doc.text('GST%', COL.gst, tblHdrY, { width: 35 });
        this._rtxt(doc, 'Total', COL.amount, tblHdrY);

        this._hr(doc, tblHdrY + 14, MID_GRAY);

        // ── Items rows ────────────────────────────────────────────────────────────
        let rowY = tblHdrY + 18;
        doc.font('Helvetica').fontSize(7.5).fillColor(BLACK);

        let totalRto = 0;
        let totalIns = 0;
        let totalOther = 0;
        let totalCgst = 0;
        let totalSgst = 0;
        let totalIgst = 0;
        let totalCess = 0;
        let totalTaxable = 0;

        sale.items.forEach((item, idx) => {
            const isBike = item.itemType === 'BIKE';
            const modelName = isBike
                ? `${item.model?.brand || ''} ${item.model?.name || ''} (${item.color || 'Any'})`.trim()
                : item.accessory?.name || '';
            
            const engine = item.bike?.engineNumber || '— (PDI Stage)';
            const chassis = item.bike?.chassisNumber || '— (PDI Stage)';
            const hsn = isBike ? item.model?.hsnCode || '' : '';
            
            // Snapshot values or fallbacks
            const exShowroom = item.exShowroomPrice || item.unitPrice || 0;
            const cgstRate = item.cgstRate || 0;
            const sgstRate = item.sgstRate || 0;
            const igstRate = item.igstRate || 0;
            const cessRate = item.cessRate || 0;
            const combinedGst = cgstRate + sgstRate + igstRate + cessRate;

            totalTaxable += exShowroom * item.quantity;
            totalCgst += (exShowroom * item.quantity * cgstRate) / 100;
            totalSgst += (exShowroom * item.quantity * sgstRate) / 100;
            totalIgst += (exShowroom * item.quantity * igstRate) / 100;
            totalCess += (exShowroom * item.quantity * cessRate) / 100;
            
            totalRto += (item.rtoCharges || 0);
            totalIns += (item.insuranceCharges || 0);
            totalOther += (item.otherCharges || 0);

            doc.text(`${idx + 1}`, COL.sno, rowY, { width: 25 });
            doc.text(modelName, COL.model, rowY, { width: 150 });
            doc.text(hsn, COL.hsn, rowY, { width: 50 });
            doc.text(engine, COL.engine, rowY, { width: 95 });
            doc.text(chassis, COL.chassis, rowY, { width: 95 });
            doc.text(`${exShowroom.toFixed(2)}`, COL.price, rowY, { width: 65 });
            doc.text(`${combinedGst}%`, COL.gst, rowY, { width: 35 });
            this._rtxt(doc, (item.lineTotal || 0).toFixed(2), COL.amount, rowY);

            rowY += 14;
        });

        this._hr(doc, rowY, MID_GRAY);
        rowY += 7;

        // ── Summary block ─────────────────────────────────────────────────────────
        const sumLblX = MARGIN + 248;
        const sumValX = PAGE_W - MARGIN;
        const sumLblW = sumValX - sumLblX - 68;

        const summaryRows = [
            { lbl: 'Taxable Value', val: totalTaxable.toFixed(2) },
            { lbl: 'CGST', val: totalCgst.toFixed(2) },
            { lbl: 'SGST', val: totalSgst.toFixed(2) },
            { lbl: 'IGST', val: totalIgst.toFixed(2) },
            { lbl: 'CESS', val: totalCess.toFixed(2) },
            { lbl: 'RTO / Registration', val: totalRto.toFixed(2) },
            { lbl: 'Insurance', val: totalIns.toFixed(2) },
            { lbl: 'Other Charges', val: totalOther.toFixed(2) },
            { lbl: 'Discount', val: `-${(sale.discountAmount || 0).toFixed(2)}` },
        ];

        doc.font('Helvetica').fontSize(8).fillColor(BLACK);
        summaryRows.forEach(({ lbl, val }) => {
            if (parseFloat(val) !== 0) {
                doc.text(lbl, sumLblX, rowY, { width: sumLblW });
                this._rtxt(doc, val, sumValX, rowY);
                rowY += 13;
            }
        });

        this._hr(doc, rowY, MID_GRAY);
        rowY += 4;

        // Grand Total highlighted row
        doc.fillColor(LIGHT_GRAY).rect(MARGIN, rowY - 2, CONTENT_W, 17).fill();
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK)
            .text('Grand Total', sumLblX, rowY, { width: sumLblW });
        this._rtxt(doc, (sale.totalAmount || 0).toFixed(2), sumValX, rowY);
        rowY += 17;

        // Paid & Pending
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#10b981')
            .text('Paid Amount', sumLblX, rowY, { width: sumLblW });
        this._rtxt(doc, (sale.paidAmount || 0).toFixed(2), sumValX, rowY);
        rowY += 13;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#f59e0b')
            .text('Pending Amount', sumLblX, rowY, { width: sumLblW });
        this._rtxt(doc, (sale.pendingAmount || 0).toFixed(2), sumValX, rowY);
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

    // ─── PAGE 3: PDI SLIP ─────────────────────────────────────────────────────
    _buildPDISlipPage(doc, sale) {
        const pgTop = 30;

        // ── Logo + Title ──────────────────────────────────────────────────────────
        this._drawLogo(doc, MARGIN, pgTop, 100, 30);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(BLACK)
            .text('PDI SLIP', MARGIN, pgTop + 6, { width: CONTENT_W, align: 'center' });
        doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY)
            .text(`Sale Ref: ${sale.id?.slice(0, 8).toUpperCase()}`, MARGIN, pgTop + 28,
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

        const custFields = [
            ['Name', sale.customer?.name || ''],
            ['Phone', formatPhone(sale.customer?.phone)],
        ];
        custFields.forEach(([lbl, val]) => {
            doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK_GRAY)
                .text(`${lbl}:`, MARGIN, y, { width: 55 });
            doc.font('Helvetica').fontSize(9).fillColor(BLACK)
                .text(val, MARGIN + 58, y, { width: CONTENT_W - 58 });
            y += 15;
        });

        this._hr(doc, y, MID_GRAY);
        y += 15;

        // ── Vehicle Details (PDI focused) ─────────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BLACK).text('VEHICLE DETAILS', MARGIN, y);
        y += 14;
        this._hr(doc, y, MID_GRAY);
        y += 10;

        const bikeItems = (sale.items || []).filter(it => it.itemType === 'BIKE');
        
        bikeItems.forEach((item, idx) => {
            doc.font('Helvetica-Bold').fontSize(10).fillColor(BLACK)
                .text(`Vehicle #${idx + 1}`, MARGIN, y);
            y += 16;

            const fields = [
                ['Model', `${item.model?.brand || ''} ${item.model?.name || ''}`],
                ['Color', item.color || 'Any'],
                ['Engine #', '___________________________ (Fill at PDI)'],
                ['Chassis #', '___________________________ (Fill at PDI)'],
                ['Key Number', '___________________________'],
                ['Battery Number', '___________________________'],
                ['Tyre Make', '___________________________'],
            ];

            fields.forEach(([lbl, val]) => {
                doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK_GRAY)
                    .text(`${lbl}:`, MARGIN + 10, y, { width: 80 });
                doc.font('Helvetica').fontSize(9).fillColor(BLACK)
                    .text(val, MARGIN + 95, y, { width: CONTENT_W - 105 });
                y += 18;
            });
            y += 5;
        });

        this._hr(doc, y, MID_GRAY);
        y += 20;

        // ── PDI Checklist Placeholder ─────────────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BLACK).text('PDI CHECKLIST', MARGIN, y);
        y += 16;
        
        const checks = [
            'Battery Voltage Checked & Charged',
            'Engine Oil Level Checked',
            'Tyre Pressure Checked',
            'All Electrical Functions (Lights, Horn, etc.) Checked',
            'Brakes & Clutch Adjustment Checked',
            'Toolkit & Owners Manual Included',
            'First Aid Kit Included',
            'Vehicle Cleaned & Polished'
        ];

        checks.forEach(check => {
            doc.rect(MARGIN + 5, y - 1, 8, 8).stroke();
            doc.font('Helvetica').fontSize(8.5).fillColor(BLACK)
                .text(check, MARGIN + 18, y);
            y += 14;
        });

        y += 20;
        
        // ── Signatures ────────────────────────────────────────────────────────────
        const sigY = y;
        doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK_GRAY)
            .text("PDI Engineer Sign", MARGIN, sigY);
        doc.font('Helvetica-Bold').fontSize(8)
            .text("Customer's Acknowledgment", PAGE_W - MARGIN - 150, sigY, { width: 150, align: 'right' });
        
        y += 35;
        this._hr(doc, y, MID_GRAY, 0.5);
        y += 5;
        doc.font('Helvetica').fontSize(7).fillColor(DARK_GRAY)
            .text(`Generated on ${new Date().toLocaleString('en-IN')}`,
                MARGIN, y, { width: CONTENT_W, align: 'right' });

        this._hr(doc, y + 15, RED, 1);
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

    generatePDISlipPDF(sale, filePath) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 0, size: 'A4' });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                this._buildPDISlipPage(doc, sale);

                doc.end();
                stream.on('finish', resolve);
                stream.on('error', reject);
            } catch (err) {
                reject(err);
            }
        });
    }

    async savePDISlip(sale) {
        try {
            const pdiDir = path.join(__dirname, '../../uploads/pdi');
            if (!fs.existsSync(pdiDir)) {
                fs.mkdirSync(pdiDir, { recursive: true });
            }
            const fileName = `pdi-${sale.id}-${Date.now()}.pdf`;
            const filePath = path.join(pdiDir, fileName);
            await this.generatePDISlipPDF(sale, filePath);
            return { fileName, url: `uploads/pdi/${fileName}`, fullPath: filePath };
        } catch (err) {
            throw err;
        }
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
