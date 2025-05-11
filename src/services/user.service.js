const BaseService = require('./base.service');

class UserService extends BaseService {
  constructor() {
    super('users');
  }

  // Custom methods specific to users
  async findByPhone(phone) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId, profileData) {
    return this.update(userId, profileData);
  }

  // Example of a custom admin method
  async adminGetUserStats() {
    const { data, error } = await this.supabaseAdmin
      .from(this.tableName)
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      total: data.length,
      newToday: data.filter(user => {
        const today = new Date();
        const userDate = new Date(user.created_at);
        return userDate.toDateString() === today.toDateString();
      }).length
    };
  }
}

module.exports = new UserService(); 