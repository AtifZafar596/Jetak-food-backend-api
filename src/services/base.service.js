const { supabase, supabaseAdmin } = require('../config/supabase');

class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
    this.supabase = supabase;
    this.supabaseAdmin = supabaseAdmin;
  }

  // Common CRUD operations
  async findAll(options = {}) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(options.select || '*')
      .order(options.orderBy || 'created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findById(id, options = {}) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(options.select || '*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(payload) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id, payload) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Admin operations
  async adminFindAll(options = {}) {
    const { data, error } = await this.supabaseAdmin
      .from(this.tableName)
      .select(options.select || '*')
      .order(options.orderBy || 'created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async adminCreate(payload) {
    const { data, error } = await this.supabaseAdmin
      .from(this.tableName)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async adminUpdate(id, payload) {
    const { data, error } = await this.supabaseAdmin
      .from(this.tableName)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async adminDelete(id) {
    const { error } = await this.supabaseAdmin
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

module.exports = BaseService; 