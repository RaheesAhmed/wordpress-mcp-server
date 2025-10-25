/**
 * WordPress User Roles & Capabilities Tools
 * Manage user roles and permissions
 */

import { Responses } from 'quickmcp-sdk';
import { callCustomAPI } from '../utils/api.js';

export function registerUserRoleTools(server: any) {
  
  // ========== USER ROLES & CAPABILITIES ==========
  
  /**
   * Get all user roles
   */
  server.tool('wordpress_get_roles', async () => {
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/roles/list', 'GET');
      
      return Responses.success(
        {
          roles: result.roles || {},
          total: Object.keys(result.roles || {}).length
        },
        `👥 Retrieved ${Object.keys(result.roles || {}).length} user roles`
      );
    } catch (error) {
      return Responses.error(`Failed to get roles: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all WordPress user roles',
    schema: {}
  });
  
  /**
   * Get capabilities for a role
   */
  server.tool('wordpress_get_capabilities', async (args: any) => {
    const { role } = args;
    
    try {
      const result = await callCustomAPI(`wp-json/wpmcp/v1/roles/${role}/capabilities`, 'GET');
      
      return Responses.success(
        {
          role,
          capabilities: result.capabilities || {},
          totalCaps: Object.keys(result.capabilities || {}).length
        },
        `🔑 Role "${role}" has ${Object.keys(result.capabilities || {}).length} capabilities`
      );
    } catch (error) {
      return Responses.error(`Failed to get capabilities: ${(error as Error).message}`);
    }
  }, {
    description: 'Get all capabilities for a user role',
    schema: {
      role: 'string'
    }
  });
  
  /**
   * Create custom role
   */
  server.tool('wordpress_create_role', async (args: any) => {
    const { role, displayName, capabilities = {} } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/roles/create', 'POST', {
        role,
        displayName,
        capabilities
      });
      
      return Responses.success(
        {
          role,
          displayName,
          created: true
        },
        `✅ Created role: ${displayName}`
      );
    } catch (error) {
      return Responses.error(`Failed to create role: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a custom user role',
    schema: {
      role: 'string',
      displayName: 'string'
    }
  });
  
  /**
   * Delete custom role
   */
  server.tool('wordpress_delete_role', async (args: any) => {
    const { role } = args;
    
    try {
      await callCustomAPI(`wp-json/wpmcp/v1/roles/${role}`, 'DELETE');
      
      return Responses.success(
        {
          role,
          deleted: true
        },
        `✅ Deleted role: ${role}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete role: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete a custom user role',
    schema: {
      role: 'string'
    }
  });
  
  /**
   * Add capability to role
   */
  server.tool('wordpress_add_capability', async (args: any) => {
    const { role, capability } = args;
    
    try {
      await callCustomAPI('wp-json/wpmcp/v1/roles/add-capability', 'POST', {
        role,
        capability
      });
      
      return Responses.success(
        {
          role,
          capability,
          added: true
        },
        `✅ Added "${capability}" to ${role}`
      );
    } catch (error) {
      return Responses.error(`Failed to add capability: ${(error as Error).message}`);
    }
  }, {
    description: 'Add capability to a user role',
    schema: {
      role: 'string',
      capability: 'string'
    }
  });
  
  /**
   * Remove capability from role
   */
  server.tool('wordpress_remove_capability', async (args: any) => {
    const { role, capability } = args;
    
    try {
      await callCustomAPI('wp-json/wpmcp/v1/roles/remove-capability', 'POST', {
        role,
        capability
      });
      
      return Responses.success(
        {
          role,
          capability,
          removed: true
        },
        `✅ Removed "${capability}" from ${role}`
      );
    } catch (error) {
      return Responses.error(`Failed to remove capability: ${(error as Error).message}`);
    }
  }, {
    description: 'Remove capability from a user role',
    schema: {
      role: 'string',
      capability: 'string'
    }
  });
  
  /**
   * Assign role to user
   */
  server.tool('wordpress_assign_role', async (args: any) => {
    const { userId, role } = args;
    
    try {
      await callCustomAPI('wp-json/wpmcp/v1/roles/assign', 'POST', {
        userId,
        role
      });
      
      return Responses.success(
        {
          userId,
          role,
          assigned: true
        },
        `✅ Assigned ${role} to user ${userId}`
      );
    } catch (error) {
      return Responses.error(`Failed to assign role: ${(error as Error).message}`);
    }
  }, {
    description: 'Assign role to user',
    schema: {
      userId: 'number',
      role: 'string'
    }
  });
  
  /**
   * Check user capability
   */
  server.tool('wordpress_check_user_capability', async (args: any) => {
    const { userId, capability } = args;
    
    try {
      const result = await callCustomAPI('wp-json/wpmcp/v1/roles/check-capability', 'POST', {
        userId,
        capability
      });
      
      return Responses.success(
        {
          userId,
          capability,
          hasCapability: result.has || false
        },
        result.has ? `✅ User ${userId} has "${capability}"` : `❌ User ${userId} lacks "${capability}"`
      );
    } catch (error) {
      return Responses.error(`Failed to check capability: ${(error as Error).message}`);
    }
  }, {
    description: 'Check if user has specific capability',
    schema: {
      userId: 'number',
      capability: 'string'
    }
  });
}