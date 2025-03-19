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

// Fallback image URL (can be a data URL or a default image)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU1RTUiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjIwIj48L3RleHQ+PC9zdmc+';

export const getMPImage = (mpName: string): string => {
  const mpPhoto = mpPhotoData.find(photo => photo.name === mpName);
  if (!mpPhoto?.portrait_link) return FALLBACK_IMAGE;
  
  // Return the image URL from the public directory
  return `/assets/images/${mpPhoto.portrait_link}`;
}; 