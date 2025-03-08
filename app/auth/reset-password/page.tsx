'use client';

import { useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'שגיאה בשליחת בקשת איפוס סיסמה');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            הוראות איפוס סיסמה נשלחו!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            שלחנו לך אימייל עם הוראות לאיפוס הסיסמה. אנא בדוק את תיבת הדואר שלך ועקוב אחר ההוראות.
          </p>
          <div className="mt-6">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              חזרה לדף ההתחברות
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            איפוס סיסמה
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 text-right">
              כתובת אימייל
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
              placeholder="כתובת אימייל"
              dir="rtl"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'שולח...' : 'שלח הוראות איפוס סיסמה'}
            </button>
          </div>
          
          <div className="text-center">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              חזרה לדף ההתחברות
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 