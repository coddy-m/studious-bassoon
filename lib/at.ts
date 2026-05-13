import axios from 'axios';

const USERNAME = process.env.AT_USERNAME;
const API_KEY = process.env.AT_API_KEY;

async function atRequest(endpoint: string, data: URLSearchParams) {
  const url = `https://api.africastalking.com/version1/${endpoint}`;
  try {
    const res = await axios.post(url, data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apiKey: API_KEY,
      },
    });
    return res.data;
  } catch (err: any) {
    console.error('AT Error:', err.response?.data || err.message);
    throw err;
  }
}

export async function sendSMS(to: string, message: string, from = 'MtaaDuka') {
  if (!USERNAME || USERNAME === 'sandbox') {
    console.log(`[SANDBOX SMS to ${to}]: ${message}`);
    return { success: true };
  }
  const data = new URLSearchParams({
    username: USERNAME,
    to: to.startsWith('+') ? to : `+${to}`,
    message,
    from,
  });
  return atRequest('messaging', data);
}

export async function sendWhatsApp(to: string, message: string) {
  if (!USERNAME || USERNAME === 'sandbox') {
    console.log(`[SANDBOX WhatsApp to ${to}]: ${message}`);
    return { success: true };
  }
  const data = new URLSearchParams({
    username: USERNAME,
    to: to.startsWith('+') ? to : `+${to}`,
    message,
    channel: 'whatsapp',
  });
  return atRequest('messaging', data);
}