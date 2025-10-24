/**
 * WordPress Custom Post Types & Taxonomies Tools
 * Register and manage custom content types
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI } from '../utils/api.js';

export function registerCustomPostTypeTools(server: any) {
  
  // ========== POST TYPES ==========
  
  /**
   * Get all post types
   */
  server.tool('wordpress_get_post_types', async (args: any) => {
    const { context = 'view' } = args || {};
    
    try {
      const postTypes = await callWordPressAPI(`/types?context=${context}`);
      
      const types = Object.entries(postTypes).map(([slug, data]: [string, any]) => ({
        slug,
        name: data.name || slug,
        description: data.description || '',
        hierarchical: data.hierarchical || false,
        hasArchive: data.has_archive || false,
        public: data.public !== undefined ? data.public : true,
        showInRest: data.show_in_rest !== undefined ? data.show_in_rest : true,
        supports: data.supports || [],
        taxonomies: data.taxonomies || []
      }));
      
      return Responses.success(
        {
          postTypes: types,
          total: types.length
        },
        `📝 Retrieved ${types.length} post types`
      );
    } catch (error) {
      return Responses.error(`Failed to get post types: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all registered post types',
    schema: {}
  });
  
  /**
   * Get specific post type details
   */
  server.tool('wordpress_get_post_type', async (args: any) => {
    const { postType } = args;
    
    try {
      const data = await callWordPressAPI(`/types/${postType}`);
      
      return Responses.success(
        {
          slug: data.slug || postType,
          name: data.name || '',
          description: data.description || '',
          hierarchical: data.hierarchical || false,
          hasArchive: data.has_archive || false,
          restBase: data.rest_base || postType,
          supports: data.supports || [],
          taxonomies: data.taxonomies || [],
          labels: data.labels || {}
        },
        `ℹ️ Post type: ${data.name}`
      );
    } catch (error) {
      return Responses.error(`Failed to get post type: ${(error as Error).message}`);
    }
  }, {
    description: 'Get details for a specific post type',
    schema: {
      postType: 'string'
    }
  });
  
  // ========== TAXONOMIES ==========
  
  /**
   * Get all taxonomies
   */
  server.tool('wordpress_get_taxonomies', async (args: any) => {
    const { context = 'view', type } = args || {};
    
    try {
      let endpoint = `/taxonomies?context=${context}`;
      if (type) endpoint += `&type=${type}`;
      
      const taxonomies = await callWordPressAPI(endpoint);
      
      const taxs = Object.entries(taxonomies).map(([slug, data]: [string, any]) => ({
        slug,
        name: data.name || slug,
        description: data.description || '',
        hierarchical: data.hierarchical || false,
        public: data.public !== undefined ? data.public : true,
        showInRest: data.show_in_rest !== undefined ? data.show_in_rest : true,
        types: data.types || []
      }));
      
      return Responses.success(
        {
          taxonomies: taxs,
          total: taxs.length
        },
        `🏷️ Retrieved ${taxs.length} taxonomies`
      );
    } catch (error) {
      return Responses.error(`Failed to get taxonomies: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all registered taxonomies',
    schema: {}
  });
  
  /**
   * Get specific taxonomy details
   */
  server.tool('wordpress_get_taxonomy', async (args: any) => {
    const { taxonomy } = args;
    
    try {
      const data = await callWordPressAPI(`/taxonomies/${taxonomy}`);
      
      return Responses.success(
        {
          slug: data.slug || taxonomy,
          name: data.name || '',
          description: data.description || '',
          hierarchical: data.hierarchical || false,
          restBase: data.rest_base || taxonomy,
          types: data.types || [],
          labels: data.labels || {}
        },
        `ℹ️ Taxonomy: ${data.name}`
      );
    } catch (error) {
      return Responses.error(`Failed to get taxonomy: ${(error as Error).message}`);
    }
  }, {
    description: 'Get details for a specific taxonomy',
    schema: {
      taxonomy: 'string'
    }
  });
  
  /**
   * Get terms from a taxonomy
   */
  server.tool('wordpress_get_terms', async (args: any) => {
    const { taxonomy, perPage = 100, hideEmpty = false, parent, search } = args;
    
    try {
      const params: any = {
        per_page: perPage,
        hide_empty: hideEmpty
      };
      
      if (parent !== undefined) params.parent = parent;
      if (search) params.search = search;
      
      // Map taxonomy to correct endpoint (WordPress uses plural forms)
      const endpointMap: Record<string, string> = {
        'category': 'categories',
        'post_tag': 'tags',
        'nav_menu': 'menus'
      };
      
      const endpoint = endpointMap[taxonomy] || taxonomy;
      const queryParams = new URLSearchParams(params).toString();
      const terms = await callWordPressAPI(`/${endpoint}?${queryParams}`);
      
      return Responses.success(
        {
          taxonomy,
          terms: terms.map((term: any) => ({
            id: term.id,
            name: term.name,
            slug: term.slug,
            description: term.description || '',
            count: term.count || 0,
            parent: term.parent || 0,
            link: term.link || ''
          })),
          total: terms.length
        },
        `🏷️ Retrieved ${terms.length} terms from ${taxonomy}`
      );
    } catch (error) {
      return Responses.error(`Failed to get terms: ${(error as Error).message}`);
    }
  }, {
    description: 'Get terms from a taxonomy (categories, tags, or custom)',
    schema: {
      taxonomy: 'string'
    }
  });
  
  /**
   * Create term in taxonomy
   */
  server.tool('wordpress_create_term', async (args: any) => {
    const { taxonomy, name, description = '', slug, parent } = args;
    
    try {
      // Map taxonomy to correct endpoint
      const endpointMap: Record<string, string> = {
        'category': 'categories',
        'post_tag': 'tags',
        'nav_menu': 'menus'
      };
      
      const endpoint = endpointMap[taxonomy] || taxonomy;
      
      const termData: any = { name, description };
      if (slug) termData.slug = slug;
      if (parent) termData.parent = parent;
      
      const term = await callWordPressAPI(`/${endpoint}`, 'POST', termData);
      
      return Responses.success(
        {
          id: term.id,
          taxonomy,
          name: term.name,
          slug: term.slug
        },
        `✅ Created ${taxonomy} term: "${name}"`
      );
    } catch (error) {
      return Responses.error(`Failed to create term: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a new term in a taxonomy',
    schema: {
      taxonomy: 'string',
      name: 'string'
    }
  });
  
  /**
   * Update term
   */
  server.tool('wordpress_update_term', async (args: any) => {
    const { taxonomy, termId, updates } = args;
    
    try {
      const endpointMap: Record<string, string> = {
        'category': 'categories',
        'post_tag': 'tags',
        'nav_menu': 'menus'
      };
      
      const endpoint = endpointMap[taxonomy] || taxonomy;
      const term = await callWordPressAPI(`/${endpoint}/${termId}`, 'PUT', updates);
      
      return Responses.success(
        {
          id: term.id,
          name: term.name,
          slug: term.slug
        },
        `✅ Updated ${taxonomy} term ID ${termId}`
      );
    } catch (error) {
      return Responses.error(`Failed to update term: ${(error as Error).message}`);
    }
  }, {
    description: 'Update a term in a taxonomy',
    schema: {
      taxonomy: 'string',
      termId: 'number',
      updates: 'object'
    }
  });
  
  /**
   * Delete term
   */
  server.tool('wordpress_delete_term', async (args: any) => {
    const { taxonomy, termId, force = false } = args;
    
    try {
      const endpointMap: Record<string, string> = {
        'category': 'categories',
        'post_tag': 'tags',
        'nav_menu': 'menus'
      };
      
      const endpointName = endpointMap[taxonomy] || taxonomy;
      const endpoint = force ? `/${endpointName}/${termId}?force=true` : `/${endpointName}/${termId}`;
      await callWordPressAPI(endpoint, 'DELETE');
      
      return Responses.success(
        {
          taxonomy,
          id: termId,
          deleted: true
        },
        `✅ Deleted ${taxonomy} term ID ${termId}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete term: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a term from a taxonomy',
    schema: {
      taxonomy: 'string',
      termId: 'number',
      force: 'boolean'
    }
  });
}