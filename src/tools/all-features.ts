/**
 * WordPress All Features Tools
 * Users, Taxonomy, Comments, Site Management, Plugins, Themes, Settings
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI, callWordPressRootAPI } from '../utils/api.js';
import { formatUser, formatComment, buildQueryString } from '../utils/helpers.js';
import type { WordPressSiteInfo } from '../types/wordpress.js';

export function registerAllFeatureTools(server: any) {
  
  // ========== USERS ==========
  
  server.tool('wordpress_create_user', async (args: any) => {
    const { username, email, password, roles = ['subscriber'], name } = args;

    try {
      const user = await callWordPressAPI('/users', 'POST', { username, email, password, roles, name });
      return Responses.success(formatUser(user), `✅ Created user: ${username}`);
    } catch (error) {
      return Responses.error(`Failed to create user: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a new WordPress user with roles',
    schema: { username: 'string', email: 'string', password: 'string' }
  });

  server.tool('wordpress_get_users', async (args: any) => {
    const { perPage = 10, page = 1, roles, search } = args;

    try {
      const params: any = { per_page: perPage, page };
      if (roles) params.roles = roles;
      if (search) params.search = search;

      const queryString = buildQueryString(params);
      const users = await callWordPressAPI(`/users?${queryString}`);

      return Responses.success(
        { users: users.map(formatUser), count: users.length },
        `👥 Retrieved ${users.length} users`
      );
    } catch (error) {
      return Responses.error(`Failed to get users: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WordPress users with role filtering',
    schema: { perPage: 'number', page: 'number' }
  });

  server.tool('wordpress_update_user', async (args: any) => {
    const { userId, updates } = args;

    try {
      const user = await callWordPressAPI(`/users/${userId}`, 'PUT', updates);
      return Responses.success(formatUser(user), `✅ Updated user ID ${userId}`);
    } catch (error) {
      return Responses.error(`Failed to update user: ${(error as Error).message}`);
    }
  }, {
    description: 'Update user information (name, email, roles, password)',
    schema: { userId: 'number', updates: 'object' }
  });

  server.tool('wordpress_delete_user', async (args: any) => {
    const { userId, reassign } = args;

    try {
      const endpoint = reassign ? `/users/${userId}?reassign=${reassign}&force=true` : `/users/${userId}?force=true`;
      await callWordPressAPI(endpoint, 'DELETE');
      return Responses.success({ id: userId, deleted: true }, `✅ Deleted user ID ${userId}`);
    } catch (error) {
      return Responses.error(`Failed to delete user: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a user (reassign their content to another user)',
    schema: { userId: 'number', reassign: 'number' }
  });

  // ========== CATEGORIES ==========

  server.tool('wordpress_create_category', async (args: any) => {
    const { name, description = '', parent = 0, slug } = args;

    try {
      const categoryData: any = { name, description, parent };
      if (slug) categoryData.slug = slug;

      const category = await callWordPressAPI('/categories', 'POST', categoryData);
      return Responses.success(
        { id: category.id, name: category.name, slug: category.slug, parent: category.parent },
        `✅ Created category: "${name}"`
      );
    } catch (error) {
      return Responses.error(`Failed to create category: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a new category with hierarchical support',
    schema: { name: 'string' }
  });

  server.tool('wordpress_get_categories', async (args: any) => {
    const { perPage = 100, parent, hideEmpty = false } = args || {};

    try {
      const params: any = { per_page: perPage, hide_empty: hideEmpty };
      if (parent !== undefined) params.parent = parent;

      const queryString = buildQueryString(params);
      const categories = await callWordPressAPI(`/categories?${queryString}`);

      return Responses.success(
        {
          categories: categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: cat.count,
            parent: cat.parent
          })),
          total: categories.length
        },
        `📁 Retrieved ${categories.length} categories`
      );
    } catch (error) {
      return Responses.error(`Failed to get categories: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all categories with hierarchy',
    schema: {}
  });

  server.tool('wordpress_update_category', async (args: any) => {
    const { categoryId, updates } = args;

    try {
      const category = await callWordPressAPI(`/categories/${categoryId}`, 'PUT', updates);
      return Responses.success({ id: category.id, name: category.name }, `✅ Updated category ID ${categoryId}`);
    } catch (error) {
      return Responses.error(`Failed to update category: ${(error as Error).message}`);
    }
  }, {
    description: 'Update category name, description, or parent',
    schema: { categoryId: 'number', updates: 'object' }
  });

  server.tool('wordpress_delete_category', async (args: any) => {
    const { categoryId, force = false } = args;

    try {
      const endpoint = force ? `/categories/${categoryId}?force=true` : `/categories/${categoryId}`;
      await callWordPressAPI(endpoint, 'DELETE');
      return Responses.success({ id: categoryId, deleted: true }, `✅ Deleted category ID ${categoryId}`);
    } catch (error) {
      return Responses.error(`Failed to delete category: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a category',
    schema: { categoryId: 'number', force: 'boolean' }
  });

  // ========== TAGS ==========

  server.tool('wordpress_create_tag', async (args: any) => {
    const { name, description = '', slug } = args;

    try {
      const tagData: any = { name, description };
      if (slug) tagData.slug = slug;

      const tag = await callWordPressAPI('/tags', 'POST', tagData);
      return Responses.success(
        { id: tag.id, name: tag.name, slug: tag.slug },
        `✅ Created tag: "${name}"`
      );
    } catch (error) {
      return Responses.error(`Failed to create tag: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a new tag',
    schema: { name: 'string' }
  });

  server.tool('wordpress_get_tags', async (args: any) => {
    const { perPage = 100, hideEmpty = false } = args || {};

    try {
      const params: any = { per_page: perPage, hide_empty: hideEmpty };
      const queryString = buildQueryString(params);
      const tags = await callWordPressAPI(`/tags?${queryString}`);

      return Responses.success(
        {
          tags: tags.map((tag: any) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            count: tag.count
          })),
          total: tags.length
        },
        `🏷️ Retrieved ${tags.length} tags`
      );
    } catch (error) {
      return Responses.error(`Failed to get tags: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all tags',
    schema: {}
  });

  // ========== COMMENTS ==========

  server.tool('wordpress_create_comment', async (args: any) => {
    const { postId, content, author, authorEmail } = args;

    try {
      const commentData: any = { post: postId, content };
      if (author) commentData.author_name = author;
      if (authorEmail) commentData.author_email = authorEmail;

      const comment = await callWordPressAPI('/comments', 'POST', commentData);
      return Responses.success(formatComment(comment), `✅ Created comment on post ${postId}`);
    } catch (error) {
      return Responses.error(`Failed to create comment: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a comment on a post',
    schema: { postId: 'number', content: 'string' }
  });

  server.tool('wordpress_get_comments', async (args: any) => {
    const { postId, perPage = 10, status = 'approve' } = args;

    try {
      const params: any = { per_page: perPage, status };
      if (postId) params.post = postId;

      const queryString = buildQueryString(params);
      const comments = await callWordPressAPI(`/comments?${queryString}`);

      return Responses.success(
        { comments: comments.map(formatComment), count: comments.length },
        `💬 Retrieved ${comments.length} comments`
      );
    } catch (error) {
      return Responses.error(`Failed to get comments: ${(error as Error).message}`);
    }
  }, {
    description: 'Get comments with filtering by post and status',
    schema: { perPage: 'number' }
  });

  server.tool('wordpress_update_comment', async (args: any) => {
    const { commentId, status, content } = args;

    try {
      const updates: any = {};
      if (status) updates.status = status;
      if (content) updates.content = content;

      const comment = await callWordPressAPI(`/comments/${commentId}`, 'PUT', updates);
      return Responses.success(formatComment(comment), `✅ Updated comment ID ${commentId}`);
    } catch (error) {
      return Responses.error(`Failed to update comment: ${(error as Error).message}`);
    }
  }, {
    description: 'Update comment (approve, spam, trash, edit content)',
    schema: { commentId: 'number' }
  });

  server.tool('wordpress_delete_comment', async (args: any) => {
    const { commentId, force = false } = args;

    try {
      const endpoint = force ? `/comments/${commentId}?force=true` : `/comments/${commentId}`;
      await callWordPressAPI(endpoint, 'DELETE');
      return Responses.success({ id: commentId, deleted: true }, `✅ Deleted comment ID ${commentId}`);
    } catch (error) {
      return Responses.error(`Failed to delete comment: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a comment',
    schema: { commentId: 'number', force: 'boolean' }
  });

  // ========== SITE & SETTINGS ==========

  server.tool('wordpress_get_site_info', async () => {
    try {
      const siteInfo = await callWordPressRootAPI() as WordPressSiteInfo;

      return Responses.success(
        {
          name: siteInfo.name,
          description: siteInfo.description,
          url: siteInfo.url,
          homeUrl: siteInfo.home,
          gmtOffset: siteInfo.gmt_offset,
          timezoneString: siteInfo.timezone_string,
          namespaces: siteInfo.namespaces,
          authentication: siteInfo.authentication,
          routes: Object.keys(siteInfo.routes || {})
        },
        `ℹ️ Site: ${siteInfo.name}`
      );
    } catch (error) {
      return Responses.error(`Failed to get site info: ${(error as Error).message}`);
    }
  }, {
    description: 'Get complete WordPress site information including available API routes',
    schema: {}
  });

  server.tool('wordpress_test_connection', async () => {
    try {
      const user = await callWordPressAPI('/users/me');

      return Responses.success(
        {
          connected: true,
          user: formatUser(user)
        },
        `✅ Connected as ${user.name}`
      );
    } catch (error) {
      return Responses.error(`Connection test failed: ${(error as Error).message}`);
    }
  }, {
    description: 'Test WordPress connection and authentication',
    schema: {}
  });

  server.tool('wordpress_get_settings', async () => {
    try {
      const settings = await callWordPressAPI('/settings');

      return Responses.success(
        {
          title: settings.title,
          description: settings.description,
          url: settings.url,
          email: settings.email,
          timezone: settings.timezone,
          dateFormat: settings.date_format,
          timeFormat: settings.time_format,
          language: settings.language,
          postsPerPage: settings.posts_per_page
        },
        `⚙️ Retrieved site settings`
      );
    } catch (error) {
      return Responses.error(`Failed to get settings: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WordPress site settings',
    schema: {}
  });

  server.tool('wordpress_update_settings', async (args: any) => {
    const updates = args;

    try {
      const settings = await callWordPressAPI('/settings', 'PUT', updates);
      return Responses.success(settings, `✅ Updated site settings`);
    } catch (error) {
      return Responses.error(`Failed to update settings: ${(error as Error).message}`);
    }
  }, {
    description: 'Update site settings (title, description, timezone, etc)',
    schema: {}
  });

  server.tool('wordpress_get_plugins', async () => {
    try {
      const plugins = await callWordPressAPI('/plugins');

      return Responses.success(
        {
          plugins: plugins.map((plugin: any) => ({
            plugin: plugin.plugin,
            status: plugin.status,
            name: plugin.name,
            version: plugin.version,
            author: plugin.author,
            description: plugin.description?.rendered || ''
          })),
          total: plugins.length
        },
        `🔌 Retrieved ${plugins.length} plugins`
      );
    } catch (error) {
      return Responses.error(`Failed to get plugins: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all installed WordPress plugins',
    schema: {}
  });

  server.tool('wordpress_get_themes', async () => {
    try {
      const themes = await callWordPressAPI('/themes');

      return Responses.success(
        {
          themes: themes.map((theme: any) => ({
            stylesheet: theme.stylesheet,
            name: theme.name?.rendered || theme.stylesheet,
            version: theme.version,
            author: theme.author,
            status: theme.status
          })),
          total: themes.length
        },
        `🎨 Retrieved ${themes.length} themes`
      );
    } catch (error) {
      return Responses.error(`Failed to get themes: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all installed WordPress themes',
    schema: {}
  });

  // SEO Meta
  server.tool('wordpress_set_seo_meta', async (args: any) => {
    const {
      postId,
      metaDescription,
      focusKeyword,
      canonicalUrl,
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription
    } = args;

    try {
      const meta: Record<string, any> = {};

      if (metaDescription) meta._yoast_wpseo_metadesc = metaDescription;
      if (focusKeyword) meta._yoast_wpseo_focuskw = focusKeyword;
      if (canonicalUrl) meta._yoast_wpseo_canonical = canonicalUrl;
      if (ogTitle) meta._yoast_wpseo_opengraph_title = ogTitle;
      if (ogDescription) meta._yoast_wpseo_opengraph_description = ogDescription;
      if (twitterTitle) meta._yoast_wpseo_twitter_title = twitterTitle;
      if (twitterDescription) meta._yoast_wpseo_twitter_description = twitterDescription;

      await callWordPressAPI(`/posts/${postId}`, 'PUT', { meta });

      return Responses.success(
        { postId, metaFieldsSet: Object.keys(meta) },
        `✅ Set SEO metadata for post ${postId}`
      );
    } catch (error) {
      return Responses.error(`Failed to set SEO meta: ${(error as Error).message}`);
    }
  }, {
    description: 'Set SEO metadata (Yoast SEO, Rank Math, All-in-One SEO compatible)',
    schema: { postId: 'number' }
  });

  server.tool('wordpress_set_custom_meta', async (args: any) => {
    const { postId, metaKey, metaValue } = args;

    try {
      const meta: Record<string, any> = {};
      meta[metaKey] = metaValue;

      await callWordPressAPI(`/posts/${postId}`, 'PUT', { meta });

      return Responses.success(
        { postId, metaKey, metaValue, set: true },
        `✅ Set custom meta "${metaKey}" for post ${postId}`
      );
    } catch (error) {
      return Responses.error(`Failed to set custom meta: ${(error as Error).message}`);
    }
  }, {
    description: 'Set custom post metadata field - useful for custom fields and plugins',
    schema: { postId: 'number', metaKey: 'string', metaValue: 'string' }
  });
}
