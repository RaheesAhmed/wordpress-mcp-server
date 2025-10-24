<?php
/**
 * Plugin Name: WPMCP File System Manager
 * Plugin URI: https://github.com/RaheesAhmed/wordpress-mcp-server
 * Description: Secure file system operations for WordPress MCP Server
 * Version: 1.0.0
 * Author: WPMCP
 * Author URI: https://github.com/RaheesAhmed
 * License: MIT
 * Text Domain: wpmcp-filesystem
 */

if (!defined('ABSPATH')) {
    exit;
}

class WPMCP_FileSystem {
    
    private $allowed_dirs = [
        'wp-content/themes',
        'wp-content/plugins',
        'wp-content/uploads',
        'wp-content/mu-plugins'
    ];
    
    private $allowed_extensions = [
        'php', 'js', 'css', 'scss', 'sass', 'less',
        'json', 'html', 'htm', 'xml', 'txt', 'md',
        'svg', 'jpg', 'jpeg', 'png', 'gif', 'webp'
    ];
    
    private $max_file_size = 10485760; // 10MB
    
    private $backup_dir = 'wp-content/wpmcp-backups';
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
        $this->ensure_backup_dir();
    }
    
    /**
     * Ensure backup directory exists
     */
    private function ensure_backup_dir() {
        $backup_path = ABSPATH . $this->backup_dir;
        if (!file_exists($backup_path)) {
            wp_mkdir_p($backup_path);
            
            // Create .htaccess to protect backups
            $htaccess = $backup_path . '/.htaccess';
            if (!file_exists($htaccess)) {
                file_put_contents($htaccess, "Deny from all\n");
            }
        }
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        $namespace = 'wpmcp/v1';
        
        // Read file
        register_rest_route($namespace, '/file/read', [
            'methods' => 'POST',
            'callback' => [$this, 'read_file'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
        
        // List files
        register_rest_route($namespace, '/file/list', [
            'methods' => 'POST',
            'callback' => [$this, 'list_files'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
        
        // Get file info
        register_rest_route($namespace, '/file/info', [
            'methods' => 'POST',
            'callback' => [$this, 'file_info'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
        
        // Write file
        register_rest_route($namespace, '/file/write', [
            'methods' => 'POST',
            'callback' => [$this, 'write_file'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
        
        // Delete file
        register_rest_route($namespace, '/file/delete', [
            'methods' => 'POST',
            'callback' => [$this, 'delete_file'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
        
        // Copy file
        register_rest_route($namespace, '/file/copy', [
            'methods' => 'POST',
            'callback' => [$this, 'copy_file'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
        
        // Move file
        register_rest_route($namespace, '/file/move', [
            'methods' => 'POST',
            'callback' => [$this, 'move_file'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
    }
    
    /**
     * Check user permissions
     */
    public function check_permissions() {
        return current_user_can('edit_themes') && current_user_can('edit_plugins');
    }
    
    /**
     * Validate file path
     */
    private function validate_path($path) {
        // Remove any directory traversal attempts
        $path = str_replace(['../', '..\\'], '', $path);
        $path = ltrim($path, '/\\');
        
        // Check if within allowed directories
        $is_allowed = false;
        foreach ($this->allowed_dirs as $dir) {
            if (strpos($path, $dir) === 0) {
                $is_allowed = true;
                break;
            }
        }
        
        if (!$is_allowed) {
            return new WP_Error(
                'invalid_path',
                'Path must be within allowed directories: ' . implode(', ', $this->allowed_dirs)
            );
        }
        
        // Check file extension
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if ($ext && !in_array($ext, $this->allowed_extensions)) {
            return new WP_Error(
                'invalid_extension',
                'File extension not allowed: ' . $ext
            );
        }
        
        return ABSPATH . $path;
    }
    
    /**
     * Create backup of file
     */
    private function create_backup($file_path) {
        if (!file_exists($file_path)) {
            return null;
        }
        
        $backup_id = uniqid('backup_', true);
        $backup_file = ABSPATH . $this->backup_dir . '/' . $backup_id . '.bak';
        
        if (copy($file_path, $backup_file)) {
            // Store metadata
            $meta_file = $backup_file . '.meta';
            $meta = [
                'original_path' => str_replace(ABSPATH, '', $file_path),
                'timestamp' => current_time('mysql'),
                'user_id' => get_current_user_id()
            ];
            file_put_contents($meta_file, json_encode($meta));
            
            return $backup_id;
        }
        
        return null;
    }
    
    /**
     * Read file endpoint
     */
    public function read_file($request) {
        $path = $request->get_param('path');
        
        $file_path = $this->validate_path($path);
        if (is_wp_error($file_path)) {
            return $file_path;
        }
        
        if (!file_exists($file_path)) {
            return new WP_Error('file_not_found', 'File not found');
        }
        
        if (!is_readable($file_path)) {
            return new WP_Error('file_not_readable', 'File is not readable');
        }
        
        $content = file_get_contents($file_path);
        if ($content === false) {
            return new WP_Error('read_failed', 'Failed to read file');
        }
        
        return [
            'content' => $content,
            'size' => filesize($file_path),
            'modified' => date('Y-m-d H:i:s', filemtime($file_path))
        ];
    }
    
    /**
     * List files endpoint
     */
    public function list_files($request) {
        $path = $request->get_param('path');
        $recursive = $request->get_param('recursive') ?? false;
        
        $dir_path = $this->validate_path($path);
        if (is_wp_error($dir_path)) {
            return $dir_path;
        }
        
        if (!is_dir($dir_path)) {
            return new WP_Error('not_directory', 'Path is not a directory');
        }
        
        $files = [];
        
        if ($recursive) {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($dir_path, RecursiveDirectoryIterator::SKIP_DOTS)
            );
        } else {
            $iterator = new DirectoryIterator($dir_path);
        }
        
        foreach ($iterator as $file) {
            if ($file->isDot()) continue;
            
            $relative_path = str_replace(ABSPATH, '', $file->getPathname());
            
            $files[] = [
                'path' => $relative_path,
                'name' => $file->getFilename(),
                'type' => $file->isDir() ? 'directory' : 'file',
                'size' => $file->isFile() ? $file->getSize() : 0,
                'modified' => date('Y-m-d H:i:s', $file->getMTime())
            ];
        }
        
        return ['files' => $files];
    }
    
    /**
     * Get file info endpoint
     */
    public function file_info($request) {
        $path = $request->get_param('path');
        
        $file_path = $this->validate_path($path);
        if (is_wp_error($file_path)) {
            return $file_path;
        }
        
        if (!file_exists($file_path)) {
            return new WP_Error('file_not_found', 'File not found');
        }
        
        return [
            'size' => filesize($file_path),
            'modified' => date('Y-m-d H:i:s', filemtime($file_path)),
            'permissions' => substr(sprintf('%o', fileperms($file_path)), -4),
            'type' => is_dir($file_path) ? 'directory' : 'file'
        ];
    }
    
    /**
     * Write file endpoint
     */
    public function write_file($request) {
        $path = $request->get_param('path');
        $content = $request->get_param('content');
        $create_backup = $request->get_param('createBackup') ?? true;
        
        $file_path = $this->validate_path($path);
        if (is_wp_error($file_path)) {
            return $file_path;
        }
        
        // Check file size
        if (strlen($content) > $this->max_file_size) {
            return new WP_Error('file_too_large', 'File size exceeds limit');
        }
        
        // Create backup if file exists
        $backup_id = null;
        if ($create_backup && file_exists($file_path)) {
            $backup_id = $this->create_backup($file_path);
        }
        
        // Ensure directory exists
        $dir = dirname($file_path);
        if (!is_dir($dir)) {
            wp_mkdir_p($dir);
        }
        
        // Write file
        $result = file_put_contents($file_path, $content);
        if ($result === false) {
            return new WP_Error('write_failed', 'Failed to write file');
        }
        
        return [
            'success' => true,
            'backup' => $backup_id,
            'bytes_written' => $result
        ];
    }
    
    /**
     * Delete file endpoint
     */
    public function delete_file($request) {
        $path = $request->get_param('path');
        $create_backup = $request->get_param('createBackup') ?? true;
        
        $file_path = $this->validate_path($path);
        if (is_wp_error($file_path)) {
            return $file_path;
        }
        
        if (!file_exists($file_path)) {
            return new WP_Error('file_not_found', 'File not found');
        }
        
        // Create backup
        $backup_id = null;
        if ($create_backup) {
            $backup_id = $this->create_backup($file_path);
        }
        
        // Delete file
        if (!unlink($file_path)) {
            return new WP_Error('delete_failed', 'Failed to delete file');
        }
        
        return [
            'success' => true,
            'backup' => $backup_id
        ];
    }
    
    /**
     * Copy file endpoint
     */
    public function copy_file($request) {
        $source = $request->get_param('source');
        $destination = $request->get_param('destination');
        
        $source_path = $this->validate_path($source);
        if (is_wp_error($source_path)) {
            return $source_path;
        }
        
        $dest_path = $this->validate_path($destination);
        if (is_wp_error($dest_path)) {
            return $dest_path;
        }
        
        if (!file_exists($source_path)) {
            return new WP_Error('source_not_found', 'Source file not found');
        }
        
        // Ensure destination directory exists
        $dest_dir = dirname($dest_path);
        if (!is_dir($dest_dir)) {
            wp_mkdir_p($dest_dir);
        }
        
        if (!copy($source_path, $dest_path)) {
            return new WP_Error('copy_failed', 'Failed to copy file');
        }
        
        return ['success' => true];
    }
    
    /**
     * Move file endpoint
     */
    public function move_file($request) {
        $source = $request->get_param('source');
        $destination = $request->get_param('destination');
        
        $source_path = $this->validate_path($source);
        if (is_wp_error($source_path)) {
            return $source_path;
        }
        
        $dest_path = $this->validate_path($destination);
        if (is_wp_error($dest_path)) {
            return $dest_path;
        }
        
        if (!file_exists($source_path)) {
            return new WP_Error('source_not_found', 'Source file not found');
        }
        
        // Ensure destination directory exists
        $dest_dir = dirname($dest_path);
        if (!is_dir($dest_dir)) {
            wp_mkdir_p($dest_dir);
        }
        
        if (!rename($source_path, $dest_path)) {
            return new WP_Error('move_failed', 'Failed to move file');
        }
        
        return ['success' => true];
    }
}

// Initialize plugin
new WPMCP_FileSystem();