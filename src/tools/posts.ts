/**
 * WordPress Posts Tools
 * Complete post management functionality
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI } from '../utils/api.js';
import { formatPost, buildQueryString } from '../utils/helpers.js';
import type { CreatePostParams, UpdatePostParams } from '../types/wordpress.js';

/**
 * Register all post-related tools with the MCP server
 */
export function registerPostTools(server: any) {
  
  // Create Post
  server.tool('wordpress_create_post', async (args: any) => {
    const {
      title,
      content,
      status = 'draft',
      date,
      categories = [],
      tags = [],
      excerpt = '',
      featured_media,
      comment_status = 'open',
      ping_status = 'open',
      meta = {}
    } = args as CreatePostParams & Record<string, any>;

    try {
      const postData: any = {
        title,
        content,
        status,
        categories,
        tags,
        excerpt,
        comment_status,
        ping_status,
        meta
      };

      if (date) postData.date = date;
      if (featured_media) postData.featured_media = featured_media;

      const post = await callWordPressAPI('/posts', 'POST', postData);
      
      return Responses.success(formatPost(post), `✅ Created post: "${title}" (ID: ${post.id})`);
    } catch (error) {
      return Responses.error(`Failed to create post: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a new WordPress post with full control over all post properties',
    schema: {
      title: 'string',
      content: 'string'
    }
  });

  // Update Post
  server.tool('wordpress_update_post', async (args: any) => {
    const { postId, updates } = args as { postId: number; updates: UpdatePostParams };

    try {
      const post = await callWordPressAPI(`/posts/${postId}`, 'PUT', updates);
      return Responses.success(formatPost(post), `✅ Updated post ID ${postId}`);
    } catch (error) {
      return Responses.error(`Failed to update post: ${(error as Error).message}`);
    }
  }, {
    description: 'Update an existing post - can modify any post property',
    schema: {
      postId: 'number',
      updates: 'object'
    }
  });

  // Delete Post
  server.tool('wordpress_delete_post', async (args: any) => {
    const { postId, force = false } = args as { postId: number; force?: boolean };

    try {
      const endpoint = force ? `/posts/${postId}?force=true` : `/posts/${postId}`;
      await callWordPressAPI(endpoint, 'DELETE');
      
      return Responses.success(
        { id: postId, deleted: true, force },
        `✅ Deleted post ID ${postId}${force ? ' permanently' : ' (moved to trash)'}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete post: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a post. Set force=true to permanently delete, otherwise moves to trash',
    schema: {
      postId: 'number',
      force: 'boolean'
    }
  });

  // Get Posts
  server.tool('wordpress_get_posts', async (args: any) => {
    const {
      perPage = 10,
      page = 1,
      status = 'any',
      orderby = 'date',
      order = 'desc',
      search,
      author,
      categories,
      tags
    } = args as Record<string, any>;

    try {
      const params: Record<string, any> = {
        per_page: perPage,
        page,
        status,
        orderby,
        order
      };

      if (search) params.search = search;
      if (author) params.author = author;
      if (categories) params.categories = categories;
      if (tags) params.tags = tags;

      const queryString = buildQueryString(params);
      const posts = await callWordPressAPI(`/posts?${queryString}`);

      return Responses.success(
        {
          posts: posts.map(formatPost),
          count: posts.length,
          page,
          perPage
        },
        `📄 Retrieved ${posts.length} posts`
      );
    } catch (error) {
      return Responses.error(`Failed to get posts: ${(error as Error).message}`);
    }
  }, {
    description: 'Get posts with advanced filtering: search, author, categories, tags, status, ordering',
    schema: {
      perPage: 'number',
      page: 'number',
      status: 'string',
      orderby: 'string',
      order: 'string'
    }
  });

  // Get Single Post
  server.tool('wordpress_get_post', async (args: any) => {
    const { postId } = args as { postId: number };

    try {
      const post = await callWordPressAPI(`/posts/${postId}`);
      return Responses.success(formatPost(post), `📄 Retrieved post: "${post.title.rendered}"`);
    } catch (error) {
      return Responses.error(`Failed to get post: ${(error as Error).message}`);
    }
  }, {
    description: 'Get detailed information about a specific post by ID',
    schema: {
      postId: 'number'
    }
  });

  // Search Posts
  server.tool('wordpress_search_posts', async (args: any) => {
    const { query, perPage = 20 } = args as { query: string; perPage?: number };

    try {
      const queryString = buildQueryString({ search: query, per_page: perPage });
      const posts = await callWordPressAPI(`/posts?${queryString}`);

      return Responses.success(
        {
          query,
          posts: posts.map(formatPost),
          count: posts.length
        },
        `🔍 Found ${posts.length} posts matching "${query}"`
      );
    } catch (error) {
      return Responses.error(`Failed to search posts: ${(error as Error).message}`);
    }
  }, {
    description: 'Search posts by keyword - searches title, content, and excerpt',
    schema: {
      query: 'string',
      perPage: 'number'
    }
  });

  // Schedule Post
  server.tool('wordpress_schedule_post', async (args: any) => {
    const { postId, datetime } = args as { postId: number; datetime: string };

    try {
      const post = await callWordPressAPI(`/posts/${postId}`, 'PUT', {
        status: 'future',
        date: datetime
      });

      return Responses.success(
        {
          id: post.id,
          title: post.title.rendered,
          scheduledFor: datetime,
          status: 'scheduled'
        },
        `✅ Scheduled post "${post.title.rendered}" for ${datetime}`
      );
    } catch (error) {
      return Responses.error(`Failed to schedule post: ${(error as Error).message}`);
    }
  }, {
    description: 'Schedule a post for future publication. Date format: YYYY-MM-DDTHH:MM:SS',
    schema: {
      postId: 'number',
      datetime: 'string'
    }
  });

  // Publish Post
  server.tool('wordpress_publish_post', async (args: any) => {
    const { postId } = args as { postId: number };

    try {
      const post = await callWordPressAPI(`/posts/${postId}`, 'PUT', { status: 'publish' });
      
      return Responses.success(
        formatPost(post),
        `✅ Published post: "${post.title.rendered}"`
      );
    } catch (error) {
      return Responses.error(`Failed to publish post: ${(error as Error).message}`);
    }
  }, {
    description: 'Publish a draft or pending post immediately',
    schema: {
      postId: 'number'
    }
  });

  // Duplicate Post
  server.tool('wordpress_duplicate_post', async (args: any) => {
    const { postId, newTitle } = args as { postId: number; newTitle?: string };

    try {
      const originalPost = await callWordPressAPI(`/posts/${postId}`);
      
      const duplicateData = {
        title: newTitle || `${originalPost.title.rendered} (Copy)`,
        content: originalPost.content.rendered,
        excerpt: originalPost.excerpt.rendered,
        status: 'draft',
        categories: originalPost.categories,
        tags: originalPost.tags,
        featured_media: originalPost.featured_media
      };

      const newPost = await callWordPressAPI('/posts', 'POST', duplicateData);
      
      return Responses.success(
        formatPost(newPost),
        `✅ Duplicated post to "${newPost.title.rendered}" (ID: ${newPost.id})`
      );
    } catch (error) {
      return Responses.error(`Failed to duplicate post: ${(error as Error).message}`);
    }
  }, {
    description: 'Duplicate an existing post with optional new title',
    schema: {
      postId: 'number',
      newTitle: 'string'
    }
  });

  // Get Post Revisions
  server.tool('wordpress_get_post_revisions', async (args: any) => {
    const { postId } = args as { postId: number };

    try {
      const revisions = await callWordPressAPI(`/posts/${postId}/revisions`);
      
      return Responses.success(
        {
          postId,
          revisions: revisions.map((rev: any) => ({
            id: rev.id,
            date: rev.date,
            author: rev.author,
            title: rev.title.rendered,
            modified: rev.modified
          })),
          count: revisions.length
        },
        `📋 Retrieved ${revisions.length} revisions for post ${postId}`
      );
    } catch (error) {
      return Responses.error(`Failed to get revisions: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all revisions/edit history for a post',
    schema: {
      postId: 'number'
    }
  });

  // Bulk Create Posts
  server.tool('wordpress_bulk_create_posts', async (args: any) => {
    const { posts } = args as { posts: Array<CreatePostParams> };

    try {
      const results = await Promise.all(
        posts.map(post => callWordPressAPI('/posts', 'POST', {
          ...post,
          status: post.status || 'draft'
        }))
      );

      return Responses.success(
        {
          created: results.length,
          posts: results.map(formatPost)
        },
        `✅ Created ${results.length} posts in bulk`
      );
    } catch (error) {
      return Responses.error(`Bulk create failed: ${(error as Error).message}`);
    }
  }, {
    description: 'Create multiple posts in one operation - efficient for batch content generation',
    schema: {
      posts: 'array'
    }
  });

  // Bulk Update Posts
  server.tool('wordpress_bulk_update_posts', async (args: any) => {
    const { updates } = args as { updates: Array<{ postId: number; changes: UpdatePostParams }> };

    try {
      const results = await Promise.all(
        updates.map(({ postId, changes }) =>
          callWordPressAPI(`/posts/${postId}`, 'PUT', changes)
        )
      );

      return Responses.success(
        {
          updated: results.length,
          posts: results.map(formatPost)
        },
        `✅ Updated ${results.length} posts in bulk`
      );
    } catch (error) {
      return Responses.error(`Bulk update failed: ${(error as Error).message}`);
    }
  }, {
    description: 'Update multiple posts in one operation - efficient for batch modifications',
    schema: {
      updates: 'array'
    }
  });

  // Bulk Delete Posts
  server.tool('wordpress_bulk_delete_posts', async (args: any) => {
    const { postIds, force = false } = args as { postIds: number[]; force?: boolean };

    try {
      const results = await Promise.all(
        postIds.map(id => {
          const endpoint = force ? `/posts/${id}?force=true` : `/posts/${id}`;
          return callWordPressAPI(endpoint, 'DELETE');
        })
      );

      return Responses.success(
        {
          deleted: results.length,
          postIds,
          permanent: force
        },
        `✅ Deleted ${results.length} posts${force ? ' permanently' : ''}`
      );
    } catch (error) {
      return Responses.error(`Bulk delete failed: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete multiple posts in one operation',
    schema: {
      postIds: 'array',
      force: 'boolean'
    }
  });
}
