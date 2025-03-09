import { Metadata } from 'next';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'פאנל ניהול - לוח בקרה',
  description: 'לוח הבקרה של פאנל הניהול',
};

export default function DashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
} 