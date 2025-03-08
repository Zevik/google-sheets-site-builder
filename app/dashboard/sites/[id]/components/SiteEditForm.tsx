'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Site } from '@/types';
import supabase from '@/lib/supabase/client';

interface SiteEditFormProps {
  site: Site;
}

export default function SiteEditForm({ site }: SiteEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: site.title,
    slug: site.slug,
    spreadsheet_id: site.spreadsheet_id,
    language: site.language,
    is_public: site.is_public,
    custom_domain: site.custom_domain || '',
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [spreadsheetError, setSpreadsheetError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // אם זה שדה ה-slug, נבצע המרה לפורמט תקין
    if (name === 'slug') {
      const sanitizedSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      
      setFormData({ ...formData, [name]: sanitizedSlug });
    } else if (name === 'spreadsheet_id') {
      // ניקוי מזהה גיליון מ-URL מלא
      let spreadsheetId = value.trim();
      
      // אם זה URL מלא, נחלץ את המזהה
      const match = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        spreadsheetId = match[1];
      }
      
      setFormData({ ...formData, [name]: spreadsheetId });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const validateSlug = async () => {
    if (!formData.slug) return false;
    if (formData.slug === site.slug) {
      setSlugError(null);
      return true;
    }
    
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id')
        .eq('slug', formData.slug)
        .single();
      
      if (data) {
        setSlugError('שם זה כבר קיים במערכת. אנא בחר שם אחר.');
        return false;
      } else {
        setSlugError(null);
        return true;
      }
    } catch (error) {
      // אם השגיאה היא שלא נמצאו תוצאות, זה בסדר
      setSlugError(null);
      return true;
    }
  };

  const validateSpreadsheet = async () => {
    if (!formData.spreadsheet_id) return false;
    if (formData.spreadsheet_id === site.spreadsheet_id) {
      setSpreadsheetError(null);
      return true;
    }
    
    try {
      setValidating(true);
      
      const response = await fetch(`/api/sheets/validate?spreadsheetId=${formData.spreadsheet_id}`);
      const data = await response.json();
      
      if (!data.valid) {
        setSpreadsheetError(data.message || 'הגיליון אינו תקין או שאין גישה אליו');
        return false;
      } else {
        setSpreadsheetError(null);
        return true;
      }
    } catch (error) {
      setSpreadsheetError('שגיאה באימות הגיליון');
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleRefreshCache = async () => {
    setRefreshing(true);
    setRefreshSuccess(false);
    setError(null);
    
    try {
      const response = await fetch('/api/sites/refresh-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteId: site.id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'שגיאה ברענון המטמון');
      }
      
      setRefreshSuccess(true);
      
      // רענון הדף לאחר 2 שניות
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error('Error refreshing cache:', error);
      setError(error.message || 'שגיאה ברענון המטמון');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // בדיקת תקינות ה-slug
      const isSlugValid = await validateSlug();
      if (!isSlugValid) {
        setLoading(false);
        return;
      }
      
      // בדיקת תקינות הגיליון אם הוא השתנה
      if (formData.spreadsheet_id !== site.spreadsheet_id) {
        const isSpreadsheetValid = await validateSpreadsheet();
        if (!isSpreadsheetValid) {
          setLoading(false);
          return;
        }
      }
      
      // עדכון האתר
      const { error } = await supabase
        .from('sites')
        .update({
          title: formData.title,
          slug: formData.slug,
          spreadsheet_id: formData.spreadsheet_id,
          language: formData.language,
          is_public: formData.is_public,
          custom_domain: formData.custom_domain || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', site.id);
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      
      // רענון הדף לאחר עדכון
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error('Error updating site:', error);
      setError(error.message || 'שגיאה בעדכון האתר');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-5 sm:px-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          האתר עודכן בהצלחה!
        </div>
      )}
      
      {refreshSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          המטמון רוענן בהצלחה! הנתונים העדכניים ביותר מהגיליון זמינים כעת.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 text-right">
            שם האתר
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="שם האתר שלך"
            dir="rtl"
          />
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 text-right">
            כתובת URL (באנגלית, ללא רווחים)
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              example.com/
            </span>
            <input
              type="text"
              name="slug"
              id="slug"
              required
              value={formData.slug}
              onChange={handleChange}
              onBlur={validateSlug}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="my-site"
            />
          </div>
          {slugError && (
            <p className="mt-1 text-sm text-red-600 text-right">{slugError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 text-right">
            שינוי כתובת ה-URL יגרום לכך שהקישורים הישנים לא יעבדו יותר.
          </p>
        </div>
        
        <div>
          <label htmlFor="spreadsheet_id" className="block text-sm font-medium text-gray-700 text-right">
            מזהה גיליון Google Sheets
          </label>
          <input
            type="text"
            name="spreadsheet_id"
            id="spreadsheet_id"
            required
            value={formData.spreadsheet_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="הדבק כאן את מזהה הגיליון או את הקישור המלא"
            dir="ltr"
          />
          {spreadsheetError && (
            <p className="mt-1 text-sm text-red-600 text-right">{spreadsheetError}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 text-right">
            שפת האתר
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-right"
            dir="rtl"
          >
            <option value="he">עברית</option>
            <option value="en">אנגלית</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="custom_domain" className="block text-sm font-medium text-gray-700 text-right">
            דומיין מותאם אישית (אופציונלי)
          </label>
          <input
            type="text"
            name="custom_domain"
            id="custom_domain"
            value={formData.custom_domain}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="example.com"
            dir="ltr"
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            השאר ריק אם אינך רוצה להשתמש בדומיין מותאם אישית.
          </p>
        </div>
        
        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="is_public"
              name="is_public"
              type="checkbox"
              checked={formData.is_public}
              onChange={handleCheckboxChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="mr-3 text-sm">
            <label htmlFor="is_public" className="font-medium text-gray-700">
              אתר פומבי
            </label>
            <p className="text-gray-500">
              אם מסומן, האתר יהיה נגיש לכל. אחרת, רק אתה תוכל לראות אותו.
            </p>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <div className="flex space-x-4 space-x-reverse">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              חזרה ללוח הבקרה
            </Link>
            
            <button
              type="button"
              onClick={handleRefreshCache}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin ml-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  מרענן מטמון...
                </>
              ) : (
                <>
                  <svg className="ml-2 -mr-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  רענן מטמון
                </>
              )}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading || validating}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? 'מעדכן...' : validating ? 'מאמת גיליון...' : 'שמור שינויים'}
          </button>
        </div>
      </form>
    </div>
  );
} 