# AA Food Delivery Backend

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
Create a `.env` file in the server directory with the following variables:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

3. **Get Supabase Credentials**
- Go to your Supabase project dashboard
- Navigate to Project Settings > API
- Copy the following values:
  - Project URL (SUPABASE_URL)
  - anon/public key (SUPABASE_ANON_KEY)
  - service_role key (SUPABASE_SERVICE_ROLE_KEY)

4. **Start the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

5. **Verify Setup**
- The server should start without any errors
- Database connection test should pass
- API documentation should be available at http://localhost:3000/api-docs
- Health check should be available at http://localhost:3000/health

## Troubleshooting

If you encounter the "Missing Supabase environment variables" error:
1. Ensure the `.env` file exists in the server directory
2. Verify all required environment variables are set
3. Check that the values are correct and not empty
4. Restart the server after making changes

## API Documentation
- Swagger UI: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health 