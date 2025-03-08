'use client';

import { ContentBlock, MainMenuItem, PageItem, SiteSettings } from '@/types';
import Link from 'next/link';

interface SiteRendererProps {
  site: any;
  settings: SiteSettings;
  mainMenu: MainMenuItem[];
  pages: PageItem[];
  content: ContentBlock[];
  currentPage: PageItem;
}

export default function SiteRenderer({ site, settings, mainMenu, pages, content, currentPage }: SiteRendererProps) {
  // הגדרת צבעים וסגנונות מהגדרות האתר
  const primaryColor = settings.primaryColor || '#3b82f6';
  const secondaryColor = settings.secondaryColor || '#1e40af';
  const textColor = settings.textColor || '#111827';
  const backgroundColor = settings.backgroundColor || '#ffffff';
  const fontFamily = settings.fontFamily || 'system-ui, -apple-system, sans-serif';
  const direction = site.language === 'he' ? 'rtl' : 'ltr';
  
  // פונקציה לרינדור תוכן לפי סוג
  const renderContent = (block: ContentBlock) => {
    const { content_type, content: blockContent, title, description, heading_level } = block;
    
    // הגדרת מרווח בין תכנים
    const spacing = settings.contentSpacing ? `${settings.contentSpacing}px` : '1.5rem';
    
    // הגדרת צבע כותרות
    const headingColor = settings.headingColor || textColor;
    
    switch (content_type) {
      case 'title':
        const HeadingTag = heading_level || 'h2';
        return (
          <div style={{ marginBottom: spacing }}>
            <HeadingTag 
              className="font-bold"
              style={{ color: headingColor }}
            >
              {blockContent}
            </HeadingTag>
          </div>
        );
        
      case 'text':
        return (
          <div 
            className="prose max-w-none"
            style={{ marginBottom: spacing }}
            dangerouslySetInnerHTML={{ __html: blockContent }}
          />
        );
        
      case 'image':
        return (
          <div style={{ marginBottom: spacing }}>
            {title && (
              <h3 className="text-lg font-medium mb-2" style={{ color: headingColor }}>
                {title}
              </h3>
            )}
            <img 
              src={blockContent} 
              alt={description || title || 'תמונה'} 
              className="max-w-full rounded-lg"
            />
            {description && (
              <p className="mt-2 text-sm text-gray-500">{description}</p>
            )}
          </div>
        );
        
      case 'youtube':
        // חילוץ מזהה הסרטון מה-URL
        const getYouTubeId = (url: string) => {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = url.match(regExp);
          return (match && match[2].length === 11) ? match[2] : null;
        };
        
        const videoId = getYouTubeId(blockContent);
        
        return (
          <div style={{ marginBottom: spacing }}>
            {title && (
              <h3 className="text-lg font-medium mb-2" style={{ color: headingColor }}>
                {title}
              </h3>
            )}
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
            {description && (
              <p className="mt-2 text-sm text-gray-500">{description}</p>
            )}
          </div>
        );
        
      case 'link':
        return (
          <div style={{ marginBottom: spacing }}>
            <a 
              href={blockContent} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {title || blockContent}
            </a>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        );
        
      case 'list':
        // פיצול הרשימה לפריטים
        const items = blockContent.split('\n').filter(item => item.trim());
        
        return (
          <div style={{ marginBottom: spacing }}>
            {title && (
              <h3 className="text-lg font-medium mb-2" style={{ color: headingColor }}>
                {title}
              </h3>
            )}
            <ul className="list-disc pr-5 space-y-1">
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        );
        
      case 'table':
        return (
          <div style={{ marginBottom: spacing }}>
            {title && (
              <h3 className="text-lg font-medium mb-2" style={{ color: headingColor }}>
                {title}
              </h3>
            )}
            <div className="overflow-x-auto">
              <div 
                className="inline-block min-w-full align-middle"
                dangerouslySetInnerHTML={{ __html: blockContent }}
              />
            </div>
          </div>
        );
        
      case 'separator':
        return (
          <hr 
            className="my-8 border-gray-200" 
            style={{ marginBottom: spacing }}
          />
        );
        
      case 'file':
        return (
          <div style={{ marginBottom: spacing }}>
            <a 
              href={blockContent} 
              download
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {title || 'הורד קובץ'}
            </a>
            {description && (
              <p className="mt-2 text-sm text-gray-500">{description}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div 
      style={{ 
        fontFamily, 
        color: textColor, 
        backgroundColor, 
        direction 
      }}
      className="min-h-screen flex flex-col"
    >
      {/* כותרת האתר */}
      <header 
        style={{ backgroundColor: primaryColor }}
        className="py-4 px-6 text-white shadow-md"
      >
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{site.title}</h1>
          {site.description && (
            <p className="mt-1 text-sm opacity-90">{site.description}</p>
          )}
        </div>
      </header>
      
      {/* תפריט ניווט */}
      <nav 
        style={{ backgroundColor: secondaryColor }}
        className="py-2 px-6 text-white"
      >
        <div className="container mx-auto">
          <ul className="flex flex-wrap gap-6">
            {mainMenu.map((item) => (
              <li key={item.id}>
                <Link 
                  href={`/${site.slug}/${item.slug}`}
                  className={`hover:underline ${currentPage.folder_id === item.id ? 'font-bold' : ''}`}
                >
                  {item.folder_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* תוכן הדף */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* תפריט צד */}
          <aside className="md:w-1/4">
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-medium mb-3" style={{ color: primaryColor }}>
                {mainMenu.find(item => String(item.id) === String(currentPage.folder_id))?.folder_name}
              </h2>
              <ul className="space-y-2">
                {pages
                  .filter(page => String(page.folder_id) === String(currentPage.folder_id))
                  .map(page => (
                    <li key={page.id}>
                      <Link 
                        href={`/${site.slug}/${mainMenu.find(item => String(item.id) === String(page.folder_id))?.slug}/${page.slug}`}
                        className={`block px-3 py-2 rounded hover:bg-gray-100 ${
                          currentPage.id === page.id 
                            ? 'bg-gray-200 font-medium' 
                            : ''
                        }`}
                      >
                        {page.page_name}
                      </Link>
                    </li>
                  ))
                }
              </ul>
            </div>
          </aside>
          
          {/* תוכן ראשי */}
          <div className="md:w-3/4 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
                {currentPage.page_name}
              </h1>
            </div>
            
            <div className="p-6">
              {content.length > 0 ? (
                content.map((block) => (
                  <div key={block.id} className={block.css_class}>
                    {renderContent(block)}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">אין תוכן זמין בדף זה.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* כותרת תחתונה */}
      <footer 
        style={{ backgroundColor: primaryColor }}
        className="py-4 px-6 text-white text-sm"
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              &copy; {new Date().getFullYear()} {site.title}
            </div>
            <div>
              נבנה באמצעות Google Sheets Site Builder
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
