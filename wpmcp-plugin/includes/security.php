<?php
/**
 * WPMCP Security Operations
 */

if (!defined('ABSPATH')) exit;

class WPMCP_Security {
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        $ns = 'wpmcp/v1';
        
        register_rest_route($ns, '/security/check-updates', ['methods' => 'GET', 'callback' => [$this, 'check_updates'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/security/debug-log', ['methods' => 'GET', 'callback' => [$this, 'get_debug_log'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/security/verify-core', ['methods' => 'GET', 'callback' => [$this, 'verify_core_files'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/security/system-info', ['methods' => 'GET', 'callback' => [$this, 'get_system_info'], 'permission_callback' => [$this, 'check_permissions']]);
    }
    
    public function check_permissions() {
        return current_user_can('manage_options');
    }
    
    public function check_updates() {
        require_once ABSPATH . 'wp-admin/includes/update.php';
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
        
        wp_update_plugins();
        wp_update_themes();
        
        $core = get_core_updates();
        $plugins = get_plugin_updates();
        $themes = get_theme_updates();
        
        return [
            'core' => $core,
            'plugins' => $plugins,
            'themes' => $themes,
            'totalUpdates' => count($core) + count($plugins) + count($themes)
        ];
    }
    
    public function get_debug_log() {
        $debug_file = WP_CONTENT_DIR . '/debug.log';
        
        if (!file_exists($debug_file)) {
            return ['exists' => false, 'content' => ''];
        }
        
        return ['exists' => true, 'content' => file_get_contents($debug_file), 'size' => filesize($debug_file)];
    }
    
    public function verify_core_files() {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        
        $checksums = get_core_checksums(get_bloginfo('version'), get_locale());
        if (!$checksums) return ['verified' => false, 'message' => 'Could not get checksums'];
        
        $modified = [];
        foreach ($checksums as $file => $checksum) {
            $filepath = ABSPATH . $file;
            if (file_exists($filepath) && md5_file($filepath) !== $checksum) {
                $modified[] = $file;
            }
        }
        
        return ['verified' => count($modified) === 0, 'modified' => $modified, 'total' => count($checksums)];
    }
    
    public function get_system_info() {
        global $wpdb;
        
        return [
            'wp_version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
            'mysql_version' => $wpdb->db_version(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'max_upload' => ini_get('upload_max_filesize'),
            'memory_limit' => ini_get('memory_limit'),
            'timezone' => wp_timezone_string()
        ];
    }
}