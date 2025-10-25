<?php
/**
 * WPMCP Shortcode Operations
 */

if (!defined('ABSPATH')) exit;

class WPMCP_Shortcodes {
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        $ns = 'wpmcp/v1';
        
        register_rest_route($ns, '/shortcodes/list', [
            'methods' => 'GET',
            'callback' => [$this, 'list_shortcodes'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
        
        register_rest_route($ns, '/shortcodes/execute', [
            'methods' => 'POST',
            'callback' => [$this, 'execute_shortcode'],
            'permission_callback' => [$this, 'check_permissions']
        ]);
    }
    
    public function check_permissions() {
        return current_user_can('manage_options');
    }
    
    public function list_shortcodes() {
        global $shortcode_tags;
        
        $shortcodes = [];
        foreach ($shortcode_tags as $tag => $callback) {
            $shortcodes[] = [
                'tag' => $tag,
                'callback' => is_string($callback) ? $callback : 'Closure'
            ];
        }
        
        return ['shortcodes' => $shortcodes, 'total' => count($shortcodes)];
    }
    
    public function execute_shortcode($request) {
        $content = $request->get_param('content');
        if (empty($content)) return new WP_Error('missing_content', 'Content required');
        
        return ['input' => $content, 'output' => do_shortcode($content)];
    }
}