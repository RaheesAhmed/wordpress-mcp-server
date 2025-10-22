/**
 * Helper Functions
 * Utility functions used across the application
 */

/**
 * Format WordPress object for response
 */
export function formatPost(post: any) {
  return {
    id: post.id,
    title: post.title?.rendered || post.title,
    content: post.content?.rendered || post.content,
    excerpt: post.excerpt?.rendered || post.excerpt,
    url: post.link,
    status: post.status,
    date: post.date,
    modified: post.modified,
    author: post.author,
    categories: post.categories || [],
    tags: post.tags || [],
    featured_media: post.featured_media || 0
  };
}

/**
 * Format WordPress page for response
 */
export function formatPage(page: any) {
  return {
    id: page.id,
    title: page.title?.rendered || page.title,
    content: page.content?.rendered || page.content,
    url: page.link,
    status: page.status,
    date: page.date,
    modified: page.modified,
    parent: page.parent || 0,
    menu_order: page.menu_order || 0,
    template: page.template || ''
  };
}

/**
 * Format media object for response
 */
export function formatMedia(media: any) {
  return {
    id: media.id,
    title: media.title?.rendered || media.title,
    url: media.source_url,
    alt_text: media.alt_text || '',
    caption: media.caption?.rendered || media.caption || '',
    media_type: media.media_type,
    mime_type: media.mime_type,
    date: media.date,
    width: media.media_details?.width || 0,
    height: media.media_details?.height || 0
  };
}

/**
 * Format user object for response (safe - no passwords)
 */
export function formatUser(user: any) {
  return {
    id: user.id,
    username: user.username || user.slug,
    name: user.name,
    email: user.email,
    roles: user.roles || [],
    url: user.url || '',
    description: user.description || '',
    avatar_urls: user.avatar_urls || {}
  };
}

/**
 * Format comment for response
 */
export function formatComment(comment: any) {
  return {
    id: comment.id,
    post: comment.post,
    author_name: comment.author_name,
    author_email: comment.author_email,
    content: comment.content?.rendered || comment.content,
    date: comment.date,
    status: comment.status,
    parent: comment.parent || 0
  };
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}
