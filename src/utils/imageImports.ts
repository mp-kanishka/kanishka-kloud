import mpPhotoData from '@/data/mp_photo_data.json';

// Import all MP images using Vite's glob import
const images = import.meta.glob<{ default: string }>('@/data/MP_Images/*.webp', { eager: true });

// Create a mapping of portrait filenames to their image URLs
export const mpImageMap: Record<string, string> = Object.fromEntries(
  Object.entries(images).map(([path, module]) => [
    path.split('/').pop() || '',
    module.default
  ])
);

export const getMPImage = (mpName: string): string | null => {
  const mpPhoto = mpPhotoData.find(photo => photo.name === mpName);
  if (!mpPhoto?.portrait_link) return null;
  
  // Get the image URL from our glob imports
  return mpImageMap[mpPhoto.portrait_link] || null;
}; 