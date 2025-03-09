# מערכת אתר דינמי מבוסס Google Sheets

מערכת זו מאפשרת יצירת אתר דינמי המשתמש ב-Google Sheets כמסד נתונים. המערכת מאפשרת לבעל האתר ליצור ולנהל דפים באמצעות פאנל ניהול ייעודי, ללא צורך באימות משתמשים כלליים.

## תכונות עיקריות

- שימוש ב-Google Sheets כמסד נתונים דינמי
- פאנל ניהול לבעל האתר בלבד
- תמיכה בסוגי תוכן מגוונים: טקסט, כותרות, תמונות, סרטוני YouTube, קישורים, רשימות, טבלאות, קווים מפרידים וקבצים להורדה
- תמיכה מלאה בעברית ובכיוון טקסט מימין לשמאל (RTL)
- עיצוב מותאם אישית באמצעות הגדרות האתר
- בניית דפים סטטיים בזמן בנייה לביצועים מהירים
- תמיכה בפריסה ב-Netlify

## מבנה Google Sheets

המערכת משתמשת בגיליון Google Sheets עם הגיליונות הבאים:

1. **main_menu** - תפריט ראשי (תיקיות/קטגוריות)
2. **pages** - דפים
3. **content** - בלוקי תוכן
4. **settings** - הגדרות האתר
5. **templates** - תבניות (אופציונלי)

### מבנה הגיליונות

#### main_menu (תפריט ראשי)
- **id** - מזהה ייחודי לתיקייה
- **folder_name** - שם התיקייה
- **display_order** - סדר תצוגה (בסדר עולה)
- **active** - האם התיקייה פעילה (yes/no)
- **slug** - מזהה URL ידידותי לתיקייה (ללא רווחים)
- **short_description** - תיאור קצר של התיקייה

#### pages (דפים)
- **id** - מזהה ייחודי לדף
- **folder_id** - מזהה התיקייה אליה שייך הדף (תואם ל-id ב-main_menu)
- **page_name** - שם הדף
- **display_order** - סדר תצוגה בתוך התיקייה (בסדר עולה)
- **active** - האם הדף פעיל (yes/no)
- **slug** - מזהה URL ידידותי לדף (ללא רווחים)
- **meta_description** - תיאור מטא עבור SEO
- **seo_title** - כותרת SEO

#### content (בלוקי תוכן)
- **id** - מזהה ייחודי לבלוק תוכן
- **page_id** - מזהה הדף אליו שייך בלוק התוכן (תואם ל-id ב-pages)
- **content_type** - סוג התוכן. ערכים מותרים: text, title, image, youtube, link, list, table, separator, file
- **display_order** - סדר תצוגה של הבלוק (בסדר עולה)
- **content** - התוכן שיוצג (HTML מותר)
- **description** - תיאור (למשל, טקסט חלופי לתמונה)
- **title** - כותרת לבלוק התוכן
- **heading_level** - רמת כותרת (למשל, h1, h2, h3, וכו') עבור סוגי תוכן מסוג title
- **active** - האם בלוק התוכן פעיל (yes/no)

#### settings (הגדרות האתר)
- **key** - מפתח ההגדרה
- **value** - ערך ההגדרה

דוגמאות להגדרות:
- **siteName** - שם האתר
- **logo** - URL של לוגו האתר
- **footerText** - טקסט בפוטר
- **primaryColor** - צבע ראשי (#HEX)
- **secondaryColor** - צבע משני (#HEX)
- **language** - שפת האתר (למשל, he, en)
- **rtl** - האם האתר הוא RTL (TRUE/FALSE)
- **contentSpacing** - מרווח בין אלמנטי תוכן (בפיקסלים)
- **pageBackground** - צבע רקע של הדף (#HEX)
- **headingColor** - צבע לכותרות (#HEX)
- **cardBackground** - צבע רקע לכרטיסים (#HEX)
- **cardBorderRadius** - רדיוס שוליים לכרטיסים (בפיקסלים)
- **pageWidth** - רוחב הדף (באחוזים)

#### templates (תבניות - אופציונלי)
- **id** - מזהה ייחודי לתבנית
- **template_name** - שם התבנית
- **description** - תיאור התבנית

## התקנה

1. צור גיליון Google Sheets עם הגיליונות הנדרשים
2. הגדר את מזהה הגיליון בקובץ `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_SHEET_ID=your_google_sheet_id_here
   ADMIN_PASSWORD=your_admin_password_here
   ```
3. התקן את התלויות:
   ```
   npm install
   ```
4. הרץ את האפליקציה בסביבת פיתוח:
   ```
   npm run dev
   ```
5. בנה את האפליקציה לייצור:
   ```
   npm run build
   ```

## פריסה ב-Netlify

1. העלה את הקוד ל-GitHub
2. צור חשבון ב-Netlify
3. חבר את המאגר ל-Netlify
4. הגדר את משתני הסביבה הבאים ב-Netlify:
   - `NEXT_PUBLIC_GOOGLE_SHEET_ID`
   - `ADMIN_PASSWORD`
5. הגדר את פקודת הבנייה ל-`npm run build`
6. הגדר את תיקיית הפריסה ל-`.next`

## גישה לפאנל הניהול

גש לנתיב `/admin` באתר והזן את הסיסמה שהגדרת ב-`ADMIN_PASSWORD` כדי לגשת לפאנל הניהול.

## טכנולוגיות

- Next.js
- TypeScript
- Tailwind CSS
- Google Sheets API
- React Icons
- SWR

## רישיון

MIT
