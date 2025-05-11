const { supabase } = require('../config/supabase');

class OTPModel {
  /**
   * Store OTP in database
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise<object>} Stored OTP data
   */
  static async storeOTP(phone, otp) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // OTP expires in 5 minutes

    const { data, error } = await supabase
      .from('otps')
      .insert([
        {
          phone,
          code: otp,
          expires_at: expiresAt.toISOString(),
          is_used: false
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Verify OTP
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise<boolean>} Whether OTP is valid
   */
  static async verifyOTP(phone, otp) {
    const { data, error } = await supabase
      .from('otps')
      .select('*')
      .eq('phone', phone)
      .eq('code', otp)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return false;

    // Mark OTP as used
    await supabase
      .from('otps')
      .update({ is_used: true })
      .eq('id', data.id);

    return true;
  }
}

module.exports = OTPModel; 