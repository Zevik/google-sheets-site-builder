import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import DashboardSitesList from '@/app/dashboard/components/DashboardSitesList';
import DashboardHeader from '@/app/dashboard/components/DashboardHeader';

export default async function DashboardPage() {
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
  
  // קבלת האתרים של המשתמש
  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });
  
  if (sitesError) {
    console.error('Error fetching user sites:', sitesError);
  }
  
  const userName = userData?.full_name || session.user.email?.split('@')[0] || 'משתמש';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName={userName} isAdmin={userData?.is_admin || false} />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:flex sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-900">לוח הבקרה שלי</h1>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/dashboard/sites/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                צור אתר חדש
              </Link>
            </div>
          </div>
          
          {/* רשימת האתרים */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {sites && sites.length > 0 ? (
              <DashboardSitesList sites={sites} />
            ) : (
              <div className="py-16 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">אין לך אתרים עדיין</h3>
                <p className="mt-1 text-sm text-gray-500">התחל ליצור את האתר הראשון שלך כעת.</p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/sites/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    צור אתר חדש
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 