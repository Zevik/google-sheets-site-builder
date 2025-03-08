import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createClient();
  
  // בדיקה אם המשתמש מחובר
  const { data: { session } } = await supabase.auth.getSession();
  
  // קבלת אתרים פופולריים (עד 6)
  const { data: popularSites } = await supabase
    .from('sites')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      {/* כותרת עליונה */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">GSheets Sites</span>
              </div>
            </div>
            <div className="flex items-center">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  לוח הבקרה שלי
                </Link>
              ) : (
                <div className="flex space-x-4 space-x-reverse">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    התחברות
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    הרשמה
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* גיבור */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">צור אתרים מקצועיים</span>
              <span className="block text-blue-600">עם Google Sheets</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              פלטפורמה פשוטה ליצירת אתרים מרהיבים המבוססים על גיליונות Google. ללא צורך בידע טכני, עדכן את האתר שלך בקלות דרך ממשק מוכר.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              {session ? (
                <div className="rounded-md shadow">
                  <Link
                    href="/dashboard/sites/new"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    צור אתר חדש
                  </Link>
                </div>
              ) : (
                <div className="rounded-md shadow">
                  <Link
                    href="/auth/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    התחל עכשיו
                  </Link>
                </div>
              )}
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:mr-3">
                <a
                  href="#features"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  למד עוד
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* תכונות */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">תכונות</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              דרך טובה יותר לבנות אתרים
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              פלטפורמה פשוטה וחזקה המאפשרת לך ליצור ולנהל אתרים מקצועיים באמצעות Google Sheets.
            </p>
          </div>
          
          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="mr-16">
                  <h3 className="text-lg font-medium text-gray-900">Google Sheets כ-CMS</h3>
                  <p className="mt-2 text-base text-gray-500">
                    השתמש בגיליונות Google כמערכת ניהול תוכן. עדכן את האתר שלך בקלות דרך ממשק מוכר ונוח.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="mr-16">
                  <h3 className="text-lg font-medium text-gray-900">התאמה אישית מלאה</h3>
                  <p className="mt-2 text-base text-gray-500">
                    התאם את העיצוב, הצבעים והפריסה של האתר שלך. שלוט בכל היבט של המראה והתחושה.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mr-16">
                  <h3 className="text-lg font-medium text-gray-900">תמיכה בריבוי שפות</h3>
                  <p className="mt-2 text-base text-gray-500">
                    תמיכה מלאה בעברית ואנגלית, כולל כיוון טקסט מימין לשמאל (RTL) לעברית.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mr-16">
                  <h3 className="text-lg font-medium text-gray-900">עיצוב רספונסיבי</h3>
                  <p className="mt-2 text-base text-gray-500">
                    כל האתרים מותאמים למובייל ונראים מעולה בכל גודל מסך, מטלפונים ועד מסכי מחשב גדולים.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* אתרים פופולריים */}
      {popularSites && popularSites.length > 0 && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">גלריה</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                אתרים שנוצרו לאחרונה
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                הצץ באתרים שנוצרו על ידי משתמשים אחרים בפלטפורמה שלנו.
              </p>
            </div>
            
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {popularSites.map((site) => (
                <div key={site.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900">{site.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      נוצר ב-{new Date(site.created_at).toLocaleDateString('he-IL')}
                    </p>
                    <div className="mt-4">
                      <a
                        href={`/${site.slug}`}
                        className="text-blue-600 hover:text-blue-500"
                        target="_blank"
                      >
                        צפה באתר &larr;
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* קריאה לפעולה */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">מוכן להתחיל?</span>
            <span className="block">צור את האתר שלך היום</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            הצטרף לאלפי משתמשים שכבר יוצרים אתרים מדהימים עם Google Sheets.
          </p>
          <div className="mt-8 flex justify-center">
            {session ? (
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/dashboard/sites/new"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  צור אתר חדש
                </Link>
              </div>
            ) : (
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  הרשם עכשיו
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* כותרת תחתונה */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} GSheets Sites. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 