'use client';

import { ContentBlock, SiteSettings } from '@/types';

interface SiteContentProps {
  content: ContentBlock[];
  settings: SiteSettings;
}

export default function SiteContent({ content, settings }: SiteContentProps) {
  // פונקציה לרינדור תוכן לפי סוג
  const renderContent = (block: ContentBlock) => {
    const { content_type, content: blockContent, title, description, heading_level } = block;
    
    // הגדרת מרווח בין תכנים
    const spacing = settings.contentSpacing ? `${settings.contentSpacing}px` : '1.5rem';
    
    // הגדרת צבע כותרות
    const headingColor = settings.headingColor || '#111827';
    
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
    <div className="p-6 md:p-8">
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
  );
}
