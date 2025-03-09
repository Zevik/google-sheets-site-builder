import { Metadata } from 'next';
import AdminLogin from '@/components/admin/AdminLogin';

export const metadata: Metadata = {
  title: 'פאנל ניהול - כניסה',
  description: 'כניסה לפאנל הניהול של האתר',
};

export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">כניסה לפאנל הניהול</h1>
        <AdminLogin />
      </div>
    </div>
  );
} 