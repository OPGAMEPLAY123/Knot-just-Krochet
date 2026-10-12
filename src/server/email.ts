import { Resend } from 'resend';
import { Order } from '../types';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'Knot Just Krochet <onboarding@resend.dev>';

/**
 * 1. Welcome Email
 */
export async function sendWelcomeEmail(toEmail: string, customerName: string) {
  if (!resend) {
    console.log(`[Email pending configuration] Welcome email to ${toEmail} for ${customerName}`);
    return { success: false, pendingConfig: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [toEmail],
      subject: 'Welcome to Knot Just Krochet! 🧶 Handcrafted with Love',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 32px; border-radius: 24px; color: #3D2C28;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 36px; margin-bottom: 8px;">🧶</div>
            <h1 style="font-family: Georgia, serif; color: #3D2C28; font-size: 26px; margin: 0;">Welcome, ${customerName}!</h1>
            <p style="color: #8B6B61; font-size: 13px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Knot Just Krochet</p>
          </div>
          <div style="background: #FFFDF9; padding: 24px; border-radius: 16px; border: 1px solid #EFE8DE; line-height: 1.6; font-size: 14px; color: #5C433C;">
            <p>Thank you for connecting with <strong>Knot Just Krochet</strong>! We are thrilled to welcome you to our handmade crochet family.</p>
            <p>Every single bloom, tote bag, and keychain is woven petal-by-petal and loop-by-loop with premium, skin-soft milk cotton yarn. Here are a few things you can do:</p>
            <ul style="padding-left: 20px;">
              <li>Explore our everlasting bouquets and bags in the shop catalogue.</li>
              <li>Save your favorite creations to your personal Wishlist.</li>
              <li>Request bespoke commissions tailored with your favorite colors and initials.</li>
            </ul>
            <p style="margin-top: 20px;">Follow along on Instagram <a href="https://instagram.com/knot_just_krochet" style="color: #6E5049; font-weight: bold;">@knot_just_krochet</a> to watch stitches come alive!</p>
          </div>
          <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #8B6B61;">
            <p>© ${new Date().getFullYear()} Knot Just Krochet • Built by ZORVEX by OPG</p>
          </div>
        </div>
      `
    });
    if (error) {
      console.error('Resend Welcome Email Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Resend execution error:', err);
    return { success: false, error: err };
  }
}

/**
 * 2. Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(order: Order) {
  if (!resend) {
    console.log(`[Email pending configuration] Order Confirmation for #${order.orderId} to ${order.customerEmail}`);
    return { success: false, pendingConfig: true };
  }

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #F4EFEA;">
        <td style="padding: 12px 0;">
          <strong>${item.name}</strong>
          ${item.selectedColor ? `<br><span style="font-size: 12px; color: #8B6B61;">Color: ${item.selectedColor}</span>` : ''}
          ${item.customNote ? `<br><span style="font-size: 11px; color: #A3897E; font-style: italic;">Note: ${item.customNote}</span>` : ''}
        </td>
        <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: bold;">₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [order.customerEmail],
      subject: `Order Confirmed: #${order.orderId} • Knot Just Krochet`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 32px; border-radius: 24px; color: #3D2C28;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 36px; margin-bottom: 8px;">🌸</div>
            <h1 style="font-family: Georgia, serif; color: #3D2C28; font-size: 24px; margin: 0;">Thank You for Your Order!</h1>
            <p style="color: #8B6B61; font-size: 13px; margin-top: 4px;">Order #${order.orderId}</p>
          </div>

          <div style="background: #FFFDF9; padding: 24px; border-radius: 16px; border: 1px solid #EFE8DE; margin-bottom: 20px;">
            <h3 style="font-family: Georgia, serif; font-size: 16px; margin: 0 0 12px 0; color: #3D2C28;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 2px solid #EFE8DE; color: #8B6B61;">
                  <th style="text-align: left; padding-bottom: 8px;">Item</th>
                  <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 16px; border-top: 1px solid #EFE8DE; padding-top: 12px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Subtotal:</span>
                <span style="font-weight: bold;">₹${order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Shipping:</span>
                <span>${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #3D2C28; border-top: 2px solid #EFE8DE; padding-top: 8px;">
                <span>Total Amount:</span>
                <span>₹${order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div style="background: #FFFDF9; padding: 20px; border-radius: 16px; border: 1px solid #EFE8DE; font-size: 13px; color: #5C433C; line-height: 1.5;">
            <h4 style="margin: 0 0 8px 0; font-family: Georgia, serif; color: #3D2C28;">Delivery Address</h4>
            <p style="margin: 0;"><strong>${order.shippingAddress.fullName}</strong></p>
            <p style="margin: 2px 0;">${order.shippingAddress.houseNumber ? `${order.shippingAddress.houseNumber}, ` : ''}${order.shippingAddress.street}</p>
            ${order.shippingAddress.area ? `<p style="margin: 2px 0;">${order.shippingAddress.area}</p>` : ''}
            <p style="margin: 2px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
            <p style="margin: 4px 0 0 0;">Phone: +91 ${order.shippingAddress.phone}</p>
          </div>

          <p style="font-size: 12px; color: #8B6B61; text-align: center; margin-top: 20px;">
            Handmade creations take 3-5 days to stitch and dispatch safely. You will receive courier tracking updates upon shipment.
          </p>
        </div>
      `
    });
    if (error) {
      console.error('Resend Order Email Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Resend execution error:', err);
    return { success: false, error: err };
  }
}

/**
 * 3. Payment Confirmation Email
 */
export async function sendPaymentConfirmationEmail(order: Order) {
  if (!resend) {
    console.log(`[Email pending configuration] Payment Confirmation for #${order.orderId} to ${order.customerEmail}`);
    return { success: false, pendingConfig: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [order.customerEmail],
      subject: `Payment Received: Order #${order.orderId} • Knot Just Krochet`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 32px; border-radius: 24px; color: #3D2C28;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 36px; margin-bottom: 8px;">💳</div>
            <h1 style="font-family: Georgia, serif; color: #3D2C28; font-size: 24px; margin: 0;">Payment Received!</h1>
            <p style="color: #8B6B61; font-size: 13px; margin-top: 4px;">Order #${order.orderId}</p>
          </div>
          <div style="background: #FFFDF9; padding: 24px; border-radius: 16px; border: 1px solid #EFE8DE; font-size: 14px; color: #5C433C; line-height: 1.6;">
            <p>Dear ${order.customerName},</p>
            <p>We have successfully verified and received your payment of <strong>₹${order.totalAmount.toLocaleString('en-IN')}</strong> for order <strong>#${order.orderId}</strong>.</p>
            ${order.razorpayPaymentId ? `<p style="font-size: 12px; color: #8B6B61;">Razorpay Transaction ID: <code>${order.razorpayPaymentId}</code></p>` : ''}
            <p>Our artisan team has queued your order for creation with the finest yarn. Thank you for supporting handmade craftsmanship!</p>
          </div>
        </div>
      `
    });
    if (error) {
      console.error('Resend Payment Email Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Resend payment error:', err);
    return { success: false, error: err };
  }
}

/**
 * 4. Order Status Update Email
 */
export async function sendOrderStatusUpdateEmail(order: Order, newStatus: string) {
  if (!resend) {
    console.log(`[Email pending configuration] Status update for #${order.orderId} to ${newStatus}`);
    return { success: false, pendingConfig: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [order.customerEmail],
      subject: `Order Update: #${order.orderId} is now ${newStatus} • Knot Just Krochet`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 32px; border-radius: 24px; color: #3D2C28;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 36px; margin-bottom: 8px;">📦</div>
            <h1 style="font-family: Georgia, serif; color: #3D2C28; font-size: 24px; margin: 0;">Order Status Update</h1>
            <p style="color: #8B6B61; font-size: 13px; margin-top: 4px;">Order #${order.orderId}</p>
          </div>
          <div style="background: #FFFDF9; padding: 24px; border-radius: 16px; border: 1px solid #EFE8DE; font-size: 14px; color: #5C433C; line-height: 1.6;">
            <p>Hi ${order.customerName},</p>
            <p>The status of your handcrafted order <strong>#${order.orderId}</strong> has been updated to:</p>
            <div style="text-align: center; padding: 12px; background: #FAF7F2; border-radius: 12px; font-weight: bold; font-size: 16px; color: #6E5049; margin: 16px 0;">
              ${newStatus}
            </div>
            ${
              order.trackingNumber
                ? `<div style="background: #EFE8DE; padding: 12px; border-radius: 12px; font-size: 13px; margin: 12px 0;">
                    <p style="margin: 0;"><strong>Courier:</strong> ${order.courierPartner || 'India Post'}</p>
                    <p style="margin: 4px 0 0 0;"><strong>Tracking AWB:</strong> ${order.trackingNumber}</p>
                   </div>`
                : ''
            }
            <p>You can view full order details in your customer account on our website anytime.</p>
          </div>
        </div>
      `
    });
    if (error) {
      console.error('Resend Status Email Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Resend status error:', err);
    return { success: false, error: err };
  }
}
