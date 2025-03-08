/**
 * שירות לקריאת נתונים מגיליונות Google ללא צורך במפתחות API
 */

import { createClient } from '@/lib/supabase/server';

export interface SheetData {
  columns: string[];
  rows: any[];
}

/**
 * פונקציה לקריאת נתונים מגיליון Google ספציפי
 * @param spreadsheetId מזהה הגיליון
 * @param sheetName שם הגיליון (sheet)
 * @returns נתוני הגיליון מעובדים
 */
export async function fetchSheetData(spreadsheetId: string, sheetName: string): Promise<SheetData> {
  try {
    // בניית URL לגישה לגיליון דרך API הויזואליזציה של Google
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    
    // שליחת בקשה לקבלת הנתונים
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }
    
    // קריאת התגובה כטקסט
    const text = await response.text();
    
    // חילוץ ה-JSON מהתגובה (התגובה מגיעה בפורמט מיוחד)
    const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);$/)?.[1];
    
    if (!jsonText) {
      throw new Error('Invalid response format from Google Sheets');
    }
    
    // המרת הטקסט ל-JSON
    const json = JSON.parse(jsonText);
    
    // בדיקה אם יש שגיאה בתגובה
    if (json.status === 'error') {
      throw new Error(`Google Sheets API error: ${json.errors?.[0]?.message || 'Unknown error'}`);
    }
    
    // חילוץ הנתונים מהתגובה
    const columns = json.table.cols.map((col: any) => col.label || col.id);
    const rows = json.table.rows.map((row: any) => {
      const rowData: any = {};
      row.c.forEach((cell: any, index: number) => {
        const columnName = columns[index];
        rowData[columnName] = cell?.v !== undefined ? cell.v : null;
      });
      return rowData;
    });
    
    return { columns, rows };
  } catch (error: any) {
    console.error('Error fetching sheet data:', error);
    throw new Error(`Failed to fetch sheet data: ${error.message}`);
  }
}

/**
 * פונקציה לאימות תקינות של גיליון Google
 * @param spreadsheetId מזהה הגיליון
 * @returns האם הגיליון תקין ומכיל את כל הגיליונות הנדרשים
 */
export async function validateSpreadsheet(spreadsheetId: string): Promise<{ valid: boolean; message?: string }> {
  const requiredSheets = ['main_menu', 'pages', 'content', 'settings'];
  const missingSheets = [];
  
  try {
    // בדיקת כל אחד מהגיליונות הנדרשים
    for (const sheetName of requiredSheets) {
      try {
        await fetchSheetData(spreadsheetId, sheetName);
      } catch (error) {
        missingSheets.push(sheetName);
      }
    }
    
    if (missingSheets.length > 0) {
      return {
        valid: false,
        message: `הגיליון חסר את הגיליונות הבאים: ${missingSheets.join(', ')}`
      };
    }
    
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      message: `שגיאה באימות הגיליון: ${error.message}`
    };
  }
}

/**
 * פונקציה לקריאת כל הנתונים הנדרשים מגיליון Google
 * @param spreadsheetId מזהה הגיליון
 * @returns כל הנתונים מכל הגיליונות הנדרשים
 */
export async function fetchAllSheetData(spreadsheetId: string) {
  try {
    // קריאת כל הגיליונות במקביל
    const [mainMenu, pages, content, settings] = await Promise.all([
      fetchSheetData(spreadsheetId, 'main_menu'),
      fetchSheetData(spreadsheetId, 'pages'),
      fetchSheetData(spreadsheetId, 'content'),
      fetchSheetData(spreadsheetId, 'settings')
    ]);
    
    // המרת הגדרות לאובייקט
    const settingsObj = settings.rows.reduce((acc: any, row: any) => {
      if (row.key) {
        acc[row.key] = row.value;
      }
      return acc;
    }, {});
    
    return {
      mainMenu: mainMenu.rows,
      pages: pages.rows,
      content: content.rows,
      settings: settingsObj
    };
  } catch (error) {
    console.error('Error fetching all sheet data:', error);
    throw error;
  }
}

/**
 * פונקציה לשמירת נתוני אתר במטמון
 * @param siteId מזהה האתר
 * @param siteData נתוני האתר
 */
export async function cacheSiteData(siteId: string, siteData: any) {
  try {
    const supabase = createClient();
    
    // מחיקת נתוני מטמון קיימים
    await supabase
      .from('cache')
      .delete()
      .eq('site_id', siteId);
    
    // הכנת נתונים לשמירה במטמון
    const cacheEntries = [
      {
        site_id: siteId,
        sheet_name: 'main_menu',
        data: siteData.mainMenu,
        created_at: new Date().toISOString()
      },
      {
        site_id: siteId,
        sheet_name: 'pages',
        data: siteData.pages,
        created_at: new Date().toISOString()
      },
      {
        site_id: siteId,
        sheet_name: 'content',
        data: siteData.content,
        created_at: new Date().toISOString()
      },
      {
        site_id: siteId,
        sheet_name: 'settings',
        data: siteData.settings,
        created_at: new Date().toISOString()
      }
    ];
    
    // שמירת הנתונים במטמון
    const { error } = await supabase
      .from('cache')
      .insert(cacheEntries);
    
    if (error) {
      console.error('Error caching site data:', error);
    }
    
    // עדכון זמן עדכון אחרון של האתר
    await supabase
      .from('sites')
      .update({
        last_fetched: new Date().toISOString(),
        cache_version: (new Date()).getTime()
      })
      .eq('id', siteId);
      
    return true;
  } catch (error) {
    console.error('Error caching site data:', error);
    return false;
  }
}

/**
 * פונקציה לקבלת נתוני אתר ממטמון או מהגיליון
 * @param siteId מזהה האתר
 * @param spreadsheetId מזהה הגיליון
 * @param forceRefresh האם לרענן את המטמון
 */
export async function getSiteDataWithCache(siteId: string, spreadsheetId: string, forceRefresh = false) {
  const supabase = createClient();
  
  if (!forceRefresh) {
    // בדיקה אם יש נתונים במטמון
    const { data: cacheData, error: cacheError } = await supabase
      .from('cache')
      .select('*')
      .eq('site_id', siteId);
    
    if (!cacheError && cacheData && cacheData.length > 0) {
      // ארגון נתוני המטמון
      const mainMenu = cacheData.find(item => item.sheet_name === 'main_menu')?.data || [];
      const pages = cacheData.find(item => item.sheet_name === 'pages')?.data || [];
      const content = cacheData.find(item => item.sheet_name === 'content')?.data || [];
      const settings = cacheData.find(item => item.sheet_name === 'settings')?.data || {};
      
      return {
        mainMenu,
        pages,
        content,
        settings,
        fromCache: true
      };
    }
  }
  
  // אם אין נתונים במטמון או נדרש רענון, משוך ישירות מהגיליון
  try {
    const siteData = await fetchAllSheetData(spreadsheetId);
    
    // שמירת הנתונים במטמון
    await cacheSiteData(siteId, siteData);
    
    return {
      ...siteData,
      fromCache: false
    };
  } catch (error) {
    console.error('Error fetching data from spreadsheet:', error);
    throw error;
  }
} 