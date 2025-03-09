import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import ContentBlock from '@/components/ContentBlock';
import { GoogleSheetsService } from '@/services/googleSheetsService';
import { Metadata } from 'next';

interface ContentPageProps {
  params: {
    folder: string;
    page: string;
  };
}

// פונקציה לקבלת נתונים בצד השרת
async function getPageData(folderSlug: string, pageSlug: string) {
  const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '';
  const service = new GoogleSheetsService(spreadsheetId);
  
  try {
    const page = await service.getPageBySlug(folderSlug, pageSlug);
    
    if (!page) {
      return null;
    }
    
    const contentBlocks = await service.getContentBlocksByPageId(page.id);
    const folders = await service.getFolders();
    const folder = folders.find(f => f.slug === folderSlug);
    
    return { page, contentBlocks, folder };
  } catch (error) {
    console.error('שגיאה בטעינת נתוני הדף:', error);
    return null;
  }
}

// יצירת מטא-דאטה דינמי
export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const pageData = await getPageData(params.folder, params.page);
  
  if (!pageData) {
    return {
      title: 'דף לא נמצא',
      description: 'הדף המבוקש לא נמצא',
    };
  }
  
  return {
    title: pageData.page.seo_title || pageData.page.page_name,
    description: pageData.page.meta_description,
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const pageData = await getPageData(params.folder, params.page);
  
  if (!pageData) {
    notFound();
  }
  
  const { page, contentBlocks, folder } = pageData;
  
  return (
    <PageLayout 
      title={page.page_name}
      description={page.meta_description}
    >
      <div className="space-y-6">
        {contentBlocks.length === 0 ? (
          <p className="text-gray-600">אין תוכן בדף זה.</p>
        ) : (
          contentBlocks.map(block => (
            <ContentBlock key={block.id} block={block} />
          ))
        )}
      </div>
    </PageLayout>
  );
}

// יצירת דפים סטטיים בזמן בנייה
export async function generateStaticParams() {
  try {
    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '';
    const service = new GoogleSheetsService(spreadsheetId);
    const folders = await service.getFolders();
    const pages = await service.getPages();
    
    const params = [];
    
    for (const folder of folders) {
      const folderPages = pages.filter(page => page.folder_id === folder.id);
      
      for (const page of folderPages) {
        params.push({
          folder: folder.slug,
          page: page.slug,
        });
      }
    }
    
    return params;
  } catch (error) {
    console.error('שגיאה ביצירת דפים סטטיים:', error);
    return [];
  }
} 