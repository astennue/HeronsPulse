# HeronPulse Academic OS - Vercel Deployment Guide

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Supabase](https://supabase.com) account (for PostgreSQL database)
3. Git repository with your code

---

## Step 1: Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (~2 minutes)
3. Go to **Project Settings** > **Database**
4. Under **Connection string** > **URI**, copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

Example connection string:
```
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your Supabase PostgreSQL connection string | Production, Preview |
| `NEXTAUTH_SECRET` | A random 32+ character string | Production, Preview |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) | Production |

### Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect Next.js
5. Add the environment variables from Step 2
6. Click "Deploy"

---

## Step 4: Initialize Database Schema

After the first deployment, you need to push the Prisma schema to Supabase:

### Method 1: Using Prisma CLI Locally

1. Set your local `.env` to use the Supabase database:
```env
DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

2. Rename the Supabase schema:
```bash
# Backup the SQLite schema
mv prisma/schema.prisma prisma/schema.sqlite.prisma

# Use the Supabase schema
mv prisma/schema.supabase.prisma prisma/schema.prisma
```

3. Push the schema:
```bash
bun run db:push
```

### Method 2: Using Supabase SQL Editor

1. Go to Supabase Dashboard > SQL Editor
2. Run the SQL from `supabase-schema.sql`

---

## Step 5: Seed the Database (Optional)

After pushing the schema, seed the database with initial data:

```bash
bun run db:seed
```

---

## Troubleshooting

### Build Error: "Failed to load config file"

This error occurs when Prisma can't find the database during build. Ensure:
- `DATABASE_URL` is set in Vercel environment variables
- The connection string is correct (no typos in password)
- Using `postinstall` script for `prisma generate`

### Database Connection Errors

If you see connection errors:
1. Check that your IP is whitelisted in Supabase (usually not required)
2. Verify the connection string format
3. Try using port 6543 (pooler) instead of 5432 for serverless

### Authentication Not Working

1. Ensure `NEXTAUTH_URL` matches your actual deployment URL
2. Check that `NEXTAUTH_SECRET` is set
3. Clear browser cookies and try again

---

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | Your app's public URL |
| `NEXTAUTH_SECRET` | ✅ | Random string for session encryption |
| `GOOGLE_CLIENT_ID` | ❌ | For Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | ❌ | For Google OAuth (optional) |

---

## Production Checklist

- [ ] Supabase project created
- [ ] Database schema pushed
- [ ] Environment variables set in Vercel
- [ ] First deployment successful
- [ ] Database seeded with initial data
- [ ] Test user login/signup works
- [ ] Test all major features

---

## Support

For issues or questions, contact the HeronPulse development team at UMAK CCIS.
