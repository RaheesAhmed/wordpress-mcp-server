/**
 * WordPress Cron & Scheduled Tasks Tools
 * Manage WordPress scheduled events and cron jobs
 */

import { Responses } from 'quickmcp-sdk';
import { callCustomAPI } from '../utils/api.js';

export function registerCronTools(server: any) {
  
  // ========== CRON JOB MANAGEMENT ==========
  
  /**
   * List all scheduled cron jobs
   */
  server.tool('wordpress_list_cron_jobs', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/cron/list', 'GET');
      
      return Responses.success(
        {
          jobs: result.jobs,
          total: result.total
        },
        `⏰ Retrieved ${result.total} scheduled jobs`
      );
    } catch (error) {
      return Responses.error(`Failed to list cron jobs: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all scheduled WordPress cron jobs',
    schema: {}
  });
  
  /**
   * Schedule a cron event
   */
  server.tool('wordpress_schedule_event', async (args: any) => {
    const { hook, timestamp, recurrence = 'once', args: eventArgs = [] } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/cron/schedule', 'POST', {
        hook,
        timestamp,
        recurrence,
        args: eventArgs
      });
      
      return Responses.success(
        {
          hook: result.hook,
          nextRun: result.next_run,
          recurrence: result.recurrence,
          success: true
        },
        `✅ Scheduled event: ${hook} (${result.recurrence})`
      );
    } catch (error) {
      return Responses.error(`Failed to schedule event: ${(error as Error).message}`);
    }
  }, {
    description: 'Schedule a new cron event (one-time or recurring)',
    schema: {
      hook: 'string'
    }
  });
  
  /**
   * Unschedule a cron event
   */
  server.tool('wordpress_unschedule_event', async (args: any) => {
    const { hook, args: eventArgs = [] } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/cron/unschedule', 'POST', {
        hook,
        args: eventArgs
      });
      
      return Responses.success(
        {
          hook,
          unscheduled: true
        },
        `✅ Unscheduled event: ${hook}`
      );
    } catch (error) {
      return Responses.error(`Failed to unschedule event: ${(error as Error).message}`);
    }
  }, {
    description: 'Remove a scheduled cron event',
    schema: {
      hook: 'string'
    }
  });
  
  /**
   * Run WordPress cron manually
   */
  server.tool('wordpress_run_cron', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/cron/run', 'POST');
      
      return Responses.success(
        {
          success: true,
          message: result.message
        },
        `✅ Manually triggered WordPress cron`
      );
    } catch (error) {
      return Responses.error(`Failed to run cron: ${(error as Error).message}`);
    }
  }, {
    description: 'Manually trigger WordPress cron execution',
    schema: {}
  });
  
  /**
   * Get cron schedules
   */
  server.tool('wordpress_get_cron_schedules', async () => {
    try {
      // Get available cron schedules
      const result = await callCustomAPI('wp-json/wpmcp/v1/cron/list', 'GET');
      
      // Extract unique schedules
      const schedules = new Set<string>();
      result.jobs.forEach((job: any) => {
        if (job.schedule) schedules.add(job.schedule);
      });
      
      return Responses.success(
        {
          schedules: Array.from(schedules),
          available: ['once', 'hourly', 'twicedaily', 'daily', 'weekly']
        },
        `⏱️ Retrieved cron schedules`
      );
    } catch (error) {
      return Responses.error(`Failed to get schedules: ${(error as Error).message}`);
    }
  }, {
    description: 'Get available cron schedule intervals',
    schema: {}
  });
}