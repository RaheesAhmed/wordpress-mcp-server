/**
 * WordPress Menu Management Tools
 * Create, update, and manage WordPress navigation menus
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI } from '../utils/api.js';
import { buildQueryString } from '../utils/helpers.js';

export function registerMenuTools(server: any) {
  
  // ========== MENU MANAGEMENT ==========
  
  /**
   * Get all menus
   */
  server.tool('wordpress_get_menus', async (args: any) => {
    const { perPage = 100 } = args || {};
    
    try {
      const params = { per_page: perPage };
      const queryString = buildQueryString(params);
      const menus = await callWordPressAPI(`/menus?${queryString}`);
      
      return Responses.success(
        {
          menus: menus.map((menu: any) => ({
            id: menu.id,
            name: menu.name,
            slug: menu.slug,
            description: menu.description || '',
            count: menu.count || 0,
            locations: menu.locations || []
          })),
          total: menus.length
        },
        `🧭 Retrieved ${menus.length} menus`
      );
    } catch (error) {
      return Responses.error(`Failed to get menus: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all navigation menus',
    schema: {}
  });
  
  /**
   * Create menu
   */
  server.tool('wordpress_create_menu', async (args: any) => {
    const { name, description = '', slug } = args;
    
    try {
      const menuData: any = { name, description };
      if (slug) menuData.slug = slug;
      
      const menu = await callWordPressAPI('/menus', 'POST', menuData);
      
      return Responses.success(
        {
          id: menu.id,
          name: menu.name,
          slug: menu.slug
        },
        `✅ Created menu: "${name}"`
      );
    } catch (error) {
      return Responses.error(`Failed to create menu: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a new navigation menu',
    schema: {
      name: 'string'
    }
  });
  
  /**
   * Delete menu
   */
  server.tool('wordpress_delete_menu', async (args: any) => {
    const { menuId, force = true } = args;
    
    try {
      const endpoint = force ? `/menus/${menuId}?force=true` : `/menus/${menuId}`;
      await callWordPressAPI(endpoint, 'DELETE');
      
      return Responses.success(
        {
          id: menuId,
          deleted: true
        },
        `✅ Deleted menu ID ${menuId}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete menu: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a navigation menu',
    schema: {
      menuId: 'number',
      force: 'boolean'
    }
  });
  
  /**
   * Get menu items
   */
  server.tool('wordpress_get_menu_items', async (args: any) => {
    const { menuId, perPage = 100 } = args || {};
    
    try {
      const params: any = { per_page: perPage };
      if (menuId) params.menus = menuId;
      
      const queryString = buildQueryString(params);
      const items = await callWordPressAPI(`/menu-items?${queryString}`);
      
      return Responses.success(
        {
          items: items.map((item: any) => ({
            id: item.id,
            title: item.title?.rendered || '',
            url: item.url || '',
            type: item.type || '',
            objectId: item.object_id || 0,
            parent: item.parent || 0,
            menuOrder: item.menu_order || 0,
            target: item.target || '',
            classes: item.classes || []
          })),
          total: items.length
        },
        `📋 Retrieved ${items.length} menu items${menuId ? ` for menu ${menuId}` : ''}`
      );
    } catch (error) {
      return Responses.error(`Failed to get menu items: ${(error as Error).message}`);
    }
  }, {
    description: 'Get menu items from a specific menu or all menus',
    schema: {}
  });
  
  /**
   * Create menu item
   */
  server.tool('wordpress_create_menu_item', async (args: any) => {
    const {
      title,
      url,
      menus,
      parent = 0,
      type = 'custom',
      objectId = 0,
      menuOrder,
      target = '',
      classes = []
    } = args;
    
    try {
      const itemData: any = {
        title,
        menus,
        type,
        parent,
        url: url || '#'
      };
      
      if (objectId) itemData.object_id = objectId;
      if (menuOrder && menuOrder > 0) itemData.menu_order = menuOrder;
      if (target) itemData.target = target;
      if (classes.length > 0) itemData.classes = classes;
      
      const item = await callWordPressAPI('/menu-items', 'POST', itemData);
      
      return Responses.success(
        {
          id: item.id,
          title: item.title?.rendered || title,
          menuOrder: item.menu_order
        },
        `✅ Created menu item: "${title}"`
      );
    } catch (error) {
      return Responses.error(`Failed to create menu item: ${(error as Error).message}`);
    }
  }, {
    description: 'Add an item to a navigation menu',
    schema: {
      title: 'string',
      menus: 'number'
    }
  });
  
  /**
   * Update menu item
   */
  server.tool('wordpress_update_menu_item', async (args: any) => {
    const { itemId, updates } = args;
    
    try {
      const item = await callWordPressAPI(`/menu-items/${itemId}`, 'PUT', updates);
      
      return Responses.success(
        {
          id: item.id,
          title: item.title?.rendered || '',
          updated: true
        },
        `✅ Updated menu item ID ${itemId}`
      );
    } catch (error) {
      return Responses.error(`Failed to update menu item: ${(error as Error).message}`);
    }
  }, {
    description: 'Update a menu item (title, URL, order, etc.)',
    schema: {
      itemId: 'number',
      updates: 'object'
    }
  });
  
  /**
   * Delete menu item
   */
  server.tool('wordpress_delete_menu_item', async (args: any) => {
    const { itemId, force = true } = args;
    
    try {
      const endpoint = force ? `/menu-items/${itemId}?force=true` : `/menu-items/${itemId}`;
      await callWordPressAPI(endpoint, 'DELETE');
      
      return Responses.success(
        {
          id: itemId,
          deleted: true
        },
        `✅ Deleted menu item ID ${itemId}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete menu item: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a menu item',
    schema: {
      itemId: 'number',
      force: 'boolean'
    }
  });
  
  /**
   * Get menu locations
   */
  server.tool('wordpress_get_menu_locations', async () => {
    try {
      const locations = await callWordPressAPI('/menu-locations');
      
      return Responses.success(
        {
          locations: Object.entries(locations).map(([key, value]: [string, any]) => ({
            location: key,
            name: value.name || key,
            description: value.description || '',
            menu: value.menu || null
          })),
          total: Object.keys(locations).length
        },
        `📍 Retrieved ${Object.keys(locations).length} menu locations`
      );
    } catch (error) {
      return Responses.error(`Failed to get menu locations: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all registered menu locations in the active theme',
    schema: {}
  });
  
  /**
   * Assign menu to location
   */
  server.tool('wordpress_assign_menu_to_location', async (args: any) => {
    const { location, menuId } = args;
    
    try {
      await callWordPressAPI(`/menu-locations/${location}`, 'PUT', {
        menu: menuId
      });
      
      return Responses.success(
        {
          location,
          menuId,
          assigned: true
        },
        `✅ Assigned menu ${menuId} to location "${location}"`
      );
    } catch (error) {
      return Responses.error(`Failed to assign menu: ${(error as Error).message}`);
    }
  }, {
    description: 'Assign a menu to a theme location',
    schema: {
      location: 'string',
      menuId: 'number'
    }
  });
}