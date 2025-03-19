// Import all MP images
const images = import.meta.glob('/src/data/MP_Images/*.webp', {
  eager: true,
  as: 'url'
});

export const getImageUrl = (imagePath: string): string | null => {
  const fullPath = `/src/data/MP_Images/${imagePath}`;
  return images[fullPath] || null;
}; 