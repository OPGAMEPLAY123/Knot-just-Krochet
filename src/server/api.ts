import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS } from '../data/initialData';
import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusUpdateEmail
} from './email';
import { Order } from '../types';

// In-memory processed webhook events cache for idempotency
const processedEvents = new Set<string>();

interface RequestBody {
  items?: Array<{ productId: string; quantity: number; selectedVariation?: string }>;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  order?: Order;
  toEmail?: string;
  customerName?: string;
  newStatus?: string;
  [key: string]: unknown;
}

function parseJsonBody(req: IncomingMessage): Promise<RequestBody> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Razorpay-Signature'
  });
  res.end(JSON.stringify(data));
}

// Trusted server-side calculation of order total
export function calculateTrustedTotal(items: Array<{ productId: string; quantity: number }>) {
  let subtotal = 0;
  for (const item of items) {
    const product = INITIAL_PRODUCTS.find(p => p.id === item.productId);
    const unitPrice = product ? (product.discountPrice ?? product.price) : 0;
    subtotal += unitPrice * Math.max(1, item.quantity);
  }

  const freeShippingThreshold = INITIAL_STORE_SETTINGS.freeShippingThreshold;
  const standardShippingFee = INITIAL_STORE_SETTINGS.standardShippingFee;
  const shippingFee = (subtotal === 0 || subtotal >= freeShippingThreshold) ? 0 : standardShippingFee;
  const discount = 0;
  const totalAmount = Math.max(0, subtotal + shippingFee - discount);

  return { subtotal, shippingFee, discount, totalAmount };
}

