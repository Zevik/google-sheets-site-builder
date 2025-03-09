import { useSiteSettings } from '@/lib/context';

export default function Footer() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return <div className="h-16 bg-gray-100 animate-pulse mt-auto"></div>;
  }

  const footerText = settings.footerText || '© כל הזכויות שמורות';
  const primaryColor = settings.primaryColor || '#3b82f6';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">
              {footerText} {currentYear}
            </p>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
                style={{ color: primaryColor }}
              >
                פייסבוק
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
                style={{ color: primaryColor }}
              >
                אינסטגרם
              </a>
            )}
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
                style={{ color: primaryColor }}
              >
                לינקדאין
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
} 