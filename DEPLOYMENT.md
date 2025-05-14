# AA Food Delivery - Server Deployment Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Twilio account
- Server hosting (e.g., DigitalOcean, AWS, Heroku)

## Environment Setup

1. Create a `.env` file in the server root directory with the following variables:

```env
# Server Configuration
PORT=3000
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
```

## Database Setup

1. Create a new Supabase project
2. Run the database migrations:
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Run the schema.sql file contents
   ```

3. Set up database backups:
   - Configure daily automated backups
   - Set up backup retention policy

## Security Setup

1. Generate a strong JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Configure CORS settings in `app.js`:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-domain.com'],
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

3. Set up rate limiting:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use(limiter);
   ```

## Production Deployment Steps

1. Install dependencies:
   ```bash
   npm install --production
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Monitoring and Logging

1. Set up error tracking:
   - Configure proper error logging
   - Set up monitoring alerts

2. Configure logging:
   - Set up production logging
   - Configure log rotation
   - Set up log aggregation

## SSL/TLS Setup

1. Obtain SSL certificate:
   - Use Let's Encrypt or your hosting provider's SSL
   - Configure automatic renewal

2. Configure HTTPS:
   ```javascript
   const https = require('https');
   const fs = require('fs');

   const options = {
     key: fs.readFileSync('path/to/private.key'),
     cert: fs.readFileSync('path/to/certificate.crt')
   };

   https.createServer(options, app).listen(443);
   ```

## Backup Strategy

1. Database backups:
   - Daily automated backups
   - Weekly full backups
   - Monthly archive backups

2. Application backups:
   - Configuration files
   - Environment variables
   - Custom scripts

## Health Checks

1. Set up health check endpoint:
   ```javascript
   app.get('/health', (req, res) => {
     res.json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime()
     });
   });
   ```

2. Configure monitoring:
   - Set up uptime monitoring
   - Configure performance monitoring
   - Set up alert notifications

## Maintenance

1. Regular updates:
   - Keep dependencies updated
   - Monitor security advisories
   - Apply security patches

2. Performance optimization:
   - Monitor server resources
   - Optimize database queries
   - Configure caching

## Troubleshooting

1. Common issues:
   - Database connection issues
   - Authentication problems
   - SMS delivery failures

2. Debugging:
   - Check application logs
   - Monitor error tracking
   - Review performance metrics

## Support

For support and issues:
1. Check the logs
2. Review error tracking
3. Contact the development team

## Security Checklist

- [ ] Strong JWT secret configured
- [ ] SSL/TLS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Database backups configured
- [ ] Environment variables secured
- [ ] Dependencies updated
- [ ] Security patches applied
- [ ] Monitoring configured
- [ ] Error tracking set up 