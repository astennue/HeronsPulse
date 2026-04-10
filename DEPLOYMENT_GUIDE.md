# HeronPulse Academic OS - Deployment Guide

## 🚀 Quick Deployment to Vercel + Supabase

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your database password
3. Go to **Project Settings > Database**
4. Copy the **Connection string (URI)** under "Connection string"
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Add `?pgbouncer=true` at the end for connection pooling

### Step 2: Set Up Database Schema

**Option A: Using SQL Editor (Recommended)**
1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy the entire contents of `supabase-schema.sql`
4. Click **Run**

**Option B: Using Prisma**
```bash
npx prisma db push
npx prisma db seed
```

### Step 3: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - HeronPulse Academic OS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Set the following environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string with `?pgbouncer=true` |
| `NEXTAUTH_URL` | Your Vercel app URL (e.g., `https://your-app.vercel.app`) |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |

5. Click **Deploy**

### Step 5: Run Migrations (if using Prisma)

After deployment, run these commands in your local terminal:

```bash
# Set your production database URL
export DATABASE_URL="your-supabase-connection-string"

# Push schema changes
npx prisma db push

# Seed demo data
npx prisma db seed
```

## 📝 Environment Variables

### Required Variables

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
```

### Generating NEXTAUTH_SECRET

```bash
# macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🔐 Demo Accounts

After running the seed script, these accounts will be available:

| Role | Email | Password |
|------|-------|----------|
| Student | reinernuevas.acads@gmail.com | @CSFDSARein03082026 |
| Faculty | faculty.demo@umak.edu.ph | Faculty@HeronPulse2026 |
| Admin | superadmin@heronpulse.demo | Admin@HeronPulse2026 |

## 🛠️ Local Development

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Seed demo data
bun run db:seed

# Start development server
bun run dev
```

## 📁 Project Structure

```
heronpulse-academic-os/
├── prisma/
│   ├── schema.prisma          # SQLite schema (development)
│   ├── schema.supabase.prisma # PostgreSQL schema (production)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── boards/            # Kanban boards
│   │   ├── projects/          # Project management
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── messages/          # Messaging system
│   │   ├── calendar/          # Calendar view
│   │   ├── leaderboard/       # Gamification
│   │   ├── admin/             # Admin panel
│   │   └── settings/          # User settings
│   ├── components/            # React components
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Utilities
├── supabase-schema.sql        # Direct SQL schema for Supabase
├── .env.example               # Environment variables template
└── package.json
```

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure your DATABASE_URL is correct
- Check if your IP is whitelisted in Supabase
- Verify the connection string includes `?pgbouncer=true`

### Build Errors
- Run `bun run lint` to check for code issues
- Ensure all environment variables are set
- Check Node.js version (requires 18+)

### Authentication Issues
- Verify NEXTAUTH_URL matches your deployment URL
- Regenerate NEXTAUTH_SECRET if needed
- Clear browser cookies and try again

## 📞 Support

For issues or questions, please open a GitHub issue or contact the development team.

---

**HeronPulse Academic OS** - Built with ❤️ for the College of Computing and Information Sciences, University of Makati
