import { REACT_APP_API_URL } from "./config";

export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '/images/users/defaultUser.svg'; // Default fallback
  }

  /*
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  */

  // If starts with /, it's a backend path - prepend API URL
  if (imagePath.startsWith('/')) {
    const apiUrl = REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
    // Remove trailing slash from API URL if present
    const baseUrl = apiUrl.replace(/\/$/, '');
    // Remove leading slash from image path if present
    const cleanPath = imagePath.replace(/^\//, '');
    return `${baseUrl}/${cleanPath}`;
  }

  // Otherwise, assume it's a public folder path
  return imagePath;
}