# HeronPulse Academic OS - Deployment Guide

## Complete Setup Instructions for Supabase + Vercel Deployment

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Setup (PostgreSQL Database)](#2-supabase-setup)
3. [Environment Variables Configuration](#3-environment-variables-configuration)
4. [Vercel Deployment](#4-vercel-deployment)
5. [Post-Deployment Configuration](#5-post-deployment-configuration)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites

### Required Accounts
- [GitHub Account](https://github.com) - For code repository
- [Supabase Account](https://supabase.com) - For PostgreSQL database
- [Vercel Account](https://vercel.com) - For hosting

### Required Tools
- Node.js 18+ or Bun
- Git
- A code editor (VS Code recommended)

---

## 2. Supabase Setup

### Step 2.1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `heronpulse-academic-os`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users (e.g., Singapore for Philippines)
   - **Plan**: Free tier is sufficient for development

4. Click **"Create new project"** and wait ~2 minutes for setup

### Step 2.2: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **Database** in the left sidebar
3. Scroll to **Connection string** section
4. Copy the **URI** connection string (format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`)

**Important Notes:**
- Replace `[password]` with your database password
- For Prisma, use port **6543** (pooler) for serverless environments
- Use port **5432** only for direct connections (migrations)

### Step 2.3: Configure Prisma for Supabase

Update your `prisma/schema.prisma` file:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

### Step 2.4: Get Supabase Anon Key

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy the **anon public** key (safe to expose in client-side code)
3. Copy the **service_role** key (keep secret - server-side only)

---

## 3. Environment Variables Configuration

### Step 3.1: Required Environment Variables

Create a `.env` file locally and configure these in Vercel:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
NEXTAUTH_URL="https://your-app.vercel.app"

# Optional: Supabase (for future features)
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Optional: Email (for notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-smtp-password"
```

### Step 3.2: Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online tool: https://generate-secret.vercel.app/32

---

## 4. Vercel Deployment

### Step 4.1: Push Code to GitHub

1. Initialize git repository (if not already):
```bash
git init
git add .
git commit -m "Initial commit - HeronPulse Academic OS"
```

2. Create a GitHub repository and push:
```bash
git remote add origin https://github.com/your-username/heronpulse-academic-os.git
git branch -M main
git push -u origin main
```

### Step 4.2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** > **"Project"**
3. Select **"Import Git Repository"**
4. Find and select your `heronpulse-academic-os` repository
5. Click **"Import"**

### Step 4.3: Configure Project Settings

**Framework Preset:**
- Next.js (auto-detected)

**Build Settings:**
- Build Command: `bun run build` (or `npm run build`)
- Output Directory: `.next`
- Install Command: `bun install` (or `npm install`)

**Environment Variables:**
Click **"Environment Variables"** and add all variables from Section 3.1:

| Name | Value |
|------|-------|
| DATABASE_URL | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| DIRECT_DATABASE_URL | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| NEXTAUTH_SECRET | Your generated secret |
| NEXTAUTH_URL | `https://your-project.vercel.app` |

### Step 4.4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (typically 2-3 minutes)
3. You'll see a success screen with your deployment URL

---

## 5. Post-Deployment Configuration

### Step 5.1: Run Database Migrations

After the first deployment, you need to push the database schema:

**Option A: Using Vercel CLI (Recommended)**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Pull environment variables:
```bash
vercel env pull .env.local
```

4. Push Prisma schema:
```bash
npx prisma db push
```

**Option B: Using Prisma Migrate**

1. Run locally with production database:
```bash
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

### Step 5.2: Seed Demo Data (Optional)

To add demo accounts and sample data:

```bash
vercel env pull .env.local
npx prisma db seed
```

### Step 5.3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **"Settings"** > **"Domains"**
3. Add your custom domain (e.g., `heronpulse.umak.edu.ph`)
4. Update `NEXTAUTH_URL` to match your domain

---

## 6. Troubleshooting

### Common Issues and Solutions

#### Issue: "Prisma Client not found"
**Solution:** Add a post-install script to package.json:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

#### Issue: "Database connection timeout"
**Solution:** 
- Use the pooled connection string (port 6543)
- Ensure `DATABASE_URL` has `?pgbouncer=true`
- Check Supabase project is not paused (free tier pauses after 7 days of inactivity)

#### Issue: "NEXTAUTH_URL mismatch"
**Solution:** Update `NEXTAUTH_URL` in Vercel environment variables to match your actual domain

#### Issue: "Build fails with Prisma error"
**Solution:**
1. Ensure `prisma generate` runs during build
2. Check `prisma/schema.prisma` syntax
3. Verify environment variables are set correctly

#### Issue: "CORS errors"
**Solution:** 
- The app handles CORS internally
- If using a custom domain, update NextAuth configuration

### Debug Commands

Check build logs in Vercel dashboard or run locally:
```bash
bun run build
```

Check Prisma schema:
```bash
npx prisma validate
```

Test database connection:
```bash
npx prisma db pull
```

---

## Quick Reference

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@heronpulse.demo | demo123 |
| Faculty | faculty@heronpulse.demo | demo123 |
| Super Admin | admin@heronpulse.demo | demo123 |

### Project Structure

```
heronpulse-academic-os/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Demo data
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities and configs
│   └── hooks/           # Custom React hooks
├── public/              # Static assets
└── package.json
```

### Useful Commands

```bash
# Development
bun run dev

# Build for production
bun run build

# Run linting
bun run lint

# Database operations
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:seed      # Seed demo data

# Production preview
bun run start
```

---

## Support

For issues or questions:
- GitHub Issues: [Project Repository]
- Documentation: Check `/docs` folder
- Email: heronpulse@umak.edu.ph

---

**HeronPulse Academic OS** - Built for the College of Computing and Information Sciences, University of Makati.
