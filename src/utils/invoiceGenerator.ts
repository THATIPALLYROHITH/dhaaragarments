interface InvoiceData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  total: number;
  shopName: string;
  shopEmail?: string;
  shopPhone?: string;
}

export const generateInvoiceHTML = (data: InvoiceData): string => {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${data.orderId}</title>
      <style>
        @media print {
          body { margin: 0; }
          .page-break { page-break-after: always; }
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .invoice-header {
          background: linear-gradient(135deg, #ffffff 0%, #000000 100%);
          color: white;
          padding: 30px;
          margin-bottom: 30px;
          border-radius: 8px;
        }
        .invoice-title {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .invoice-id {
          font-size: 18px;
          opacity: 0.9;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th {
          background-color: #000;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
        }
        .total-row {
          background-color: #f9fafb;
          font-weight: bold;
        }
        .grand-total {
          background-color: #000;
          color: white;
          font-size: 18px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="invoice-title">${data.shopName}</div>
        <div class="invoice-id">RECEIPT ID: ${data.orderId.substring(0, 8).toUpperCase()}</div>
      </div>

      <div class="section">
        <div class="section-title">Bill To</div>
        <p><strong>${data.customerName}</strong><br>
        ${data.customerEmail}</p>
      </div>

      <div class="section">
        <div class="section-title">Invoice Details</div>
        <p><strong>Date:</strong> ${new Date(data.orderDate).toLocaleDateString("en-IN", { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <div class="section">
        <div class="section-title">Order Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr class="total-row">
              <td colspan="3" style="padding: 8px; text-align: right;">Subtotal:</td>
              <td style="padding: 8px; text-align: right;">₹${data.subtotal.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="padding: 8px; text-align: right;">Tax:</td>
              <td style="padding: 8px; text-align: right;">₹${data.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="padding: 8px; text-align: right;">Delivery:</td>
              <td style="padding: 8px; text-align: right;">₹${data.deliveryCharge.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td colspan="3" style="padding: 12px 8px; text-align: right;">GRAND TOTAL:</td>
              <td style="padding: 12px 8px; text-align: right;">₹${data.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p><strong>${data.shopName}</strong></p>
        ${data.shopEmail ? `<p>Email: ${data.shopEmail}</p>` : ''}
        ${data.shopPhone ? `<p>Phone: ${data.shopPhone}</p>` : ''}
        <p style="margin-top: 20px;">Thank you for your business!</p>
      </div>

      <div class="page-break"></div>

      <!-- Shop Copy -->
      <div class="invoice-header">
        <div class="invoice-title">${data.shopName}</div>
        <div class="invoice-id">RECEIPT ID: ${data.orderId.substring(0, 8).toUpperCase()} (SHOP COPY)</div>
      </div>

      <div class="section">
        <div class="section-title">Bill To</div>
        <p><strong>${data.customerName}</strong><br>
        ${data.customerEmail}</p>
      </div>

      <div class="section">
        <div class="section-title">Invoice Details</div>
        <p><strong>Date:</strong> ${new Date(data.orderDate).toLocaleDateString("en-IN", { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <div class="section">
        <div class="section-title">Order Items</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr class="total-row">
              <td colspan="3" style="padding: 8px; text-align: right;">Subtotal:</td>
              <td style="padding: 8px; text-align: right;">₹${data.subtotal.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="padding: 8px; text-align: right;">Tax:</td>
              <td style="padding: 8px; text-align: right;">₹${data.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="padding: 8px; text-align: right;">Delivery:</td>
              <td style="padding: 8px; text-align: right;">₹${data.deliveryCharge.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td colspan="3" style="padding: 12px 8px; text-align: right;">GRAND TOTAL:</td>
              <td style="padding: 12px 8px; text-align: right;">₹${data.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p><strong>${data.shopName}</strong></p>
        ${data.shopEmail ? `<p>Email: ${data.shopEmail}</p>` : ''}
        ${data.shopPhone ? `<p>Phone: ${data.shopPhone}</p>` : ''}
        <p style="margin-top: 20px;">Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
};

export const printInvoice = (invoiceHTML: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export const downloadInvoiceAsPDF = (invoiceHTML: string, orderId: string) => {
  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${orderId.substring(0, 8)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};