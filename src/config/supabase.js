const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for missing environment variables
const missingVars = [];
if (!supabaseUrl) missingVars.push('SUPABASE_URL');
if (!supabaseKey) missingVars.push('SUPABASE_ANON_KEY');
if (!supabaseServiceKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease create a .env file in the server directory with these variables:');
  console.error(`
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
  `);
  process.exit(1);
}

// Client for public operations (user-facing)
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for service role operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Please check your Supabase configuration and ensure the database is accessible.');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful!');
    console.log('📊 Connection details:', {
      url: supabaseUrl,
      key: supabaseKey.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Please check your network connection and Supabase configuration.');
    process.exit(1);
  }
};

// Run connection test
testConnection();

module.exports = {
  supabase,
  supabaseAdmin
}; 