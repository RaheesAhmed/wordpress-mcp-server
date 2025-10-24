/**
 * WordPress File System Tools
 * Secure file operations for themes, plugins, and WordPress files
 */

import { Responses } from 'quickmcp-sdk';
import { config } from '../config/wordpress.js';
import { callCustomAPI } from '../utils/api.js';
import * as path from 'path';

/**
 * Security configuration for file operations
 */
const ALLOWED_DIRECTORIES = [
  'wp-content/themes/',
  'wp-content/plugins/',
  'wp-content/uploads/',
  'wp-content/mu-plugins/'
] as const;

const ALLOWED_EXTENSIONS = [
  '.php', '.js', '.css', '.scss', '.sass', '.less',
  '.json', '.html', '.htm', '.xml', '.txt', '.md',
  '.svg', '.jpg', '.jpeg', '.png', '.gif', '.webp'
] as const;

const FORBIDDEN_PATTERNS = [
  /\.\.\//g,                    // Directory traversal
  /eval\s*\(/gi,                // Eval execution
  /base64_decode/gi,            // Encoded payloads
  /shell_exec/gi,               // Shell commands
  /exec\s*\(/gi,                // Execution functions
  /system\s*\(/gi,              // System calls
  /passthru/gi,                 // Passthrough execution
  /proc_open/gi,                // Process opening
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file path is within allowed directories
 */
function validatePath(filePath: string): { valid: boolean; error?: string; normalized?: string } {
  // Normalize path
  const normalized = path.normalize(filePath).replace(/\\/g, '/');
  
  // Check for directory traversal
  if (/\.\.\//.test(normalized) || /\.\.\\/.test(filePath)) {
    return { valid: false, error: 'Directory traversal detected' };
  }
  
  // Check if within allowed directories
  const isAllowed = ALLOWED_DIRECTORIES.some(dir => 
    normalized.startsWith(dir) || normalized.includes('/' + dir)
  );
  
  if (!isAllowed) {
    return { 
      valid: false, 
      error: `Path must be within allowed directories: ${ALLOWED_DIRECTORIES.join(', ')}` 
    };
  }
  
  // Check file extension
  const ext = path.extname(normalized).toLowerCase();
  const isAllowedExt = ALLOWED_EXTENSIONS.some(allowed => ext === allowed);
  
  if (ext && !isAllowedExt) {
    return { 
      valid: false, 
      error: `File extension '${ext}' not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` 
    };
  }
  
  return { valid: true, normalized };
}

/**
 * Scan content for malicious patterns
 */
function scanContent(content: string): { safe: boolean; threats: string[] } {
  const threats: string[] = [];
  
  for (const pattern of FORBIDDEN_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      threats.push(`Suspicious pattern detected: ${pattern.toString()}`);
    }
  }
  
  return { safe: threats.length === 0, threats };
}

/**
 * Validate PHP syntax (basic check)
 */
function validatePHP(content: string): { valid: boolean; error?: string } {
  // Check for opening PHP tag
  if (content.trim().startsWith('<?php') || content.includes('<?php')) {
    // Basic syntax checks
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      return { valid: false, error: 'Unmatched braces in PHP code' };
    }
    
    // Check for common syntax errors
    if (content.includes('<?php') && !content.trim().endsWith('?>') && !content.includes('?>')) {
      // PHP file without closing tag is actually valid and recommended
      return { valid: true };
    }
    
    return { valid: true };
  }
  
  return { valid: true };
}

export function registerFileSystemTools(server: any) {
  
  // ========== READ OPERATIONS ==========
  
  /**
   * Read file contents from WordPress installation
   */
  server.tool('wordpress_read_file', async (args: any) => {
    const { path: filePath } = args;
    
    try {
      // Validate path
      const validation = validatePath(filePath);
      if (!validation.valid) {
        return Responses.error(`Security: ${validation.error}`);
      }
      
      // Read file via WordPress REST API or direct access
      // For now, we'll use a custom endpoint approach
      const response = await callCustomAPI('/wp-json/wpmcp/v1/file/read', 'POST', {
        path: validation.normalized
      });
      
      return Responses.success(
        {
          path: filePath,
          content: response.content,
          size: response.size,
          modified: response.modified
        },
        `📄 Read file: ${filePath}`
      );
    } catch (error) {
      return Responses.error(`Failed to read file: ${(error as Error).message}`);
    }
  }, {
    description: 'Read file contents from WordPress (themes, plugins, etc.)',
    schema: {
      path: 'string'
    }
  });
  
  /**
   * List files in a directory
   */
  server.tool('wordpress_list_files', async (args: any) => {
    const { path: dirPath, recursive = false } = args;
    
    try {
      // Validate path
      const validation = validatePath(dirPath + '/');
      if (!validation.valid) {
        return Responses.error(`Security: ${validation.error}`);
      }
      
      const response = await callCustomAPI('/wp-json/wpmcp/v1/file/list', 'POST', {
        path: validation.normalized,
        recursive
      });
      
      return Responses.success(
        {
          path: dirPath,
          files: response.files,
          count: response.files.length
        },
        `📁 Listed ${response.files.length} files in ${dirPath}`
      );
    } catch (error) {
      return Responses.error(`Failed to list files: ${(error as Error).message}`);
    }
  }, {
    description: 'List files in a WordPress directory',
    schema: {
      path: 'string',
      recursive: 'boolean'
    }
  });
  
  /**
   * Get file information
   */
  server.tool('wordpress_file_info', async (args: any) => {
    const { path: filePath } = args;
    
    try {
      const validation = validatePath(filePath);
      if (!validation.valid) {
        return Responses.error(`Security: ${validation.error}`);
      }
      
      const response = await callCustomAPI('/wp-json/wpmcp/v1/file/info', 'POST', {
        path: validation.normalized
      });
      
      return Responses.success(
        {
          path: filePath,
          size: response.size,
          modified: response.modified,
          permissions: response.permissions,
          type: response.type
        },
        `ℹ️ File info: ${filePath}`
      );
    } catch (error) {
      return Responses.error(`Failed to get file info: ${(error as Error).message}`);
    }
  }, {
    description: 'Get file information (size, modified date, permissions)',
    schema: {
      path: 'string'
    }
  });
  
  // ========== WRITE OPERATIONS ==========
  
  /**
   * Write file contents (create or overwrite)
   */
  server.tool('wordpress_write_file', async (args: any) => {
    const { path: filePath, content, createBackup = true } = args;
    
    try {
      // Validate path
      const validation = validatePath(filePath);
      if (!validation.valid) {
        return Responses.error(`Security: ${validation.error}`);
      }
      
      // Check file size
      const contentSize = Buffer.byteLength(content, 'utf8');
      if (contentSize > MAX_FILE_SIZE) {
        return Responses.error(`File size (${contentSize} bytes) exceeds limit (${MAX_FILE_SIZE} bytes)`);
      }
      
      // Validate PHP syntax if PHP file
      if (filePath.endsWith('.php')) {
        const phpValidation = validatePHP(content);
        if (!phpValidation.valid) {
          return Responses.error(`PHP validation failed: ${phpValidation.error}`);
        }
      }
      
      // Scan for malicious content
      const scan = scanContent(content);
      if (!scan.safe) {
        return Responses.error(`Security scan failed: ${scan.threats.join(', ')}`);
      }
      
      // Write file
      const response = await callCustomAPI('/wp-json/wpmcp/v1/file/write', 'POST', {
        path: validation.normalized,
        content,
        createBackup
      });
      
      return Responses.success(
        {
          path: filePath,
          success: true,
          backup: response.backup,
          size: contentSize
        },
        `✅ Wrote file: ${filePath}${response.backup ? ' (backup created)' : ''}`
      );
    } catch (error) {
      return Responses.error(`Failed to write file: ${(error as Error).message}`);
    }
  }, {
    description: 'Write or create file with security validation and optional backup',
    schema: {
      path: 'string',
      content: 'string',
      createBackup: 'boolean'
    }
  });
  
  /**
   * Delete file
   */
  server.tool('wordpress_delete_file', async (args: any) => {
    const { path: filePath, createBackup = true } = args;
    
    try {
      const validation = validatePath(filePath);
      if (!validation.valid) {
        return Responses.error(`Security: ${validation.error}`);
      }
      
      const response = await callCustomAPI('/wp-json/wpmcp/v1/file/delete', 'POST', {
        path: validation.normalized,
        createBackup
      });
      
      return Responses.success(
        {
          path: filePath,
          deleted: true,
          backup: response.backup
        },
        `🗑️ Deleted file: ${filePath}${response.backup ? ' (backup created)' : ''}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete file: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete file with optional backup',
    schema: {
      path: 'string',
      createBackup: 'boolean'
    }
  });
  
  /**
   * Copy file
   */
  server.tool('wordpress_copy_file', async (args: any) => {
    const { source, destination } = args;
    
    try {
      const sourceValidation = validatePath(source);
      if (!sourceValidation.valid) {
        return Responses.error(`Source path security: ${sourceValidation.error}`);
      }
      
      const destValidation = validatePath(destination);
      if (!destValidation.valid) {
        return Responses.error(`Destination path security: ${destValidation.error}`);
      }
      
      await callCustomAPI('/wp-json/wpmcp/v1/file/copy', 'POST', {
        source: sourceValidation.normalized,
        destination: destValidation.normalized
      });
      
      return Responses.success(
        {
          source,
          destination,
          success: true
        },
        `📋 Copied file: ${source} → ${destination}`
      );
    } catch (error) {
      return Responses.error(`Failed to copy file: ${(error as Error).message}`);
    }
  }, {
    description: 'Copy file to another location within WordPress',
    schema: {
      source: 'string',
      destination: 'string'
    }
  });
  
  /**
   * Move/rename file
   */
  server.tool('wordpress_move_file', async (args: any) => {
    const { source, destination } = args;
    
    try {
      const sourceValidation = validatePath(source);
      if (!sourceValidation.valid) {
        return Responses.error(`Source path security: ${sourceValidation.error}`);
      }
      
      const destValidation = validatePath(destination);
      if (!destValidation.valid) {
        return Responses.error(`Destination path security: ${destValidation.error}`);
      }
      
      await callCustomAPI('/wp-json/wpmcp/v1/file/move', 'POST', {
        source: sourceValidation.normalized,
        destination: destValidation.normalized
      });
      
      return Responses.success(
        {
          source,
          destination,
          success: true
        },
        `➡️ Moved file: ${source} → ${destination}`
      );
    } catch (error) {
      return Responses.error(`Failed to move file: ${(error as Error).message}`);
    }
  }, {
    description: 'Move or rename file within WordPress',
    schema: {
      source: 'string',
      destination: 'string'
    }
  });
}