import { REACT_APP_API_URL } from "./config";

export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath || imagePath.trim() === '') {
    return '/images/users/defaultUser.svg'; // Default fallback
  }

  const defaultImagePaths = [
    '/images/users/defaultUser.svg',
    '/img/profile/defaultUser.svg', // Legacy path
  ];

  if (defaultImagePaths.includes(imagePath)) {
    return imagePath;
  }

  // Already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const apiUrl = REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
  const baseUrl = apiUrl.replace(/\/$/, '');

  // Handle absolute paths (starting with /)
  if (imagePath.startsWith('/')) {
    const cleanPath = imagePath.replace(/^\//, '');
    return `${baseUrl}/${cleanPath}`;
  }

  // ✅ FIX: Handle relative paths (uploads/member/file.jpg, member/file.jpg, etc.)
  // These need API URL prepended
  return `${baseUrl}/${imagePath}`;
}