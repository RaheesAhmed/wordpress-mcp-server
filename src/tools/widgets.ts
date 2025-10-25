/**
 * WordPress Widget Management Tools
 * Manage WordPress widgets and sidebars
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI, callCustomAPI } from '../utils/api.js';

export function registerWidgetTools(server: any) {
  
  // ========== WIDGET MANAGEMENT ==========
  
  /**
   * Get all sidebars (widget areas)
   */
  server.tool('wordpress_get_sidebars', async () => {
    try {
      const sidebars = await callWordPressAPI('/sidebars');
      
      return Responses.success(
        {
          sidebars: sidebars.map((sidebar: any) => ({
            id: sidebar.id,
            name: sidebar.name,
            description: sidebar.description || '',
            class: sidebar.class || '',
            widgets: sidebar.widgets || []
          })),
          total: sidebars.length
        },
        `📦 Retrieved ${sidebars.length} widget areas`
      );
    } catch (error) {
      return Responses.error(`Failed to get sidebars: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all registered sidebar/widget areas',
    schema: {}
  });
  
  /**
   * Get specific sidebar details
   */
  server.tool('wordpress_get_sidebar', async (args: any) => {
    const { id } = args;
    
    try {
      const sidebar = await callWordPressAPI(`/sidebars/${id}`);
      
      return Responses.success(
        {
          id: sidebar.id,
          name: sidebar.name,
          description: sidebar.description || '',
          widgets: sidebar.widgets || []
        },
        `📦 Retrieved sidebar: ${sidebar.name}`
      );
    } catch (error) {
      return Responses.error(`Failed to get sidebar: ${(error as Error).message}`);
    }
  }, {
    description: 'Get details for a specific sidebar',
    schema: {
      id: 'string'
    }
  });
  
  /**
   * Get all widgets
   */
  server.tool('wordpress_get_widgets', async (args: any) => {
    const { sidebarId } = args || {};
    
    try {
      const widgets = await callWordPressAPI('/widgets');
      
      const filteredWidgets = sidebarId
        ? widgets.filter((w: any) => w.sidebar === sidebarId)
        : widgets;
      
      return Responses.success(
        {
          widgets: filteredWidgets.map((widget: any) => ({
            id: widget.id,
            sidebar: widget.sidebar,
            instance: widget.instance || {},
            idBase: widget.id_base || ''
          })),
          total: filteredWidgets.length
        },
        `🔧 Retrieved ${filteredWidgets.length} widgets${sidebarId ? ` from ${sidebarId}` : ''}`
      );
    } catch (error) {
      return Responses.error(`Failed to get widgets: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all widgets or widgets in a specific sidebar',
    schema: {}
  });
  
  /**
   * Update widget
   */
  server.tool('wordpress_update_widget', async (args: any) => {
    const { widgetId, instance } = args;
    
    try {
      const widget = await callWordPressAPI(`/widgets/${widgetId}`, 'PUT', {
        instance
      });
      
      return Responses.success(
        {
          id: widget.id,
          sidebar: widget.sidebar,
          updated: true
        },
        `✅ Updated widget ID ${widgetId}`
      );
    } catch (error) {
      return Responses.error(`Failed to update widget: ${(error as Error).message}`);
    }
  }, {
    description: 'Update widget configuration',
    schema: {
      widgetId: 'string',
      instance: 'object'
    }
  });
  
  /**
   * Delete widget
   */
  server.tool('wordpress_delete_widget', async (args: any) => {
    const { widgetId, force = false } = args;
    
    try {
      const endpoint = force ? `/widgets/${widgetId}?force=true` : `/widgets/${widgetId}`;
      await callWordPressAPI(endpoint, 'DELETE');
      
      return Responses.success(
        {
          id: widgetId,
          deleted: true
        },
        `✅ Deleted widget ID ${widgetId}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete widget: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a widget from a sidebar',
    schema: {
      widgetId: 'string',
      force: 'boolean'
    }
  });
  
  /**
   * Get widget types
   */
  server.tool('wordpress_get_widget_types', async () => {
    try {
      const widgetTypes = await callWordPressAPI('/widget-types');
      
      return Responses.success(
        {
          widgetTypes: widgetTypes.map((type: any) => ({
            id: type.id,
            name: type.name || type.id,
            description: type.description || '',
            is_multi: type.is_multi || false
          })),
          total: widgetTypes.length
        },
        `🔧 Retrieved ${widgetTypes.length} widget types`
      );
    } catch (error) {
      return Responses.error(`Failed to get widget types: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all available widget types',
    schema: {}
  });
}