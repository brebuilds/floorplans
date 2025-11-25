# AI Services Setup Guide

This guide explains how to move from mock implementations to production-ready AI services.

## Overview

The application now includes production-ready AI services for:
1. **AI Cleanup** - Clean up messy sketches into professional floorplans
2. **OCR** - Extract text and labels from images
3. **Building Detection** - Automatically detect buildings in site plans

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install the `openai` package required for AI services.

### 2. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (you won't be able to see it again!)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o
```

**Important**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- For production deployments (Vercel, Netlify, etc.), add these environment variables in your hosting platform's dashboard

### 4. Test the Services

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Upload a floorplan or site plan
3. Click "Cleanup" or "Detect Buildings"
4. Check the browser console for any errors

## How It Works

### Architecture

```
Component (FloorplanEditor/SitePlanView)
    ↓
Service Layer (lib/services/aiService.ts)
    ↓
API Route (app/api/ai/*/route.ts)
    ↓
OpenAI API
```

### Service Layer

The `lib/services/aiService.ts` file provides a clean abstraction:
- `cleanupImage()` - Clean up floorplan images
- `extractText()` - Extract text via OCR
- `detectBuildings()` - Detect buildings in site plans

### API Routes

- `/api/ai/cleanup` - Processes floorplan cleanup requests
- `/api/ai/ocr` - Extracts text from images
- `/api/ai/detect-buildings` - Detects building outlines

## Current Implementation Status

### ✅ Fully Implemented
- API routes for all three services
- Service abstraction layer
- Error handling
- Component integration

### 🔄 Partial Implementation
- **Cleanup**: Returns AI description, but doesn't yet parse and apply changes to canvas
- **OCR**: Returns text with bounding boxes, but doesn't yet auto-populate labels
- **Building Detection**: Returns building outlines, but uses simple rectangles (could be improved with polygon detection)

### 🚀 Future Enhancements

1. **Parse AI descriptions into structured data**
   - Convert AI text descriptions into SVG paths
   - Apply changes directly to canvas

2. **Auto-populate labels from OCR**
   - When OCR detects text, automatically create label elements
   - Position labels based on bounding boxes

3. **Advanced building detection**
   - Detect irregular building shapes (not just rectangles)
   - Use polygon tracing for complex outlines

4. **Alternative AI Providers**
   - Add support for Anthropic Claude
   - Add support for Google Gemini Vision
   - Make provider configurable

5. **Cost Optimization**
   - Cache results
   - Use lower-cost models for simple tasks
   - Batch processing

## Troubleshooting

### "OpenAI API key not configured"
- Make sure `.env.local` exists and contains `OPENAI_API_KEY`
- Restart the dev server after adding environment variables
- Check that the key starts with `sk-`

### "Failed to process cleanup"
- Check your OpenAI account has credits
- Verify the API key is valid
- Check browser console for detailed error messages

### Rate Limits
- OpenAI has rate limits based on your account tier
- If you hit limits, wait a few minutes or upgrade your plan

## Cost Considerations

OpenAI pricing (as of 2024):
- **gpt-4o**: ~$2.50-$10 per 1M input tokens, ~$10-$30 per 1M output tokens
- **gpt-4-turbo**: ~$10 per 1M input tokens, ~$30 per 1M output tokens

A typical floorplan cleanup might use:
- ~500-1000 input tokens (image + prompt)
- ~200-500 output tokens (description)

Estimated cost per cleanup: **$0.01 - $0.05**

## Security Best Practices

1. **Never expose API keys in client-side code**
   - All API calls go through Next.js API routes (server-side)
   - Keys are only used server-side

2. **Use environment variables**
   - Never hardcode keys
   - Use different keys for dev/staging/production

3. **Rate limiting** (recommended for production)
   - Add rate limiting to API routes
   - Consider using Upstash Redis or similar

4. **Input validation**
   - Validate image sizes
   - Limit file types
   - Sanitize inputs

## Alternative: Using Tesseract.js for OCR

If you prefer a free, client-side OCR solution:

```bash
npm install tesseract.js
```

Then modify `app/api/ai/ocr/route.ts` to use Tesseract instead of OpenAI. This would:
- ✅ Be free (no API costs)
- ✅ Work offline
- ❌ Be less accurate than OpenAI
- ❌ Not handle handwritten text as well

## Next Steps

1. Set up your OpenAI API key
2. Test the services
3. Monitor costs
4. Consider implementing the parsing logic to apply AI results to the canvas
5. Add error boundaries and better user feedback

For questions or issues, check the console logs and OpenAI API documentation.

