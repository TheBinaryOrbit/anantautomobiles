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
    hsn: MARGIN + 145,
    engine: MARGIN + 195,
    chassis: MARGIN + 285,
    price: MARGIN + 375, // Ex-showroom
    gst: MARGIN + 435,   // GST Amt
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

        const logoPath = path.join(__dirname, '../../public/Logo_header.jpeg');
        console.log('Looking for logo at:', logoPath);
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, x, y, { width: w, height: h });
        } else {
            doc.font('Helvetica-Bold').fontSize(18).fillColor(RED)
                .text('Anant', x, y + 8, { continued: true })
                .fillColor(BLACK).text('Hero');
        }
    }

    // ─── PAGE 1: TAX INVOICE ──────────────────────────────────────────────────
    // ─── PAGE 1: DELIVERY CHALLAN (UPPER SECTION) ────────────────────────────
    // ─── PAGE 1: TAX INVOICE / DELIVERY CHALLAN (UPPER SECTION) ──────────────
    // ─── PAGE 1: TAX INVOICE / DELIVERY CHALLAN (UPPER SECTION) ──────────────
    _buildInvoicePage(doc, sale, startY = 30) {
        // ── Logo ──────────────────────────────────────────────────────────────────
        // ── Logo ──────────────────────────────────────────────────────────────────
        this._drawLogo(doc, MARGIN, startY, 120, 38);

        // Dealership Address (below logo)
        doc.font('Helvetica-Bold')
            .fontSize(8)
            .fillColor(DARK_GRAY)
            .text(
                'Address : Hero - Anant Automobiles, Ahmadgarh, Uttar Pradesh 203392',
                MARGIN,
                startY + 42,
                { width: 250 }
            );

        doc.font('Helvetica-Bold')
            .fontSize(8)
            .fillColor(DARK_GRAY)
            .text(
                'Phone Number : 8650507572',
                MARGIN,
                startY + 54
            );

        // ── Invoice # / Date (top-right) ─────────────────────────────────────────
        const invInfoY = startY + 36;
        const invLblX = PAGE_W - MARGIN - 200;
        const invValX = PAGE_W - MARGIN - 130;

        doc.font('Helvetica-Bold').fontSize(9).fillColor(RED)
            .text('CHALLAN', invLblX, invInfoY - 14, { width: 200, align: 'right' });

        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK)
            .text('Challan NO.', invLblX, invInfoY, { width: 65, align: 'right' });
        doc.font('Helvetica').fontSize(8)
            .text(String(sale.saleNumber || sale.id || ''), invValX, invInfoY, { width: 130, align: 'right' });

        doc.font('Helvetica-Bold').fontSize(8)
            .text('Date', invLblX, invInfoY + 13, { width: 65, align: 'right' });
        doc.font('Helvetica').fontSize(8)
            .text(new Date(sale.saleDate).toLocaleString('en-IN'),
                invValX, invInfoY + 13, { width: 130, align: 'right' });

        const addrTop = startY + 60;
        const divY = addrTop + 35;
        this._hr(doc, divY, RED, 1.5);

        // ── Customer info grid ────────────────────────────────────────────────────
        const gridTop = divY + 8;
        const LBL_W = 105;
        const VAL_W = 350;

        const addr = sale.customer?.address || {};
        const addrStr = [
            addr.addressLine1,
            addr.addressLine2,
            addr.city,
            addr.state,
            addr.postalCode,
        ].filter(Boolean).join(', ');

        const rows = [
            ['Customer Name', sale.customer?.name || ''],
            ['Mobile / Contact', formatPhone(sale.customer?.phone)],
            ['Address', addrStr],
            ['Finance Company', sale.financeCompany || 'N/A'],
            ['Payment Type', sale.paymentType || ''],
            ['Overall Status', sale.status || 'PENDING']
        ];

        let gy = gridTop;

        rows.forEach(([lbl, val]) => {
            // Calculate the height required for the value
            const valueHeight = doc.heightOfString(val || '', {
                width: VAL_W,
                align: 'left'
            });

            const rowHeight = Math.max(12, valueHeight + 2);

            doc.font('Helvetica-Bold')
                .fontSize(8)
                .fillColor(DARK_GRAY)
                .text(lbl, MARGIN, gy, { width: LBL_W });

            doc.font('Helvetica')
                .fontSize(8)
                .fillColor(BLACK)
                .text(val || '', MARGIN + LBL_W + 4, gy, {
                    width: VAL_W
                });

            gy += rowHeight;
        });

        this._hr(doc, gy + 4, MID_GRAY);

        // ── Items table header (Includes Status Column) ───────────────────────────
        const tblHdrY = gy + 10;
        doc.fillColor(LIGHT_GRAY).rect(MARGIN, tblHdrY - 2, CONTENT_W, 14).fill();

        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK);
        doc.text('S.No', MARGIN, tblHdrY, { width: 25 });
        doc.text('Description & Accessories', MARGIN + 30, tblHdrY, { width: 170 });
        doc.text('Engine No.', MARGIN + 210, tblHdrY, { width: 95 });
        doc.text('Chassis No.', MARGIN + 315, tblHdrY, { width: 95 });
        doc.text('Status', MARGIN + 420, tblHdrY, { width: 70 });
        this._rtxt(doc, 'Qty', PAGE_W - MARGIN, tblHdrY, 25);

        this._hr(doc, tblHdrY + 14, MID_GRAY);

        // ── Items rows (With Dynamic Heights & Conditional Color Tracking) ────────
        let rowY = tblHdrY + 18;

        sale.items.forEach((item, idx) => {
            const isBike = item.itemType === 'BIKE';
            const modelName = isBike
                ? `${item.model?.brand || ''} ${item.model?.name || ''} (${item.color || 'Any'})`.trim()
                : item.accessory?.name || '';

            const engine = item.bike?.engineNumber || (isBike ? '— (PDI)' : '—');
            const chassis = item.bike?.chassisNumber || (isBike ? '— (PDI)' : '—');
            const itemStatus = item.SaleItemStatus || 'SOLD';

            // Calculate height metrics dynamically
            const textWidth = 170;
            doc.font('Helvetica').fontSize(8);
            const textHeight = doc.heightOfString(modelName, { width: textWidth });

            const padding = 6;
            const rowHeight = Math.max(14, textHeight + padding);

            // Row background tint logic based on item status
            if (itemStatus === 'EXCHANGED') {
                doc.fillColor('#fef2f2').rect(MARGIN, rowY - (padding / 2), CONTENT_W, rowHeight).fill();
            } else if (idx % 2 === 1) {
                doc.fillColor('#f9f9f9').rect(MARGIN, rowY - (padding / 2), CONTENT_W, rowHeight).fill();
            }

            // Draw data rows
            doc.fillColor(itemStatus === 'EXCHANGED' ? '#b91c1c' : BLACK);
            doc.text(`${idx + 1}`, MARGIN, rowY, { width: 25 });
            doc.text(modelName, MARGIN + 30, rowY, { width: textWidth });
            doc.text(engine, MARGIN + 210, rowY, { width: 95 });
            doc.text(chassis, MARGIN + 315, rowY, { width: 95 });

            // Render Status Text bolded
            doc.font('Helvetica-Bold');
            doc.text(itemStatus, MARGIN + 420, rowY, { width: 70 });
            doc.font('Helvetica');

            this._rtxt(doc, String(item.quantity || 1), PAGE_W - MARGIN, rowY, 25);

            rowY += rowHeight;
        });

        this._hr(doc, rowY, MID_GRAY);
        rowY += 8;

        // ── Summary Financial Block ───────────────────────────────────────────────
        const sumLblX = PAGE_W - MARGIN - 220;
        const sumValX = PAGE_W - MARGIN;
        const sumLblW = 120;

        doc.font('Helvetica').fontSize(8.5).fillColor(BLACK);

        doc.font('Helvetica-Bold').text('Grand Total:', sumLblX, rowY, { width: sumLblW });
        this._rtxt(doc, (sale.totalAmount || 0).toFixed(2), sumValX, rowY, 90);
        rowY += 13;

        doc.font('Helvetica').text('Discount Allowed:', sumLblX, rowY, { width: sumLblW });
        this._rtxt(doc, `-${(sale.discountAmount || 0).toFixed(2)}`, sumValX, rowY, 90);
        rowY += 13;

        doc.font('Helvetica-Bold').fillColor('#10b981').text('Amount Paid:', sumLblX, rowY, { width: sumLblW });
        this._rtxt(doc, (sale.paidAmount || 0).toFixed(2), sumValX, rowY, 90);
        rowY += 13;

        // doc.font('Helvetica-Bold').fillColor('#f59e0b').text('Pending Balance:', sumLblX, rowY, { width: sumLblW });
        // this._rtxt(doc, (sale.pendingAmount || 0).toFixed(2), sumValX, rowY, 90);
        // rowY += 16;


        return rowY + 25;
    }

    // ─── PAGE 1: GATE PASS (FIXED TO BOTTOM OF PAGE) ──────────────────────────
    // ─── PAGE 1: GATE PASS (FIXED TO BOTTOM OF PAGE) ──────────────────────────
    _buildGatePassPage(doc, sale, startY) {
        const GATE_PASS_HEIGHT = 200;
        let y = 880 - GATE_PASS_HEIGHT - MARGIN;



        doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK_GRAY);
        doc.text("Customer's Acknowledgement Signature", MARGIN, y);
        doc.text('Authorized Signatory (Anant Hero)', PAGE_W - MARGIN - 180, y, { width: 180, align: 'right' });

        y += 40;

        // Scissor cutting line implementation
        doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY);
        doc.text('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  CUT HERE  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -', MARGIN, y);

        y += 20;

        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor(BLACK)
            .text('GATE PASS', MARGIN, y);

        doc.font('Helvetica')
            .fontSize(8)
            .fillColor(DARK_GRAY)
            .text(
                `Challan Ref: ${sale.saleNumber || sale.id || ''}  |  Date: ${new Date(sale.saleDate).toLocaleDateString('en-IN')}`,
                PAGE_W - MARGIN - 250,
                y,
                { width: 250, align: 'right' }
            );

        y += 14;

        // Customer Name
        doc.font('Helvetica-Bold')
            .fontSize(8)
            .fillColor(BLACK)
            .text(
                `Customer Name : ${sale.customer?.name || ''}`,
                MARGIN,
                y
            );

        y += 14;

        this._hr(doc, y, RED, 1);
        y += 8;

        const gC1 = MARGIN;
        const gC2 = MARGIN + 30;
        const gC3 = MARGIN + 210;
        const gC4 = MARGIN + 315;
        const gC5 = MARGIN + 420;
        const gC6 = PAGE_W - MARGIN;

        doc.fillColor(LIGHT_GRAY).rect(MARGIN, y - 2, CONTENT_W, 14).fill();
        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK);
        doc.text('#', gC1, y, { width: 25 });
        doc.text('Cleared Item Description', gC2, y, { width: 170 });
        doc.text('Engine #', gC3, y, { width: 95 });
        doc.text('Chassis #', gC4, y, { width: 95 });
        doc.text('Status', gC5, y, { width: 70 });
        this._rtxt(doc, 'Qty', gC6, y, 25);

        y += 16;
        this._hr(doc, y - 2, MID_GRAY);

        doc.font('Helvetica').fontSize(8).fillColor(BLACK);
        sale.items.forEach((item, idx) => {
            const isBike = item.itemType === 'BIKE';
            const desc = isBike
                ? `${item.model?.brand || ''} ${item.model?.name || ''} (${item.color || 'Any'})`.trim()
                : item.accessory?.name || '';

            const engineNo = isBike ? (item.bike?.engineNumber || '—') : '—';
            const chassisNo = isBike ? (item.bike?.chassisNumber || '—') : '—';
            const itemStatus = item.SaleItemStatus || 'SOLD';

            const textHeight = doc.heightOfString(desc, { width: 170 });
            const padding = 4;
            const gpRowHeight = Math.max(14, textHeight + padding);

            if (itemStatus === 'EXCHANGED') {
                doc.fillColor('#fef2f2').rect(MARGIN, y - (padding / 2), CONTENT_W, gpRowHeight).fill();
            } else if (idx % 2 === 1) {
                doc.fillColor('#f9f9f9').rect(MARGIN, y - (padding / 2), CONTENT_W, gpRowHeight).fill();
            }

            doc.fillColor(itemStatus === 'EXCHANGED' ? '#b91c1c' : BLACK);
            doc.text(`${idx + 1}`, gC1, y, { width: 25 });
            doc.text(desc, gC2, y, { width: 170 });
            doc.text(engineNo, gC3, y, { width: 95 });
            doc.text(chassisNo, gC4, y, { width: 95 });

            doc.font('Helvetica-Bold');
            doc.text(itemStatus, gC5, y, { width: 70 });
            doc.font('Helvetica');

            this._rtxt(doc, String(item.quantity || 1), gC6, y, 25);

            y += gpRowHeight;
        });

        this._hr(doc, y, MID_GRAY);
        y += 15;

        doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK_GRAY);
        doc.text('Store In-Charge Signature: ____________________', MARGIN, y);
        doc.text('Gate Security Guard: ____________________', PAGE_W - MARGIN - 200, y, { width: 200, align: 'right' });
    }

    // ─── Main PDF generation ───────────────────────────────────────────────────
    generateInvoicePDF(sale, filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Initializing default single A4 frame structure 
                const doc = new PDFDocument({ margin: 0, size: 'A4' });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Build delivery challan configuration area (Upper Side)
                const endOfUpperPartY = this._buildInvoicePage(doc, sale, 30);

                // Build simplified matching Gate Pass element inside remaining single space
                this._buildGatePassPage(doc, sale, endOfUpperPartY);

                doc.end();
                stream.on('finish', resolve);
                stream.on('error', reject);
            } catch (err) {
                reject(err);
            }
        });
    }


    // ─── PAGE 3: PDI SLIP ─────────────────────────────────────────────────────
    _buildPDISlipPage(doc, sale) {
        const pgTop = 24;
        const COL2_X = MARGIN + CONTENT_W / 2 + 6;
        const COL_W = CONTENT_W / 2 - 6;

        // ── Header Band ──────────────────────────────────────────────────────────
        // doc.rect(MARGIN, pgTop, CONTENT_W, 38).fill(WHITE);

        this._drawLogo(doc, MARGIN + 8, pgTop + 4, 90, 28);

        doc.font('Helvetica-Bold').fontSize(16).fillColor('RED')
            .text('PRE-DELIVERY INSPECTION', MARGIN, pgTop + 4, { width: CONTENT_W, align: 'center' });
        // sale number 
        doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.85)')
            .text(`Sale Number: ${sale?.saleNumber || 'N/A'}`, MARGIN, pgTop + 26, { width: CONTENT_W, align: 'center' });

        // ── Sub-header pill row ───────────────────────────────────────────────────
        let y = pgTop + 48;
        const pillH = 18;
        doc.roundedRect(MARGIN, y, CONTENT_W, pillH, 4).fill('#F5F5F5');

        const refText = `REF: ${sale.id?.slice(0, 8).toUpperCase() || 'N/A'}`;
        const dateText = `DATE: ${new Date(sale.saleDate).toLocaleDateString('en-IN')}`;
        const genText = `GENERATED: ${new Date().toLocaleString('en-IN')}`;

        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(DARK_GRAY)
            .text(refText, MARGIN + 8, y + 5)
            .text(dateText, MARGIN + CONTENT_W / 2 - 30, y + 5)
            .text(genText, PAGE_W - MARGIN - 140, y + 5, { width: 140, align: 'right' });

        y += pillH + 12;

        // ── SECTION HEADER helper ─────────────────────────────────────────────────
        const sectionHeader = (title, yPos) => {
            doc.rect(MARGIN, yPos, CONTENT_W, 16).fill('#FFFFFF');
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
                .text(title, MARGIN + 8, yPos + 4);
            return yPos + 22;
        };

        // ── KEY-VALUE helper ──────────────────────────────────────────────────────
        const kv = (label, value, x, yPos, w) => {
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(DARK_GRAY)
                .text(label.toUpperCase(), x, yPos, { width: 72 });
            doc.font('Helvetica').fontSize(8.5).fillColor(BLACK)
                .text(value || '—', x + 76, yPos, { width: w - 80 });
        };

        // ═══════════════════════════════════════════════════
        // SECTION 1: CUSTOMER DETAILS  (two-column layout)
        // ═══════════════════════════════════════════════════
        y = sectionHeader('CUSTOMER DETAILS', y);

        const addr = [
            sale.customer?.address?.addressLine1,
            sale.customer?.address?.city,
            sale.customer?.address?.state,
            sale.customer?.address?.pincode,
            sale.customer?.address?.country,
        ].filter(Boolean).join(', ');

        // Left column
        kv('Name', sale.customer?.name || '', MARGIN, y, COL_W);
        kv('Phone', formatPhone(sale.customer?.phone), MARGIN, y + 14, COL_W);

        // Right column
        kv('Address', addr, COL2_X, y, COL_W);

        y += 30;
        this._hr(doc, y, '#E0E0E0', 0.5);
        y += 10;

        // ═══════════════════════════════════════════════════
        // SECTION 2: VEHICLE DETAILS  (per-bike card)
        // ═══════════════════════════════════════════════════
        y = sectionHeader('VEHICLE DETAILS', y);

        const bikeItems = (sale.items || []).filter(it => it.itemType === 'BIKE' && it.SaleItemStatus == 'SOLD');

        bikeItems.forEach((item, idx) => {
            // Vehicle card header
            doc.rect(MARGIN, y, CONTENT_W, 14).fill('#F0F0F5');
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#1A1A2E')
                .text(`VEHICLE #${idx + 1}  —  ${item.model?.brand || ''} ${item.model?.name || ''}  |  Color: ${item.color || 'Any'}`,
                    MARGIN + 8, y + 3);
            y += 20;

            // Two-column grid of fields
            const leftFields = [
                ['Engine #', '___________________________'],
                ['Chassis #', '___________________________'],
                ['Key Number', '___________________________'],
                ['Battery No.', '___________________________'],
            ];
            const rightFields = [
                ['Battery Co.', '___________________________'],
                ['Battery Make', '___________________________'],
                ['Tyre Make', '___________________________'],
                ['Odometer', '___________________________'],
            ];

            const rowH = 16;
            leftFields.forEach((f, i) => {
                // Alternate row tint
                if (i % 2 === 0) {
                    doc.rect(MARGIN, y, CONTENT_W, rowH).fill('#FAFAFA');
                }
                kv(f[0], f[1], MARGIN + 6, y + 3, COL_W - 6);
                kv(rightFields[i][0], rightFields[i][1], COL2_X, y + 3, COL_W);

                // Center divider
                doc.moveTo(COL2_X - 6, y).lineTo(COL2_X - 6, y + rowH)
                    .strokeColor('#E0E0E0').lineWidth(0.5).stroke();

                y += rowH;
            });

            y += 8;
        });

        this._hr(doc, y, '#E0E0E0', 0.5);
        y += 10;

        // ═══════════════════════════════════════════════════
        // SECTION 3: PDI CHECKLIST  (two-column grid)
        // ═══════════════════════════════════════════════════
        y = sectionHeader('PDI CHECKLIST', y);

        const checks = [
            'Battery Voltage Checked & Charged',
            'Engine Oil Level Checked',
            'Tyre Pressure Checked',
            'All Electrical Functions Checked',
            'Lights & Horn Verified',
            'Brakes & Clutch Adjustment Checked',
            'Toolkit & Owners Manual Included',
            'First Aid Kit Included',
            'Vehicle Cleaned & Polished',
            '5 Photos of Vehicle Taken',
        ];

        const checkRowH = 17;
        checks.forEach((check, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const cx = col === 0 ? MARGIN + 6 : COL2_X;
            const cy = y + row * checkRowH;

            // Alternate row tint (full-width, only on left column to avoid double draw)
            if (col === 0 && row % 2 === 0) {
                doc.rect(MARGIN, cy, CONTENT_W, checkRowH).fill('#FAFAFA');
            }

            // Checkbox
            doc.roundedRect(cx + 1, cy + 4, 9, 9, 1.5)
                .strokeColor(RED).lineWidth(1).stroke();

            doc.font('Helvetica').fontSize(8).fillColor(BLACK)
                .text(check, cx + 14, cy + 5, { width: COL_W - 14 });
        });

        y += Math.ceil(checks.length / 2) * checkRowH + 12;

        this._hr(doc, y, '#E0E0E0', 0.5);
        y += 12;

        // ═══════════════════════════════════════════════════
        // SECTION 4: REMARKS  (short text box)
        // ═══════════════════════════════════════════════════
        y = sectionHeader('REMARKS / NOTES', y);

        doc.rect(MARGIN, y, CONTENT_W, 32).strokeColor('#D0D0D0').lineWidth(0.5).stroke();
        doc.font('Helvetica').fontSize(7.5).fillColor('#AAAAAA')
            .text('Enter any remarks or notes here...', MARGIN + 8, y + 11);

        y += 42;

        // ═══════════════════════════════════════════════════
        // SECTION 5: SIGNATURES  (three boxes)
        // ═══════════════════════════════════════════════════
        const sigBoxW = (CONTENT_W - 16) / 3;
        const sigBoxH = 42;
        const sigLabels = ['PDI Engineer', "Supervisor's Approval", "Customer's Acknowledgment"];

        sigLabels.forEach((lbl, i) => {
            const sx = MARGIN + i * (sigBoxW + 8);

            // Box
            doc.rect(sx, y, sigBoxW, sigBoxH)
                .strokeColor('#CCCCCC').lineWidth(0.5).stroke();

            // Signature line inside box
            doc.moveTo(sx + 8, y + sigBoxH - 14)
                .lineTo(sx + sigBoxW - 8, y + sigBoxH - 14)
                .strokeColor('#CCCCCC').lineWidth(0.5).stroke();

            // Label strip at bottom
            doc.rect(sx, y + sigBoxH - 12, sigBoxW, 12).fill('#F5F5F5');
            doc.font('Helvetica-Bold').fontSize(6.5).fillColor(DARK_GRAY)
                .text(lbl.toUpperCase(), sx, y + sigBoxH - 9, { width: sigBoxW, align: 'center' });
        });

        y += sigBoxH + 10;

        // ── Footer bar ────────────────────────────────────────────────────────────
        doc.rect(MARGIN, y, CONTENT_W, 12).fill(RED);
        doc.font('Helvetica').fontSize(6.5).fillColor('#FFFFFF')
            .text('This PDI slip must be signed before vehicle handover.  |  Keep a copy for dealership records.',
                MARGIN, y + 3, { width: CONTENT_W, align: 'center' });
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
