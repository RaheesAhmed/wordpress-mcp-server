#!/usr/bin/env node
/**
 * WordPress MCP Server - Main Entry Point
 * Comprehensive WordPress management through MCP
 * 
 * Organization:
 * - config/: Configuration and environment
 * - types/: TypeScript type definitions
 * - utils/: API wrapper and helper functions
 * - tools/: Feature-organized tool modules
 */

import { createServer } from 'quickmcp-sdk';
import { config } from './config/wordpress.js';
import { registerPostTools } from './tools/posts.js';
import { registerPageTools } from './tools/pages.js';
import { registerMediaTools } from './tools/media.js';
import { registerAllFeatureTools } from './tools/all-features.js';
import { registerFileSystemTools } from './tools/filesystem.js';
import { registerThemeTools } from './tools/themes.js';
import { registerPluginTools } from './tools/plugins.js';
import { registerMenuTools } from './tools/menus.js';
import { registerCustomPostTypeTools } from './tools/custom-post-types.js';
import { registerShortcodeTools } from './tools/shortcodes.js';
import { registerCronTools } from './tools/cron.js';
import { registerWidgetTools } from './tools/widgets.js';
import { registerDatabaseTools } from './tools/database.js';
import { registerWooCommerceTools } from './tools/woocommerce.js';
import { registerBlockTools } from './tools/blocks.js';
import { registerSecurityTools } from './tools/security.js';
import { registerPerformanceTools } from './tools/performance.js';
import { registerSEOTools } from './tools/seo.js';
import { registerBackupTools } from './tools/backup.js';
import { registerUserRoleTools } from './tools/user-roles.js';

// Validate configuration
config.validate();

// Create MCP server
const server = createServer({
  name: 'wpagent-wordpress',
  debug: true,
});

console.log('🚀 wpAgent WordPress MCP Server starting...');
console.log(`📡 Connected to: ${config.url}`);
console.log('');

// Register all tool modules
console.log('📦 Loading tool modules...');

registerPostTools(server);
console.log('  ✅ Posts (15 tools)');

registerPageTools(server);
console.log('  ✅ Pages (4 tools)');

registerMediaTools(server);
console.log('  ✅ Media (5 tools)');

registerAllFeatureTools(server);
console.log('  ✅ Users, Taxonomy, Comments, Site, SEO (25+ tools)');

registerFileSystemTools(server);
console.log('  ✅ File System (8 tools)');

registerThemeTools(server);
console.log('  ✅ Theme Management (13 tools)');

registerPluginTools(server);
console.log('  ✅ Plugin Management (10 tools)');

registerMenuTools(server);
console.log('  ✅ Menu Management (8 tools)');

registerCustomPostTypeTools(server);
console.log('  ✅ Custom Post Types & Taxonomies (7 tools)');

registerShortcodeTools(server);
console.log('  ✅ Shortcode System (3 tools) - NEW!');

registerCronTools(server);
console.log('  ✅ Cron & Scheduled Tasks (5 tools) - NEW!');

registerWidgetTools(server);
console.log('  ✅ Widget Management (6 tools)');

registerDatabaseTools(server);
console.log('  ✅ Database Operations (6 tools)');

registerWooCommerceTools(server);
console.log('  ✅ WooCommerce Integration (15 tools)');

registerBlockTools(server);
console.log('  ✅ Gutenberg/Block Editor (12 tools)');

registerSecurityTools(server);
console.log('  ✅ Security & Site Health (7 tools) - NEW!');

registerPerformanceTools(server);
console.log('  ✅ Performance Optimization (8 tools)');

registerSEOTools(server);
console.log('  ✅ Advanced SEO (10 tools)');

registerBackupTools(server);
console.log('  ✅ Backup & Migration (10 tools) - NEW!');

registerUserRoleTools(server);
console.log('  ✅ User Roles & Capabilities (8 tools) - NEW!');

console.log('');
console.log('✅ WordPress MCP Server initialized');
console.log(`📋 Total: 195+ WordPress management tools loaded`);
console.log('');
console.log('🔧 Available Feature Categories:');
console.log('  📝 Posts: create, update, delete, publish, schedule, search, duplicate, revisions, bulk operations');
console.log('  📄 Pages: create, update, delete, hierarchy management');
console.log('  🖼️  Media: upload, get, update, delete, featured images');
console.log('  👥 Users: create, get, update, delete, role management');
console.log('  📁 Categories: create, get, update, delete, hierarchy');
console.log('  🏷️  Tags: create, get, manage');
console.log('  💬 Comments: create, get, update, delete, moderation');
console.log('  ⚙️  Settings: get, update site configuration');
console.log('  🔌 Plugins: list installed plugins');
console.log('  🎨 Themes: list installed themes');
console.log('  🔍 SEO: Yoast, Rank Math, All-in-One SEO support');
console.log('  🛠️  Site Management: info, connection test, custom meta');
console.log('  📁 File System: read, write, delete, copy, move files - secure theme/plugin editing');
console.log('  🎨 Theme Manager: activate, create child themes, modify theme.json, read/write theme files');
console.log('  🔌 Plugin Manager: activate, deactivate, delete, read/write plugin files, status checks');
console.log('  🧭 Menu Manager: create menus, add items, assign to locations, full navigation control');
console.log('  📋 Custom Post Types: get post types, taxonomies, create/update terms');
console.log('  📝 Shortcodes: list registered shortcodes, execute shortcode strings');
console.log('  ⏰ Cron Jobs: schedule events, manage tasks, manual cron execution');
console.log('  🔧 Widgets: get sidebars, manage widgets, widget types');
console.log('  🗄️ Database: execute queries, manage options, list tables, inspect data');
console.log('  🛍️ WooCommerce: products, orders, customers, inventory, coupons, reports');
console.log('  🧱 Gutenberg Blocks: block types, patterns, reusable blocks, templates');
console.log('  🔒 Security: site health, updates, debug logs, file integrity, permissions');
console.log('  ⚡ Performance: cache clearing, database optimization, image regeneration');
console.log('  🎯 SEO: sitemaps, redirects, schema markup, Open Graph, Twitter cards, analysis');
console.log('  📦 Backup (NEW): full/partial backups, restore, export/import, clone to staging');
console.log('  👤 User Roles (NEW): custom roles, capabilities, permissions, role assignment');
console.log('');
console.log('🔗 Listening for MCP requests...');

// Start server
await server.start();
