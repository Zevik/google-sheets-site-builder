import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { GoogleSheetsService } from '@/services/googleSheetsService';

interface FolderPageProps {
  params: {
    folder: string;
  };
}

// פונקציה לקבלת נתונים בצד השרת
async function getFolderData(folderSlug: string) {
  const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '';
  const service = new GoogleSheetsService(spreadsheetId);
  
  try {
    const folders = await service.getFolders();
    const folder = folders.find(f => f.slug === folderSlug);
    
    if (!folder) {
      return null;
    }
    
    const pages = await service.getPagesByFolderId(folder.id);
    return { folder, pages };
  } catch (error) {
    console.error('שגיאה בטעינת נתוני התיקייה:', error);
    return null;
  }
}

export default async function FolderPage({ params }: FolderPageProps) {
  const folderData = await getFolderData(params.folder);
  
  if (!folderData) {
    notFound();
  }
  
  const { folder, pages } = folderData;
  
  return (
    <PageLayout 
      title={folder.folder_name}
      description={folder.short_description}
    >
      <div className="space-y-6">
        {pages.length === 0 ? (
          <p className="text-gray-600">אין דפים בקטגוריה זו.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pages.map(page => (
              <Link
                key={page.id}
                href={`/${folder.slug}/${page.slug}`}
                className="block p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-lg font-semibold mb-2">{page.page_name}</h3>
                {page.meta_description && (
                  <p className="text-gray-600 text-sm">{page.meta_description}</p>
                )}
              </Link>
            ))}
          </div>
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
    
    return folders.map(folder => ({
      folder: folder.slug,
    }));
  } catch (error) {
    console.error('שגיאה ביצירת דפים סטטיים:', error);
    return [];
  }
} 