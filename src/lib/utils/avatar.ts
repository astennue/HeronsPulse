// Avatar utility functions for HeronPulse Academic OS

/**
 * Generate a default avatar URL using UI Avatars service
 * This creates an avatar based on the user's initials
 */
export function generateDefaultAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&bold=true&format=svg`;
}

/**
 * Get initials from a name
 * Returns up to 2 characters representing the name's initials
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get avatar URL for display
 * Returns the avatar URL if provided, otherwise generates a default avatar
 */
export function getAvatarUrl(avatarUrl: string | null | undefined, name: string | null | undefined): string {
  if (avatarUrl) return avatarUrl;
  return generateDefaultAvatar(name || 'User');
}

/**
 * Check if an avatar URL is a default generated avatar
 */
export function isDefaultAvatar(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('https://ui-avatars.com/api/');
}

/**
 * User data interface for avatar components
 */
export interface UserAvatarData {
  name?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
}
