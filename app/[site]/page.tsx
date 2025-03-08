import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSiteDataWithCache } from '@/lib/sheets/sheetsService';
import SiteLayout from './components/SiteLayout';
import SiteContent from './components/SiteContent';
import { SiteData } from '@/types';

// פונקציה לקבלת נתוני האתר
async function getSiteData(slug: string): Promise<{ site: any, siteData: SiteData } | null> {
  try {
    const supabase = createClient();
    
    // קבלת פרטי האתר לפי ה-slug
    const { data: site, error } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .single();
    
    if (error || !site) {
      console.error('Error fetching site:', error);
      return null;
    }
    
    // בדיקה אם יש נתונים במטמון
    const { data: cacheData, error: cacheError } = await supabase
      .from('cache')
      .select('*')
      .eq('site_id', site.id);
    
    let siteData: SiteData;
    
    if (cacheError || cacheData.length === 0) {
      // אם אין נתונים במטמון, משוך ישירות מהגיליון
      try {
        siteData = await getSiteDataWithCache(site.id, site.spreadsheet_id);
      } catch (error) {
        console.error('Error fetching data from spreadsheet:', error);
        return null;
      }
    } else {
      // ארגון נתוני המטמון
      const mainMenu = cacheData.find(item => item.sheet_name === 'main_menu')?.data || [];
      const pages = cacheData.find(item => item.sheet_name === 'pages')?.data || [];
      const content = cacheData.find(item => item.sheet_name === 'content')?.data || [];
      const settings = cacheData.find(item => item.sheet_name === 'settings')?.data || {};
      
      siteData = {
        mainMenu,
        pages,
        content,
        settings
      };
    }
    
    return { site, siteData };
  } catch (error) {
    console.error('Error in getSiteData:', error);
    return null;
  }
}

// פונקציה ליצירת מטא-נתונים דינמיים
export async function generateMetadata({ params }: { params: { site: string } }): Promise<Metadata> {
  const siteData = await getSiteData(params.site);
  
  if (!siteData) {
    return {
      title: 'דף לא נמצא',
      description: 'האתר המבוקש לא נמצא'
    };
  }
  
  const { site, siteData: data } = siteData;
  const siteName = data.settings.siteName || site.title;
  const siteDescription = data.settings.siteDescription || '';
  
  return {
    title: siteName,
    description: siteDescription,
    openGraph: {
      title: siteName,
      description: siteDescription,
      url: `/${params.site}`,
      siteName,
      locale: site.language === 'he' ? 'he_IL' : 'en_US',
      type: 'website',
    },
  };
}

interface SitePageProps {
  params: {
    site: string;
  };
}

export default async function SitePage({ params }: SitePageProps) {
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
    
    // בדיקה אם יש דף ראשי
    const homePage = siteData.pages.find(page => 
      page.active?.toLowerCase() === 'yes' && 
      siteData.mainMenu.some(menu => 
        menu.id === page.folder_id && 
        menu.active?.toLowerCase() === 'yes'
      )
    );
    
    if (!homePage) {
      return (
        <SiteLayout siteData={siteData} site={site}>
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ברוכים הבאים לאתר {site.title}</h1>
            <p className="text-gray-600">
              האתר נמצא בבנייה. אנא הוסף דפים לגיליון ה-Google Sheets שלך.
            </p>
          </div>
        </SiteLayout>
      );
    }
    
    // מציאת תוכן הדף הראשי
    const pageContent = siteData.content
      .filter(content => 
        content.page_id === homePage.id && 
        content.active?.toLowerCase() === 'yes'
      )
      .sort((a, b) => a.display_order - b.display_order);
    
    return (
      <SiteLayout siteData={siteData} site={site} currentPage={homePage}>
        <SiteContent content={pageContent} settings={siteData.settings} />
      </SiteLayout>
    );
  } catch (error) {
    console.error('Error fetching site data:', error);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">שגיאה בטעינת האתר</h1>
          <p className="text-gray-600 mb-8">
            לא ניתן לטעון את נתוני האתר מגיליון Google Sheets. אנא ודא שהגיליון משותף כראוי ובפורמט הנכון.
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