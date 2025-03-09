import { useState, useEffect } from 'react';
import { useSite } from '@/lib/context';
import Link from 'next/link';
import { FaFolder, FaFile, FaCog, FaExternalLinkAlt } from 'react-icons/fa';

export default function AdminDashboard() {
  const { siteStructure, loading, error, refreshData } = useSite();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    refreshData();
  }, [refreshData]);

  if (!isClient) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">שגיאה!</strong>
        <span className="block sm:inline"> אירעה שגיאה בטעינת נתוני האתר. אנא נסה שוב מאוחר יותר.</span>
        <button 
          onClick={refreshData}
          className="mt-3 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  const folderCount = siteStructure?.folders.length || 0;
  const pageCount = siteStructure?.pages.length || 0;
  const contentBlockCount = siteStructure?.contentBlocks.length || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">לוח בקרה</h1>
        <Link 
          href="/"
          target="_blank"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <span className="ml-1">צפה באתר</span>
          <FaExternalLinkAlt />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 ml-4">
              <FaFolder className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">תיקיות</p>
              <p className="text-2xl font-semibold">{folderCount}</p>
            </div>
          </div>
          <Link 
            href="/admin/dashboard/folders"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
          >
            נהל תיקיות
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 ml-4">
              <FaFile className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">דפים</p>
              <p className="text-2xl font-semibold">{pageCount}</p>
            </div>
          </div>
          <Link 
            href="/admin/dashboard/pages"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
          >
            נהל דפים
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 ml-4">
              <FaCog className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500">הגדרות</p>
              <p className="text-2xl font-semibold">{Object.keys(siteStructure?.settings || {}).length}</p>
            </div>
          </div>
          <Link 
            href="/admin/dashboard/settings"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
          >
            נהל הגדרות
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">סטטיסטיקות תוכן</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">סה"כ תיקיות:</span>
            <span className="font-semibold">{folderCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">סה"כ דפים:</span>
            <span className="font-semibold">{pageCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">סה"כ בלוקי תוכן:</span>
            <span className="font-semibold">{contentBlockCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">ממוצע בלוקי תוכן לדף:</span>
            <span className="font-semibold">
              {pageCount > 0 ? (contentBlockCount / pageCount).toFixed(1) : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 