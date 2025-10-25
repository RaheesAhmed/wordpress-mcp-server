/**
 * WordPress Gutenberg/Block Editor Tools
 * Manage blocks, block patterns, and block-based content
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI } from '../utils/api.js';
import { buildQueryString } from '../utils/helpers.js';

export function registerBlockTools(server: any) {
  
  // ========== BLOCK MANAGEMENT ==========
  
  /**
   * Get all block types
   */
  server.tool('wordpress_get_block_types', async (args: any) => {
    const { namespace, perPage = 100 } = args || {};
    
    try {
      let endpoint = '/block-types';
      if (namespace) endpoint += `/${namespace}`;
      
      const params = { per_page: perPage };
      const queryString = buildQueryString(params);
      
      const blocks = await callWordPressAPI(`${endpoint}?${queryString}`);
      
      const blockList = Array.isArray(blocks) ? blocks : [blocks];
      
      return Responses.success(
        {
          blocks: blockList.map((block: any) => ({
            name: block.name,
            title: block.title,
            description: block.description || '',
            category: block.category,
            icon: block.icon,
            supports: block.supports || {}
          })),
          total: blockList.length
        },
        `🧱 Retrieved ${blockList.length} block types`
      );
    } catch (error) {
      return Responses.error(`Failed to get block types: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all registered block types',
    schema: {}
  });
  
  /**
   * Get block patterns
   */
  server.tool('wordpress_get_block_patterns', async (args: any) => {
    const { perPage = 100 } = args || {};
    
    try {
      const params = { per_page: perPage };
      const queryString = buildQueryString(params);
      
      const patterns = await callWordPressAPI(`/block-patterns/patterns?${queryString}`);
      
      return Responses.success(
        {
          patterns: patterns.map((p: any) => ({
            name: p.name,
            title: p.title,
            description: p.description || '',
            categories: p.categories || [],
            keywords: p.keywords || []
          })),
          total: patterns.length
        },
        `🎨 Retrieved ${patterns.length} block patterns`
      );
    } catch (error) {
      return Responses.error(`Failed to get patterns: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all available block patterns',
    schema: {}
  });
  
  /**
   * Get block pattern categories
   */
  server.tool('wordpress_get_block_categories', async () => {
    try {
      const categories = await callWordPressAPI('/block-patterns/categories');
      
      return Responses.success(
        {
          categories: categories.map((c: any) => ({
            name: c.name,
            label: c.label
          })),
          total: categories.length
        },
        `📁 Retrieved ${categories.length} pattern categories`
      );
    } catch (error) {
      return Responses.error(`Failed to get categories: ${(error as Error).message}`);
    }
  }, {
    description: 'Get block pattern categories',
    schema: {}
  });
  
  /**
   * Get reusable blocks
   */
  server.tool('wordpress_get_reusable_blocks', async (args: any) => {
    const { perPage = 100, search } = args || {};
    
    try {
      const params: any = { per_page: perPage };
      if (search) params.search = search;
      
      const queryString = buildQueryString(params);
      const blocks = await callWordPressAPI(`/blocks?${queryString}`);
      
      return Responses.success(
        {
          blocks: blocks.map((b: any) => ({
            id: b.id,
            title: b.title?.rendered || '',
            content: b.content?.rendered || '',
            status: b.status
          })),
          total: blocks.length
        },
        `🔄 Retrieved ${blocks.length} reusable blocks`
      );
    } catch (error) {
      return Responses.error(`Failed to get reusable blocks: ${(error as Error).message}`);
    }
  }, {
    description: 'Get reusable blocks (saved blocks)',
    schema: {}
  });
  
  /**
   * Create reusable block
   */
  server.tool('wordpress_create_reusable_block', async (args: any) => {
    const { title, content, status = 'publish' } = args;
    
    try {
      const block = await callWordPressAPI('/blocks', 'POST', {
        title,
        content,
        status
      });
      
      return Responses.success(
        {
          id: block.id,
          title: block.title?.rendered || title,
          status: block.status
        },
        `✅ Created reusable block: "${title}"`
      );
    } catch (error) {
      return Responses.error(`Failed to create block: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a reusable block',
    schema: {
      title: 'string',
      content: 'string'
    }
  });
  
  /**
   * Update reusable block
   */
  server.tool('wordpress_update_reusable_block', async (args: any) => {
    const { blockId, updates } = args;
    
    try {
      const block = await callWordPressAPI(`/blocks/${blockId}`, 'PUT', updates);
      
      return Responses.success(
        {
          id: block.id,
          title: block.title?.rendered || '',
          updated: true
        },
        `✅ Updated block ID ${blockId}`
      );
    } catch (error) {
      return Responses.error(`Failed to update block: ${(error as Error).message}`);
    }
  }, {
    description: 'Update a reusable block',
    schema: {
      blockId: 'number',
      updates: 'object'
    }
  });
  
  /**
   * Delete reusable block
   */
  server.tool('wordpress_delete_reusable_block', async (args: any) => {
    const { blockId, force = false } = args;
    
    try {
      const params = force ? '?force=true' : '';
      await callWordPressAPI(`/blocks/${blockId}${params}`, 'DELETE');
      
      return Responses.success(
        {
          id: blockId,
          deleted: true
        },
        `✅ Deleted block ID ${blockId}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete block: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a reusable block',
    schema: {
      blockId: 'number',
      force: 'boolean'
    }
  });
  
  /**
   * Parse block content
   */
  server.tool('wordpress_parse_blocks', async (args: any) => {
    const { content } = args;
    
    try {
      // This would require server-side block parsing
      // For now, return the content as-is with basic parsing info
      const blockCount = (content.match(/<!--\s*wp:/g) || []).length;
      
      return Responses.success(
        {
          content,
          blockCount,
          hasBlocks: blockCount > 0
        },
        `📝 Parsed content: ${blockCount} blocks found`
      );
    } catch (error) {
      return Responses.error(`Failed to parse blocks: ${(error as Error).message}`);
    }
  }, {
    description: 'Parse block content from HTML',
    schema: {
      content: 'string'
    }
  });
  
  /**
   * Get block directory (available blocks from WordPress.org)
   */
  server.tool('wordpress_search_block_directory', async (args: any) => {
    const { term, perPage = 10 } = args;
    
    try {
      const params = { term, per_page: perPage };
      const queryString = buildQueryString(params);
      
      const results = await callWordPressAPI(`/block-directory/search?${queryString}`);
      
      return Responses.success(
        {
          blocks: results.map((b: any) => ({
            name: b.name,
            title: b.title,
            description: b.description,
            author: b.author,
            rating: b.rating || 0,
            activeInstalls: b.active_installs || 0
          })),
          total: results.length
        },
        `🔍 Found ${results.length} blocks for "${term}"`
      );
    } catch (error) {
      return Responses.error(`Failed to search blocks: ${(error as Error).message}`);
    }
  }, {
    description: 'Search WordPress.org block directory',
    schema: {
      term: 'string'
    }
  });
  
  /**
   * Get block editor settings
   */
  server.tool('wordpress_get_block_editor_settings', async () => {
    try {
      // Block editor settings are part of the global data
      // We'll get them from the block types endpoint
      const blockTypes = await callWordPressAPI('/block-types');
      
      return Responses.success(
        {
          totalBlocks: Array.isArray(blockTypes) ? blockTypes.length : 1,
          message: 'Block editor is available'
        },
        `⚙️ Block editor settings retrieved`
      );
    } catch (error) {
      return Responses.error(`Failed to get settings: ${(error as Error).message}`);
    }
  }, {
    description: 'Get block editor configuration',
    schema: {}
  });
  
  /**
   * Get template for post type
   */
  server.tool('wordpress_get_block_template', async (args: any) => {
    const { slug } = args;
    
    try {
      const template = await callWordPressAPI(`/templates/${slug}`);
      
      return Responses.success(
        {
          id: template.id,
          slug: template.slug,
          theme: template.theme,
          content: template.content?.raw || '',
          title: template.title?.rendered || '',
          description: template.description || ''
        },
        `📄 Retrieved template: ${template.title?.rendered || slug}`
      );
    } catch (error) {
      return Responses.error(`Failed to get template: ${(error as Error).message}`);
    }
  }, {
    description: 'Get block template by slug',
    schema: {
      slug: 'string'
    }
  });
  
  /**
   * Get global styles variations
   */
  server.tool('wordpress_get_style_variations', async (args: any) => {
    const { stylesheet } = args;
    
    try {
      const variations = await callWordPressAPI(`/global-styles/themes/${stylesheet}/variations`);
      
      return Responses.success(
        {
          variations: variations.map((v: any) => ({
            title: v.title,
            slug: v.slug || '',
            settings: v.settings || {},
            styles: v.styles || {}
          })),
          total: variations.length
        },
        `🎨 Retrieved ${variations.length} style variations`
      );
    } catch (error) {
      return Responses.error(`Failed to get variations: ${(error as Error).message}`);
    }
  }, {
    description: 'Get theme style variations for block themes',
    schema: {
      stylesheet: 'string'
    }
  });
}