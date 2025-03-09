// טיפוסים עבור המבנה של Google Sheets

// תיקיות ראשיות (main_menu)
export interface Folder {
  id: string;
  folder_name: string;
  display_order: number;
  active: 'yes' | 'no';
  slug: string;
  short_description: string;
}

// דפים (pages)
export interface Page {
  id: string;
  folder_id: string;
  page_name: string;
  display_order: number;
  active: 'yes' | 'no';
  slug: string;
  meta_description: string;
  seo_title: string;
}

// סוגי תוכן אפשריים
export type ContentType = 'text' | 'title' | 'image' | 'youtube' | 'link' | 'list' | 'table' | 'separator' | 'file';

// בלוקי תוכן (content)
export interface ContentBlock {
  id: string;
  page_id: string;
  content_type: ContentType;
  display_order: number;
  content: string;
  description?: string;
  title?: string;
  heading_level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  active: 'yes' | 'no';
}

// הגדרות האתר (settings)
export interface SiteSetting {
  key: string;
  value: string;
}

// תבניות (templates)
export interface Template {
  id: string;
  template_name: string;
  description: string;
}

// טיפוס עבור מבנה האתר המלא
export interface SiteStructure {
  folders: Folder[];
  pages: Page[];
  contentBlocks: ContentBlock[];
  settings: Record<string, string>;
  templates?: Template[];
} 