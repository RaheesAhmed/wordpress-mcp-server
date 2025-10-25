<?php
/**
 * WPMCP Database Operations
 */

if (!defined('ABSPATH')) exit;

class WPMCP_Database {
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        $ns = 'wpmcp/v1';
        
        register_rest_route($ns, '/database/tables', ['methods' => 'GET', 'callback' => [$this, 'list_tables'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/database/query', ['methods' => 'POST', 'callback' => [$this, 'execute_query'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/database/option', ['methods' => 'GET', 'callback' => [$this, 'get_option_value'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/database/option', ['methods' => 'POST', 'callback' => [$this, 'update_option_value'], 'permission_callback' => [$this, 'check_permissions']]);
    }
    
    public function check_permissions() {
        return current_user_can('manage_options');
    }
    
    public function list_tables() {
        global $wpdb;
        
        $tables = $wpdb->get_results('SHOW TABLES', ARRAY_N);
        $table_list = [];
        
        foreach ($tables as $table) {
            $table_name = $table[0];
            $table_list[] = [
                'name' => $table_name,
                'rows' => (int)$wpdb->get_var("SELECT COUNT(*) FROM `$table_name`"),
                'is_wp_table' => strpos($table_name, $wpdb->prefix) === 0
            ];
        }
        
        return ['tables' => $table_list, 'total' => count($table_list), 'prefix' => $wpdb->prefix];
    }
    
    public function execute_query($request) {
        global $wpdb;
        
        $query = $request->get_param('query');
        if (empty($query)) return new WP_Error('missing_query', 'Query required');
        
        if (!preg_match('/^SELECT|^SHOW|^DESCRIBE|^EXPLAIN/i', trim($query))) {
            return new WP_Error('unsafe_query', 'Only SELECT, SHOW, DESCRIBE, EXPLAIN allowed');
        }
        
        $results = $wpdb->get_results($query, ARRAY_A);
        if ($wpdb->last_error) return new WP_Error('query_error', $wpdb->last_error);
        
        return ['results' => $results, 'rows' => count($results), 'query' => $query];
    }
    
    public function get_option_value($request) {
        $name = $request->get_param('name');
        if (empty($name)) return new WP_Error('missing_name', 'Name required');
        
        $value = get_option($name, null);
        return ['name' => $name, 'value' => $value, 'exists' => $value !== null];
    }
    
    public function update_option_value($request) {
        $name = $request->get_param('name');
        if (empty($name)) return new WP_Error('missing_name', 'Name required');
        
        $updated = update_option($name, $request->get_param('value'));
        return ['name' => $name, 'updated' => $updated, 'value' => $request->get_param('value')];
    }
}