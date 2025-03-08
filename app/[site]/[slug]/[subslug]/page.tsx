import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSiteDataWithCache } from '@/lib/sheets/sheetsService';
import SiteLayout from '../../components/SiteLayout';
import SiteContent from '../../components/SiteContent';
import { Metadata } from 'next';

interface PageParams {
  site: string;
  slug: string;
  subslug: string;
}

// פונקציה ליצירת מטא-נתונים דינמיים
export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const supabase = createClient();
  
  // קבלת פרטי האתר לפי ה-slug
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', params.site)
    .single();
  
  if (siteError || !site) {
    return {
      title: 'דף לא נמצא',
    };
  }
  
  try {
    // קבלת נתוני האתר מהמטמון או מהגיליון
    const siteData = await getSiteDataWithCache(site.id, site.spreadsheet_id);
    
    // מציאת התיקייה והדף הנוכחיים
    const currentFolder = siteData.mainMenu.find(folder => 
      folder.slug === params.slug && 
      folder.active?.toLowerCase() === 'yes'
    );
    
    if (!currentFolder) {
      return {
        title: `${site.title} - דף לא נמצא`,
      };
    }
    
    const currentPage = siteData.pages.find(page => 
      page.slug === params.subslug && 
      String(page.folder_id) === String(currentFolder.id) && 
      page.active?.toLowerCase() === 'yes'
    );
    
    if (!currentPage) {
      return {
        title: `${site.title} - דף לא נמצא`,
      };
    }
    
    return {
      title: currentPage.seo_title || `${currentPage.page_name} - ${site.title}`,
      description: currentPage.meta_description || `${currentPage.page_name} - ${site.title}`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: site.title,
    };
  }
}

export default async function SitePageView({ params }: { params: PageParams }) {
  const supabase = createClient();
  
  // קבלת פרטי האתר לפי ה-slug
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', params.site)
    .single();
  
  if (siteError || !site) {
    notFound();
  }
  
  // בדיקה אם האתר פומבי
  if (!site.is_public) {
    // בדיקה אם המשתמש מחובר
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // אם המשתמש לא מחובר, הפניה לדף ההתחברות
      redirect('/auth/login');
    }
    
    // בדיקה אם המשתמש הוא הבעלים של האתר או מנהל
    const { data: userData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (site.owner_id !== session.user.id && !userData?.is_admin) {
      // אם המשתמש אינו הבעלים או מנהל, הפניה לדף הבית
      redirect('/');
    }
  }
  
  try {
    // קבלת נתוני האתר מהמטמון או מהגיליון
    const siteData = await getSiteDataWithCache(site.id, site.spreadsheet_id);
    
    // מציאת התיקייה והדף הנוכחיים
    const currentFolder = siteData.mainMenu.find(folder => 
      folder.slug === params.slug && 
      folder.active?.toLowerCase() === 'yes'
    );
    
    if (!currentFolder) {
      notFound();
    }
    
    const currentPage = siteData.pages.find(page => 
      page.slug === params.subslug && 
      String(page.folder_id) === String(currentFolder.id) && 
      page.active?.toLowerCase() === 'yes'
    );
    
    if (!currentPage) {
      notFound();
    }
    
    // מציאת תוכן הדף
    const pageContent = siteData.content
      .filter(content => 
        String(content.page_id) === String(currentPage.id) && 
        content.active?.toLowerCase() === 'yes'
      )
      .sort((a, b) => Number(a.display_order) - Number(b.display_order));
    
    return (
      <SiteLayout siteData={siteData} site={site} currentPage={currentPage}>
        <SiteContent content={pageContent} settings={siteData.settings} />
      </SiteLayout>
    );
  } catch (error) {
    console.error('Error fetching site data:', error);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">שגיאה בטעינת הדף</h1>
          <p className="text-gray-600 mb-8">
            לא ניתן לטעון את נתוני הדף מגיליון Google Sheets. אנא ודא שהגיליון משותף כראוי ובפורמט הנכון.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            חזרה ללוח הבקרה
          </a>
        </div>
      </div>
    );
  }
} 