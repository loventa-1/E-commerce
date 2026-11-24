const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || '127.0.0.1',
  port: Number(process.env.MAIL_PORT) || 1025,
  secure: false
});

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

const sendOrderConfirmationEmail = async (order) => {
  try {
    const itemRows = order.items.map((item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;">
          ${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="" width="48" height="48" style="object-fit:cover;border-radius:8px;vertical-align:middle;margin-left:10px;">` : ''}
          ${escapeHtml(item.name)}
        </td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:left;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'Modern Shop <no-reply@modern-shop.local>',
      to: order.customer.email,
      subject: `تأكيد استلام طلبك #${order._id}`,
      text: `مرحبًا ${order.customer.name}، شكرًا لطلبك من Modern Shop. استلمنا طلبك رقم ${order._id} بإجمالي $${order.totalAmount.toFixed(2)}. سنتواصل معك هاتفيًا لتأكيد التوصيل.`,
      html: `
        <!doctype html>
        <html lang="ar" dir="rtl">
          <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Tahoma,Arial,sans-serif;color:#0f172a;">
            <main style="max-width:640px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
              <header style="padding:24px;background:#0f172a;text-align:center;color:#fff;">
                <h1 style="margin:0;color:#f59e0b;font-size:24px;">Modern Shop</h1>
                <p style="margin:8px 0 0;color:#cbd5e1;">شكرًا لطلبك، تم استلام طلبك بنجاح</p>
              </header>
              <section style="padding:24px;">
                <h2 style="font-size:20px;">مرحبًا ${escapeHtml(order.customer.name)}،</h2>
                <p style="line-height:1.8;color:#475569;">يسعدنا انضمامك إلينا. استلمنا طلبك وسنتواصل معك هاتفيًا لتأكيد التفاصيل وترتيب التوصيل.</p>
                <div style="padding:16px;background:#f8fafc;border-radius:8px;line-height:1.9;">
                  <div><strong>رقم الطلب:</strong> #${escapeHtml(order._id)}</div>
                  <div><strong>عنوان التوصيل:</strong> ${escapeHtml(order.customer.address)}</div>
                  <div><strong>رقم الهاتف:</strong> ${escapeHtml(order.customer.phone)}</div>
                </div>
                <h3 style="margin:24px 0 8px;">تفاصيل الطلب</h3>
                <table style="width:100%;border-collapse:collapse;">
                  <thead><tr style="background:#f1f5f9;"><th style="padding:12px;text-align:right;">المنتج</th><th style="padding:12px;">الكمية</th><th style="padding:12px;text-align:left;">الإجمالي</th></tr></thead>
                  <tbody>${itemRows}</tbody>
                </table>
                <p style="margin-top:20px;text-align:left;font-size:20px;font-weight:bold;">إجمالي الطلب: $${order.totalAmount.toFixed(2)}</p>
              </section>
              <footer style="padding:16px;text-align:center;background:#f8fafc;color:#64748b;font-size:13px;">نتمنى لك تجربة تسوق ممتعة.</footer>
            </main>
          </body>
        </html>
      `
    });

    console.log(`[Email] Order confirmation sent to ${order.customer.email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Could not send order confirmation: ${error.message}`);
    return false;
  }
};

module.exports = sendOrderConfirmationEmail;