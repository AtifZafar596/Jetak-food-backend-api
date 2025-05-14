# Deploying AA Food Delivery Server on Vercel

## Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (`npm i -g vercel`)
3. Git repository with your project
4. Supabase project set up
5. Twilio account configured

## Step 1: Project Preparation

1. Create a `vercel.json` file in your server root directory:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.js"
    }
  ]
}
```

2. Update your `package.json` to include the correct start script:
```json
{
  "scripts": {
    "start": "node src/app.js",
    "vercel-build": "echo 'Building...'"
  }
}
```

## Step 2: Environment Variables Setup

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following environment variables:

```env
# Server Configuration
NODE_ENV=production

# Database Configuration (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret_key

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

## Step 3: Database Setup

1. Ensure your Supabase project is properly configured
2. Run the database migrations in Supabase SQL editor:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run your schema.sql contents
```

## Step 4: Deployment Methods

### Method 1: Using Vercel CLI (Recommended for first deployment)

1. Login to Vercel:
```bash
vercel login
```

2. Deploy the project:
```bash
vercel
```

3. Follow the CLI prompts:
   - Set up and deploy: Yes
   - Link to existing project: No
   - Project name: aa-food-delivery-server
   - Directory: ./
   - Override settings: No

### Method 2: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: npm run vercel-build
   - Output Directory: ./
   - Install Command: npm install

## Step 5: Post-Deployment Configuration

1. Configure Custom Domain (if needed):
   - Go to Project Settings > Domains
   - Add your domain
   - Follow DNS configuration instructions

2. Set up SSL:
   - Vercel automatically handles SSL certificates
   - No additional configuration needed

3. Configure CORS:
   - Update CORS_ORIGIN in environment variables
   - Add your frontend domain

## Step 6: Monitoring Setup

1. Enable Vercel Analytics:
   - Go to Project Settings > Analytics
   - Enable Analytics

2. Set up Error Monitoring:
   - Go to Project Settings > Monitoring
   - Enable Error Tracking

## Step 7: Testing the Deployment

1. Test the health endpoint:
```bash
curl https://your-vercel-domain.vercel.app/health
```

2. Test API endpoints:
```bash
# Test authentication
curl -X POST https://your-vercel-domain.vercel.app/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

## Step 8: Continuous Deployment

1. Connect your GitHub repository:
   - Go to Project Settings > Git
   - Connect your repository
   - Configure deployment settings

2. Set up deployment protection:
   - Go to Project Settings > Git
   - Enable "Require Preview Deployment Comments"

## Troubleshooting

### Common Issues and Solutions

1. Environment Variables Not Working:
   - Check if variables are properly set in Vercel dashboard
   - Redeploy after updating variables

2. Database Connection Issues:
   - Verify Supabase connection settings
   - Check if IP is whitelisted in Supabase

3. CORS Errors:
   - Verify CORS_ORIGIN setting
   - Check if frontend domain is correct

4. Build Failures:
   - Check build logs in Vercel dashboard
   - Verify package.json scripts

## Maintenance

1. Regular Updates:
   - Keep dependencies updated
   - Monitor Vercel dashboard for issues
   - Check deployment logs regularly

2. Performance Monitoring:
   - Use Vercel Analytics
   - Monitor API response times
   - Check error rates

## Security Considerations

1. Environment Variables:
   - Keep sensitive data in Vercel environment variables
   - Never commit .env files

2. API Security:
   - Use rate limiting
   - Implement proper authentication
   - Monitor for suspicious activity

## Support

For issues:
1. Check Vercel deployment logs
2. Review error tracking
3. Contact Vercel support
4. Check project documentation

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Node.js on Vercel](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Deployment Protection](https://vercel.com/docs/concepts/deployments/deployment-protection) 