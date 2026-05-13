import axios from 'axios';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const PASSKEY = process.env.MPESA_PASSKEY;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const ENV = process.env.MPESA_ENV || 'sandbox';

const BASE_URL = ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

export async function getAccessToken(): Promise<string> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) throw new Error('M-Pesa credentials missing');
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.data.access_token;
}

export async function stkPush(phone: string, amount: number, accountRef: string, callbackUrl: string) {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: accountRef,
    TransactionDesc: 'MtaaDuka Order',
  };

  const res = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function b2cPayout(phone: string, amount: number, remarks: string) {
  const token = await getAccessToken();
  const payload = {
    InitiatorName: process.env.MPESA_B2C_INITIATOR,
    SecurityCredential: process.env.MPESA_B2C_INITIATOR_PASSWORD,
    CommandID: 'BusinessPayment',
    Amount: amount,
    PartyA: process.env.MPESA_B2C_SHORTCODE,
    PartyB: phone,
    Remarks: remarks,
    QueueTimeOutURL: `${process.env.NEXTAUTH_URL}/api/mpesa/b2c-timeout`,
    ResultURL: `${process.env.NEXTAUTH_URL}/api/mpesa/b2c-result`,
    Occasion: 'Seller Payout',
  };

  const res = await axios.post(`${BASE_URL}/mpesa/b2c/v1/paymentrequest`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}