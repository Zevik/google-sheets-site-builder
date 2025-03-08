'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Site, SiteData, Page } from '@/types';

interface SiteLayoutProps {
  children: React.ReactNode;
  siteData: SiteData;
  site: Site;
  currentPage?: Page;
}

export default function SiteLayout({ children, siteData, site, currentPage }: SiteLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  
  const { settings, mainMenu, pages } = siteData;
  
  // סינון תפריט ראשי פעיל
  const activeMainMenu = mainMenu
    .filter(item => item.active?.toLowerCase() === 'yes')
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  
  // סינון דפים פעילים
  const activePages = pages
    .filter(page => page.active?.toLowerCase() === 'yes')
    .sort((a, b) => Number(a.display_order) - Number(b.display_order));
  
  // הגדרת כיוון טקסט לפי שפה
  const isRtl = settings.rtl?.toLowerCase() === 'true' || site.language === 'he';
  const textDirection = isRtl ? 'rtl' : 'ltr';
  
  // הגדרת צבעים מותאמים אישית
  const primaryColor = settings.primaryColor || '#3b82f6';
  const secondaryColor = settings.secondaryColor || '#1e40af';
  const bgColor = settings.pageBackground || '#f9fafb';
  const cardBgColor = settings.cardBackground || '#ffffff';
  const cardBorderRadius = settings.cardBorderRadius || '12px';
  
  // פתיחת התיקייה של הדף הנוכחי
  useEffect(() => {
    if (currentPage) {
      setActiveFolder(String(currentPage.folder_id));
    }
  }, [currentPage]);
  
  // פורמט תאריך עדכון אחרון
  const formatLastUpdated = () => {
    if (!site.last_fetched) {
      return null;
    }
    
    const lastUpdated = new Date(site.last_fetched);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `עודכן לפני ${diffMins} דקות`;
    } else if (diffHours < 24) {
      return `עודכן לפני ${diffHours} שעות`;
    } else {
      return `עודכן לפני ${diffDays} ימים`;
    }
  };
  
  const lastUpdatedText = formatLastUpdated();
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: bgColor,
        direction: textDirection,
      }}
    >
      {/* כותרת עליונה */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt={settings.siteName || site.title} 
                    className="h-8 w-auto"
                  />
                ) : (
                  <span 
                    className="text-xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    {settings.siteName || site.title}
                  </span>
                )}
              </div>
            </div>
            
            {/* תפריט נייד */}
            <div className="-mr-2 flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">פתח תפריט</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* תפריט שולחן עבודה */}
            <nav className="hidden md:flex md:space-x-8 md:space-x-reverse">
              {activeMainMenu.map((folder) => (
                <div key={folder.id} className="relative group">
                  <button
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      activeFolder === String(folder.id)
                        ? `border-${primaryColor.replace('#', '')} text-gray-900`
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveFolder(activeFolder === String(folder.id) ? null : String(folder.id))}
                    style={
                      activeFolder === String(folder.id)
                        ? { borderBottomColor: primaryColor, color: 'black' }
                        : {}
                    }
                  >
                    {folder.folder_name}
                    <svg
                      className={`ml-2 h-5 w-5 transition-transform ${
                        activeFolder === String(folder.id) ? 'transform rotate-180' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  
                  {/* תפריט נפתח */}
                  {activeFolder === String(folder.id) && (
                    <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        {activePages
                          .filter(page => String(page.folder_id) === String(folder.id))
                          .map(page => (
                            <Link
                              key={page.id}
                              href={`/${site.slug}/${folder.slug}/${page.slug}`}
                              className={`block px-4 py-2 text-sm ${
                                currentPage && String(currentPage.id) === String(page.id)
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              role="menuitem"
                            >
                              {page.page_name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
        
        {/* תפריט נייד פתוח */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {activeMainMenu.map(folder => (
                <div key={folder.id}>
                  <button
                    className={`w-full flex justify-between items-center px-4 py-2 text-base font-medium ${
                      activeFolder === String(folder.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    } border-r-4`}
                    onClick={() => setActiveFolder(activeFolder === String(folder.id) ? null : String(folder.id))}
                  >
                    {folder.folder_name}
                    <svg
                      className={`ml-2 h-5 w-5 transition-transform ${
                        activeFolder === String(folder.id) ? 'transform rotate-180' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  
                  {activeFolder === String(folder.id) && (
                    <div className="pr-12 space-y-1">
                      {activePages
                        .filter(page => String(page.folder_id) === String(folder.id))
                        .map(page => (
                          <Link
                            key={page.id}
                            href={`/${site.slug}/${folder.slug}/${page.slug}`}
                            className={`block px-4 py-2 text-base font-medium ${
                              currentPage && String(currentPage.id) === String(page.id)
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {page.page_name}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
      
      {/* תוכן ראשי */}
      <main className="flex-grow">
        <div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          style={{ 
            width: settings.pageWidth ? `${settings.pageWidth}%` : '100%',
            maxWidth: '1200px',
          }}
        >
          <div 
            className="bg-white shadow overflow-hidden"
            style={{ 
              backgroundColor: cardBgColor,
              borderRadius: cardBorderRadius,
            }}
          >
            {children}
          </div>
        </div>
      </main>
      
      {/* כותרת תחתונה */}
      <footer className="bg-white shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <div>
              {settings.footerText || `© ${new Date().getFullYear()} ${settings.siteName || site.title}. כל הזכויות שמורות.`}
            </div>
            {lastUpdatedText && (
              <div className="mt-2 text-xs text-gray-400">
                {lastUpdatedText}
              </div>
            )}
          </div>
        </div>
      </footer>
      
      {/* סגנונות מותאמים אישית */}
      {settings.customCSS && (
        <style jsx global>{`
          ${settings.customCSS}
        `}</style>
      )}
    </div>
  );
} 