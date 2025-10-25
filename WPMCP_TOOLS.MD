# WordPress MCP Server - Tool Reference

**Version:** 2.2.0 | **Total Tools:** 157

---

## Posts (15 tools)

1. `wordpress_create_post` - Create new post
2. `wordpress_update_post` - Update existing post
3. `wordpress_delete_post` - Delete post
4. `wordpress_get_posts` - Get posts with filtering
5. `wordpress_get_post` - Get single post by ID
6. `wordpress_search_posts` - Search posts by keyword
7. `wordpress_schedule_post` - Schedule post for future publication
8. `wordpress_publish_post` - Publish draft post
9. `wordpress_duplicate_post` - Duplicate existing post
10. `wordpress_get_post_revisions` - Get post edit history
11. `wordpress_bulk_create_posts` - Create multiple posts
12. `wordpress_bulk_update_posts` - Update multiple posts
13. `wordpress_bulk_delete_posts` - Delete multiple posts

## Pages (4 tools)

1. `wordpress_create_page` - Create new page
2. `wordpress_update_page` - Update existing page
3. `wordpress_delete_page` - Delete page
4. `wordpress_get_pages` - Get pages with hierarchy

## Media (5 tools)

1. `wordpress_upload_media` - Upload image or file
2. `wordpress_get_media` - Get media library files
3. `wordpress_update_media` - Update media metadata
4. `wordpress_delete_media` - Delete media file
5. `wordpress_set_featured_image` - Set post featured image

## Users (4 tools)

1. `wordpress_create_user` - Create new user
2. `wordpress_get_users` - Get users with role filtering
3. `wordpress_update_user` - Update user information
4. `wordpress_delete_user` - Delete user

## Categories (4 tools)

1. `wordpress_create_category` - Create new category
2. `wordpress_get_categories` - Get all categories
3. `wordpress_update_category` - Update category
4. `wordpress_delete_category` - Delete category

## Tags (2 tools)

1. `wordpress_create_tag` - Create new tag
2. `wordpress_get_tags` - Get all tags

## Comments (4 tools)

1. `wordpress_create_comment` - Create comment on post
2. `wordpress_get_comments` - Get comments with filtering
3. `wordpress_update_comment` - Update comment status/content
4. `wordpress_delete_comment` - Delete comment

## Settings (4 tools)

1. `wordpress_get_site_info` - Get complete site information
2. `wordpress_test_connection` - Test WordPress connection
3. `wordpress_get_settings` - Get site settings
4. `wordpress_update_settings` - Update site settings

## SEO (2 tools)

1. `wordpress_set_seo_meta` - Set SEO metadata (Yoast, Rank Math, AIOSEO)
2. `wordpress_set_custom_meta` - Set custom post metadata

## File System (8 tools)

1. `wordpress_read_file` - Read file contents
2. `wordpress_write_file` - Write or create file with backup
3. `wordpress_delete_file` - Delete file with optional backup
4. `wordpress_copy_file` - Copy file to another location
5. `wordpress_move_file` - Move or rename file
6. `wordpress_list_files` - List files in directory
7. `wordpress_file_info` - Get file information

## Themes (13 tools)

1. `wordpress_get_themes_detailed` - Get all installed themes
2. `wordpress_activate_theme` - Activate theme
3. `wordpress_get_active_theme` - Get currently active theme
4. `wordpress_create_child_theme` - Create child theme automatically
5. `wordpress_get_theme_mods` - Get theme customizer settings
6. `wordpress_delete_theme` - Delete theme
7. `wordpress_get_theme_json` - Get theme.json for block themes
8. `wordpress_update_theme_json` - Update theme.json
9. `wordpress_read_theme_file` - Read theme file
10. `wordpress_write_theme_file` - Write theme file
11. `wordpress_list_theme_files` - List theme files
12. `wordpress_get_theme_templates` - Get theme templates
13. `wordpress_get_template_parts` - Get template parts
14. `wordpress_get_global_styles` - Get global styles
15. `wordpress_theme_exists` - Check if theme is installed

## Plugins (10 tools)

1. `wordpress_get_plugins_detailed` - Get all installed plugins
2. `wordpress_activate_plugin` - Activate plugin
3. `wordpress_deactivate_plugin` - Deactivate plugin
4. `wordpress_delete_plugin` - Delete plugin
5. `wordpress_read_plugin_file` - Read plugin file
6. `wordpress_write_plugin_file` - Write plugin file
7. `wordpress_list_plugin_files` - List plugin files
8. `wordpress_get_active_plugins` - Get active plugins
9. `wordpress_plugin_exists` - Check if plugin installed
10. `wordpress_get_plugin_status` - Get plugin status

## Menus (8 tools)

