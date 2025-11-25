# Deployment Guide

This guide covers deploying Floorplans Studio to various platforms.

## Prerequisites

- GitHub repository pushed (✅ Done)
- OpenAI API key ready
- Node.js 18+ (handled by platforms)

## Platform Options

### 🚀 Option 1: Vercel (Recommended - Easiest for Next.js)

**Why Vercel?**
- Made by the creators of Next.js
- Zero-config deployment
- Automatic HTTPS, CDN, and preview deployments
- Free tier includes generous limits

**Steps:**

1. **Sign up/Login:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" and connect with GitHub

2. **Import Project:**
   - Click "Add New Project"
   - Select `brebuilds/floorplans` repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables:**
   - In project settings → Environment Variables, add:
     ```
     OPENAI_API_KEY=sk-your-actual-key-here
     OPENAI_MODEL=gpt-4o
     ```
   - Select "Production", "Preview", and "Development" environments

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://floorplans-xxx.vercel.app`

5. **Custom Domain (Optional):**
   - Go to Settings → Domains
   - Add your custom domain

**Cost:** Free tier is generous, paid plans start at $20/month

---

### 🌐 Option 2: Netlify

**Why Netlify?**
- Great free tier
- Easy continuous deployment
- Good for static + serverless functions

**Steps:**

1. **Sign up:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Import Project:**
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select `brebuilds/floorplans`

3. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Netlify will auto-detect Next.js (or use the `netlify.toml` file)

4. **Environment Variables:**
   - Site settings → Environment variables → Add:
     ```
     OPENAI_API_KEY=sk-your-key
     OPENAI_MODEL=gpt-4o
     ```

5. **Deploy:**
   - Click "Deploy site"
   - Your app will be live at `https://random-name.netlify.app`

**Cost:** Free tier available, Pro starts at $19/month

---

### 🚂 Option 3: Railway

**Why Railway?**
- Simple deployment
- Good for full-stack apps
- Pay-as-you-go pricing

**Steps:**

1. **Sign up:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `brebuilds/floorplans`

3. **Configure:**
   - Railway auto-detects Next.js
   - Add environment variables:
     ```
     OPENAI_API_KEY=sk-your-key
     OPENAI_MODEL=gpt-4o
     ```

4. **Deploy:**
   - Railway will automatically deploy
   - Get your URL from the project dashboard

**Cost:** $5/month + usage, free $5 credit monthly

---

### ☁️ Option 4: Render

**Why Render?**
- Simple interface
- Good free tier
- Automatic SSL

**Steps:**

1. **Sign up:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repo `brebuilds/floorplans`

3. **Configure:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

4. **Environment Variables:**
   - Add:
     ```
     OPENAI_API_KEY=sk-your-key
     OPENAI_MODEL=gpt-4o
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Your app will be live at `https://floorplans.onrender.com`

**Cost:** Free tier available, paid plans start at $7/month

---

## Environment Variables Required

All platforms need these environment variables:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o  # Optional, defaults to gpt-4o
```

**Important:** Never commit these to git! They should only be set in your hosting platform's dashboard.

## Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test AI cleanup feature (requires API key)
- [ ] Test OCR feature
- [ ] Test building detection
- [ ] Check console for errors
- [ ] Set up custom domain (optional)
- [ ] Monitor OpenAI API usage/costs
- [ ] Set up error monitoring (optional: Sentry, LogRocket)

## Troubleshooting

### Build Fails
- Check that Node.js version is 18+
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### API Routes Return 500 Errors
- Verify `OPENAI_API_KEY` is set correctly
- Check that the API key is valid
- Ensure the key has credits/quota

### App Works But AI Features Don't
- Double-check environment variables are set
- Restart/redeploy after adding env vars
- Check browser console for errors

## Which Platform Should I Choose?

- **Vercel**: Best for Next.js, easiest setup, recommended
- **Netlify**: Good alternative, great free tier
- **Railway**: Good if you need more control
- **Render**: Simple and straightforward

## Need Help?

If you need assistance with any platform, I can:
1. Help you through the signup process
2. Create additional configuration files
3. Troubleshoot deployment issues
4. Set up custom domains

Just let me know which platform you'd like to use!

