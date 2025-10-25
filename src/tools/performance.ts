/**
 * WordPress Performance & Optimization Tools
 * Cache management, database optimization, image processing
 */

import { Responses } from 'quickmcp-sdk';
import { callCustomAPI } from '../utils/api.js';

export function registerPerformanceTools(server: any) {
  
  // ========== CACHE MANAGEMENT ==========
  
  /**
   * Clear all caches
   */
  server.tool('wordpress_clear_cache', async (args: any) => {
    const { type = 'all' } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/performance/clear-cache', 'POST', {
        type
      });
      
      return Responses.success(
        {
          cleared: result.cleared || [],
          success: true
        },
        `✅ Cleared ${type} cache`
      );
    } catch (error) {
      return Responses.error(`Failed to clear cache: ${(error as Error).message}`);
    }
  }, {
    description: 'Clear WordPress caches (transients, object cache, page cache)',
    schema: {}
  });
  
  /**
   * Optimize database
   */
  server.tool('wordpress_optimize_database', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/performance/optimize-db', 'POST');
      
      return Responses.success(
        {
          tablesOptimized: result.tables || 0,
          spaceReclaimed: result.space || '0 MB',
          success: true
        },
        `✅ Optimized ${result.tables || 0} database tables`
      );
    } catch (error) {
      return Responses.error(`Failed to optimize database: ${(error as Error).message}`);
    }
  }, {
    description: 'Optimize all database tables for better performance',
    schema: {}
  });
  
  /**
   * Cleanup database (revisions, drafts, spam)
   */
  server.tool('wordpress_cleanup_database', async (args: any) => {
    const { 
      revisions = true, 
      autodrafts = true, 
      spam = true,
      trash = true
    } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/performance/cleanup', 'POST', {
        revisions,
        autodrafts,
        spam,
        trash
      });
      
      return Responses.success(
        {
          removed: result.removed || {},
          totalRemoved: result.total || 0
        },
        `✅ Cleaned up ${result.total || 0} items from database`
      );
    } catch (error) {
      return Responses.error(`Failed to cleanup database: ${(error as Error).message}`);
    }
  }, {
    description: 'Clean up database (revisions, auto-drafts, spam, trash)',
    schema: {}
  });
  
  /**
   * Regenerate image thumbnails
   */
  server.tool('wordpress_regenerate_thumbnails', async (args: any) => {
    const { attachmentId } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/performance/regenerate-thumbs', 'POST', {
        attachmentId
      });
      
      return Responses.success(
        {
          regenerated: result.count || 0,
          success: true
        },
        attachmentId 
          ? `✅ Regenerated thumbnails for image ${attachmentId}`
          : `✅ Regenerated ${result.count || 0} image thumbnails`
      );
    } catch (error) {
      return Responses.error(`Failed to regenerate thumbnails: ${(error as Error).message}`);
    }
  }, {
    description: 'Regenerate image thumbnails for all or specific images',
    schema: {}
  });
  
  /**
   * Get performance metrics
   */
  server.tool('wordpress_get_performance_metrics', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/performance/metrics', 'GET');
      
      return Responses.success(
        {
          dbSize: result.db_size || 'Unknown',
          uploadsSize: result.uploads_size || 'Unknown',
          themesSize: result.themes_size || 'Unknown',
          pluginsSize: result.plugins_size || 'Unknown',
          totalSize: result.total_size || 'Unknown',
          cacheStatus: result.cache_enabled || false,
          phpMemoryLimit: result.php_memory || 'Unknown'
        },
        `📊 Performance metrics retrieved`
      );
    } catch (error) {
      return Responses.error(`Failed to get metrics: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WordPress performance metrics and resource usage',
    schema: {}
  });
  
  /**
   * Enable maintenance mode
   */
  server.tool('wordpress_enable_maintenance_mode', async (args: any) => {
    const { enabled = true } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/performance/maintenance', 'POST', {
        enabled
      });
      
      return Responses.success(
        {
          enabled: result.enabled,
          success: true
        },
        result.enabled ? `🚧 Maintenance mode enabled` : `✅ Maintenance mode disabled`
      );
    } catch (error) {
      return Responses.error(`Failed to toggle maintenance: ${(error as Error).message}`);
    }
  }, {
    description: 'Enable or disable WordPress maintenance mode',
    schema: {}
  });
  
  /**
   * Flush rewrite rules
   */
  server.tool('wordpress_flush_rewrite_rules', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/performance/flush-rewrites', 'POST');
      
      return Responses.success(
        {
          flushed: true,
          success: true
        },
        `✅ Flushed rewrite rules`
      );
    } catch (error) {
      return Responses.error(`Failed to flush rewrites: ${(error as Error).message}`);
    }
  }, {
    description: 'Flush WordPress rewrite rules (fixes permalink issues)',
    schema: {}
  });
  
  /**
   * Get system information
   */
  server.tool('wordpress_get_system_info', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/security/system-info', 'GET');
      
      return Responses.success(
        {
          wordpress: result.wp_version || 'Unknown',
          php: result.php_version || 'Unknown',
          mysql: result.mysql_version || 'Unknown',
          server: result.server_software || 'Unknown',
          maxUploadSize: result.max_upload || 'Unknown',
          memoryLimit: result.memory_limit || 'Unknown',
          timezone: result.timezone || 'Unknown'
        },
        `💻 System information retrieved`
      );
    } catch (error) {
      return Responses.error(`Failed to get system info: ${(error as Error).message}`);
    }
  }, {
    description: 'Get complete system information (versions, limits, configuration)',
    schema: {}
  });
}