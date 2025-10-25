/**
 * WordPress Security & Site Health Tools
 * Monitor security, check for updates, verify integrity
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI, callCustomAPI } from '../utils/api.js';

export function registerSecurityTools(server: any) {
  
  // ========== SITE HEALTH & SECURITY ==========
  
  /**
   * Get site health status
   */
  server.tool('wordpress_get_site_health', async () => {
    try {
      // Get site health tests
      const tests = await callWordPressAPI('/site-health/v1/tests/background-updates', 'GET', undefined, 'wp-site-health');
      
      return Responses.success(
        {
          tests,
          message: 'Site health check completed'
        },
        `🏥 Site health status retrieved`
      );
    } catch (error) {
      return Responses.error(`Failed to get site health: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WordPress site health and status checks',
    schema: {}
  });
  
  /**
   * Check for WordPress updates
   */
  server.tool('wordpress_check_updates', async () => {
    try {
      // Trigger update check
      const result = await callCustomAPI('wp-json/wpmcp/v1/security/check-updates', 'GET');
      
      return Responses.success(
        {
          coreUpdates: result.core || [],
          pluginUpdates: result.plugins || [],
          themeUpdates: result.themes || [],
          totalUpdates: (result.core?.length || 0) + (result.plugins?.length || 0) + (result.themes?.length || 0)
        },
        `🔄 Found ${result.totalUpdates || 0} available updates`
      );
    } catch (error) {
      return Responses.error(`Failed to check updates: ${(error as Error).message}`);
    }
  }, {
    description: 'Check for available WordPress, plugin, and theme updates',
    schema: {}
  });
  
  /**
   * Get debug log
   */
  server.tool('wordpress_get_debug_log', async (args: any) => {
    const { lines = 100 } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/security/debug-log', 'GET');
      
      // Get last N lines
      const logLines = result.content ? result.content.split('\n').slice(-lines) : [];
      
      return Responses.success(
        {
          lines: logLines,
          totalLines: logLines.length,
          exists: result.exists
        },
        result.exists ? `📝 Retrieved last ${logLines.length} debug log entries` : `❌ Debug log not found`
      );
    } catch (error) {
      return Responses.error(`Failed to get debug log: ${(error as Error).message}`);
    }
  }, {
    description: 'Read WordPress debug.log file',
    schema: {}
  });
  
  /**
   * Verify core file integrity
   */
  server.tool('wordpress_verify_core_files', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/security/verify-core', 'GET');
      
      return Responses.success(
        {
          verified: result.verified,
          modifiedFiles: result.modified || [],
          totalChecked: result.total || 0
        },
        result.verified ? `✅ Core files verified` : `⚠️ ${result.modified?.length} modified files found`
      );
    } catch (error) {
      return Responses.error(`Failed to verify files: ${(error as Error).message}`);
    }
  }, {
    description: 'Verify WordPress core file integrity (checksums)',
    schema: {}
  });
  
  /**
   * Get failed login attempts
   */
  server.tool('wordpress_get_failed_logins', async (args: any) => {
    const { limit = 50 } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/security/failed-logins', 'GET');
      
      const attempts = result.attempts ? result.attempts.slice(0, limit) : [];
      
      return Responses.success(
        {
          attempts,
          total: attempts.length
        },
        `🔒 Retrieved ${attempts.length} failed login attempts`
      );
    } catch (error) {
      return Responses.error(`Failed to get login attempts: ${(error as Error).message}`);
    }
  }, {
    description: 'Get failed login attempts for security monitoring',
    schema: {}
  });
  
  /**
   * Scan file permissions
   */
  server.tool('wordpress_scan_permissions', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/security/scan-permissions', 'GET');
      
      return Responses.success(
        {
          issues: result.issues || [],
          totalScanned: result.total || 0,
          hasIssues: (result.issues?.length || 0) > 0
        },
        (result.issues?.length || 0) > 0 
          ? `⚠️ Found ${result.issues.length} permission issues` 
          : `✅ File permissions OK`
      );
    } catch (error) {
      return Responses.error(`Failed to scan permissions: ${(error as Error).message}`);
    }
  }, {
    description: 'Scan file and directory permissions for security issues',
    schema: {}
  });
  
  /**
   * Get WordPress version info
   */
  server.tool('wordpress_get_version_info', async () => {
    try {
      const siteInfo = await callWordPressAPI('/');
      
      return Responses.success(
        {
          wpVersion: siteInfo.description || 'Unknown',
          phpVersion: siteInfo.php_version || 'Unknown',
          mysqlVersion: siteInfo.mysql_version || 'Unknown'
        },
        `ℹ️ WordPress version information`
      );
    } catch (error) {
      return Responses.error(`Failed to get version info: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WordPress, PHP, and MySQL version information',
    schema: {}
  });
}