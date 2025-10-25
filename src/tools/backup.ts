/**
 * WordPress Backup & Migration Tools
 * Complete backup, restore, and migration capabilities
 */

import { Responses } from 'quickmcp-sdk';
import { callCustomAPI } from '../utils/api.js';

export function registerBackupTools(server: any) {
  
  // ========== BACKUP OPERATIONS ==========
  
  /**
   * Full site backup (files + database)
   */
  server.tool('wordpress_full_backup', async (args: any) => {
    const { name } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/full', 'POST', {
        name: name || `backup-${Date.now()}`
      });
      
      return Responses.success(
        {
          backupId: result.id,
          filename: result.filename,
          size: result.size || '0 MB',
          timestamp: result.timestamp
        },
        `✅ Full backup created: ${result.filename}`
      );
    } catch (error) {
      return Responses.error(`Failed to create backup: ${(error as Error).message}`);
    }
  }, {
    description: 'Create complete site backup (files + database)',
    schema: {}
  });
  
  /**
   * Database backup only
   */
  server.tool('wordpress_backup_database', async (args: any) => {
    const { name } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/database', 'POST', {
        name: name || `db-backup-${Date.now()}`
      });
      
      return Responses.success(
        {
          backupId: result.id,
          filename: result.filename,
          size: result.size || '0 MB'
        },
        `✅ Database backup created`
      );
    } catch (error) {
      return Responses.error(`Failed to backup database: ${(error as Error).message}`);
    }
  }, {
    description: 'Export database only',
    schema: {}
  });
  
  /**
   * Files backup only
   */
  server.tool('wordpress_backup_files', async (args: any) => {
    const { name } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/files', 'POST', {
        name: name || `files-backup-${Date.now()}`
      });
      
      return Responses.success(
        {
          backupId: result.id,
          filename: result.filename,
          size: result.size || '0 MB'
        },
        `✅ Files backup created`
      );
    } catch (error) {
      return Responses.error(`Failed to backup files: ${(error as Error).message}`);
    }
  }, {
    description: 'Backup files only (no database)',
    schema: {}
  });
  
  /**
   * List available backups
   */
  server.tool('wordpress_list_backups', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/list', 'GET');
      
      return Responses.success(
        {
          backups: result.backups || [],
          total: result.total || 0
        },
        `📦 Retrieved ${result.total || 0} backups`
      );
    } catch (error) {
      return Responses.error(`Failed to list backups: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all available backups',
    schema: {}
  });
  
  /**
   * Restore from backup
   */
  server.tool('wordpress_restore_backup', async (args: any) => {
    const { backupId } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/restore', 'POST', {
        backupId
      });
      
      return Responses.success(
        {
          backupId,
          restored: true,
          filesRestored: result.files || 0,
          databaseRestored: result.database || false
        },
        `✅ Restored from backup ${backupId}`
      );
    } catch (error) {
      return Responses.error(`Failed to restore backup: ${(error as Error).message}`);
    }
  }, {
    description: 'Restore WordPress from backup',
    schema: {
      backupId: 'string'
    }
  });
  
  /**
   * Delete backup
   */
  server.tool('wordpress_delete_backup', async (args: any) => {
    const { backupId } = args;
    
    try {
      await callCustomAPI(`wp-json/wpmcp/v1/backup/${backupId}`, 'DELETE');
      
      return Responses.success(
        {
          backupId,
          deleted: true
        },
        `✅ Deleted backup ${backupId}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete backup: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a backup file',
    schema: {
      backupId: 'string'
    }
  });
  
  // ========== MIGRATION OPERATIONS ==========
  
  /**
   * Export content (posts/pages as XML)
   */
  server.tool('wordpress_export_content', async (args: any) => {
    const { postType = 'all', status = 'all' } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/export-content', 'POST', {
        postType,
        status
      });
      
      return Responses.success(
        {
          exportUrl: result.url || '',
          itemCount: result.count || 0,
          fileSize: result.size || '0 MB'
        },
        `✅ Exported ${result.count || 0} items`
      );
    } catch (error) {
      return Responses.error(`Failed to export content: ${(error as Error).message}`);
    }
  }, {
    description: 'Export posts/pages as WordPress XML',
    schema: {}
  });
  
  /**
   * Import content (from XML)
   */
  server.tool('wordpress_import_content', async (args: any) => {
    const { fileUrl, importAttachments = true } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/import-content', 'POST', {
        fileUrl,
        importAttachments
      });
      
      return Responses.success(
        {
          imported: result.count || 0,
          skipped: result.skipped || 0
        },
        `✅ Imported ${result.count || 0} items`
      );
    } catch (error) {
      return Responses.error(`Failed to import content: ${(error as Error).message}`);
    }
  }, {
    description: 'Import content from WordPress XML',
    schema: {
      fileUrl: 'string'
    }
  });
  
  /**
   * Clone to staging
   */
  server.tool('wordpress_clone_to_staging', async (args: any) => {
    const { stagingUrl } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/clone-staging', 'POST', {
        stagingUrl
      });
      
      return Responses.success(
        {
          stagingUrl,
          cloned: true,
          backupId: result.backupId
        },
        `✅ Cloned to staging: ${stagingUrl}`
      );
    } catch (error) {
      return Responses.error(`Failed to clone to staging: ${(error as Error).message}`);
    }
  }, {
    description: 'Clone WordPress to staging environment',
    schema: {
      stagingUrl: 'string'
    }
  });
  
  /**
   * Schedule automatic backups
   */
  server.tool('wordpress_schedule_backups', async (args: any) => {
    const { frequency = 'daily', time = '03:00', keepCount = 7 } = args || {};
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/backup/schedule', 'POST', {
        frequency,
        time,
        keepCount
      });
      
      return Responses.success(
        {
          scheduled: true,
          frequency,
          nextRun: result.nextRun
        },
        `✅ Scheduled ${frequency} backups at ${time}`
      );
    } catch (error) {
      return Responses.error(`Failed to schedule backups: ${(error as Error).message}`);
    }
  }, {
    description: 'Schedule automatic backups',
    schema: {}
  });
}