/**
 * WordPress Database Operations Tools
 * Safe database queries, wp_options management, table operations
 */

import { Responses } from 'quickmcp-sdk';
import { callCustomAPI } from '../utils/api.js';

export function registerDatabaseTools(server: any) {
  
  // ========== DATABASE OPERATIONS ==========
  
  /**
   * List all database tables
   */
  server.tool('wordpress_list_tables', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/database/tables', 'GET');
      
      return Responses.success(
        {
          tables: result.tables,
          total: result.total,
          prefix: result.prefix
        },
        `🗄️ Retrieved ${result.total} database tables (prefix: ${result.prefix})`
      );
    } catch (error) {
      return Responses.error(`Failed to list tables: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all WordPress database tables with row counts',
    schema: {}
  });
  
  /**
   * Execute SQL query (SELECT only for safety)
   */
  server.tool('wordpress_execute_sql', async (args: any) => {
    const { query } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/database/query', 'POST', {
        query
      });
      
      return Responses.success(
        {
          results: result.results,
          rows: result.rows,
          query: result.query
        },
        `✅ Query returned ${result.rows} rows`
      );
    } catch (error) {
      return Responses.error(`Query failed: ${(error as Error).message}`);
    }
  }, {
    description: 'Execute SQL query (SELECT, SHOW, DESCRIBE, EXPLAIN only for safety)',
    schema: {
      query: 'string'
    }
  });
  
  /**
   * Get WordPress option value
   */
  server.tool('wordpress_get_option', async (args: any) => {
    const { name } = args;
    
    try {
      const result = await callCustomAPI(`wp-json/wpmcp/v1/database/option?name=${encodeURIComponent(name)}`, 'GET');
      
      return Responses.success(
        {
          name: result.name,
          value: result.value,
          exists: result.exists
        },
        result.exists ? `✅ Option "${name}": ${JSON.stringify(result.value)}` : `❌ Option "${name}" not found`
      );
    } catch (error) {
      return Responses.error(`Failed to get option: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WordPress option value from wp_options table',
    schema: {
      name: 'string'
    }
  });
  
  /**
   * Update WordPress option value
   */
  server.tool('wordpress_update_option', async (args: any) => {
    const { name, value } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/database/option', 'POST', {
        name,
        value
      });
      
      return Responses.success(
        {
          name: result.name,
          updated: result.updated,
          value: result.value
        },
        `✅ Updated option "${name}"`
      );
    } catch (error) {
      return Responses.error(`Failed to update option: ${(error as Error).message}`);
    }
  }, {
    description: 'Update WordPress option value in wp_options table',
    schema: {
      name: 'string',
      value: 'string'
    }
  });
  
  /**
   * Get table structure
   */
  server.tool('wordpress_get_table_structure', async (args: any) => {
    const { table } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/database/query', 'POST', {
        query: `DESCRIBE ${table}`
      });
      
      return Responses.success(
        {
          table,
          columns: result.results,
          count: result.rows
        },
        `📋 Table "${table}" has ${result.rows} columns`
      );
    } catch (error) {
      return Responses.error(`Failed to get table structure: ${(error as Error).message}`);
    }
  }, {
    description: 'Get database table structure (columns and types)',
    schema: {
      table: 'string'
    }
  });
  
  /**
   * Get table preview (first 10 rows)
   */
  server.tool('wordpress_get_table_preview', async (args: any) => {
    const { table, limit = 10 } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/database/query', 'POST', {
        query: `SELECT * FROM ${table} LIMIT ${limit}`
      });
      
      return Responses.success(
        {
          table,
          rows: result.results,
          count: result.rows
        },
        `👀 Preview of table "${table}": ${result.rows} rows`
      );
    } catch (error) {
      return Responses.error(`Failed to preview table: ${(error as Error).message}`);
    }
  }, {
    description: 'Get preview of table data (first 10 rows by default)',
    schema: {
      table: 'string'
    }
  });
}