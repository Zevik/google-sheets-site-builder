import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useSiteSettings } from '@/lib/context';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function PageLayout({ children, title, description }: PageLayoutProps) {
  const { settings } = useSiteSettings();
  
  // הגדרות עיצוב מתוך הגדרות האתר
  const pageBackground = settings.pageBackground || '#ffffff';
  const pageWidth = settings.pageWidth || '90%';
  const contentSpacing = settings.contentSpacing || '20';
  const cardBackground = settings.cardBackground || '#ffffff';
  const cardBorderRadius = settings.cardBorderRadius || '8';

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: pageBackground }}>
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto" style={{ maxWidth: pageWidth }}>
          {title && (
            <div 
              className="mb-8 p-6 shadow-md" 
              style={{ 
                backgroundColor: cardBackground,
                borderRadius: `${cardBorderRadius}px`
              }}
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
              {description && <p className="text-gray-600">{description}</p>}
            </div>
          )}
          
          <div 
            className="p-6 shadow-md" 
            style={{ 
              backgroundColor: cardBackground,
              borderRadius: `${cardBorderRadius}px`,
              padding: `${contentSpacing}px`
            }}
          >
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 