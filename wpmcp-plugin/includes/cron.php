<?php
/**
 * WPMCP Cron Job Operations
 */

if (!defined('ABSPATH')) exit;

class WPMCP_Cron {
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        $ns = 'wpmcp/v1';
        
        register_rest_route($ns, '/cron/list', ['methods' => 'GET', 'callback' => [$this, 'list_cron_jobs'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/cron/schedule', ['methods' => 'POST', 'callback' => [$this, 'schedule_event'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/cron/unschedule', ['methods' => 'POST', 'callback' => [$this, 'unschedule_event'], 'permission_callback' => [$this, 'check_permissions']]);
        register_rest_route($ns, '/cron/run', ['methods' => 'POST', 'callback' => [$this, 'run_cron'], 'permission_callback' => [$this, 'check_permissions']]);
    }
    
    public function check_permissions() {
        return current_user_can('manage_options');
    }
    
    public function list_cron_jobs() {
        $cron = _get_cron_array();
        $jobs = [];
        
        foreach ($cron as $timestamp => $hooks) {
            foreach ($hooks as $hook => $events) {
                foreach ($events as $event) {
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
        
        return ['jobs' => $jobs, 'total' => count($jobs)];
    }
    
    public function schedule_event($request) {
        $hook = $request->get_param('hook');
        if (!$hook) return new WP_Error('missing_hook', 'Hook required');
        
        $time = $request->get_param('timestamp') ? strtotime($request->get_param('timestamp')) : time();
        $recurrence = $request->get_param('recurrence');
        $args = $request->get_param('args') ?? [];
        
        if ($recurrence && $recurrence !== 'once') {
            wp_schedule_event($time, $recurrence, $hook, $args);
        } else {
            wp_schedule_single_event($time, $hook, $args);
        }
        
        return ['success' => true, 'hook' => $hook, 'next_run' => date('Y-m-d H:i:s', $time), 'recurrence' => $recurrence ?? 'once'];
    }
    
    public function unschedule_event($request) {
        $hook = $request->get_param('hook');
        if (!$hook) return new WP_Error('missing_hook', 'Hook required');
        
        $timestamp = wp_next_scheduled($hook, $request->get_param('args') ?? []);
        if ($timestamp) {
            wp_unschedule_event($timestamp, $hook, $request->get_param('args') ?? []);
            return ['success' => true, 'hook' => $hook];
        }
        
        return new WP_Error('not_scheduled', 'Event not found');
    }
    
    public function run_cron() {
        spawn_cron();
        return ['success' => true, 'message' => 'Cron triggered'];
    }
}