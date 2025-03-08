'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Site } from '@/types';
import supabase from '@/lib/supabase/client';

interface DashboardSitesListProps {
  sites: Site[];
}

export default function DashboardSitesList({ sites }: DashboardSitesListProps) {
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDeleteSite = async (siteId: string) => {
    try {
      setDeletingSiteId(siteId);
      
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);
      
      if (error) {
        throw error;
      }
      
      // רענון הדף לאחר מחיקה
      router.refresh();
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('שגיאה במחיקת האתר');
    } finally {
      setDeletingSiteId(null);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <ul className="divide-y divide-gray-200">
      {sites.map((site) => (
        <li key={site.id}>
          <div className="block hover:bg-gray-50">
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">{site.title.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="mr-4">
                    <p className="text-lg font-medium text-blue-600 truncate">{site.title}</p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="truncate">{site.slug}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  {showDeleteConfirm === site.id ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleDeleteSite(site.id)}
                        disabled={deletingSiteId === site.id}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {deletingSiteId === site.id ? 'מוחק...' : 'כן, מחק'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        ביטול
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/${site.slug}`}
                        target="_blank"
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        צפייה
                      </Link>
                      <Link
                        href={`/dashboard/sites/${site.id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        ערוך
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(site.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        מחק
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 ml-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    עודכן: {formatDate(site.updated_at)}
                  </p>
                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:mr-6">
                    <svg className="flex-shrink-0 ml-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    שפה: {site.language === 'he' ? 'עברית' : 'אנגלית'}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <svg className="flex-shrink-0 ml-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  סטטוס: {site.is_public ? 'פומבי' : 'פרטי'}
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
} 