export async function handleApiRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/')) {
    return false;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Razorpay-Signature'
    });
    res.end();
    return true;
  }

  const [pathname, queryString] = url.split('?');
  const urlParams = new URLSearchParams(queryString || '');

  try {
    // 1. Config status endpoint
    if (pathname === '/api/config-status' && req.method === 'GET') {
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID || null;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || null;
      const isRazorpayConfigured = Boolean(razorpayKeyId && razorpayKeySecret);
      const isResendConfigured = Boolean(process.env.RESEND_API_KEY);

      sendJson(res, 200, {
        razorpay: {
          isConfigured: isRazorpayConfigured,
          keyId: razorpayKeyId,
          mode: isRazorpayConfigured ? 'live_configured' : 'pending_configuration'
        },
        resend: {
          isConfigured: isResendConfigured,
          mode: isResendConfigured ? 'live_configured' : 'pending_configuration'
        },
        firebase: {
          projectId: 'knotjustkrochetopg',
          isConfigured: true
        },
        store: {
          name: INITIAL_STORE_SETTINGS.storeName,
          instagram: INITIAL_STORE_SETTINGS.instagramHandle,
          developer: 'Built by ZORVEX by OPG'
        }
      });
      return true;
    }

    // 2. Reverse Geocoding Endpoint for "Use My Current Location"
    if (pathname === '/api/reverse-geocode' && req.method === 'GET') {
      const lat = urlParams.get('lat');
      const lon = urlParams.get('lon');

      if (!lat || !lon) {
        sendJson(res, 400, { success: false, error: 'Latitude and longitude are required' });
        return true;
      }

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
            lat
          )}&lon=${encodeURIComponent(lon)}&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'KnotJustKrochet-Store/1.0 (knotjustkrochetofficial@gmail.com)'
            }
          }
        );

        if (!geoRes.ok) {
          sendJson(res, 502, { success: false, error: 'Geocoding service unavailable' });
          return true;
        }

        const geoData = await geoRes.json();
        const address = geoData.address || {};

        // Parse structured Indian address fields
        const houseNumber = address.house_number || address.building || '';
        const street = address.road || address.pedestrian || address.street || '';
        const area = address.suburb || address.neighbourhood || address.residential || address.commercial || '';
        const city = address.city || address.town || address.village || address.county || '';
        const state = address.state || '';
        const pincode = address.postcode || '';

        sendJson(res, 200, {
          success: true,
          data: {
            houseNumber,
            street,
            area,
            city,
            state,
            pincode,
            formattedAddress: geoData.display_name || ''
          }
        });
        return true;
      } catch (err) {
        console.error('Reverse geocoding fetch error:', err);
        sendJson(res, 500, { success: false, error: 'Failed to reverse geocode location' });
        return true;
      }
    }

    // 3. Resend Emails Endpoints
    if (pathname === '/api/emails/welcome' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { toEmail, customerName } = body;
      if (!toEmail) {
        sendJson(res, 400, { success: false, error: 'Recipient email required' });
        return true;
      }
      const result = await sendWelcomeEmail(String(toEmail), String(customerName || 'Friend'));
      sendJson(res, 200, result);
      return true;
    }

    if (pathname === '/api/emails/order-confirmation' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const order = body.order as Order;
      if (!order || !order.customerEmail) {
        sendJson(res, 400, { success: false, error: 'Valid order data required' });
        return true;
      }
      const result = await sendOrderConfirmationEmail(order);
      sendJson(res, 200, result);
      return true;
    }

    if (pathname === '/api/emails/status-update' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const order = body.order as Order;
      const newStatus = body.newStatus as string;
      if (!order || !newStatus) {
        sendJson(res, 400, { success: false, error: 'Order and new status required' });
        return true;
      }
      const result = await sendOrderStatusUpdateEmail(order, newStatus);
      sendJson(res, 200, result);
      return true;
    }

    // 4. Calculate Order Total
    if (pathname === '/api/orders/calculate-total' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const items = (body.items || []) as Array<{ productId: string; quantity: number }>;
      const calculation = calculateTrustedTotal(items);
      sendJson(res, 200, { success: true, ...calculation });
      return true;
    }

    // 5. Create Razorpay Order
    if (pathname === '/api/razorpay/create-order' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const items = (body.items || []) as Array<{ productId: string; quantity: number }>;
      const calculation = calculateTrustedTotal(items);
      const amountInPaise = calculation.totalAmount * 100;

      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (razorpayKeyId && razorpayKeySecret) {
        try {
          const authString = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
          const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${authString}`
            },
            body: JSON.stringify({
              amount: amountInPaise,
              currency: 'INR',
              receipt: receiptId,
              notes: {
                store: 'Knot Just Krochet',
                source: 'KJK Store Checkout'
              }
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            console.error('Razorpay API error:', errData);
            sendJson(res, 502, {
              success: false,
              error: 'Failed to create Razorpay order with provided credentials',
              details: errData
            });
            return true;
          }

          const rzpOrder = await response.json();
          sendJson(res, 200, {
            success: true,
            isConfigured: true,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            keyId: razorpayKeyId,
            calculation
          });
          return true;
        } catch (error) {
          console.error('Error contacting Razorpay API:', error);
          sendJson(res, 500, {
            success: false,
            error: 'Server error contacting payment gateway'
          });
          return true;
        }
      } else {
        // Return structured pending configuration state with calculated amount
        const mockOrderId = `order_test_${Date.now()}`;
        sendJson(res, 200, {
          success: true,
          isConfigured: false,
          mode: 'pending_configuration',
          orderId: mockOrderId,
          amount: amountInPaise,
          currency: 'INR',
          keyId: null,
          message: 'Razorpay Key ID and Secret are not yet configured in server environment. Online payments are pending merchant keys.',
          calculation
        });
        return true;
      }
    }

    // 6. Verify Razorpay Payment Signature
    if (pathname === '/api/razorpay/verify-payment' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order } = body;

      if (!razorpay_order_id || !razorpay_payment_id) {
        sendJson(res, 400, {
          success: false,
          verified: false,
          error: 'Missing payment or order ID'
        });
        return true;
      }

      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (razorpayKeySecret) {
        const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(payload)
          .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (isValid && order) {
          // Send payment confirmation email via Resend
          sendPaymentConfirmationEmail(order as Order).catch(console.error);
        }

        sendJson(res, 200, {
          success: true,
          verified: isValid,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id
        });
        return true;
      } else {
        if (order) {
          sendPaymentConfirmationEmail(order as Order).catch(console.error);
        }

        sendJson(res, 200, {
          success: true,
          verified: true,
          isTestMode: true,
          message: 'Test mode verification completed. Production signature requires RAZORPAY_KEY_SECRET.',
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id
        });
        return true;
      }
    }

    // 7. Razorpay Webhook Handler
    if (pathname === '/api/razorpay/webhook' && req.method === 'POST') {
      const webhookSignature = req.headers['x-razorpay-signature'] as string;
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      let rawBody = '';
      req.on('data', chunk => { rawBody += chunk; });
      req.on('end', () => {
        if (webhookSecret) {
          const expectedSig = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

          if (expectedSig !== webhookSignature) {
            sendJson(res, 400, { success: false, error: 'Invalid webhook signature' });
            return;
          }
        }

        try {
          const event = JSON.parse(rawBody);
          const eventId = event?.event_id || event?.id;

          // Idempotent duplicate check
          if (eventId && processedEvents.has(eventId)) {
            sendJson(res, 200, { status: 'already_processed' });
            return;
          }
          if (eventId) {
            processedEvents.add(eventId);
          }

          console.log(`Razorpay Webhook event received: ${event?.event}`);
          sendJson(res, 200, { status: 'ok', event: event?.event });
        } catch {
          sendJson(res, 400, { error: 'Invalid webhook JSON' });
        }
      });
      return true;
    }

    sendJson(res, 404, { error: 'API endpoint not found' });
    return true;
  } catch (error) {
    console.error('API Error:', error);
    sendJson(res, 500, { error: 'Internal server error' });
    return true;
  }
}
