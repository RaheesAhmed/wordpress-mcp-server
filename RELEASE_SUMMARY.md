# WordPress MCP Server v3.0 - Release Notes

**Version:** 3.0.0  
**Release Date:** October 25, 2025  
**Type:** Major Update

---

## What's New

WordPress MCP Server v3.0 expands from 49 to **190 tools**, enabling AI to handle 99% of WordPress development tasks.

---

## New Features

### **Developer Tools (66 tools)**
- File System Operations (8) - Read/write files with automatic backups
- Theme Management (13) - Create child themes, customize theme.json
- Plugin Management (10) - Activate/deactivate, modify code
- Menu Management (8) - Build navigation menus
- Custom Post Types (7) - Manage content structures
- Shortcodes, Cron, Widgets, Database (20) - Advanced WordPress APIs

### **E-commerce & Modern WordPress (27 tools)**
- WooCommerce (15) - Products, orders, inventory, coupons, analytics
- Gutenberg (12) - 95 block types, 156 patterns, reusable blocks

### **Production Features (48 tools)**
- Advanced SEO (10) - Sitemaps, redirects, schema markup, Open Graph
- Security (7) - Site health, updates, integrity checks
- Performance (8) - Cache management, database optimization
- Advanced Media (5) - Image optimization, WebP conversion, cleanup
- Backup & Migration (10) - Full/partial backups, restore, clone
- User Roles (8) - Custom roles, capabilities, permissions

---

## Installation

```bash
npm install -g wpmcp@3.0.0
```

Upload `wpmcp-plugin` folder to WordPress and activate.

---

## What AI Can Do

- Build complete WordPress + WooCommerce sites
- Develop custom themes with Gutenberg
- Manage plugins and code
- Database operations
- Advanced SEO optimization
- Backup and disaster recovery
- Performance optimization
- User role management

---

## Breaking Changes

None. All v2.x tools remain compatible.

---

## Requirements

- Node.js 18+
- WordPress 5.0+
- PHP 7.2+

---

## Documentation

- [README.md](./README.md) - Quick start
- [WPMCP_TOOLS.MD](./WPMCP_TOOLS.MD) - All 190 tools
- [wpmcp-plugin/README.md](./wpmcp-plugin/README.md) - Plugin setup

---

**Total:** 190 tools | 99% coverage | Production ready
