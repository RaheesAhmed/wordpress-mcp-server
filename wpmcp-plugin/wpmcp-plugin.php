<?php
/**
 * Plugin Name: WordPress MCP Server Plugin
 * Plugin URI: https://github.com/RaheesAhmed/wordpress-mcp-server
 * Description: Complete WordPress control for MCP Server - File System, Shortcodes, Cron Jobs, and Widgets
 * Version: 2.0.0
 * Author: WPMCP
 * Author URI: https://github.com/RaheesAhmed
 * License: MIT
 * Text Domain: wpmcp
 * Requires at least: 5.0
 * Requires PHP: 7.2
 */

if (!defined('ABSPATH')) {
    exit;
}

class WPMCP_Plugin {
    
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
            
            // Protect backups
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
        
        // File System Routes
        register_rest_route($namespace, '/file/read', [
            'methods' => 'POST',
            'callback' => [$this, 'read_file'],
            'permission_callback' => [$this, 'check_file_permissions']
        ]);
        
        register_rest_route($namespace, '/file/list', [
            'methods' => 'POST',
            'callback' => [$this, 'list_files'],
            'permission_callback' => [$this, 'check_file_permissions']
        ]);
        
        register_rest_route($namespace, '/file/info', [
            'methods' => 'POST',
            'callback' => [$this, 'file_info'],
            'permission_callback' => [$this, 'check_file_permissions']
        ]);
        
        register_rest_route($namespace, '/file/write', [
            'methods' => 'POST',
            'callback' => [$this, 'write_file'],
            'permission_callback' => [$this, 'check_file_permissions']
        ]);
        
        register_rest_route($namespace, '/file/delete', [
            'methods' => 'POST',
            'callback' => [$this, 'delete_file'],
            'permission_callback' => [$this, 'check_file_permissions']
        ]);
        
        register_rest_route($namespace, '/file/copy', [
            'methods' => 'POST',
            'callback' => [$this, 'copy_file'],
            'permission_callback' => [$this, 'check_file_permissions']
        ]);
        
        register_rest_route($namespace, '/file/move', [
            'methods' => 'POST',
            'callback' => [$this, 'move_file'],
            'permission_callback' => [$this, 'check_file_permissions']
        ]);
        
        // Shortcode Routes
        register_rest_route($namespace, '/shortcodes/list', [
            'methods' => 'GET',
            'callback' => [$this, 'list_shortcodes'],
            'permission_callback' => [$this, 'check_admin_permissions']
        ]);
        
        register_rest_route($namespace, '/shortcodes/execute', [
            'methods' => 'POST',
            'callback' => [$this, 'execute_shortcode'],
            'permission_callback' => [$this, 'check_admin_permissions']
        ]);
        
        // Cron Routes
        register_rest_route($namespace, '/cron/list', [
            'methods' => 'GET',
            'callback' => [$this, 'list_cron_jobs'],
            'permission_callback' => [$this, 'check_admin_permissions']
        ]);
        
        register_rest_route($namespace, '/cron/schedule', [
            'methods' => 'POST',
            'callback' => [$this, 'schedule_event'],
            'permission_callback' => [$this, 'check_admin_permissions']
        ]);
        
        register_rest_route($namespace, '/cron/unschedule', [
            'methods' => 'POST',
            'callback' => [$this, 'unschedule_event'],
            'permission_callback' => [$this, 'check_admin_permissions']
        ]);
        
