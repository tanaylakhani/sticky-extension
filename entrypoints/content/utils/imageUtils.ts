export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    // Handle Cloudinary URLs
    if (url.includes('cloudinary.com')) {
      const matches = url.match(/\/v\d+\/([^/]+)\./);
      return matches ? matches[1] : null;
    }

    // Handle other URLs or return null if can't extract
    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};