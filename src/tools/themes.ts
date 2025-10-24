/**
 * WordPress Theme Management Tools
 * Install, activate, customize, and manage themes
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI, callCustomAPI } from '../utils/api.js';
import { buildQueryString } from '../utils/helpers.js';

export function registerThemeTools(server: any) {
  
  // ========== THEME INSTALLATION & ACTIVATION ==========
  
  /**
   * Get installed themes
   */
  server.tool('wordpress_get_themes_detailed', async (args: any) => {
    const { status } = args || {};
    
    try {
      const params: any = {};
      if (status) params.status = status;
      
      const queryString = buildQueryString(params);
      const themes = await callWordPressAPI(`/themes${queryString ? '?' + queryString : ''}`);
      
      return Responses.success(
        {
          themes: themes.map((theme: any) => ({
            stylesheet: theme.stylesheet,
            template: theme.template,
            name: theme.name?.rendered || theme.stylesheet,
            version: theme.version,
            author: theme.author,
            description: theme.description?.rendered || '',
            status: theme.status,
            screenshot: theme.screenshot,
            tags: theme.tags,
            textDomain: theme.textdomain,
            isBlockTheme: theme.is_block_theme || false
          })),
          total: themes.length
        },
        `🎨 Retrieved ${themes.length} themes`
      );
    } catch (error) {
      return Responses.error(`Failed to get themes: ${(error as Error).message}`);
    }
  }, {
    description: 'Get detailed information about all installed themes',
    schema: {}
  });
  
  /**
   * Activate a theme
   */
  server.tool('wordpress_activate_theme', async (args: any) => {
    const { stylesheet } = args;
    
    try {
      // Use the themes endpoint to activate
      const theme = await callWordPressAPI(`/themes/${stylesheet}`, 'PUT', {
        status: 'active'
      });
      
      return Responses.success(
        {
          stylesheet: theme.stylesheet,
          name: theme.name?.rendered || theme.stylesheet,
          status: 'active'
        },
        `✅ Activated theme: ${theme.name?.rendered || stylesheet}`
      );
    } catch (error) {
      return Responses.error(`Failed to activate theme: ${(error as Error).message}`);
    }
  }, {
    description: 'Activate a theme (switch to it as the active theme)',
    schema: {
      stylesheet: 'string'
    }
  });
  
  /**
   * Get active theme
   */
  server.tool('wordpress_get_active_theme', async () => {
    try {
      const themes = await callWordPressAPI('/themes');
      const activeTheme = themes.find((theme: any) => theme.status === 'active');
      
      if (!activeTheme) {
        return Responses.error('No active theme found');
      }
      
      return Responses.success(
        {
          stylesheet: activeTheme.stylesheet,
          template: activeTheme.template,
          name: activeTheme.name?.rendered || activeTheme.stylesheet,
          version: activeTheme.version,
          author: activeTheme.author,
          isBlockTheme: activeTheme.is_block_theme || false
        },
        `🎨 Active theme: ${activeTheme.name?.rendered}`
      );
    } catch (error) {
      return Responses.error(`Failed to get active theme: ${(error as Error).message}`);
    }
  }, {
    description: 'Get the currently active theme',
    schema: {}
  });
  
  /**
   * Create child theme
   */
  server.tool('wordpress_create_child_theme', async (args: any) => {
    const { parentTheme, childName, childDescription = '' } = args;
    
    try {
      // Generate child theme slug
      const childSlug = childName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Create child theme directory
      const themeDir = `wp-content/themes/${childSlug}`;
      
      // Create style.css
      const styleContent = `/*
Theme Name: ${childName}
Template: ${parentTheme}
Description: ${childDescription}
Version: 1.0.0
*/

@import url('../${parentTheme}/style.css');

/* Custom styles below */
`;
      
      await callCustomAPI('wp-json/wpmcp/v1/file/write', 'POST', {
        path: `${themeDir}/style.css`,
        content: styleContent,
        createBackup: false
      });
      
      // Create functions.php
      const functionsContent = `<?php
/**
 * ${childName} Functions
 * Child theme for ${parentTheme}
 */

// Enqueue parent and child theme styles
function ${childSlug.replace(/-/g, '_')}_enqueue_styles() {
    // Parent theme stylesheet
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
    
    // Child theme stylesheet
    wp_enqueue_style('child-style', 
        get_stylesheet_directory_uri() . '/style.css',
        array('parent-style'),
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', '${childSlug.replace(/-/g, '_')}_enqueue_styles');

// Add your custom functions below
`;
      
      await callCustomAPI('wp-json/wpmcp/v1/file/write', 'POST', {
        path: `${themeDir}/functions.php`,
        content: functionsContent,
        createBackup: false
      });
      
      // Create screenshot.png (empty placeholder)
      // Note: In production, you'd want to copy parent's screenshot or provide custom one
      
      return Responses.success(
        {
          childSlug,
          childName,
          parentTheme,
          files: [
            `${themeDir}/style.css`,
            `${themeDir}/functions.php`
          ]
        },
        `✅ Created child theme: "${childName}" (${childSlug})`
      );
    } catch (error) {
      return Responses.error(`Failed to create child theme: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a child theme from a parent theme',
    schema: {
      parentTheme: 'string',
      childName: 'string'
    }
  });
  
  /**
   * Get theme customizer settings (theme mods)
   */
  server.tool('wordpress_get_theme_mods', async (args: any) => {
    const { theme } = args || {};
    
    try {
      // Theme mods are stored in wp_options table as theme_mods_{stylesheet}
      // We'll need to use a custom endpoint or direct option retrieval
      const activeTheme = theme || (await callWordPressAPI('/themes')).find((t: any) => t.status === 'active')?.stylesheet;
      
      if (!activeTheme) {
        return Responses.error('No theme specified and no active theme found');
      }
      
      // Get theme mods via settings or custom endpoint
      const settings = await callWordPressAPI('/settings');
      
      return Responses.success(
        {
          theme: activeTheme,
          mods: settings.theme_mods || {},
          note: 'Theme mods may require custom endpoint for full access'
        },
        `⚙️ Retrieved theme mods for ${activeTheme}`
      );
    } catch (error) {
      return Responses.error(`Failed to get theme mods: ${(error as Error).message}`);
    }
  }, {
    description: 'Get theme customizer settings (Appearance → Customize data)',
    schema: {}
  });
  
  /**
   * Delete a theme
   */
  server.tool('wordpress_delete_theme', async (args: any) => {
    const { stylesheet, force = false } = args;
    
    try {
      const endpoint = force ? `/themes/${stylesheet}?force=true` : `/themes/${stylesheet}`;
      await callWordPressAPI(endpoint, 'DELETE');
      
      return Responses.success(
        {
          stylesheet,
          deleted: true
        },
        `✅ Deleted theme: ${stylesheet}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete theme: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a theme (cannot delete active theme)',
    schema: {
      stylesheet: 'string',
      force: 'boolean'
    }
  });
  
  /**
   * Get theme.json for block themes
   */
  server.tool('wordpress_get_theme_json', async (args: any) => {
    const { theme } = args;
    
    try {
      // Get active theme if not specified
      const targetTheme = theme || (await callWordPressAPI('/themes')).find((t: any) => t.status === 'active')?.stylesheet;
      
      if (!targetTheme) {
        return Responses.error('No theme specified');
      }
      
      // Read theme.json using filesystem tool
      const themeJsonPath = `wp-content/themes/${targetTheme}/theme.json`;
      const fileContent = await callCustomAPI('wp-json/wpmcp/v1/file/read', 'POST', {
        path: themeJsonPath
      });
      
      const themeJson = JSON.parse(fileContent.content);
      
      return Responses.success(
        {
          theme: targetTheme,
          themeJson,
          version: themeJson.version || 2,
          settings: themeJson.settings || {},
          styles: themeJson.styles || {}
        },
        `📋 Retrieved theme.json for ${targetTheme}`
      );
    } catch (error) {
      return Responses.error(`Failed to get theme.json: ${(error as Error).message}`);
    }
  }, {
    description: 'Get theme.json configuration for block themes (FSE)',
    schema: {}
  });
  
  /**
   * Update theme.json for block themes
   */
  server.tool('wordpress_update_theme_json', async (args: any) => {
    const { theme, themeJson } = args;
    
    try {
      // Get active theme if not specified
      const targetTheme = theme || (await callWordPressAPI('/themes')).find((t: any) => t.status === 'active')?.stylesheet;
      
      if (!targetTheme) {
        return Responses.error('No theme specified');
      }
      
      const themeJsonPath = `wp-content/themes/${targetTheme}/theme.json`;
      
      // Write updated theme.json
      const content = typeof themeJson === 'string' 
        ? themeJson 
        : JSON.stringify(themeJson, null, 2);
      
      await callCustomAPI('wp-json/wpmcp/v1/file/write', 'POST', {
        path: themeJsonPath,
        content,
        createBackup: true
      });
      
      return Responses.success(
        {
          theme: targetTheme,
          updated: true
        },
        `✅ Updated theme.json for ${targetTheme}`
      );
    } catch (error) {
      return Responses.error(`Failed to update theme.json: ${(error as Error).message}`);
    }
  }, {
    description: 'Update theme.json configuration for block themes (FSE)',
    schema: {
      themeJson: 'object'
    }
  });
  
  /**
   * Read theme file (convenience wrapper)
   */
  server.tool('wordpress_read_theme_file', async (args: any) => {
    const { theme, filePath } = args;
    
    try {
      const fullPath = `wp-content/themes/${theme}/${filePath}`;
      const result = await callCustomAPI('wp-json/wpmcp/v1/file/read', 'POST', {
        path: fullPath
      });
      
      return Responses.success(
        {
          theme,
          filePath,
          content: result.content,
          size: result.size,
          modified: result.modified
        },
        `📄 Read ${filePath} from ${theme}`
      );
    } catch (error) {
      return Responses.error(`Failed to read theme file: ${(error as Error).message}`);
    }
  }, {
    description: 'Read a specific file from a theme',
    schema: {
      theme: 'string',
      filePath: 'string'
    }
  });
  
  /**
   * Write theme file (convenience wrapper)
   */
  server.tool('wordpress_write_theme_file', async (args: any) => {
    const { theme, filePath, content, createBackup = true } = args;
    
    try {
      const fullPath = `wp-content/themes/${theme}/${filePath}`;
      const result = await callCustomAPI('wp-json/wpmcp/v1/file/write', 'POST', {
        path: fullPath,
        content,
        createBackup
      });
      
      return Responses.success(
        {
          theme,
          filePath,
          success: true,
          backup: result.backup
        },
        `✅ Wrote ${filePath} to ${theme}${result.backup ? ' (backup created)' : ''}`
      );
    } catch (error) {
      return Responses.error(`Failed to write theme file: ${(error as Error).message}`);
    }
  }, {
    description: 'Write or modify a file in a theme (automatically creates backup)',
    schema: {
      theme: 'string',
      filePath: 'string',
      content: 'string'
    }
  });
  
  /**
   * List theme files
   */
  server.tool('wordpress_list_theme_files', async (args: any) => {
    const { theme, recursive = false } = args;
    
    try {
      const themePath = `wp-content/themes/${theme}/`;
      const result = await callCustomAPI('wp-json/wpmcp/v1/file/list', 'POST', {
        path: themePath,
        recursive
      });
      
      return Responses.success(
        {
          theme,
          files: result.files,
          count: result.files.length
        },
        `📁 Listed ${result.files.length} files in ${theme}`
      );
    } catch (error) {
      return Responses.error(`Failed to list theme files: ${(error as Error).message}`);
    }
  }, {
    description: 'List all files in a theme directory',
    schema: {
      theme: 'string',
      recursive: 'boolean'
    }
  });
  
  /**
   * Get theme templates (for block themes)
   */
  server.tool('wordpress_get_theme_templates', async (args: any) => {
    const { theme } = args || {};
    
    try {
      // Get templates from WordPress API
      const templates = await callWordPressAPI('/templates');
      
      // Filter by theme if specified
      const filteredTemplates = theme 
        ? templates.filter((t: any) => t.theme === theme)
        : templates;
      
      return Responses.success(
        {
          templates: filteredTemplates.map((tpl: any) => ({
            id: tpl.id,
            slug: tpl.slug,
            theme: tpl.theme,
            title: tpl.title?.rendered || tpl.slug,
            description: tpl.description || '',
            is_custom: tpl.is_custom || false
          })),
          total: filteredTemplates.length
        },
        `📋 Retrieved ${filteredTemplates.length} templates${theme ? ` for ${theme}` : ''}`
      );
    } catch (error) {
      return Responses.error(`Failed to get templates: ${(error as Error).message}`);
    }
  }, {
    description: 'Get theme templates (block theme templates from WordPress API)',
    schema: {}
  });
  
  /**
   * Get theme template parts (for block themes)
   */
  server.tool('wordpress_get_template_parts', async (args: any) => {
    const { theme } = args || {};
    
    try {
      const templateParts = await callWordPressAPI('/template-parts');
      
      const filteredParts = theme
        ? templateParts.filter((tp: any) => tp.theme === theme)
        : templateParts;
      
      return Responses.success(
        {
          templateParts: filteredParts.map((tp: any) => ({
            id: tp.id,
            slug: tp.slug,
            theme: tp.theme,
            title: tp.title?.rendered || tp.slug,
            area: tp.area || '',
            is_custom: tp.is_custom || false
          })),
          total: filteredParts.length
        },
        `🧩 Retrieved ${filteredParts.length} template parts${theme ? ` for ${theme}` : ''}`
      );
    } catch (error) {
      return Responses.error(`Failed to get template parts: ${(error as Error).message}`);
    }
  }, {
    description: 'Get theme template parts (block theme components like header, footer)',
    schema: {}
  });
  
  /**
   * Get global styles for theme
   */
  server.tool('wordpress_get_global_styles', async (args: any) => {
    const { theme } = args || {};
    
    try {
      // Get global styles
      const globalStyles = await callWordPressAPI('/global-styles/themes/' + (theme || 'active'));
      
      return Responses.success(
        {
          id: globalStyles.id,
          title: globalStyles.title?.rendered || 'Global Styles',
          settings: globalStyles.settings || {},
          styles: globalStyles.styles || {}
        },
        `🎨 Retrieved global styles`
      );
    } catch (error) {
      return Responses.error(`Failed to get global styles: ${(error as Error).message}`);
    }
  }, {
    description: 'Get theme global styles (Site Editor styles)',
    schema: {}
  });
  
  /**
   * Check if theme exists
   */
  server.tool('wordpress_theme_exists', async (args: any) => {
    const { theme } = args;
    
    try {
      const themes = await callWordPressAPI('/themes');
      const exists = themes.some((t: any) => t.stylesheet === theme);
      
      return Responses.success(
        {
          theme,
          exists
        },
        exists ? `✅ Theme "${theme}" exists` : `❌ Theme "${theme}" not found`
      );
    } catch (error) {
      return Responses.error(`Failed to check theme: ${(error as Error).message}`);
    }
  }, {
    description: 'Check if a theme is installed',
    schema: {
      theme: 'string'
    }
  });
}