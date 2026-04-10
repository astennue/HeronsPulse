'use client';

import { AppShell } from '@/app/AppShell';
import { AdminDashboardContent } from './AdminContent';

export default function AdminPage() {
  return (
    <AppShell>
      <AdminDashboardContent />
    </AppShell>
  );
}
