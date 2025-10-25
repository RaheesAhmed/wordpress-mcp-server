/**
 * WordPress Media Tools
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI, uploadMediaFile, callCustomAPI } from '../utils/api.js';
import { formatMedia, buildQueryString } from '../utils/helpers.js';

export function registerMediaTools(server: any) {
  
  server.tool('wordpress_upload_media', async (args: any) => {
    const { fileBase64, filename, altText = '', caption = '' } = args;

    try {
      const media = await uploadMediaFile(fileBase64, filename);

      if (altText || caption) {
        const updateData: any = {};
        if (altText) updateData.alt_text = altText;
        if (caption) updateData.caption = caption;
        await callWordPressAPI(`/media/${media.id}`, 'PUT', updateData);
      }

      return Responses.success(formatMedia(media), `✅ Uploaded: ${filename}`);
    } catch (error) {
      return Responses.error(`Failed to upload media: ${(error as Error).message}`);
    }
  }, {
    description: 'Upload image or file to WordPress media library (provide base64 encoded file)',
    schema: { fileBase64: 'string', filename: 'string' }
  });

  server.tool('wordpress_get_media', async (args: any) => {
    const { perPage = 20, page = 1, mediaType } = args;

    try {
      const params: any = { per_page: perPage, page };
      if (mediaType) params.media_type = mediaType;
      
      const queryString = buildQueryString(params);
      const media = await callWordPressAPI(`/media?${queryString}`);

      return Responses.success(
        { media: media.map(formatMedia), count: media.length },
        `🖼️ Retrieved ${media.length} media files`
      );
    } catch (error) {
      return Responses.error(`Failed to get media: ${(error as Error).message}`);
    }
  }, {
    description: 'Get media library files with filtering by type',
    schema: { perPage: 'number', page: 'number' }
  });

  server.tool('wordpress_update_media', async (args: any) => {
    const { mediaId, altText, caption, title } = args;

    try {
      const updateData: any = {};
      if (altText) updateData.alt_text = altText;
      if (caption) updateData.caption = caption;
      if (title) updateData.title = title;

      const media = await callWordPressAPI(`/media/${mediaId}`, 'PUT', updateData);
      return Responses.success(formatMedia(media), `✅ Updated media ID ${mediaId}`);
    } catch (error) {
      return Responses.error(`Failed to update media: ${(error as Error).message}`);
    }
  }, {
    description: 'Update media file metadata (alt text, caption, title)',
    schema: { mediaId: 'number' }
  });

  server.tool('wordpress_delete_media', async (args: any) => {
    const { mediaId, force = false } = args;

    try {
      const endpoint = force ? `/media/${mediaId}?force=true` : `/media/${mediaId}`;
      await callWordPressAPI(endpoint, 'DELETE');
      return Responses.success({ id: mediaId, deleted: true }, `✅ Deleted media ID ${mediaId}`);
    } catch (error) {
      return Responses.error(`Failed to delete media: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a media file from library',
    schema: { mediaId: 'number', force: 'boolean' }
  });

  server.tool('wordpress_set_featured_image', async (args: any) => {
    const { postId, mediaId } = args;

    try {
      await callWordPressAPI(`/posts/${postId}`, 'PUT', { featured_media: mediaId });
      return Responses.success({ postId, mediaId }, `✅ Set featured image for post ${postId}`);
    } catch (error) {
      return Responses.error(`Failed to set featured image: ${(error as Error).message}`);
    }
  }, {
    description: 'Set featured image (thumbnail) for a post',
    schema: { postId: 'number', mediaId: 'number' }
  });
  
  // ========== ADVANCED MEDIA TOOLS ==========
  
  /**
   * Bulk optimize images
   */
  server.tool('wordpress_bulk_optimize_images', async (args: any) => {
    const { limit = 10 } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/media/optimize-bulk', 'POST', { limit });
      
      return Responses.success(
        {
          optimized: result.count || 0,
          savedSpace: result.saved || '0 MB'
        },
        `✅ Optimized ${result.count || 0} images`
      );
    } catch (error) {
      return Responses.error(`Failed to optimize images: ${(error as Error).message}`);
    }
  }, {
    description: 'Bulk optimize images (compress all images)',
    schema: {}
  });
  
  /**
   * Convert images to WebP
   */
  server.tool('wordpress_convert_to_webp', async (args: any) => {
    const { mediaId } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/media/convert-webp', 'POST', { mediaId });
      
      return Responses.success(
        {
          mediaId,
          webpUrl: result.url || '',
          converted: true
        },
        `✅ Converted image ${mediaId} to WebP`
      );
    } catch (error) {
      return Responses.error(`Failed to convert to WebP: ${(error as Error).message}`);
    }
  }, {
    description: 'Convert image to WebP format',
    schema: {
      mediaId: 'number'
    }
  });
  
  /**
   * Find unused media
   */
  server.tool('wordpress_get_unused_media', async (args: any) => {
    const { limit = 50 } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/media/unused', 'GET');
      
      return Responses.success(
        {
          unusedMedia: (result.media || []).slice(0, limit),
          total: result.total || 0
        },
        `📊 Found ${result.total || 0} unused media files`
      );
    } catch (error) {
      return Responses.error(`Failed to find unused media: ${(error as Error).message}`);
    }
  }, {
    description: 'Find unused media files in library',
    schema: {}
  });
  
  /**
   * Bulk delete media
   */
  server.tool('wordpress_bulk_delete_media', async (args: any) => {
    const { mediaIds } = args;
    
    try {
      const results = await Promise.all(
        mediaIds.map((id: number) => callWordPressAPI(`/media/${id}?force=true`, 'DELETE'))
      );
      
      return Responses.success(
        {
          deleted: results.length,
          mediaIds
        },
        `✅ Deleted ${results.length} media files`
      );
    } catch (error) {
      return Responses.error(`Failed to bulk delete: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete multiple media files',
    schema: {
      mediaIds: 'array'
    }
  });
  
  /**
   * Get media storage analytics
   */
  server.tool('wordpress_get_media_analytics', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/media/analytics', 'GET');
      
      return Responses.success(
        {
          totalFiles: result.total || 0,
          totalSize: result.size || '0 MB',
          byType: result.byType || {}
        },
        `📊 Media analytics retrieved`
      );
    } catch (error) {
      return Responses.error(`Failed to get analytics: ${(error as Error).message}`);
    }
  }, {
    description: 'Get media library storage usage statistics',
    schema: {}
  });
}
