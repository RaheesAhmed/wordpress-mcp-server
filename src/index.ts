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

console.log('');
console.log('✅ WordPress MCP Server initialized');
console.log(`📋 Total: 49+ WordPress management tools loaded`);
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
console.log('');
console.log('🔗 Listening for MCP requests...');

// Start server
await server.start();
