<?php
/**
 * WPMCP Performance Optimization
 */

if (!defined('ABSPATH')) exit;

class WPMCP_Performance {
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        $ns = 'wpmcp/v1';
        
        register_rest_route($ns, '/performance/clear-cache', ['methods' => 'POST', 'callback' => [$this, 'clear_cache'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/performance/optimize-db', ['methods' => 'POST', 'callback' => [$this, 'optimize_database'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/performance/cleanup', ['methods' => 'POST', 'callback' => [$this, 'cleanup_database'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/performance/flush-rewrites', ['methods' => 'POST', 'callback' => [$this, 'flush_rewrites'], 'permission_callback' => [$this, 'check_permissions']]);
    }
    
    public function check_permissions() {
        return current_user_can('manage_options');
    }
    
    public function clear_cache() {
        global $wpdb;
        
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_%'");
        
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
        
        return ['cleared' => ['transients', 'object_cache'], 'success' => true];
    }
    
    public function optimize_database() {
        global $wpdb;
        
        $tables = $wpdb->get_results('SHOW TABLES', ARRAY_N);
        $optimized = 0;
        
        foreach ($tables as $table) {
            $wpdb->query("OPTIMIZE TABLE `{$table[0]}`");
            $optimized++;
        }
        
        return ['tables' => $optimized, 'success' => true];
    }
    
    public function cleanup_database($request) {
        global $wpdb;
        
        $removed = ['revisions' => 0, 'auto_drafts' => 0, 'spam' => 0, 'trash' => 0];
        
        if ($request->get_param('revisions')) {
            $removed['revisions'] = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_type = 'revision'");
        }
        
        if ($request->get_param('autodrafts')) {
            $removed['auto_drafts'] = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_status = 'auto-draft'");
        }
        
        if ($request->get_param('spam')) {
            $removed['spam'] = $wpdb->query("DELETE FROM {$wpdb->comments} WHERE comment_approved = 'spam'");
        }
        
        if ($request->get_param('trash')) {
            $removed['trash'] = $wpdb->query("DELETE FROM {$wpdb->posts} WHERE post_status = 'trash'");
        }
        
        return ['removed' => $removed, 'total' => array_sum($removed)];
    }
    
    public function flush_rewrites() {
        flush_rewrite_rules();
        return ['success' => true];
    }
}