1. `wordpress_get_menus` - Get all navigation menus
2. `wordpress_create_menu` - Create new menu
3. `wordpress_delete_menu` - Delete menu
4. `wordpress_get_menu_items` - Get menu items
5. `wordpress_create_menu_item` - Add menu item
6. `wordpress_update_menu_item` - Update menu item
7. `wordpress_delete_menu_item` - Delete menu item
8. `wordpress_get_menu_locations` - Get menu locations
9. `wordpress_assign_menu_to_location` - Assign menu to location

## Custom Post Types & Taxonomies (7 tools)

1. `wordpress_get_post_types` - Get all post types
2. `wordpress_get_post_type` - Get post type details
3. `wordpress_get_taxonomies` - Get all taxonomies
4. `wordpress_get_taxonomy` - Get taxonomy details
5. `wordpress_get_terms` - Get terms from taxonomy
6. `wordpress_create_term` - Create new term
7. `wordpress_update_term` - Update term
8. `wordpress_delete_term` - Delete term

## Shortcodes (3 tools)

1. `wordpress_list_shortcodes` - Get all registered shortcodes
2. `wordpress_execute_shortcode` - Execute shortcode string
3. `wordpress_shortcode_exists` - Check if shortcode registered

## Cron Jobs (5 tools)

1. `wordpress_list_cron_jobs` - Get all scheduled cron jobs
2. `wordpress_schedule_event` - Schedule new cron event
3. `wordpress_unschedule_event` - Remove scheduled event
4. `wordpress_run_cron` - Manually trigger cron
5. `wordpress_get_cron_schedules` - Get cron schedules

## Widgets (6 tools)

1. `wordpress_get_sidebars` - Get all widget areas
2. `wordpress_get_sidebar` - Get sidebar details
3. `wordpress_get_widgets` - Get all widgets
4. `wordpress_update_widget` - Update widget configuration
5. `wordpress_delete_widget` - Delete widget
6. `wordpress_get_widget_types` - Get widget types

## Database (6 tools)

1. `wordpress_list_tables` - Get all database tables
2. `wordpress_execute_sql` - Execute SQL query (SELECT only)
3. `wordpress_get_option` - Get WordPress option value
4. `wordpress_update_option` - Update WordPress option
5. `wordpress_get_table_structure` - Get table structure
6. `wordpress_get_table_preview` - Preview table data

## WooCommerce (15 tools)

1. `wordpress_wc_create_product` - Create product
2. `wordpress_wc_update_product` - Update product
3. `wordpress_wc_get_products` - Get products
4. `wordpress_wc_delete_product` - Delete product
5. `wordpress_wc_get_orders` - Get orders
6. `wordpress_wc_update_order_status` - Update order status
7. `wordpress_wc_get_customers` - Get customers
8. `wordpress_wc_update_stock` - Update inventory
9. `wordpress_wc_create_coupon` - Create coupon
10. `wordpress_wc_get_coupons` - Get coupons
11. `wordpress_wc_get_payment_gateways` - Get payment methods
12. `wordpress_wc_get_shipping_zones` - Get shipping zones
13. `wordpress_wc_get_sales_report` - Get sales report
14. `wordpress_wc_get_top_sellers` - Get top products
15. `wordpress_wc_get_product_categories` - Get product categories
16. `wordpress_wc_is_active` - Check if WooCommerce active

## Gutenberg Blocks (12 tools)

1. `wordpress_get_block_types` - Get all block types
2. `wordpress_get_block_patterns` - Get all block patterns
3. `wordpress_get_block_categories` - Get pattern categories
4. `wordpress_get_reusable_blocks` - Get reusable blocks
5. `wordpress_create_reusable_block` - Create reusable block
6. `wordpress_update_reusable_block` - Update reusable block
7. `wordpress_delete_reusable_block` - Delete reusable block
8. `wordpress_parse_blocks` - Parse block content
9. `wordpress_search_block_directory` - Search block directory
10. `wordpress_get_block_editor_settings` - Get editor settings
11. `wordpress_get_block_template` - Get block template
12. `wordpress_get_style_variations` - Get style variations

## Security (7 tools)

1. `wordpress_get_site_health` - Get site health status
2. `wordpress_check_updates` - Check for updates
3. `wordpress_get_debug_log` - Read debug.log
4. `wordpress_verify_core_files` - Verify core file integrity
5. `wordpress_get_failed_logins` - Get failed login attempts
6. `wordpress_scan_permissions` - Scan file permissions
7. `wordpress_get_version_info` - Get version information

## Performance (8 tools)

1. `wordpress_clear_cache` - Clear all caches
2. `wordpress_optimize_database` - Optimize database tables
3. `wordpress_cleanup_database` - Clean up revisions, spam, trash
4. `wordpress_regenerate_thumbnails` - Regenerate image thumbnails
5. `wordpress_get_performance_metrics` - Get performance metrics
6. `wordpress_enable_maintenance_mode` - Enable/disable maintenance mode
7. `wordpress_flush_rewrite_rules` - Flush rewrite rules
8. `wordpress_get_system_info` - Get system information

