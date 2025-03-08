'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreateSiteRequest } from '@/types';
import supabase from '@/lib/supabase/client';

export default function NewSitePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateSiteRequest>({
    title: '',
    slug: '',
    spreadsheet_id: '',
    language: 'he',
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const validateSlug = async () => {
    if (!formData.slug) return;
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // בדיקת תקינות ה-slug
      const isSlugValid = await validateSlug();
      if (!isSlugValid) {
        setLoading(false);
        return;
      }
      
      // בדיקת תקינות הגיליון
      const isSpreadsheetValid = await validateSpreadsheet();
      if (!isSpreadsheetValid) {
        setLoading(false);
        return;
      }
      
      // קבלת מזהה המשתמש הנוכחי
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('לא מחובר למערכת');
      }
      
      // יצירת האתר החדש
      const { data, error } = await supabase
        .from('sites')
        .insert({
          title: formData.title,
          slug: formData.slug,
          spreadsheet_id: formData.spreadsheet_id,
          language: formData.language,
          owner_id: session.user.id,
          is_public: true,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // מעבר לדף האתר החדש
      router.push(`/dashboard/sites/${data.id}`);
    } catch (error: any) {
      console.error('Error creating site:', error);
      setError(error.message || 'שגיאה ביצירת האתר');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">יצירת אתר חדש</h1>
            <p className="mt-1 text-sm text-gray-500">
              צור אתר חדש המקושר לגיליון Google Sheets
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
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
                  כתובת ה-URL תשמש לגישה לאתר שלך. השתמש באותיות אנגליות, מספרים ומקפים בלבד.
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
                <p className="mt-1 text-xs text-gray-500 text-right">
                  העתק את הקישור לגיליון Google Sheets שלך והדבק אותו כאן. המערכת תחלץ את המזהה באופן אוטומטי.
                </p>
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
              
              <div className="flex justify-between pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ביטול
                </Link>
                <button
                  type="submit"
                  disabled={loading || validating}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading ? 'יוצר אתר...' : validating ? 'מאמת גיליון...' : 'צור אתר'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">הנחיות ליצירת גיליון Google Sheets</h2>
            <p className="mt-1 text-sm text-gray-500">
              כדי שהאתר יעבוד כראוי, הגיליון שלך צריך להיות בפורמט מסוים
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="prose prose-sm max-w-none text-right">
              <p>הגיליון שלך צריך להכיל את הגיליונות (sheets) הבאים:</p>
              
              <ul className="list-disc pr-5">
                <li><strong>main_menu</strong> - תפריט ראשי (תיקיות)</li>
                <li><strong>pages</strong> - עמודים</li>
                <li><strong>content</strong> - בלוקי תוכן</li>
                <li><strong>settings</strong> - הגדרות האתר</li>
              </ul>
              
              <p>כל גיליון צריך להכיל עמודות ספציפיות. <a href="/docs/spreadsheet-format" target="_blank" className="text-blue-600 hover:text-blue-500">לחץ כאן לפרטים מלאים על מבנה הגיליון</a>.</p>
              
              <p>הגיליון חייב להיות משותף עם הרשאות צפייה לכל מי שיש לו את הקישור:</p>
              <ol className="list-decimal pr-5">
                <li>פתח את הגיליון ב-Google Sheets</li>
                <li>לחץ על כפתור "שתף" בפינה הימנית העליונה</li>
                <li>שנה את ההרשאות ל"כל מי שיש לו את הקישור יכול לצפות"</li>
                <li>העתק את הקישור והדבק אותו בטופס למעלה</li>
              </ol>
              
              <p>לנוחותך, <a href="https://docs.google.com/spreadsheets/d/1Cnplk3drtn3ygXD1JxjtIbb5UpNrEv0J-bpfZ5xA6u4/copy" target="_blank" className="text-blue-600 hover:text-blue-500">לחץ כאן להעתקת תבנית גיליון מוכנה</a> שתוכל להתחיל לערוך מיד.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 