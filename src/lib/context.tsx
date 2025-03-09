import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleSheetsService } from '@/services/googleSheetsService';
import { SiteStructure } from '@/types';

interface SiteContextType {
  siteStructure: SiteStructure | null;
  loading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

interface SiteProviderProps {
  children: ReactNode;
  spreadsheetId: string;
}

export function SiteProvider({ children, spreadsheetId }: SiteProviderProps) {
  const [siteStructure, setSiteStructure] = useState<SiteStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [service] = useState(() => new GoogleSheetsService(spreadsheetId));

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getSiteStructure();
      setSiteStructure(data);
    } catch (err) {
      console.error('שגיאה בטעינת נתוני האתר:', err);
      setError(err instanceof Error ? err : new Error('שגיאה לא ידועה בטעינת נתוני האתר'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [spreadsheetId]);

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <SiteContext.Provider value={{ siteStructure, loading, error, refreshData }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite חייב להיות בתוך SiteProvider');
  }
  return context;
}

// הוק שמחזיר את הגדרות האתר
export function useSiteSettings() {
  const { siteStructure, loading } = useSite();
  return {
    settings: siteStructure?.settings || {},
    loading
  };
}

// הוק שמחזיר את התיקיות (תפריט ראשי)
export function useFolders() {
  const { siteStructure, loading } = useSite();
  return {
    folders: siteStructure?.folders || [],
    loading
  };
}

// הוק שמחזיר דפים לפי מזהה תיקייה
export function usePagesByFolderId(folderId: string) {
  const { siteStructure, loading } = useSite();
  const pages = siteStructure?.pages.filter(page => page.folder_id === folderId) || [];
  return { pages, loading };
}

// הוק שמחזיר בלוקי תוכן לפי מזהה דף
export function useContentBlocksByPageId(pageId: string) {
  const { siteStructure, loading } = useSite();
  const contentBlocks = siteStructure?.contentBlocks.filter(block => block.page_id === pageId) || [];
  return { contentBlocks, loading };
} 