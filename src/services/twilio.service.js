const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

class TwilioService {
  /**
   * Generate a random 6-digit OTP
   * @returns {string} 6-digit OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP via SMS using Twilio
   * @param {string} to - Recipient's phone number
   * @param {string} otp - OTP to send
   * @returns {Promise<object>} Twilio message object
   */
  static async sendOTP(to, otp) {
    try {
      const message = await client.messages.create({
        body: `Your AA Food Delivery verification code is: ${otp}. This code will expire in 5 minutes.`,
        from: phoneNumber,
        to: to
      });
      return message;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }
}

module.exports = TwilioService; 