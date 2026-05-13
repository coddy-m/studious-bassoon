const { Worker } = require('bullmq');
const Redis = require('ioredis');
const axios = require('axios');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const AT_USERNAME = process.env.AT_USERNAME;
const AT_API_KEY = process.env.AT_API_KEY;

async function sendWhatsApp(to, message) {
  if (!AT_USERNAME || AT_USERNAME === 'sandbox') {
    console.log(`[SANDBOX WhatsApp to ${to}]: ${message}`);
    return;
  }
  try {
    await axios.post('https://api.africastalking.com/version1/messaging', 
      new URLSearchParams({ 
        username: AT_USERNAME, 
        to: to.startsWith('+') ? to : `+${to}`, 
        message, 
        channel: 'whatsapp' 
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', apiKey: AT_API_KEY } }
    );
  } catch (err) {
    console.error('WhatsApp failed:', err.message);
  }
}

const worker = new Worker('notifications', async (job) => {
  if (job.name === 'notify-seller') {
    const { sellerPhone, orderId, buyerName, total, items } = job.data;
    const msg = `🔔 NEW ORDER #${orderId}\nBuyer: ${buyerName}\nTotal: KES ${total}\nItems: ${items}\n\nLogin: https://mtaaduka.co.ke/dashboard`;
    await sendWhatsApp(sellerPhone, msg);
  } else if (job.name === 'notify-buyer') {
    const { buyerPhone, orderId, sellerName, total } = job.data;
    const msg = `✅ Order #${orderId} confirmed with ${sellerName}.\nAmount paid: KES ${total}\n\nYou will receive delivery updates.`;
    await sendWhatsApp(buyerPhone, msg);
  }
}, { connection: redis });

console.log('Notification worker started');

{
    "compilerOptions"; {
    "baseUrl"; ".",
    "paths"; {
      "@/*";["./src/*"]
    }
  }
}
