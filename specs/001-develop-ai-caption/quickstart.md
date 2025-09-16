# Quickstart Guide: AI Caption Genie MVP

**Version**: 1.0.0  
**Last Updated**: September 13, 2025  
**Estimated Completion Time**: 30 minutes

## Overview

This quickstart guide walks through the complete AI Caption Genie MVP setup, from development environment to production deployment. Follow these steps to get the application running locally and deployed to Vercel.

## Prerequisites

**Required Software**:

- Node.js 18.17.0 or later
- npm 9.0.0 or later
- Git
- VS Code (recommended)

**Required Accounts**:

- OpenAI API account with credits
- Stripe account (test mode acceptable)
- Vercel account (free tier sufficient)
- GitHub account for deployment

**Required API Keys**:

- OpenAI API key with GPT-4 and Vision API access
- Stripe publishable and secret keys
- Stripe webhook endpoint secret (for production)

## Step 1: Project Setup (5 minutes)

### 1.1 Clone and Initialize Project

```bash
git clone <repository-url>
cd AiCaptionGenie
npm install
```

### 1.2 Environment Configuration

Create `.env.local` file in project root:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 1.3 Verify Installation

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to verify the app loads.

## Step 2: Core Functionality Testing (10 minutes)

### 2.1 Text Caption Generation

1. Navigate to the caption generation form
2. Enter test description: "Launching new eco-friendly skincare product for millennials"
3. Select platform: Instagram
4. Select tone: Professional
5. Click "Generate Captions"
6. Verify 5-10 captions are generated with emojis, CTAs, and hashtags

**Expected Result**: Captions displayed with copy buttons and download option

### 2.2 Image Upload and Analysis

1. Upload a test image (JPEG/PNG/GIF, under 10MB)
2. Select platform: TikTok
3. Select tone: Casual
4. Click "Generate Captions"
5. Verify captions relate to image content

**Expected Result**: Captions reflect image analysis from OpenAI Vision API

### 2.3 Rate Limiting Validation

1. Generate captions 3 times in succession
2. Attempt a 4th generation
3. Verify rate limit message appears with upgrade option

**Expected Result**: "You've reached your 3 free daily generations. Upgrade to a paid plan for unlimited access."

### 2.4 File Validation Testing

1. Attempt to upload unsupported file format (.txt, .pdf)
2. Attempt to upload file over 10MB
3. Verify appropriate error messages

**Expected Result**: "File must be JPEG, PNG, or GIF and under 10MB"

## Step 3: Payment Flow Testing (5 minutes)

### 3.1 Stripe Checkout Integration

1. Click "Upgrade to Pro" when rate limited
2. Verify redirect to Stripe checkout
3. Use Stripe test card: 4242 4242 4242 4242
4. Complete test purchase
5. Verify redirect to success page

**Expected Result**: Successful test payment with confirmation

### 3.2 Post-Payment Functionality

1. Verify rate limiting is bypassed after purchase
2. Generate additional captions without restriction
3. Test all platform and tone combinations

**Expected Result**: Unlimited caption generation for paid users

## Step 4: Performance Validation (5 minutes)

### 4.1 Response Time Testing

1. Measure caption generation time (should be < 2 seconds)
2. Test file upload speed (should handle 10MB files efficiently)
3. Verify UI responsiveness on mobile viewport

**Expected Result**: Fast, responsive user experience

### 4.2 Error Handling Testing

1. Disconnect internet during generation
2. Submit empty form
3. Upload corrupted image file
4. Verify graceful error handling with user-friendly messages

**Expected Result**: Clear error messages with recovery options

## Step 5: Production Deployment (5 minutes)

### 5.1 Vercel Deployment Setup

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 5.2 Environment Variables Configuration

In Vercel dashboard, add all environment variables from `.env.local` with production values:

- Update `NEXT_PUBLIC_APP_URL` to production domain
- Use production Stripe keys
- Configure webhook endpoint for Stripe

### 5.3 Domain and SSL Verification

1. Verify custom domain works (if configured)
2. Test HTTPS certificate
3. Verify all API endpoints work in production

**Expected Result**: Fully functional production application

## Validation Checklist

**Core Functionality**:

- [ ] Text-based caption generation works
- [ ] Image upload and analysis works
- [ ] Image file handling works with Vision API
- [ ] All platforms (Instagram, TikTok, LinkedIn) generate appropriate content
- [ ] All tones (casual, professional, humorous) work correctly
- [ ] Rate limiting enforces 3 free generations per day
- [ ] Copy to clipboard functionality works
- [ ] Download captions as text file works

**Error Handling**:

- [ ] Invalid file formats show proper error message
- [ ] Oversized files show proper error message
- [ ] Network errors are handled gracefully
- [ ] OpenAI API errors show user-friendly messages
- [ ] Form validation works for all required fields

**Payment Integration**:

- [ ] Stripe checkout flow completes successfully
- [ ] Payment confirmation updates user status
- [ ] Unlimited generations work after payment
- [ ] Webhook handling works in production

**Performance**:

- [ ] Caption generation completes in < 2 seconds
- [ ] File uploads handle 10MB files efficiently
- [ ] Mobile responsive design works correctly
- [ ] Application loads quickly on first visit

**Security**:

- [ ] API keys are not exposed in client-side code
- [ ] File uploads are properly validated
- [ ] HTTPS works correctly in production
- [ ] Stripe webhooks verify signatures

## Troubleshooting

### Common Issues

**"OpenAI API key not working"**

- Verify API key has sufficient credits
- Check if key has GPT-4 and Vision API access
- Ensure key is correctly set in environment variables

**"File upload fails"**

- Check file size (must be < 10MB)
- Verify file format (JPEG, PNG, GIF only)
- Ensure sufficient server memory for processing

**"Rate limiting not working"**

- Check if localStorage is enabled in browser
- Verify UTC timestamp calculations
- Test in incognito mode to reset session

**"Stripe payments fail"**

- Use test card numbers in development
- Verify webhook endpoint is accessible
- Check Stripe dashboard for error details

### Performance Optimization

**Slow caption generation**:

- Optimize OpenAI prompts to reduce token usage
- Implement request caching for common inputs
- Consider image compression before Vision API calls

**Large bundle sizes**:

- Enable Tailwind CSS purging
- Use dynamic imports for heavy components
- Optimize images with Next.js Image component

## Success Criteria

The quickstart is complete when:

1. All validation checklist items pass
2. Application works in both development and production
3. Payment flow processes successfully
4. Performance meets specified targets (< 2s generation time)
5. Error handling provides good user experience

## Next Steps

After completing the quickstart:

1. Set up monitoring and analytics
2. Configure automated testing pipeline
3. Implement user feedback collection
4. Plan feature enhancements based on usage data
5. Scale infrastructure based on user growth

## Support

For issues during setup:

1. Check the troubleshooting section above
2. Review error logs in browser console and Vercel dashboard
3. Verify all environment variables are correctly configured
4. Test with different browsers and devices

**Development Time**: This quickstart validates the MVP is ready for user testing and can be completed by new developers in 30 minutes or less.
