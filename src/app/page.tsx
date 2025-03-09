import PageLayout from '@/components/PageLayout';
import { useSiteSettings, useFolders } from '@/lib/context';
import Link from 'next/link';

export default function Home() {
  return (
    <PageLayout title="דף הבית">
      <HomeContent />
    </PageLayout>
  );
}

function HomeContent() {
  const { folders, loading: foldersLoading } = useFolders();
  const { settings, loading: settingsLoading } = useSiteSettings();

  if (foldersLoading || settingsLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const primaryColor = settings.primaryColor || '#3b82f6';
  const welcomeText = settings.welcomeText || 'ברוכים הבאים לאתר שלנו';
  const homeDescription = settings.homeDescription || 'בחרו קטגוריה מהרשימה למטה כדי להתחיל לגלוש באתר.';

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: primaryColor }}>
        {welcomeText}
      </h2>
      
      <p className="mb-6 text-gray-700">
        {homeDescription}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <Link 
            key={folder.id} 
            href={`/${folder.slug}`}
            className="block p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: primaryColor }}>
              {folder.folder_name}
            </h3>
            {folder.short_description && (
              <p className="text-gray-600 text-sm">{folder.short_description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
