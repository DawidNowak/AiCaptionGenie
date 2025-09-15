# Vercel Deployment Setup Guide

This guide provides step-by-step instructions for deploying AI Caption Genie to Vercel with proper environment variable configuration.

## Prerequisites

- Vercel account (free tier available)
- GitHub repository with AI Caption Genie code
- OpenAI API key
- Stripe account (test keys for development, live keys for production)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository containing AI Caption Genie
4. Configure deployment settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (if code is in root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 2. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

#### Required Environment Variables

| Variable Name            | Description                            | Example Value                    |
| ------------------------ | -------------------------------------- | -------------------------------- |
| `OPENAI_API_KEY`         | OpenAI API key for caption generation  | `sk-proj-...`                    |
| `STRIPE_SECRET_KEY`      | Stripe secret key for payments         | `sk_live_...` or `sk_test_...`   |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for frontend    | `pk_live_...` or `pk_test_...`   |
| `STRIPE_WEBHOOK_SECRET`  | Stripe webhook secret for verification | `whsec_...`                      |
| `NEXT_PUBLIC_APP_URL`    | Your production domain                 | `https://your-domain.vercel.app` |
| `NODE_ENV`               | Environment indicator                  | `production`                     |

#### How to Add Environment Variables in Vercel:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. For each variable:
   - Enter the **Key** (variable name)
   - Enter the **Value** (your actual API key/secret)
   - Select environments: **Production**, **Preview**, **Development** (as needed)
   - Click **Save**

### 3. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to send:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
5. Copy the webhook signing secret
6. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`

### 4. Deploy and Test

1. Push code to your repository (or trigger manual deploy in Vercel)
2. Wait for deployment to complete
3. Test the application:
   - Visit your production URL
   - Try generating captions (should work with OpenAI)
   - Test payment flow (should work with Stripe)

## Environment Variable Values Guide

### OpenAI API Key

- Get from: [OpenAI Platform](https://platform.openai.com/api-keys)
- Format: `sk-proj-...` or `sk-...`
- Required for: Caption generation functionality

### Stripe Keys

- Get from: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- For testing: Use keys starting with `sk_test_` and `pk_test_`
- For production: Use keys starting with `sk_live_` and `pk_live_`
- Required for: Payment processing

### App URL

- Development: `http://localhost:3000`
- Production: Your Vercel domain (e.g., `https://ai-caption-genie.vercel.app`)
- Used for: Stripe redirects, webhooks, CORS

## Security Best Practices

### ✅ Do's

- Use environment variables for all secrets
- Use test keys for development/preview environments
- Use live keys only for production environment
- Regenerate keys if accidentally exposed
- Monitor Vercel deployment logs for errors

### ❌ Don'ts

- Never commit `.env.local` to version control
- Never expose API keys in client-side code
- Never use live keys in development
- Never share environment variable values

## Troubleshooting

### Common Issues

#### Build Failures

```
Error: Environment variable OPENAI_API_KEY is not set
```

**Solution**: Ensure all required environment variables are set in Vercel dashboard

#### Module Resolution Errors

```
Module not found: Can't resolve '@/components/CaptionForm'
```

**Solution**: This indicates path alias resolution issues. The project includes webpack configuration in `next.config.mjs` to handle this. If you still see this error:

1. Ensure you're using Node.js 18.17.0 or higher (specified in `package.json`)
2. Check that `tsconfig.json` has the correct path mapping:
   ```json
   "baseUrl": ".",
   "paths": {
     "@/*": ["src/*"]
   }
   ```
3. Verify the `next.config.mjs` includes the webpack alias configuration
4. Try redeploying after clearing Vercel build cache

#### CSS/Tailwind Build Errors

```
Error: Cannot find module 'tailwindcss'
```

**Solution**: This occurs when CSS build dependencies aren't available during the build process. The project configuration includes `tailwindcss`, `postcss`, and `autoprefixer` in the main dependencies (not devDependencies) to ensure they're available during Vercel builds.

#### Stripe Webhook Failures

```
Error: Invalid webhook signature
```

**Solution**: Verify webhook secret matches Stripe dashboard configuration

#### API Key Errors

```
Error: Invalid API key provided
```

**Solution**: Check API key format and permissions in provider dashboard

### Debugging Steps

1. **Check Vercel Function Logs**:

   - Go to Vercel Dashboard → Project → Functions
   - View logs for error details

2. **Verify Environment Variables**:

   - Settings → Environment Variables
   - Ensure all required variables are set
   - Check variable names match exactly

3. **Test API Endpoints**:
   - Use tools like Postman to test `/api/generate`
   - Verify webhook endpoint at `/api/stripe/webhook`

## Performance Optimization

The Next.js configuration includes several optimizations:

- **SWC Minification**: Faster builds and smaller bundles
- **Image Optimization**: WebP/AVIF formats with responsive sizing
- **Security Headers**: X-Frame-Options, X-Content-Type-Options
- **Compression**: Gzip compression enabled
- **Bundle Optimization**: Tree shaking and import optimization

## Monitoring and Maintenance

### Regular Checks

- Monitor OpenAI API usage and costs
- Review Stripe transaction logs
- Check Vercel function execution logs
- Update dependencies regularly

### Cost Management

- Set OpenAI usage limits in platform dashboard
- Monitor Stripe processing fees
- Track Vercel function execution time

## Support

For deployment issues:

- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Review Next.js deployment guide: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- Contact support through respective platforms

---

**Note**: This guide assumes you're using the production-ready configuration from `next.config.mjs` with all optimizations enabled.
