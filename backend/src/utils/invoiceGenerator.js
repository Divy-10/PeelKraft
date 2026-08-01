import PDFDocument from 'pdfkit';

/**
 * Dynamically generates a professional PDF invoice and pipes it to the provided writable stream.
 * @param {Object} order - The order document from MongoDB.
 * @param {Object} stream - A writable stream (e.g. Express response).
 */
export const generateInvoicePDF = (order, stream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Styling Brand Colors
  const primaryColor = '#2D3A1E'; // Dark green brand color
  const textColor = '#374151'; // Charcoal text
  const lightBg = '#F9FAFB'; // Light grey

  // Header / Brand Typography Logo
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(28)
     .text('PeelKraft', 50, 50);

  doc.fillColor(textColor)
     .font('Helvetica')
     .fontSize(9)
     .text('Premium Sustainable Citrus Foods', 50, 82);

  // Company / Vendor Details (Right-aligned)
  doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('JuiceTap Global Pvt Ltd', 350, 50, { align: 'right', width: 210 });
  doc.font('Helvetica').fontSize(8).fillColor(textColor)
     .text('Plot 13-14, Nandini Farm, Tata Motors Lane, Bhatpore, Hazira, Surat, Gujarat 394510', 350, 64, { align: 'right', width: 210 })
     .text('Email: info@peelkraft.com', 350, 75, { align: 'right', width: 210 })
     .text('GSTIN: 24AAAJZ1234F1Z5', 350, 86, { align: 'right', width: 210 });

  // Divider Line
  doc.moveTo(50, 110).lineTo(560, 110).strokeColor('#E5E7EB').strokeWidth(1).stroke();

  // Invoice Metadata
  doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryColor).text('INVOICE', 50, 130);
  
  doc.font('Helvetica-Bold').fontSize(9).fillColor(textColor).text('Invoice No:', 50, 155);
  doc.font('Helvetica').text(`INV-${order.orderNumber}`, 120, 155);
  
  doc.font('Helvetica-Bold').text('Order ID:', 50, 168);
  doc.font('Helvetica').text(`#${order.orderNumber}`, 120, 168);

  doc.font('Helvetica-Bold').text('Invoice Date:', 50, 181);
  doc.font('Helvetica').text(new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 120, 181);

  // Billing & Shipping Information Card
  doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('Bill & Ship To:', 350, 130);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(textColor).text(order.shippingAddress?.fullName || 'Customer Name', 350, 145);
  doc.font('Helvetica').fontSize(8)
     .text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 350, 157)
     .text(`WhatsApp: ${order.shippingAddress?.whatsapp || 'N/A'}`, 350, 168)
     .text(`${order.shippingAddress?.addressLine1 || ''}`, 350, 179)
     .text(`${order.shippingAddress?.addressLine2 || ''}`, 350, 189)
     .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`, 350, 199)
     .text(`${order.shippingAddress?.country || 'India'}`, 350, 209);

  // Divider Line
  doc.moveTo(50, 225).lineTo(560, 225).strokeColor('#E5E7EB').strokeWidth(1).stroke();

  // Product Table Header row
  const tableTop = 245;
  doc.fillColor(lightBg).rect(50, tableTop, 510, 20).fill();
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8);
  doc.text('ITEM DESCRIPTION', 60, tableTop + 6);
  doc.text('PRICE', 300, tableTop + 6, { width: 60, align: 'right' });
  doc.text('QTY', 380, tableTop + 6, { width: 40, align: 'right' });
  doc.text('TOTAL', 470, tableTop + 6, { width: 80, align: 'right' });

  // Product Table Rows
  let y = tableTop + 20;
  doc.font('Helvetica').fontSize(8).fillColor(textColor);
  
  order.items.forEach((item, index) => {
    // Alternating row background shading
    if (index % 2 === 1) {
      doc.fillColor('#F9FAFB').rect(50, y, 510, 20).fill();
    }
    doc.fillColor(textColor);
    const itemDescription = item.packageName ? `${item.name} (${item.packageName})` : item.name;
    doc.text(itemDescription, 60, y + 6, { width: 230, ellipsis: true });
    doc.text(`₹${item.price}`, 300, y + 6, { width: 60, align: 'right' });
    doc.text(`${item.quantity}`, 380, y + 6, { width: 40, align: 'right' });
    doc.text(`₹${item.total}`, 470, y + 6, { width: 80, align: 'right' });
    y += 20;
  });

  // Table Bottom line
  doc.moveTo(50, y).lineTo(560, y).strokeColor('#E5E7EB').strokeWidth(1).stroke();
  y += 15;

  // Invoice Pricing Summaries (Right Column) & Shipment details (Left Column)
  const totalsTop = y;
  
  // Payment, Fulfillment & Shipment Info (Left Side)
  doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor).text('Payment & Shipping Summary', 50, totalsTop);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(textColor);
  
  doc.text('Payment Method:', 50, totalsTop + 18);
  const pm = order.paymentMethod || 'N/A';
  const methodText = pm.toLowerCase() === 'razorpay' ? 'Razorpay' : (pm.toLowerCase() === 'cod' ? 'Cash on Delivery' : pm);
  doc.font('Helvetica').text(methodText, 140, totalsTop + 18);

  doc.font('Helvetica-Bold').text('Payment Status:', 50, totalsTop + 30);
  const payStatusText = order.paymentStatus ? (order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)) : 'Pending';
  doc.font('Helvetica').text(payStatusText, 140, totalsTop + 30);

  doc.font('Helvetica-Bold').text('Order Status:', 50, totalsTop + 42);
  const orderStatusText = order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Pending';
  doc.font('Helvetica').text(orderStatusText, 140, totalsTop + 42);

  let nextRowY = totalsTop + 54;
  if (order.courierName) {
    doc.font('Helvetica-Bold').text('Courier Name:', 50, nextRowY);
    doc.font('Helvetica').text(order.courierName, 140, nextRowY);
    nextRowY += 12;
  }
  if (order.trackingNumber) {
    doc.font('Helvetica-Bold').text('Tracking ID:', 50, nextRowY);
    doc.font('Helvetica').text(order.trackingNumber, 140, nextRowY);
    nextRowY += 12;
  }
  if (order.deliveryStatus) {
    doc.font('Helvetica-Bold').text('Delivery Status:', 50, nextRowY);
    const dStatus = order.deliveryStatus.replace(/_/g, ' ');
    doc.font('Helvetica').text(dStatus.charAt(0).toUpperCase() + dStatus.slice(1), 140, nextRowY);
    nextRowY += 12;
  }

  // Pricing Totals (Right Side)
  doc.font('Helvetica-Bold').fontSize(8).fillColor(textColor);
  doc.text('Subtotal:', 350, totalsTop, { width: 110, align: 'right' });
  doc.font('Helvetica').text(`₹${order.subtotal}`, 470, totalsTop, { width: 80, align: 'right' });

  doc.font('Helvetica-Bold').text('Shipping:', 350, totalsTop + 15, { width: 110, align: 'right' });
  doc.font('Helvetica').text(`₹${order.shippingCharge}`, 470, totalsTop + 15, { width: 80, align: 'right' });

  doc.font('Helvetica-Bold').text('Tax (GST):', 350, totalsTop + 30, { width: 110, align: 'right' });
  doc.font('Helvetica').text(`₹${order.gst || 0}`, 470, totalsTop + 30, { width: 80, align: 'right' });

  doc.font('Helvetica-Bold').text('Discount:', 350, totalsTop + 45, { width: 110, align: 'right' });
  doc.font('Helvetica').text(`-₹${order.discount}`, 470, totalsTop + 45, { width: 80, align: 'right' });

  // Grand Total Box
  doc.fillColor('#F59E0B').rect(350, totalsTop + 62, 210, 22).fill();
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
  doc.text('Grand Total:', 360, totalsTop + 68);
  doc.text(`₹${order.grandTotal}`, 470, totalsTop + 68, { width: 80, align: 'right' });

  // Footer Section
  doc.fillColor(textColor).font('Helvetica-Oblique').fontSize(9).text('Thank you for shopping with PeelKraft.', 50, totalsTop + 115, { align: 'center', width: 510 });

  doc.end();
};
