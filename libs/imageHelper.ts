import { REACT_APP_API_URL } from "./config";

export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '/images/users/defaultUser.svg'; // Default fallback
  }

  const defaultImagePaths = [
    '/images/users/defaultUser.svg',
  ];

  if (defaultImagePaths.includes(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/')) {
    const apiUrl = REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
    const baseUrl = apiUrl.replace(/\/$/, '');
    const cleanPath = imagePath.replace(/^\//, '');
    return `${baseUrl}/${cleanPath}`;
  }

  return imagePath;
}