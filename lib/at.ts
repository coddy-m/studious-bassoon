// lib/at.ts

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSMS(phone: string, message: string): Promise<SMSResponse> {
  //  Development/Sandbox Mode: Log to console instead of sending
  if (process.env.NODE_ENV === 'development' || process.env.AT_SANDBOX === 'true') {
    console.log('📱 [SMS SANDBOX MODE]');
    console.log('To:', phone);
    console.log('Message:', message);
    console.log('---');
    return { success: true, messageId: 'sandbox-test-mode' };
  }

  // ✅ Production Mode: Send real SMS via Africa's Talking
  try {
    // Validate required environment variables
    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;
    
    if (!username || !apiKey) {
      console.error('❌ Africa\'s Talking credentials missing');
      return { 
        success: false, 
        error: 'SMS configuration error: Missing credentials' 
      };
    }

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('to', phone);
    params.append('message', message);
    if (process.env.AT_SHORTCODE) {
      params.append('from', process.env.AT_SHORTCODE);
    }

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'ApiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params,
    });

    const result = await response.json();
    
    // Check for Africa's Talking API errors
    if (result.errorMessage) {
      console.error('📱 Africa\'s Talking API Error:', result.errorMessage);
      return { 
        success: false, 
        error: result.errorMessage 
      };
    }

    // Success response
    console.log('✅ SMS sent successfully:', result);
    return { 
      success: true, 
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId || 'unknown' 
    };

  } catch (error) {
    console.error('📱 SMS API Request Failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending SMS' 
    };
  }
}

// 🧪 Test function to verify SMS configuration
export async function testSMSConnection(phone: string): Promise<SMSResponse> {
  return await sendSMS(phone, 'MtaaDuka: SMS integration test successful! ✅');
}