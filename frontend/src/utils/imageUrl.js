// Utility function to get the correct image URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://khalafiati.io';

export const getImageUrl = (path) => {
  if (!path) return null;

  // If path already includes http/https, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If path starts with /, prepend API base
  if (path.startsWith('/')) {
    return `${API_BASE}${path}`;
  }

  // Otherwise, prepend API base with /
  return `${API_BASE}/${path}`;
};

export const getAvatarUrl = (user) => {
  if (!user) return null;
  return getImageUrl(user.avatarUrl || user.avatar);
};

export const getCoverUrl = (user) => {
  if (!user) return null;
  return getImageUrl(user.coverImageUrl || user.coverImage);
};

export const getThumbnailUrl = (category) => {
  if (!category) return null;
  return getImageUrl(category.thumbnailUrl || category.thumbnail);
};
