import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchAllSheetData } from '@/lib/sheets/sheetsService';
import SiteRenderer from '../../components/content/SiteRenderer';
import { SiteData } from '@/types';

// פונקציה לקבלת נתוני האתר והדף
async function getSiteAndPageData(siteSlug: string, pageSlug: string): Promise<{ site: any, siteData: SiteData, currentPage: any } | null> {
  try {
    const supabase = createClient();
    
    // קבלת פרטי האתר לפי ה-slug
    const { data: site, error } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', siteSlug)
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
        siteData = await fetchAllSheetData(site.spreadsheet_id);
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
    
    // סינון דפים פעילים
    const activePages = siteData.pages.filter(page => page.active === 'yes');
    
    // חיפוש הדף הנוכחי לפי ה-slug
    const currentPage = activePages.find(page => page.slug === pageSlug);
    
    if (!currentPage) {
      return null;
    }
    
    return { site, siteData, currentPage };
  } catch (error) {
    console.error('Error in getSiteAndPageData:', error);
    return null;
  }
}

// פונקציה ליצירת מטא-נתונים דינמיים
export async function generateMetadata({ params }: { params: { site: string, slug: string } }): Promise<Metadata> {
  const data = await getSiteAndPageData(params.site, params.slug);
  
  if (!data) {
    return {
      title: 'דף לא נמצא',
      description: 'הדף המבוקש לא נמצא'
    };
  }
  
  const { site, siteData, currentPage } = data;
  const siteName = siteData.settings.siteName || site.title;
  const pageTitle = currentPage.seo_title || currentPage.page_name;
  const pageDescription = currentPage.meta_description || '';
  
  return {
    title: `${pageTitle} | ${siteName}`,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `/${params.site}/${params.slug}`,
      siteName,
      locale: site.language === 'he' ? 'he_IL' : 'en_US',
      type: 'website',
    },
  };
}

// דף ספציפי באתר
export default async function SitePageContent({ params }: { params: { site: string, slug: string } }) {
  const data = await getSiteAndPageData(params.site, params.slug);
  
  if (!data) {
    notFound();
  }
  
  const { site, siteData, currentPage } = data;
  
  // סינון תפריט ראשי פעיל
  const activeMainMenu = siteData.mainMenu.filter(item => item.active === 'yes')
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  
  // סינון דפים פעילים
  const activePages = siteData.pages.filter(page => page.active === 'yes')
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  
  // סינון תוכן פעיל לדף הנוכחי
  const pageContent = siteData.content
    .filter(content => String(content.page_id) === String(currentPage.id) && content.active === 'yes')
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  
  return (
    <SiteRenderer
      site={site}
      settings={siteData.settings}
      mainMenu={activeMainMenu}
      pages={activePages}
      content={pageContent}
      currentPage={currentPage}
    />
  );
} 