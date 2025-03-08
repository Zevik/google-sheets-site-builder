import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SiteEditForm from './components/SiteEditForm';
import DashboardHeader from '@/app/dashboard/components/DashboardHeader';

interface SiteEditPageProps {
  params: {
    id: string;
  };
}

export default async function SiteEditPage({ params }: SiteEditPageProps) {
  const supabase = createClient();
  
  // בדיקת אימות משתמש
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  // קבלת פרטי המשתמש
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (userError) {
    console.error('Error fetching user profile:', userError);
  }
  
  // קבלת פרטי האתר
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (siteError || !site) {
    console.error('Error fetching site:', siteError);
    redirect('/dashboard');
  }
  
  // בדיקה שהמשתמש הוא הבעלים של האתר או מנהל
  if (site.owner_id !== session.user.id && !userData?.is_admin) {
    redirect('/dashboard');
  }
  
  const userName = userData?.full_name || session.user.email?.split('@')[0] || 'משתמש';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName={userName} isAdmin={userData?.is_admin || false} />
      
      <main className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h1 className="text-2xl font-bold text-gray-900">עריכת אתר: {site.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                עדכן את פרטי האתר שלך
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              <SiteEditForm site={site} />
            </div>
          </div>
          
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">קישורים מהירים</h2>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <a
                  href={`/${site.slug}`}
                  target="_blank"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 space-x-reverse hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 mr-3 text-right">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">צפייה באתר</p>
                    <p className="text-sm text-gray-500 truncate">פתח את האתר בחלון חדש</p>
                  </div>
                </a>
                
                <a
                  href={`https://docs.google.com/spreadsheets/d/${site.spreadsheet_id}/edit`}
                  target="_blank"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 space-x-reverse hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 mr-3 text-right">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">ערוך את הגיליון</p>
                    <p className="text-sm text-gray-500 truncate">פתח את גיליון ה-Google Sheets</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 