        register_rest_route($namespace, '/cron/run', [
            'methods' => 'POST',
            'callback' => [$this, 'run_cron'],
            'permission_callback' => [$this, 'check_admin_permissions']
        ]);
    }
    
    // ========== PERMISSION CHECKS ==========
    
    public function check_file_permissions() {
        return current_user_can('edit_themes') && current_user_can('edit_plugins');
    }
    
    public function check_admin_permissions() {
        return current_user_can('manage_options');
    }
    
    // ========== FILE SYSTEM METHODS ==========
    
    private function validate_path($path) {
        $path = str_replace(['../', '..\\'], '', $path);
        $path = ltrim($path, '/\\');
        
        $is_allowed = false;
        foreach ($this->allowed_dirs as $dir) {
            if (strpos($path, $dir) === 0) {
                $is_allowed = true;
                break;
            }
        }
        
        if (!$is_allowed) {
            return new WP_Error('invalid_path', 'Path must be within allowed directories: ' . implode(', ', $this->allowed_dirs));
        }
        
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if ($ext && !in_array($ext, $this->allowed_extensions)) {
            return new WP_Error('invalid_extension', 'File extension not allowed: ' . $ext);
        }
        
        return ABSPATH . $path;
    }
    
    private function create_backup($file_path) {
        if (!file_exists($file_path)) {
            return null;
        }
        
        $backup_id = uniqid('backup_', true);
        $backup_file = ABSPATH . $this->backup_dir . '/' . $backup_id . '.bak';
        
        if (copy($file_path, $backup_file)) {
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
    
    public function read_file($request) {
        $path = $request->get_param('path');
        $file_path = $this->validate_path($path);
        
        if (is_wp_error($file_path)) {
            return $file_path;
        }
        
        if (!file_exists($file_path)) {
            return new WP_Error('file_not_found', 'File not found');
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
        $iterator = $recursive 
            ? new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir_path, RecursiveDirectoryIterator::SKIP_DOTS))
            : new DirectoryIterator($dir_path);
        
        foreach ($iterator as $file) {
            if ($file->isDot()) continue;
            
            $files[] = [
                'path' => str_replace(ABSPATH, '', $file->getPathname()),
                'name' => $file->getFilename(),
                'type' => $file->isDir() ? 'directory' : 'file',
                'size' => $file->isFile() ? $file->getSize() : 0,
                'modified' => date('Y-m-d H:i:s', $file->getMTime())
            ];
        }
        
        return ['files' => $files];
    }
    
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
    
    public function write_file($request) {
        $path = $request->get_param('path');
        $content = $request->get_param('content');
        $create_backup = $request->get_param('createBackup') ?? true;
        
        $file_path = $this->validate_path($path);
        if (is_wp_error($file_path)) {
            return $file_path;
        }
        
        if (strlen($content) > $this->max_file_size) {
            return new WP_Error('file_too_large', 'File size exceeds limit');
        }
        
        $backup_id = null;
        if ($create_backup && file_exists($file_path)) {
            $backup_id = $this->create_backup($file_path);
        }
        
        $dir = dirname($file_path);
        if (!is_dir($dir)) {
            wp_mkdir_p($dir);
        }
        
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
        
        $backup_id = null;
        if ($create_backup) {
            $backup_id = $this->create_backup($file_path);
        }
        
        if (!unlink($file_path)) {
            return new WP_Error('delete_failed', 'Failed to delete file');
        }
        
        return ['success' => true, 'backup' => $backup_id];
    }
    
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
        
        $dest_dir = dirname($dest_path);
        if (!is_dir($dest_dir)) {
            wp_mkdir_p($dest_dir);
        }
        
        if (!copy($source_path, $dest_path)) {
            return new WP_Error('copy_failed', 'Failed to copy file');
        }
        
        return ['success' => true];
    }
    
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
        
        $dest_dir = dirname($dest_path);
        if (!is_dir($dest_dir)) {
            wp_mkdir_p($dest_dir);
        }
        
        if (!rename($source_path, $dest_path)) {
            return new WP_Error('move_failed', 'Failed to move file');
        }
        
        return ['success' => true];
    }
    
    // ========== SHORTCODE METHODS ==========
    
    public function list_shortcodes() {
        global $shortcode_tags;
        
        $shortcodes = [];
        foreach ($shortcode_tags as $tag => $callback) {
            $shortcodes[] = [
                'tag' => $tag,
                'callback' => $this->get_callback_info($callback)
            ];
        }
        
        return [
            'shortcodes' => $shortcodes,
            'total' => count($shortcodes)
        ];
    }
    
    public function execute_shortcode($request) {
        $content = $request->get_param('content');
        
        if (empty($content)) {
            return new WP_Error('missing_content', 'Shortcode content is required');
        }
        
        $output = do_shortcode($content);
        
        return [
            'input' => $content,
            'output' => $output
        ];
    }
    
    // ========== CRON METHODS ==========
    
    public function list_cron_jobs() {
        $cron = _get_cron_array();
        
        $jobs = [];
        foreach ($cron as $timestamp => $hooks) {
            foreach ($hooks as $hook => $events) {
                foreach ($events as $key => $event) {
                    $jobs[] = [
                        'hook' => $hook,
                        'timestamp' => $timestamp,
                        'schedule' => $event['schedule'] ?? 'once',
                        'args' => $event['args'] ?? [],
                        'next_run' => date('Y-m-d H:i:s', $timestamp)
                    ];
                }
            }
        }
        
        return [
            'jobs' => $jobs,
            'total' => count($jobs)
        ];
    }
    
    public function schedule_event($request) {
        $hook = $request->get_param('hook');
        $timestamp = $request->get_param('timestamp');
        $recurrence = $request->get_param('recurrence');
        $args = $request->get_param('args') ?? [];
        
        if (!$hook) {
            return new WP_Error('missing_hook', 'Hook name is required');
        }
        
        $time = $timestamp ? strtotime($timestamp) : time();
        
        if ($recurrence && $recurrence !== 'once') {
            $scheduled = wp_schedule_event($time, $recurrence, $hook, $args);
        } else {
            $scheduled = wp_schedule_single_event($time, $hook, $args);
        }
        
        if ($scheduled === false) {
            return new WP_Error('schedule_failed', 'Failed to schedule event');
        }
        
        return [
            'success' => true,
            'hook' => $hook,
            'next_run' => date('Y-m-d H:i:s', $time),
            'recurrence' => $recurrence ?? 'once'
        ];
    }
    
    public function unschedule_event($request) {
        $hook = $request->get_param('hook');
        $args = $request->get_param('args') ?? [];
        
        if (!$hook) {
            return new WP_Error('missing_hook', 'Hook name is required');
        }
        
        $timestamp = wp_next_scheduled($hook, $args);
        
        if ($timestamp) {
            wp_unschedule_event($timestamp, $hook, $args);
            return ['success' => true, 'hook' => $hook];
        }
        
        return new WP_Error('not_scheduled', 'Event not found');
    }
    
    public function run_cron() {
        spawn_cron();
        return ['success' => true, 'message' => 'Cron triggered'];
    }
    
    // ========== HELPER METHODS ==========
    
    private function get_callback_info($callback) {
        if (is_string($callback)) {
            return $callback;
        } elseif (is_array($callback)) {
            if (is_object($callback[0])) {
                return get_class($callback[0]) . '::' . $callback[1];
            }
            return implode('::', $callback);
        } elseif (is_object($callback)) {
            return $callback instanceof \Closure ? 'Closure' : get_class($callback);
        }
        return 'Unknown';
    }
}

// Initialize plugin
new WPMCP_Plugin();