
import React from 'react';
import { Grid, Download, Trash2, Video, Image as ImageIcon, FileText } from 'lucide-react';
import { LanguageCode, UserProfile, GalleryItem } from '../types';
import { t } from '../constants';
import { Card } from './Common';

interface Props {
  language: LanguageCode;
  user: UserProfile | null;
}

const GalleryView: React.FC<Props> = ({ language, user }) => {
  const items = user?.gallery || [];

  const handleDownload = (item: GalleryItem) => {
      let href = item.content;
      let download = `saved-${item.id}`;

      if (item.type === 'text') {
          // Create Blob for text content
          const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' });
          href = URL.createObjectURL(blob);
          download += '.txt';
      } else if (item.type === 'image') {
          download += '.png';
      } else if (item.type === 'video') {
          download += '.mp4';
      }

      // Create temporary link to trigger download
      const link = document.createElement('a');
      link.href = href;
      link.download = download;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-4xl font-black text-black mb-6 border-b-4 border-pink-500 pb-3">
        {t(language, 'gallery_title')}
      </h2>

      {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
              <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">{t(language, 'gallery_empty')}</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...items].reverse().map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 group hover:shadow-2xl transition-shadow">
                      <div className="aspect-square bg-gray-100 relative">
                          {item.type === 'image' && <img src={item.content} alt={item.title} className="w-full h-full object-cover" />}
                          {item.type === 'video' && <video src={item.content} className="w-full h-full object-cover" controls />}
                          {item.type === 'text' && (
                              <div className="p-6 h-full flex items-center justify-center text-center bg-pink-50 overflow-hidden">
                                  <p className="font-serif text-gray-800 line-clamp-6">{item.content}</p>
                              </div>
                          )}
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1">
                              {item.type === 'video' && <Video size={12} />}
                              {item.type === 'image' && <ImageIcon size={12} />}
                              {item.type === 'text' && <FileText size={12} />}
                              {item.type}
                          </div>
                      </div>
                      <div className="p-4">
                          <p className="text-sm text-gray-500 mb-1">{item.date}</p>
                          <h4 className="font-bold text-lg text-black mb-4 truncate">{item.title}</h4>
                          <button
                            onClick={() => handleDownload(item)}
                            className="block w-full py-2 bg-pink-600 text-white text-center rounded-lg font-bold hover:bg-pink-700 transition flex items-center justify-center gap-2"
                          >
                              <Download size={16} /> Download
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default GalleryView;
