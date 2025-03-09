import Link from 'next/link';
import { useFolders, useSiteSettings } from '@/lib/context';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const { folders, loading: foldersLoading } = useFolders();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (foldersLoading || settingsLoading) {
    return <div className="h-16 bg-gray-100 animate-pulse"></div>;
  }

  const siteName = settings.siteName || 'אתר דינמי';
  const logoUrl = settings.logo || '';
  const primaryColor = settings.primaryColor || '#3b82f6';

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {logoUrl ? (
              <Link href="/" className="flex items-center">
                <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
              </Link>
            ) : (
              <Link href="/" className="text-xl font-bold" style={{ color: primaryColor }}>
                {siteName}
              </Link>
            )}
          </div>

          {/* תפריט למסך רחב */}
          <nav className="hidden md:flex space-x-8 space-x-reverse">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/${folder.slug}`}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-150 ease-in-out"
              >
                {folder.folder_name}
              </Link>
            ))}
          </nav>

          {/* כפתור תפריט למובייל */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* תפריט מובייל */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
              {folders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/${folder.slug}`}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition duration-150 ease-in-out"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {folder.folder_name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 