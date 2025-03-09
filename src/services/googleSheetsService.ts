import { Folder, Page, ContentBlock, SiteSetting, Template, SiteStructure } from '@/types';

/**
 * שירות להבאת נתונים מ-Google Sheets
 */
export class GoogleSheetsService {
  private spreadsheetId: string;
  private cache: {
    folders?: Folder[];
    pages?: Page[];
    contentBlocks?: ContentBlock[];
    settings?: Record<string, string>;
    templates?: Template[];
    lastFetch: Record<string, number>;
  };
  private cacheDuration = 5 * 60 * 1000; // 5 דקות בmilliseconds

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
    this.cache = { lastFetch: {} };
  }

  /**
   * מביא נתונים מגיליון ספציפי ב-Google Sheets
   */
  private async fetchSheetData<T>(sheetName: string): Promise<T[]> {
    try {
      // בדיקה אם יש נתונים במטמון שעדיין תקפים
      const now = Date.now();
      if (
        this.cache[sheetName as keyof typeof this.cache] &&
        this.cache.lastFetch[sheetName] &&
        now - this.cache.lastFetch[sheetName] < this.cacheDuration
      ) {
        return this.cache[sheetName as keyof typeof this.cache] as T[];
      }

      const url = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
      const response = await fetch(url);
      const text = await response.text();
      
      // חילוץ ה-JSON מהתגובה
      const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);$/)?.[1];
      if (!jsonText) {
        throw new Error('לא ניתן לחלץ נתונים מהתגובה');
      }
      
      const data = JSON.parse(jsonText);
      
      // המרת הנתונים למבנה נוח יותר לשימוש
      const headers = data.table.cols.map((col: any) => col.label);
      const rows = data.table.rows.map((row: any) => {
        const item: any = {};
        row.c.forEach((cell: any, index: number) => {
          const header = headers[index];
          if (header) {
            item[header] = cell ? cell.v : null;
          }
        });
        return item;
      });
      
      // נרמול הנתונים
      const normalizedData = this.normalizeData(rows, sheetName);
      
      // שמירה במטמון
      this.cache[sheetName as keyof typeof this.cache] = normalizedData as any;
      this.cache.lastFetch[sheetName] = now;
      
      return normalizedData as T[];
    } catch (error) {
      console.error(`שגיאה בהבאת נתונים מהגיליון ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * נרמול הנתונים לפי סוג הגיליון
   */
  private normalizeData(data: any[], sheetName: string): any[] {
    switch (sheetName) {
      case 'main_menu':
        return data.map(item => ({
          id: String(item.id),
          folder_name: item.folder_name,
          display_order: Number(item.display_order),
          active: item.active?.toLowerCase(),
          slug: item.slug,
          short_description: item.short_description
        })).sort((a, b) => a.display_order - b.display_order);
        
      case 'pages':
        return data.map(item => ({
          id: String(item.id),
          folder_id: String(item.folder_id),
          page_name: item.page_name,
          display_order: Number(item.display_order),
          active: item.active?.toLowerCase(),
          slug: item.slug,
          meta_description: item.meta_description,
          seo_title: item.seo_title
        })).sort((a, b) => a.display_order - b.display_order);
        
      case 'content':
        return data.map(item => ({
          id: String(item.id),
          page_id: String(item.page_id),
          content_type: item.content_type,
          display_order: Number(item.display_order),
          content: item.content,
          description: item.description,
          title: item.title,
          heading_level: item.heading_level,
          active: item.active?.toLowerCase()
        })).sort((a, b) => a.display_order - b.display_order);
        
      case 'settings':
        return data.map(item => ({
          key: item.key,
          value: item.value
        }));
        
      case 'templates':
        return data.map(item => ({
          id: String(item.id),
          template_name: item.template_name,
          description: item.description
        }));
        
      default:
        return data;
    }
  }

  /**
   * מביא את כל התיקיות (main_menu)
   */
  async getFolders(): Promise<Folder[]> {
    const folders = await this.fetchSheetData<Folder>('main_menu');
    return folders.filter(folder => folder.active === 'yes');
  }

  /**
   * מביא את כל הדפים
   */
  async getPages(): Promise<Page[]> {
    const pages = await this.fetchSheetData<Page>('pages');
    return pages.filter(page => page.active === 'yes');
  }

  /**
   * מביא דפים לפי מזהה תיקייה
   */
  async getPagesByFolderId(folderId: string): Promise<Page[]> {
    const pages = await this.getPages();
    return pages.filter(page => page.folder_id === folderId);
  }

  /**
   * מביא דף לפי slug
   */
  async getPageBySlug(folderSlug: string, pageSlug: string): Promise<Page | null> {
    const folders = await this.getFolders();
    const folder = folders.find(f => f.slug === folderSlug);
    
    if (!folder) return null;
    
    const pages = await this.getPagesByFolderId(folder.id);
    return pages.find(p => p.slug === pageSlug) || null;
  }

  /**
   * מביא את כל בלוקי התוכן
   */
  async getContentBlocks(): Promise<ContentBlock[]> {
    const contentBlocks = await this.fetchSheetData<ContentBlock>('content');
    return contentBlocks.filter(block => block.active === 'yes');
  }

  /**
   * מביא בלוקי תוכן לפי מזהה דף
   */
  async getContentBlocksByPageId(pageId: string): Promise<ContentBlock[]> {
    const contentBlocks = await this.getContentBlocks();
    return contentBlocks.filter(block => block.page_id === pageId);
  }

  /**
   * מביא את כל הגדרות האתר
   */
  async getSettings(): Promise<Record<string, string>> {
    const settings = await this.fetchSheetData<SiteSetting>('settings');
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * מביא את כל התבניות
   */
  async getTemplates(): Promise<Template[]> {
    try {
      return await this.fetchSheetData<Template>('templates');
    } catch (error) {
      console.warn('לא נמצאו תבניות או שהגיליון אינו קיים');
      return [];
    }
  }

  /**
   * מביא את כל מבנה האתר
   */
  async getSiteStructure(): Promise<SiteStructure> {
    const [folders, pages, contentBlocks, settings, templates] = await Promise.all([
      this.getFolders(),
      this.getPages(),
      this.getContentBlocks(),
      this.getSettings(),
      this.getTemplates().catch(() => [])
    ]);

    return {
      folders,
      pages,
      contentBlocks,
      settings,
      templates
    };
  }
} 