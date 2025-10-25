/**
 * WordPress Advanced SEO Tools
 * Comprehensive SEO management for WordPress sites
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI, callCustomAPI } from '../utils/api.js';

function calculateSEOScore(analysis: any): number {
  let score = 0;
  if (analysis.hasTitle) score += 15;
  if (analysis.hasContent) score += 15;
  if (analysis.hasExcerpt) score += 10;
  if (analysis.hasFeaturedImage) score += 10;
  if (analysis.hasCategories) score += 10;
  if (analysis.hasTags) score += 10;
  if (analysis.titleLength >= 30 && analysis.titleLength <= 60) score += 15;
  if (analysis.contentLength >= 300) score += 15;
  return score;
}

export function registerSEOTools(server: any) {
  
  // ========== SITEMAP MANAGEMENT ==========
  
  /**
   * Generate XML sitemap
   */
  server.tool('wordpress_generate_sitemap', async () => {
    try {
      // WordPress 5.5+ has built-in sitemaps
      const sitemapUrl = await callCustomAPI('wp-json/wpmcp/v1/seo/generate-sitemap', 'POST');
      
      return Responses.success(
        {
          url: sitemapUrl.url || '/wp-sitemap.xml',
          generated: true
        },
        `✅ Sitemap generated`
      );
    } catch (error) {
      return Responses.error(`Failed to generate sitemap: ${(error as Error).message}`);
    }
  }, {
    description: 'Generate XML sitemap for search engines',
    schema: {}
  });
  
  /**
   * Get robots.txt content
   */
  server.tool('wordpress_get_robots_txt', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/seo/robots-txt', 'GET');
      
      return Responses.success(
        {
          content: result.content || '',
          exists: result.exists || false
        },
        result.exists ? `📄 Robots.txt content retrieved` : `❌ Robots.txt not found`
      );
    } catch (error) {
      return Responses.error(`Failed to get robots.txt: ${(error as Error).message}`);
    }
  }, {
    description: 'Get robots.txt file content',
    schema: {}
  });
  
  /**
   * Update robots.txt content
   */
  server.tool('wordpress_update_robots_txt', async (args: any) => {
    const { content } = args;
    
    try {
      await callCustomAPI('wp-json/wpmcp/v1/seo/robots-txt', 'POST', { content });
      
      return Responses.success(
        {
          updated: true
        },
        `✅ Robots.txt updated`
      );
    } catch (error) {
      return Responses.error(`Failed to update robots.txt: ${(error as Error).message}`);
    }
  }, {
    description: 'Update robots.txt file content',
    schema: {
      content: 'string'
    }
  });
  
  // ========== REDIRECTS ==========
  
  /**
   * Create redirect
   */
  server.tool('wordpress_create_redirect', async (args: any) => {
    const { source, destination, type = 301 } = args;
    
    try {
      await callCustomAPI('wp-json/wpmcp/v1/seo/redirect', 'POST', {
        source,
        destination,
        type
      });
      
      return Responses.success(
        {
          source,
          destination,
          type,
          created: true
        },
        `✅ Created ${type} redirect: ${source} → ${destination}`
      );
    } catch (error) {
      return Responses.error(`Failed to create redirect: ${(error as Error).message}`);
    }
  }, {
    description: 'Create URL redirect (301, 302, 307)',
    schema: {
      source: 'string',
      destination: 'string'
    }
  });
  
  /**
   * Get all redirects
   */
  server.tool('wordpress_get_redirects', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/seo/redirects', 'GET');
      
      return Responses.success(
        {
          redirects: result.redirects || [],
          total: result.total || 0
        },
        `🔀 Retrieved ${result.total || 0} redirects`
      );
    } catch (error) {
      return Responses.error(`Failed to get redirects: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all URL redirects',
    schema: {}
  });
  
  /**
   * Delete redirect
   */
  server.tool('wordpress_delete_redirect', async (args: any) => {
    const { redirectId } = args;
    
    try {
      await callCustomAPI(`wp-json/wpmcp/v1/seo/redirect/${redirectId}`, 'DELETE');
      
      return Responses.success(
        {
          id: redirectId,
          deleted: true
        },
        `✅ Deleted redirect ID ${redirectId}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete redirect: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete URL redirect',
    schema: {
      redirectId: 'number'
    }
  });
  
  // ========== META TAGS & SCHEMA ==========
  
  /**
   * Set Open Graph tags
   */
  server.tool('wordpress_set_og_tags', async (args: any) => {
    const { postId, ogTitle, ogDescription, ogImage, ogType = 'article' } = args;
    
    try {
      const meta: Record<string, any> = {};
      
      if (ogTitle) meta._yoast_wpseo_opengraph_title = ogTitle;
      if (ogDescription) meta._yoast_wpseo_opengraph_description = ogDescription;
      if (ogImage) meta._yoast_wpseo_opengraph_image = ogImage;
      if (ogType) meta._yoast_wpseo_opengraph_type = ogType;
      
      await callWordPressAPI(`/posts/${postId}`, 'PUT', { meta });
      
      return Responses.success(
        {
          postId,
          fields: Object.keys(meta)
        },
        `✅ Set Open Graph tags for post ${postId}`
      );
    } catch (error) {
      return Responses.error(`Failed to set OG tags: ${(error as Error).message}`);
    }
  }, {
    description: 'Set Open Graph meta tags for social sharing',
    schema: {
      postId: 'number'
    }
  });
  
  /**
   * Set Twitter Card tags
   */
  server.tool('wordpress_set_twitter_cards', async (args: any) => {
    const { postId, twitterTitle, twitterDescription, twitterImage, cardType = 'summary_large_image' } = args;
    
    try {
      const meta: Record<string, any> = {};
      
      if (twitterTitle) meta._yoast_wpseo_twitter_title = twitterTitle;
      if (twitterDescription) meta._yoast_wpseo_twitter_description = twitterDescription;
      if (twitterImage) meta._yoast_wpseo_twitter_image = twitterImage;
      if (cardType) meta._yoast_wpseo_twitter_card_type = cardType;
      
      await callWordPressAPI(`/posts/${postId}`, 'PUT', { meta });
      
      return Responses.success(
        {
          postId,
          fields: Object.keys(meta)
        },
        `✅ Set Twitter Card tags for post ${postId}`
      );
    } catch (error) {
      return Responses.error(`Failed to set Twitter cards: ${(error as Error).message}`);
    }
  }, {
    description: 'Set Twitter Card meta tags for social sharing',
    schema: {
      postId: 'number'
    }
  });
  
  /**
   * Set canonical URL
   */
  server.tool('wordpress_set_canonical_url', async (args: any) => {
    const { postId, canonicalUrl } = args;
    
    try {
      await callWordPressAPI(`/posts/${postId}`, 'PUT', {
        meta: {
          _yoast_wpseo_canonical: canonicalUrl
        }
      });
      
      return Responses.success(
        {
          postId,
          canonicalUrl
        },
        `✅ Set canonical URL for post ${postId}`
      );
    } catch (error) {
      return Responses.error(`Failed to set canonical: ${(error as Error).message}`);
    }
  }, {
    description: 'Set canonical URL for post',
    schema: {
      postId: 'number',
      canonicalUrl: 'string'
    }
  });
  
  /**
   * Set schema markup
   */
  server.tool('wordpress_set_schema_markup', async (args: any) => {
    const { postId, schemaType, schemaData } = args;
    
    try {
      const schema = {
        '@context': 'https://schema.org',
        '@type': schemaType,
        ...schemaData
      };
      
      await callWordPressAPI(`/posts/${postId}`, 'PUT', {
        meta: {
          _wpmcp_schema_markup: JSON.stringify(schema)
        }
      });
      
      return Responses.success(
        {
          postId,
          schemaType,
          schema
        },
        `✅ Set ${schemaType} schema for post ${postId}`
      );
    } catch (error) {
      return Responses.error(`Failed to set schema: ${(error as Error).message}`);
    }
  }, {
    description: 'Add JSON-LD schema markup to post',
    schema: {
      postId: 'number',
      schemaType: 'string',
      schemaData: 'object'
    }
  });
  
  /**
   * Analyze SEO for post
   */
  server.tool('wordpress_analyze_seo', async (args: any) => {
    const { postId } = args;
    
    try {
      const post = await callWordPressAPI(`/posts/${postId}`);
      
      const analysis = {
        hasTitle: !!post.title?.rendered,
        hasContent: !!post.content?.rendered,
        hasExcerpt: !!post.excerpt?.rendered,
        hasFeaturedImage: !!post.featured_media,
        hasCategories: post.categories?.length > 0,
        hasTags: post.tags?.length > 0,
        titleLength: post.title?.rendered?.length || 0,
        contentLength: post.content?.rendered?.length || 0
      };
      
      return Responses.success(
        {
          postId,
          analysis,
          score: calculateSEOScore(analysis)
        },
        `📊 SEO analysis for post ${postId}`
      );
    } catch (error) {
      return Responses.error(`Failed to analyze SEO: ${(error as Error).message}`);
    }
  }, {
    description: 'Analyze SEO elements for a post',
    schema: {
      postId: 'number'
    }
  });
}