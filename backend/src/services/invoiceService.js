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

// Devanagari faces, needed for the Hindi customer satisfaction certificate --
// the built-in Helvetica has no Devanagari glyphs. Mukta is used rather than Noto
// Sans Devanagari because fontkit 2.x crashes shaping Noto's GPOS anchor tables.
const HINDI_FONT_REGULAR = path.join(__dirname, '../../public/fonts/Mukta-Regular.ttf');
const HINDI_FONT_BOLD = path.join(__dirname, '../../public/fonts/Mukta-Bold.ttf');


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

    /**
     * Registers the Devanagari faces on this document and returns the font names
     * to use. Falls back to Helvetica if the TTFs are missing so PDF generation
     * never hard-fails on a deployment without them.
     */
    _registerHindiFonts(doc) {
        const hasRegular = fs.existsSync(HINDI_FONT_REGULAR);
        const hasBold = fs.existsSync(HINDI_FONT_BOLD);

        if (hasRegular) doc.registerFont('Hindi', HINDI_FONT_REGULAR);
        if (hasBold) doc.registerFont('Hindi-Bold', HINDI_FONT_BOLD);

        return {
            regular: hasRegular ? 'Hindi' : 'Helvetica',
            bold: hasBold ? 'Hindi-Bold' : (hasRegular ? 'Hindi' : 'Helvetica-Bold'),
        };
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
        // ── Title (centered, top of page) ───────────────────────────────────────
        doc.font('Helvetica-Bold').fontSize(16).fillColor(RED)
            .text('CHALLAN', MARGIN, startY, { width: CONTENT_W, align: 'center' });

        const titleH = doc.heightOfString('CHALLAN', { width: CONTENT_W, align: 'center' });
        const belowTitleY = startY + titleH + 12;

        // ── Logo (left, below title) ────────────────────────────────────────────
        this._drawLogo(doc, MARGIN, belowTitleY, 120, 38);

        // Dealership Address (below logo)
        doc.font('Helvetica-Bold')
            .fontSize(8)
            .fillColor(DARK_GRAY);

        const address = 'Address: Hero - Anant Automobiles, Front Of Indian Petrol Pump, Ahmadgarh, Uttar Pradesh 203392';

        const addressY = belowTitleY + 46;

        doc.text(address, MARGIN, addressY, {
            width: 250
        });

        // Calculate how much vertical space the address used
        const addressHeight = doc.heightOfString(address, {
            width: 250
        });

        // Phone number below the address
        doc.text(
            'Phone Number: 8650507572',
            MARGIN,
            addressY + addressHeight + 4
        );

        // ── Challan # / Date (right, aligned with logo row) ─────────────────────
        const invInfoY = belowTitleY + 6;
        const invLblX = PAGE_W - MARGIN - 200;
        const invValX = PAGE_W - MARGIN - 130;

        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK)
            .text('Challan NO.', invLblX, invInfoY, { width: 65, align: 'right' });
        doc.font('Helvetica').fontSize(8)
            .text(String(sale.saleNumber || sale.id || ''), invValX, invInfoY, { width: 130, align: 'right' });

        doc.font('Helvetica-Bold').fontSize(8)
            .text('Date', invLblX, invInfoY + 13, { width: 65, align: 'right' });
        doc.font('Helvetica').fontSize(8)
            .text(new Date(sale.saleDate).toLocaleString('en-IN'),
                invValX, invInfoY + 13, { width: 130, align: 'right' });
                

        // ── Divider (below the taller of the two columns) ───────────────────────
        const leftColBottom = addressY + addressHeight + 4 + 16;
        const rightColBottom = invInfoY + 13 + 10 + 16;
        const divY = Math.max(leftColBottom, rightColBottom);
        this._hr(doc, divY, RED, 1.5);

        const DIVIDER_BOTTOM_MARGIN = 16;
        let y = divY + DIVIDER_BOTTOM_MARGIN; 

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

        // ── Items table header ───────────────────────────────────────────────────
        // Only ex-showroom values are printed here. Any discount on the sale is
        // deliberately kept off the customer copy.
        const ITEM_COL = {
            sno:     { x: MARGIN,          w: 22 },
            desc:    { x: MARGIN + 22,     w: 130 },
            engine:  { x: MARGIN + 152,    w: 82 },
            chassis: { x: MARGIN + 234,    w: 88 },
            status:  { x: MARGIN + 322,    w: 58 },
            qty:     { end: MARGIN + 400,  w: 20 },
            price:   { end: MARGIN + 460,  w: 58 },
            amount:  { end: PAGE_W - MARGIN, w: 55 },
        };

        const tblHdrY = gy + 10;
        doc.fillColor(LIGHT_GRAY).rect(MARGIN, tblHdrY - 2, CONTENT_W, 14).fill();

        doc.font('Helvetica-Bold').fontSize(8).fillColor(BLACK);
        doc.text('S.No', ITEM_COL.sno.x, tblHdrY, { width: ITEM_COL.sno.w, lineBreak: false });
        doc.text('Description', ITEM_COL.desc.x, tblHdrY, { width: ITEM_COL.desc.w, lineBreak: false });
        doc.text('Engine No.', ITEM_COL.engine.x, tblHdrY, { width: ITEM_COL.engine.w, lineBreak: false });
        doc.text('Chassis No.', ITEM_COL.chassis.x, tblHdrY, { width: ITEM_COL.chassis.w, lineBreak: false });
        doc.text('Status', ITEM_COL.status.x, tblHdrY, { width: ITEM_COL.status.w, lineBreak: false });
        this._rtxt(doc, 'Qty', ITEM_COL.qty.end, tblHdrY, ITEM_COL.qty.w);
        this._rtxt(doc, 'Ex-Showroom', ITEM_COL.price.end, tblHdrY, ITEM_COL.price.w);
        this._rtxt(doc, 'Amount', ITEM_COL.amount.end, tblHdrY, ITEM_COL.amount.w);

        this._hr(doc, tblHdrY + 14, MID_GRAY);

        // ── Items rows (With Dynamic Heights & Conditional Color Tracking) ────────
        let rowY = tblHdrY + 18;
        let grandTotal = 0;

        sale.items.forEach((item, idx) => {
            const isBike = item.itemType === 'BIKE';
            const modelName = isBike
                ? `${item.model?.brand || ''} ${item.model?.name || ''} (${item.color || 'Any'})`.trim()
                : item.accessory?.name || '';

            const engine = item.bike?.engineNumber || (isBike ? '\u2014 (PDI)' : '\u2014');
            const chassis = item.bike?.chassisNumber || (isBike ? '\u2014 (PDI)' : '\u2014');
            const itemStatus = item.SaleItemStatus || 'SOLD';

            const quantity = item.quantity || 1;
            const exShowroomPrice = item.unitPrice || 0;   // pre-discount, as printed
            const lineAmount = exShowroomPrice * quantity;

            // Items replaced through an exchange stay visible but no longer count
            if (itemStatus !== 'EXCHANGED') grandTotal += lineAmount;

            // Calculate height metrics dynamically
            doc.font('Helvetica').fontSize(8);
            const textHeight = doc.heightOfString(modelName, { width: ITEM_COL.desc.w });

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
            doc.text(`${idx + 1}`, ITEM_COL.sno.x, rowY, { width: ITEM_COL.sno.w });
            doc.text(modelName, ITEM_COL.desc.x, rowY, { width: ITEM_COL.desc.w });
            doc.text(engine, ITEM_COL.engine.x, rowY, { width: ITEM_COL.engine.w });
            doc.text(chassis, ITEM_COL.chassis.x, rowY, { width: ITEM_COL.chassis.w });

            // Render Status Text bolded
            doc.font('Helvetica-Bold');
            doc.text(itemStatus, ITEM_COL.status.x, rowY, { width: ITEM_COL.status.w });
            doc.font('Helvetica');

            this._rtxt(doc, String(quantity), ITEM_COL.qty.end, rowY, ITEM_COL.qty.w);
            this._rtxt(doc, exShowroomPrice.toFixed(2), ITEM_COL.price.end, rowY, ITEM_COL.price.w);
            this._rtxt(doc, lineAmount.toFixed(2), ITEM_COL.amount.end, rowY, ITEM_COL.amount.w);

            rowY += rowHeight;
        });

        this._hr(doc, rowY, MID_GRAY);
        rowY += 10;

        // ── Summary Financial Block (ex-showroom figures only) ───────────────────
        const sumLblX = PAGE_W - MARGIN - 220;
        const sumValX = PAGE_W - MARGIN;
        const sumLblW = 120;

        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#10b981')
            .text('Amount Paid:', sumLblX, rowY, { width: sumLblW });
        this._rtxt(doc, (sale.paidAmount || 0).toFixed(2), sumValX, rowY, 90);
        rowY += 16;

        // Grand Total closes out the challan, below every other figure
        doc.save().fillColor(LIGHT_GRAY)
            .rect(sumLblX - 8, rowY - 4, sumValX - sumLblX + 8, 20).fill().restore();

        doc.font('Helvetica-Bold').fontSize(10).fillColor(BLACK)
            .text('GRAND TOTAL:', sumLblX, rowY + 2, { width: sumLblW });
        this._rtxt(doc, grandTotal.toFixed(2), sumValX, rowY + 2, 90);
        rowY += 24;

        return rowY + 20;
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
        const COL_GAP = 12;
        const COL2_X = MARGIN + CONTENT_W / 2 + COL_GAP / 2;
        const COL_W = CONTENT_W / 2 - COL_GAP / 2;
        const PAGE_BOTTOM = 841.89 - MARGIN;

        // Keeps every block from running off the page instead of silently overlapping the footer
        const ensureSpace = (needed) => {
            if (y + needed > PAGE_BOTTOM) {
                doc.addPage();
                y = MARGIN;
            }
        };

        let y = pgTop;

        // ═══════════════════════════════════════════════════
        // HEADER BAND — logo + address on the left, title on the right
        // (previously the title/sale-number sat at a fixed y that assumed
        // a 1-line address; now the two sides are measured independently)
        // ═══════════════════════════════════════════════════
        const logoW = 90, logoH = 28;
        this._drawLogo(doc, MARGIN, y, logoW, logoH);

        const address = 'Address: Hero - Anant Automobiles, Front Of Indian Petrol Pump, Ahmadgarh, Uttar Pradesh 203392';
        const addrWidth = 230;
        const addrY = y + logoH + 6;

        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(DARK_GRAY)
            .text(address, MARGIN, addrY, { width: addrWidth, lineGap: 1 });
        const addressHeight = doc.heightOfString(address, { width: addrWidth, lineGap: 1 });

        const phoneY = addrY + addressHeight + 4;
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(DARK_GRAY)
            .text('Phone Number: 8650507572', MARGIN, phoneY, { width: addrWidth });
        const phoneHeight = doc.heightOfString('Phone Number: 8650507572', { width: addrWidth });

        const leftColBottom = phoneY + phoneHeight;

        // Title + sale number, right side of the header, independent of address height
        const titleX = MARGIN + addrWidth + 16;
        const titleW = CONTENT_W - addrWidth - 16;

        doc.font('Helvetica-Bold').fontSize(16).fillColor(RED)
            .text('PRE-DELIVERY INSPECTION', titleX, y + 6, { width: titleW, align: 'right' });
        const titleHeight = doc.heightOfString('PRE-DELIVERY INSPECTION', {
            width: titleW, align: 'right'
        });

        // FIX: was rgba(255,255,255,0.85) on a plain white page — invisible.
        // Uses DARK_GRAY on white, same as the rest of the meta text.
        const saleNumberY = y + 6 + titleHeight + 4;
        doc.font('Helvetica').fontSize(8).fillColor(DARK_GRAY)
            .text(`Sale Number: ${sale?.saleNumber || 'N/A'}`, titleX, saleNumberY, {
                width: titleW, align: 'right'
            });
        const rightColBottom = saleNumberY + doc.heightOfString(`Sale Number: ${sale?.saleNumber || 'N/A'}`, { width: titleW });

        y = Math.max(leftColBottom, rightColBottom, y + logoH) + 10;

        // ── Sub-header pill row (REF / DATE / GENERATED) ───────────────────────────
        const pillH = 18;
        ensureSpace(pillH + 12);
        doc.roundedRect(MARGIN, y, CONTENT_W, pillH, 4).fill('#F5F5F5');

        const refText = `REF: ${sale.id?.slice(0, 8).toUpperCase() || 'N/A'}`;
        const dateText = `DATE: ${new Date(sale.saleDate).toLocaleDateString('en-IN')}`;
        const genText = `GENERATED: ${new Date().toLocaleString('en-IN')}`;

        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(DARK_GRAY)
            .text(refText, MARGIN + 8, y + 5, { width: CONTENT_W / 3, lineBreak: false })
            .text(dateText, MARGIN + CONTENT_W / 3, y + 5, { width: CONTENT_W / 3, align: 'center', lineBreak: false })
            .text(genText, PAGE_W - MARGIN - 160, y + 5, { width: 160, align: 'right', lineBreak: false });

        y += pillH + 12;

        // ── SECTION HEADER helper ───────────────────────────────────────────────────
        // FIX: was filling a white rect and writing white text on it (invisible).
        // Now a dark band with white text, matching the vehicle-card style used below.
        const sectionHeaderH = 16;
        const sectionHeader = (title) => {
            ensureSpace(sectionHeaderH + 8);
            doc.rect(MARGIN, y, CONTENT_W, sectionHeaderH).fill('#1A1A2E');
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF')
                .text(title, MARGIN + 8, y + 4);
            y += sectionHeaderH + 8;
        };

        // ── KEY-VALUE helper — returns the height it actually used ────────────────
        const kv = (label, value, x, yPos, w) => {
            doc.font('Helvetica-Bold').fontSize(7.5).fillColor(DARK_GRAY)
                .text(label.toUpperCase(), x, yPos, { width: 72 });
            const valueW = w - 80;
            doc.font('Helvetica').fontSize(8.5).fillColor(BLACK)
                .text(value || '—', x + 76, yPos, { width: valueW });
            return doc.heightOfString(value || '—', { width: valueW });
        };

        // ═══════════════════════════════════════════════════
        // SECTION 1: CUSTOMER DETAILS (two-column, dynamic row height)
        // ═══════════════════════════════════════════════════
        sectionHeader('CUSTOMER DETAILS');

        const addr = [
            sale.customer?.address?.addressLine1,
            sale.customer?.address?.city,
            sale.customer?.address?.state,
            sale.customer?.address?.pincode,
            sale.customer?.address?.country,
        ].filter(Boolean).join(', ');

        const nameH = kv('Name', sale.customer?.name || '', MARGIN, y, COL_W);
        // Address on the right can wrap to multiple lines — measure it first so
        // the phone row below never starts before the address block ends.
        const addrH = doc.heightOfString(addr || '—', { width: COL_W - 80 });
        kv('Address', addr, COL2_X, y, COL_W);

        const phoneRowY = y + Math.max(nameH, 12) + 6;
        const phoneH = kv('Phone', formatPhone(sale.customer?.phone), MARGIN, phoneRowY, COL_W);

        y = Math.max(phoneRowY + phoneH, y + addrH) + 10;
        this._hr(doc, y, '#E0E0E0', 0.5);
        y += 10;

        // ═══════════════════════════════════════════════════
        // SECTION 2: VEHICLE DETAILS (per-bike card, dynamic header height)
        // ═══════════════════════════════════════════════════
        sectionHeader('VEHICLE DETAILS');

        const bikeItems = (sale.items || []).filter(it => it.itemType === 'BIKE' && it.SaleItemStatus == 'SOLD');

        bikeItems.forEach((item, idx) => {
            const cardTitle = `VEHICLE #${idx + 1}  —  ${item.model?.brand || ''} ${item.model?.name || ''}  |  Color: ${item.color || 'Any'}`;
            const cardTitleH = doc.heightOfString(cardTitle, { width: CONTENT_W - 16 });
            const cardHeaderH = Math.max(14, cardTitleH + 6);

            ensureSpace(cardHeaderH + 4 * 16 + 8);

            doc.rect(MARGIN, y, CONTENT_W, cardHeaderH).fill('#F0F0F5');
            doc.font('Helvetica-Bold').fontSize(8).fillColor('#1A1A2E')
                .text(cardTitle, MARGIN + 8, y + 3, { width: CONTENT_W - 16 });
            y += cardHeaderH + 6;

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

            const rowH = 16; // placeholder underscores never wrap, fixed row height is safe here
            leftFields.forEach((f, i) => {
                ensureSpace(rowH);
                if (i % 2 === 0) {
                    doc.rect(MARGIN, y, CONTENT_W, rowH).fill('#FAFAFA');
                }
                kv(f[0], f[1], MARGIN + 6, y + 3, COL_W - 6);
                kv(rightFields[i][0], rightFields[i][1], COL2_X, y + 3, COL_W);

                doc.moveTo(COL2_X - 6, y).lineTo(COL2_X - 6, y + rowH)
                    .strokeColor('#E0E0E0').lineWidth(0.5).stroke();

                y += rowH;
            });

            y += 8;
        });

        this._hr(doc, y, '#E0E0E0', 0.5);
        y += 10;

        // ═══════════════════════════════════════════════════
        // SECTION 3: PDI CHECKLIST (two-column, per-row dynamic height)
        // ═══════════════════════════════════════════════════
        sectionHeader('PDI CHECKLIST');

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

        const checkTextW = COL_W - 14;
        for (let row = 0; row < Math.ceil(checks.length / 2); row++) {
            const leftText = checks[row * 2];
            const rightText = checks[row * 2 + 1];

            const leftH = doc.heightOfString(leftText, { width: checkTextW });
            const rightH = rightText ? doc.heightOfString(rightText, { width: checkTextW }) : 0;
            const rowH = Math.max(leftH, rightH, 9) + 10; // +10 padding so text never touches the row edge

            ensureSpace(rowH);

            if (row % 2 === 0) {
                doc.rect(MARGIN, y, CONTENT_W, rowH).fill('#FAFAFA');
            }

            doc.roundedRect(MARGIN + 7, y + 4, 9, 9, 1.5)
                .strokeColor(RED).lineWidth(1).stroke();
            doc.font('Helvetica').fontSize(8).fillColor(BLACK)
                .text(leftText, MARGIN + 20, y + 5, { width: checkTextW });

            if (rightText) {
                doc.roundedRect(COL2_X + 1, y + 4, 9, 9, 1.5)
                    .strokeColor(RED).lineWidth(1).stroke();
                doc.font('Helvetica').fontSize(8).fillColor(BLACK)
                    .text(rightText, COL2_X + 14, y + 5, { width: checkTextW });
            }

            y += rowH;
        }

        y += 4;
        this._hr(doc, y, '#E0E0E0', 0.5);
        y += 12;

        // ═══════════════════════════════════════════════════
        // SECTION 4: REMARKS
        // ═══════════════════════════════════════════════════
        const remarksBoxH = 32;
        ensureSpace(remarksBoxH + 10);
        sectionHeader('REMARKS / NOTES');

        doc.rect(MARGIN, y, CONTENT_W, remarksBoxH).strokeColor('#D0D0D0').lineWidth(0.5).stroke();
        doc.font('Helvetica').fontSize(7.5).fillColor('#AAAAAA')
            .text('Enter any remarks or notes here...', MARGIN + 8, y + 11);

        y += remarksBoxH + 10;

        // ═══════════════════════════════════════════════════
        // SECTION 5: SIGNATURES
        // ═══════════════════════════════════════════════════
        const sigBoxW = (CONTENT_W - 16) / 3;
        const sigBoxH = 42;
        const sigLabels = ['PDI Engineer', "Supervisor's Approval", "Customer's Acknowledgment"];

        ensureSpace(sigBoxH + 22); // signatures + footer bar together, so they don't get split across a page break

        sigLabels.forEach((lbl, i) => {
            const sx = MARGIN + i * (sigBoxW + 8);

            doc.rect(sx, y, sigBoxW, sigBoxH)
                .strokeColor('#CCCCCC').lineWidth(0.5).stroke();

            doc.moveTo(sx + 8, y + sigBoxH - 14)
                .lineTo(sx + sigBoxW - 8, y + sigBoxH - 14)
                .strokeColor('#CCCCCC').lineWidth(0.5).stroke();

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

    // ─── PDI SLIP — PAGE 2: CUSTOMER SATISFACTION CERTIFICATE ─────────────
    _buildCustomerSatisfactionPage(doc) {
        const fonts = this._registerHindiFonts(doc);

        let y = 30;
        this._drawLogo(doc, MARGIN, y, 90, 28);

        const title = 'ग्राहक संतुष्टि प्रमाण पत्र';
        doc.font(fonts.bold).fontSize(17).fillColor(RED)
            .text(title, MARGIN, y + 40, { width: CONTENT_W, align: 'center' });

        y = doc.y + 8;
        this._hr(doc, y, RED, 1.5);
        y += 18;

        // Writes one block and advances the cursor using PDFKit's own text metrics
        const block = (text, font, size, gap = 6, options = {}) => {
            doc.font(font).fontSize(size).fillColor(BLACK)
                .text(text, MARGIN, y, { width: CONTENT_W, lineGap: 4, ...options });
            y = doc.y + gap;
        };

        block('सेवा में,', fonts.regular, 12, 2);
        block('अनंत ऑटोमोबाइल्स', fonts.bold, 13, 2);
        block('अहमदगढ़ (बुलंदशहर)', fonts.regular, 12, 14);
        block('महोदय,', fonts.regular, 12, 12);

        const paragraphs = [
            'आज दिनांक ............................ में मेने मॉडल न0 .................................... और चेसिस न०.................................... हीरो बाइक क्रय की है, हमने उपरोक्त वाहन चलाने और देखने के बाद में पूरी तरह से संतुष्ट हूँ, अत: भविष्य में मेरे द्वारा हीरो बाइक लौटाने के सभी दावों को अस्वीकार किया जाये! में इससे पूर्णत: सहमत हूँ तथा शोरूम के द्वारा दी गयी कैश या फाइनेंस की सभी जानकारी और मेरे द्वारा हीरो बाइक के दिए गए भुगतान से पूर्णतः सहमत हूँ ! हमने शोरूम से हीरो बाइक और कंपनी का हेलमेट लिया ...... है अथवा नहीं...... लिया है जिसका इनवॉइस न० ..................................... है !',
            'और आपको दीया हुआ मोबाइल न० मेरे आधार कार्ड से लिंक है और इसकी पूर्णतः जिम्मेदारी मेरी होगी,',
            'यदि किसी कारणवश मेरी हीरो बाइक का रजिस्ट्रेशन नहीं हो पाया तो में स्वयं उसका जिम्मेदार हूँगा !',
        ];

        paragraphs.forEach((paragraph) => block(paragraph, fonts.regular, 11.5, 14, { align: 'justify' }));

        block('धन्यवाद', fonts.regular, 12, 30);

        [
            'ग्राहक का नाम .........................',
            'पता .....................................',
            'मोबाइल न० ............................',
        ].forEach((field) => block(field, fonts.regular, 12, 16));

        block('ह०', fonts.regular, 12, 0);
    }

    generatePDISlipPDF(sale, filePath) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 0, size: 'A4' });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                this._buildPDISlipPage(doc, sale);

                // Customer satisfaction certificate goes on its own page at the end
                doc.addPage();
                this._buildCustomerSatisfactionPage(doc);

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
