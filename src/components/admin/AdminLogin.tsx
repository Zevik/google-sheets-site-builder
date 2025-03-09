import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // בדיקה אם הסיסמה נכונה
      const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      
      if (password === correctPassword) {
        // שמירת מצב כניסה ב-localStorage
        localStorage.setItem('adminAuthenticated', 'true');
        // מעבר לדף הניהול
        router.push('/admin/dashboard');
      } else {
        setError('סיסמה שגויה');
      }
    } catch (err) {
      setError('אירעה שגיאה בתהליך הכניסה');
      console.error('שגיאת כניסה:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          סיסמה
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'מתחבר...' : 'כניסה'}
        </button>
      </div>
    </form>
  );
} 