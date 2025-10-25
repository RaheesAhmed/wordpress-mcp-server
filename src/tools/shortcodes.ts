/**
 * WordPress Shortcode System Tools
 * List and execute WordPress shortcodes
 */

import { Responses } from 'quickmcp-sdk';
import { callCustomAPI } from '../utils/api.js';

export function registerShortcodeTools(server: any) {
  
  // ========== SHORTCODE SYSTEM ==========
  
  /**
   * List all registered shortcodes
   */
  server.tool('wordpress_list_shortcodes', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/shortcodes/list', 'GET');
      
      return Responses.success(
        {
          shortcodes: result.shortcodes.map((sc: any) => ({
            tag: sc.tag,
            callback: sc.callback
          })),
          total: result.total
        },
        `📝 Retrieved ${result.total} registered shortcodes`
      );
    } catch (error) {
      return Responses.error(`Failed to list shortcodes: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all registered WordPress shortcodes',
    schema: {}
  });
  
  /**
   * Execute a shortcode
   */
  server.tool('wordpress_execute_shortcode', async (args: any) => {
    const { content } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/shortcodes/execute', 'POST', {
        content
      });
      
      return Responses.success(
        {
          input: result.input,
          output: result.output
        },
        `✅ Executed shortcode`
      );
    } catch (error) {
      return Responses.error(`Failed to execute shortcode: ${(error as Error).message}`);
    }
  }, {
    description: 'Process and execute a shortcode string',
    schema: {
      content: 'string'
    }
  });
  
  /**
   * Check if shortcode exists
   */
  server.tool('wordpress_shortcode_exists', async (args: any) => {
    const { tag } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/shortcodes/list', 'GET');
      const exists = result.shortcodes.some((sc: any) => sc.tag === tag);
      
      return Responses.success(
        {
          tag,
          exists
        },
        exists ? `✅ Shortcode [${tag}] exists` : `❌ Shortcode [${tag}] not found`
      );
    } catch (error) {
      return Responses.error(`Failed to check shortcode: ${(error as Error).message}`);
    }
  }, {
    description: 'Check if a shortcode is registered',
    schema: {
      tag: 'string'
    }
  });
}