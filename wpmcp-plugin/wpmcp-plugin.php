<?php
/**
 * Plugin Name: WordPress MCP Server Plugin
 * Plugin URI: https://github.com/RaheesAhmed/wordpress-mcp-server
 * Description: Complete WordPress control for MCP Server
 * Version: 2.2.0
 * Author: Rahees Ahmed
 * License: MIT
 * Requires at least: 5.0
 * Requires PHP: 7.2
 */

if (!defined('ABSPATH')) exit;

// Define plugin constants
define('WPMCP_VERSION', '2.2.0');
define('WPMCP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WPMCP_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load all feature modules
require_once WPMCP_PLUGIN_DIR . 'includes/filesystem.php';
require_once WPMCP_PLUGIN_DIR . 'includes/shortcodes.php';
require_once WPMCP_PLUGIN_DIR . 'includes/cron.php';
require_once WPMCP_PLUGIN_DIR . 'includes/database.php';
require_once WPMCP_PLUGIN_DIR . 'includes/security.php';
require_once WPMCP_PLUGIN_DIR . 'includes/performance.php';

// Initialize all modules
new WPMCP_FileSystem();
new WPMCP_Shortcodes();
new WPMCP_Cron();
new WPMCP_Database();
new WPMCP_Security();
new WPMCP_Performance();