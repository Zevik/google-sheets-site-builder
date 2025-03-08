/**
 * טיפוסים בסיסיים למערכת
 */

// טיפוס משתמש
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  language_preference?: string;
  created_at: string;
}

// טיפוס אתר
export interface Site {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  spreadsheet_id: string;
  language: string;
  is_public: boolean;
  custom_domain?: string;
  theme?: string;
  created_at: string;
  updated_at: string;
  last_fetched?: string;
  cache_version?: number;
}

// טיפוס משתף פעולה באתר
export interface SiteCollaborator {
  id: string;
  site_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}

// טיפוס פריט תפריט ראשי
export interface MenuItem {
  id: string | number;
  folder_name: string;
  display_order: number;
  active: string;
  slug: string;
  short_description?: string;
  icon?: string;
}

// טיפוס דף
export interface Page {
  id: string | number;
  folder_id: string | number;
  page_name: string;
  display_order: number;
  active: string;
  slug: string;
  meta_description?: string;
  seo_title?: string;
  featured_image?: string;
  template?: string;
}

// טיפוס תוכן
export interface ContentBlock {
  id: string | number;
  page_id: string | number;
  content_type: ContentType;
  display_order: number;
  content: string;
  description?: string;
  title?: string;
  heading_level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  active: string;
  css_class?: string;
  animation?: string;
}

// סוגי תוכן אפשריים
export type ContentType = 
  | 'text' 
  | 'title' 
  | 'image' 
  | 'youtube' 
  | 'link' 
  | 'list' 
  | 'table' 
  | 'separator' 
  | 'file';

// טיפוס הגדרות אתר
export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  rtl?: string;
  language?: string;
  footerText?: string;
  socialLinks?: string;
  analyticsId?: string;
  customCSS?: string;
  [key: string]: string | undefined;
}

// טיפוס נתוני אתר מלאים
export interface SiteData {
  mainMenu: MenuItem[];
  pages: Page[];
  content: ContentBlock[];
  settings: SiteSettings;
}

// טיפוס בקשת יצירת אתר
export interface CreateSiteRequest {
  title: string;
  slug: string;
  spreadsheet_id: string;
  language: string;
}

// טיפוס תגובת אימות גיליון
export interface ValidateSpreadsheetResponse {
  valid: boolean;
  message?: string;
} 