import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaFolder, FaFile, FaCog, FaSignOutAlt } from 'react-icons/fa';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    // בדיקה אם המשתמש מחובר
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    
    if (!isAuthenticated) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin');
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* סרגל צד */}
      <div className="w-full md:w-64 bg-gray-800 text-white md:min-h-screen">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">פאנל ניהול</h2>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin/dashboard" 
                className="flex items-center space-x-2 space-x-reverse p-2 rounded hover:bg-gray-700"
              >
                <FaHome className="ml-2" />
                <span>לוח בקרה</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/dashboard/folders" 
                className="flex items-center space-x-2 space-x-reverse p-2 rounded hover:bg-gray-700"
              >
                <FaFolder className="ml-2" />
                <span>תיקיות</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/dashboard/pages" 
                className="flex items-center space-x-2 space-x-reverse p-2 rounded hover:bg-gray-700"
              >
                <FaFile className="ml-2" />
                <span>דפים</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/dashboard/settings" 
                className="flex items-center space-x-2 space-x-reverse p-2 rounded hover:bg-gray-700"
              >
                <FaCog className="ml-2" />
                <span>הגדרות</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 mt-auto border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 space-x-reverse p-2 rounded hover:bg-gray-700 w-full"
          >
            <FaSignOutAlt className="ml-2" />
            <span>התנתק</span>
          </button>
        </div>
      </div>
      
      {/* תוכן ראשי */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
} 