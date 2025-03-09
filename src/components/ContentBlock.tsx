import { ContentBlock as ContentBlockType } from '@/types';
import { useSiteSettings } from '@/lib/context';

interface ContentBlockProps {
  block: ContentBlockType;
}

export default function ContentBlock({ block }: ContentBlockProps) {
  const { settings } = useSiteSettings();
  const primaryColor = settings.primaryColor || '#3b82f6';
  const headingColor = settings.headingColor || primaryColor;

  // פונקציה להצגת תוכן HTML בצורה בטוחה
  const renderHTML = (html: string) => {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  switch (block.content_type) {
    case 'text':
      return (
        <div className="my-4">
          {renderHTML(block.content)}
        </div>
      );

    case 'title':
      const HeadingTag = (block.heading_level || 'h2') as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag 
          className="font-bold my-4" 
          style={{ color: headingColor }}
        >
          {block.content}
        </HeadingTag>
      );

    case 'image':
      return (
        <div className="my-6">
          <img 
            src={block.content} 
            alt={block.description || ''} 
            className="max-w-full h-auto rounded-lg shadow-md"
          />
          {block.description && (
            <p className="text-sm text-gray-500 mt-2">{block.description}</p>
          )}
        </div>
      );

    case 'youtube':
      // חילוץ מזהה הסרטון מה-URL
      const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };

      const videoId = getYouTubeId(block.content);
      
      return (
        <div className="my-6">
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-md">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={block.title || 'YouTube video'}
            ></iframe>
          </div>
          {block.title && (
            <p className="text-sm text-gray-500 mt-2">{block.title}</p>
          )}
        </div>
      );

    case 'link':
      return (
        <div className="my-4">
          <a 
            href={block.content}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            style={{ color: primaryColor }}
          >
            {block.title || block.content}
          </a>
        </div>
      );

    case 'list':
      const listItems = block.content.split('\n').filter(item => item.trim());
      
      return (
        <div className="my-4">
          {block.title && <h3 className="font-semibold mb-2">{block.title}</h3>}
          <ul className="list-disc list-inside space-y-1">
            {listItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case 'table':
      return (
        <div className="my-6 overflow-x-auto">
          {block.title && <h3 className="font-semibold mb-2">{block.title}</h3>}
          <div className="border rounded-lg">
            {renderHTML(block.content)}
          </div>
        </div>
      );

    case 'separator':
      return (
        <hr className="my-6 border-t border-gray-200" />
      );

    case 'file':
      return (
        <div className="my-4">
          <a 
            href={block.content}
            download
            className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out"
            style={{ backgroundColor: primaryColor }}
          >
            {block.title || 'הורד קובץ'}
          </a>
          {block.description && (
            <p className="text-sm text-gray-500 mt-2">{block.description}</p>
          )}
        </div>
      );

    default:
      return null;
  }
} 