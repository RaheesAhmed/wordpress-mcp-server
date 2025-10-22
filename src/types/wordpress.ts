/**
 * WordPress Type Definitions
 * Comprehensive types for WordPress REST API
 */

export interface WordPressSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
  namespaces: string[];
  authentication: Record<string, any>;
  routes: Record<string, any>;
}

export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
}

export interface WordPressPage {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  template: string;
}

export interface WordPressMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  author: number;
  caption: { rendered: string };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: Record<string, any>;
  };
  source_url: string;
}

export interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
}

export interface WordPressTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WordPressUser {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  url: string;
  description: string;
  link: string;
  locale: string;
  nickname: string;
  slug: string;
  roles: string[];
  capabilities: Record<string, boolean>;
  avatar_urls: Record<string, string>;
}

export interface WordPressComment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_email: string;
  author_url: string;
  date: string;
  content: { rendered: string };
  link: string;
  status: string;
  type: string;
}

export interface WordPressPlugin {
  plugin: string;
  status: 'inactive' | 'active';
  name: string;
  plugin_uri: string;
  author: string;
  author_uri: string;
  description: { raw: string; rendered: string };
  version: string;
  network_only: boolean;
  requires_wp: string;
  requires_php: string;
  textdomain: string;
}

export interface WordPressTheme {
  stylesheet: string;
  template: string;
  author: string;
  author_uri: string;
  description: { raw: string; rendered: string };
  version: string;
  name: { raw: string; rendered: string };
  tags: { raw: string[]; rendered: string };
  theme_uri: string;
  status: 'inactive' | 'active';
}

export interface WordPressMenu {
  term_id: number;
  name: string;
  slug: string;
  term_group: number;
  term_taxonomy_id: number;
  taxonomy: string;
  description: string;
  parent: number;
  count: number;
}

export interface WordPressMenuItem {
  id: number;
  title: { rendered: string };
  status: string;
  url: string;
  attr_title: string;
  description: string;
  type: string;
  type_label: string;
  object: string;
  object_id: number;
  parent: number;
  menu_order: number;
  target: string;
  classes: string[];
  xfn: string[];
  invalid: boolean;
  menus: number[];
}

export interface WordPressSettings {
  title: string;
  description: string;
  url: string;
  email: string;
  timezone: string;
  date_format: string;
  time_format: string;
  start_of_week: number;
  language: string;
  use_smilies: boolean;
  default_category: number;
  default_post_format: string;
  posts_per_page: number;
  default_ping_status: 'open' | 'closed';
  default_comment_status: 'open' | 'closed';
}

export interface CreatePostParams {
  title: string;
  content: string;
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  date?: string;
  categories?: number[];
  tags?: number[];
  excerpt?: string;
  featured_media?: number;
  comment_status?: 'open' | 'closed';
  ping_status?: 'open' | 'closed';
  meta?: Record<string, any>;
}

export interface UpdatePostParams {
  title?: string;
  content?: string;
  status?: string;
  categories?: number[];
  tags?: number[];
  excerpt?: string;
  featured_media?: number;
  comment_status?: string;
  ping_status?: string;
  meta?: Record<string, any>;
}
