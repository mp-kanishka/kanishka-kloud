import mpPhotoData from '@/data/mp_photo_data.json';

// Import all MP images using Vite's glob import
const images = import.meta.glob<{ default: string }>('@/data/MP_Images/*.webp', { eager: true });

// Create a mapping of portrait filenames to their image URLs
export const mpImageMap: Record<string, string> = {
  'Ms_Diane_Abbott_Portrait.webp': 'Ms_Diane_Abbott_Portrait.webp',
  'Jack_Abbott_Portrait.webp': 'Jack_Abbott_Portrait.webp',
  'Debbie_Abrahams_Portrait.webp': 'Debbie_Abrahams_Portrait.webp',
  // ... add all other mappings
};

export const getMPImage = (mpName: string): string | null => {
  // Find the MP's portrait data
  const mpPhoto = mpPhotoData.find(photo => photo.name === mpName);
  if (!mpPhoto?.portrait_link) return null;
  
  // Construct the full path to the image
  const imagePath = `../data/MP_Images/${mpPhoto.portrait_link}`;
  
  // Get the image URL from our glob imports
  const image = images[imagePath];
  if (!image) {
    console.warn(`No image found for MP: ${mpName}`);
    return null;
  }
  
  return image.default;
}; 