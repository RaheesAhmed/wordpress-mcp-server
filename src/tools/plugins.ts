/**
 * WordPress Plugin Management Tools
 * Activate, deactivate, and manage plugins
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI, callCustomAPI } from '../utils/api.js';
import { buildQueryString } from '../utils/helpers.js';

export function registerPluginTools(server: any) {
  
  // ========== PLUGIN MANAGEMENT ==========
  
  /**
   * Get detailed plugin information
   */
  server.tool('wordpress_get_plugins_detailed', async (args: any) => {
    const { status, search } = args || {};
    
    try {
      const params: any = {};
      if (status) params.status = status;
      if (search) params.search = search;
      
      const queryString = buildQueryString(params);
      const plugins = await callWordPressAPI(`/plugins${queryString ? '?' + queryString : ''}`);
      
      return Responses.success(
        {
          plugins: plugins.map((plugin: any) => ({
            plugin: plugin.plugin,
            status: plugin.status,
            name: plugin.name,
            pluginUri: plugin.plugin_uri || '',
            version: plugin.version,
            description: plugin.description?.rendered || '',
            author: plugin.author,
            authorUri: plugin.author_uri || '',
            textDomain: plugin.textdomain || '',
            requiresWP: plugin.requires_wp || '',
            requiresPHP: plugin.requires_php || '',
            networkOnly: plugin.network_only || false
          })),
          total: plugins.length
        },
        `🔌 Retrieved ${plugins.length} plugins`
      );
    } catch (error) {
      return Responses.error(`Failed to get plugins: ${(error as Error).message}`);
    }
  }, {
    description: 'Get detailed information about all installed plugins',
    schema: {}
  });
  
  /**
   * Activate plugin
   */
  server.tool('wordpress_activate_plugin', async (args: any) => {
    const { plugin } = args;
    
    try {
      const result = await callWordPressAPI(`/plugins/${plugin}`, 'PUT', {
        status: 'active'
      });
      
      return Responses.success(
        {
          plugin: result.plugin,
          name: result.name,
          status: 'active'
        },
        `✅ Activated plugin: ${result.name}`
      );
    } catch (error) {
      return Responses.error(`Failed to activate plugin: ${(error as Error).message}`);
    }
  }, {
    description: 'Activate a plugin',
    schema: {
      plugin: 'string'
    }
  });
  
  /**
   * Deactivate plugin
   */
  server.tool('wordpress_deactivate_plugin', async (args: any) => {
    const { plugin } = args;
    
    try {
      const result = await callWordPressAPI(`/plugins/${plugin}`, 'PUT', {
        status: 'inactive'
      });
      
      return Responses.success(
        {
          plugin: result.plugin,
          name: result.name,
          status: 'inactive'
        },
        `⏸️ Deactivated plugin: ${result.name}`
      );
    } catch (error) {
      return Responses.error(`Failed to deactivate plugin: ${(error as Error).message}`);
    }
  }, {
    description: 'Deactivate a plugin',
    schema: {
      plugin: 'string'
    }
  });
  
  /**
   * Delete plugin
   */
  server.tool('wordpress_delete_plugin', async (args: any) => {
    const { plugin } = args;
    
    try {
      await callWordPressAPI(`/plugins/${plugin}`, 'DELETE');
      
      return Responses.success(
        {
          plugin,
          deleted: true
        },
        `✅ Deleted plugin: ${plugin}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete plugin: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a plugin (must be deactivated first)',
    schema: {
      plugin: 'string'
    }
  });
  
  /**
   * Read plugin file
   */
  server.tool('wordpress_read_plugin_file', async (args: any) => {
    const { plugin, filePath } = args;
    
    try {
      const fullPath = `wp-content/plugins/${plugin}/${filePath}`;
      const result = await callCustomAPI('wp-json/wpmcp/v1/file/read', 'POST', {
        path: fullPath
      });
      
      return Responses.success(
        {
          plugin,
          filePath,
          content: result.content,
          size: result.size,
          modified: result.modified
        },
        `📄 Read ${filePath} from ${plugin}`
      );
    } catch (error) {
      return Responses.error(`Failed to read plugin file: ${(error as Error).message}`);
    }
  }, {
    description: 'Read a specific file from a plugin',
    schema: {
      plugin: 'string',
      filePath: 'string'
    }
  });
  
  /**
   * Write plugin file
   */
  server.tool('wordpress_write_plugin_file', async (args: any) => {
    const { plugin, filePath, content, createBackup = true } = args;
    
    try {
      const fullPath = `wp-content/plugins/${plugin}/${filePath}`;
      const result = await callCustomAPI('wp-json/wpmcp/v1/file/write', 'POST', {
        path: fullPath,
        content,
        createBackup
      });
      
      return Responses.success(
        {
          plugin,
          filePath,
          success: true,
          backup: result.backup
        },
        `✅ Wrote ${filePath} to ${plugin}${result.backup ? ' (backup created)' : ''}`
      );
    } catch (error) {
      return Responses.error(`Failed to write plugin file: ${(error as Error).message}`);
    }
  }, {
    description: 'Write or modify a file in a plugin (automatically creates backup)',
    schema: {
      plugin: 'string',
      filePath: 'string',
      content: 'string'
    }
  });
  
  /**
   * List plugin files
   */
  server.tool('wordpress_list_plugin_files', async (args: any) => {
    const { plugin, recursive = false } = args;
    
    try {
      const pluginPath = `wp-content/plugins/${plugin}/`;
      const result = await callCustomAPI('wp-json/wpmcp/v1/file/list', 'POST', {
        path: pluginPath,
        recursive
      });
      
      return Responses.success(
        {
          plugin,
          files: result.files,
          count: result.files.length
        },
        `📁 Listed ${result.files.length} files in ${plugin}`
      );
    } catch (error) {
      return Responses.error(`Failed to list plugin files: ${(error as Error).message}`);
    }
  }, {
    description: 'List all files in a plugin directory',
    schema: {
      plugin: 'string',
      recursive: 'boolean'
    }
  });
  
  /**
   * Get active plugins
   */
  server.tool('wordpress_get_active_plugins', async () => {
    try {
      const plugins = await callWordPressAPI('/plugins?status=active');
      
      return Responses.success(
        {
          plugins: plugins.map((p: any) => ({
            plugin: p.plugin,
            name: p.name,
            version: p.version
          })),
          total: plugins.length
        },
        `🔌 ${plugins.length} active plugins`
      );
    } catch (error) {
      return Responses.error(`Failed to get active plugins: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all currently active plugins',
    schema: {}
  });
  
  /**
   * Check if plugin exists
   */
  server.tool('wordpress_plugin_exists', async (args: any) => {
    const { plugin } = args;
    
    try {
      const plugins = await callWordPressAPI('/plugins');
      const exists = plugins.some((p: any) => p.plugin === plugin);
      
      return Responses.success(
        {
          plugin,
          exists
        },
        exists ? `✅ Plugin "${plugin}" exists` : `❌ Plugin "${plugin}" not found`
      );
    } catch (error) {
      return Responses.error(`Failed to check plugin: ${(error as Error).message}`);
    }
  }, {
    description: 'Check if a plugin is installed',
    schema: {
      plugin: 'string'
    }
  });
  
  /**
   * Get plugin status
   */
  server.tool('wordpress_get_plugin_status', async (args: any) => {
    const { plugin } = args;
    
    try {
      const pluginData = await callWordPressAPI(`/plugins/${plugin}`);
      
      return Responses.success(
        {
          plugin: pluginData.plugin,
          name: pluginData.name,
          status: pluginData.status,
          version: pluginData.version,
          active: pluginData.status === 'active'
        },
        `ℹ️ Plugin "${pluginData.name}" is ${pluginData.status}`
      );
    } catch (error) {
      return Responses.error(`Failed to get plugin status: ${(error as Error).message}`);
    }
  }, {
    description: 'Get status and details of a specific plugin',
    schema: {
      plugin: 'string'
    }
  });
}