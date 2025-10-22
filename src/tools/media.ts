/**
 * WordPress Media Tools
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI, uploadMediaFile } from '../utils/api.js';
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
}
