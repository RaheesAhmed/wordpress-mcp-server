# WordPress MCP Server

Enable AI to manage WordPress sites like a professional developer - 95+ tools for complete WordPress control.

[![GitHub](https://img.shields.io/badge/GitHub-wordpress--mcp--server-blue?logo=github)](https://github.com/RaheesAhmed/wordpress-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## What This Is

A Model Context Protocol (MCP) server that gives AI agents complete control over WordPress sites. Connect it to Claude, Cline, or any MCP-compatible AI, and manage WordPress through natural language.

**Key Capabilities:**
- ✅ **Content Management** - Posts, pages, media, users, comments
- ✅ **File System Access** - Read and write theme/plugin files
- ✅ **Theme Customization** - Create child themes, modify styles, customize block themes
- ✅ **Plugin Control** - Activate, deactivate, and modify plugins
- ✅ **Menu Management** - Create menus, add items, assign to locations
- ✅ **Custom Content Types** - Manage post types and taxonomies
- ✅ **Shortcodes & Cron** - Execute shortcodes, schedule tasks
- ✅ **Widget System** - Manage sidebars and widgets
- ✅ **Complete Security** - Multi-layer validation and automatic backups

## Quick Start

### 1. Install

```bash
npm i -g wpmcp
```

### 2. Configure

Add to your MCP client (Claude Desktop, Cline, etc.):

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "npx",
      "args": ["-y", "wpmcp"],
      "env": {
        "WORDPRESS_URL": "https://your-site.com",
        "WORDPRESS_USERNAME": "admin",
        "WORDPRESS_PASSWORD": "your-app-password"
      }
    }
  }
}
```

### 3. Install WordPress Plugin (Required)

1. Upload `wpmcp-plugin/wpmcp-plugin.php` to `/wp-content/plugins/wpmcp-plugin/`
2. Activate via WordPress Admin → Plugins → "WordPress MCP Server Plugin"
3. Ensure you have `edit_themes` and `edit_plugins` capabilities

**What the plugin enables:**
- File system operations (read, write, delete, copy, move)
- Shortcode execution
- Cron job management
- All advanced WordPress features

See [`wpmcp-plugin/README.md`](./wpmcp-plugin/README.md) for detailed setup guide.

### 4. Use

```
"Create a child theme called 'My Custom Theme'"
"Activate Akismet plugin"
"Read the style.css file from my theme"
"Create a blog post about WordPress and publish it"
```

## Available Tools (95+)

| Category | Tools | What You Can Do |
|----------|-------|-----------------|
| **Posts** (15) | create, update, delete, search, schedule, publish, duplicate, bulk | Manage all blog content |
| **Pages** (4) | create, update, delete, hierarchy | Build site structure |
| **Media** (5) | upload, update, delete, featured images | Manage images and files |
| **Users** (4) | create, update, delete, roles | User management |
| **Categories** (4) | create, update, delete, hierarchy | Organize content |
| **Tags** (2) | create, get | Tag content |
| **Comments** (4) | create, update, delete, moderate | Manage discussions |
| **Settings** (4) | get, update site settings | Configure WordPress |
| **SEO** (2) | meta description, focus keywords | Optimize for search |
| **File System** (8) | read, write, delete, copy, move | Edit any file |
| **Theme Manager** (13) | activate, child themes, theme.json, templates | Complete theme control |
| **Plugin Manager** (10) | activate, deactivate, read/write files | Full plugin control |
| **Menu Manager** (8) | create, add items, assign locations | Full navigation control |
| **Custom Types** (7) | get post types, taxonomies, manage terms | Advanced content types |
| **Shortcodes** (3) | list, execute, check existence | Shortcode system |
| **Cron Jobs** (5) | list, schedule, unschedule, run manually | Task scheduling |
| **Widgets** (6) | get sidebars, widgets, types, update | Widget management |

## What You Can Do

### Content Management
```
"Create a blog post about AI and publish it"
"Upload an image and set it as featured image for post 5"
"Get all draft posts"
"Create a new page called 'About Us'"
```

### Theme Customization
```
"Create a child theme of Twenty Twenty-Five"
"Read my theme's functions.php file"
"Add custom CSS to make headers blue"
"Get the theme.json configuration"
"List all files in my theme"
```

### Menu Management Examples
```typescript
// Create menu
{
  "name": "Main Navigation",
  "description": "Primary site menu"
}

// Add menu item
{
  "title": "Home",
  "url": "https://yoursite.com",
  "menus": 3
}

// Get menu locations
// No parameters needed

// Assign menu to location
{
  "location": "primary",
  "menuId": 3
}
```

### Plugin Management
```
"Show me all installed plugins"
"Activate the Contact Form 7 plugin"
"Read the main WooCommerce plugin file"
"Deactivate Hello Dolly"
"Check if Yoast SEO is installed"
```

### Menu Management
```
"Create a new menu called 'Main Navigation'"
"Add a Home link to the menu"
"Get all registered menu locations"
"Assign the Main Navigation menu to primary location"
"Show me all menu items in the Main menu"
```

### Custom Post Types & Taxonomies
```
"Show me all registered post types"
"Get details for the 'page' post type"
"Get all taxonomies"
"Show me all categories"
"Create a new category called 'Technology'"
```

### Shortcodes
```
"List all registered shortcodes"
"Execute [gallery ids='1,2,3']"
"Check if 'contact-form' shortcode exists"
```

### Cron Jobs & Scheduled Tasks
```
"Show me all scheduled cron jobs"
"Schedule a daily backup task"
"Run WordPress cron manually"
"Get available cron schedules"
```

### Widgets
```
"Get all widget areas"
"Show me all available widget types"
"Get widgets in the sidebar"
"List inactive widgets"
```

### File Operations
```
"Read style.css from my theme"
"Create a new custom.css file in my theme"
"Copy functions.php to functions-backup.php"
"Delete old-template.php with backup"
```

## Security Features

All operations are secure:
- ✅ Only allowed directories (themes, plugins, uploads)
- ✅ Only safe file extensions (.php, .css, .js, etc.)
- ✅ Malware pattern detection
- ✅ PHP syntax validation
- ✅ Automatic backups before changes
- ✅ WordPress permission system
- ✅ File size limits (10MB)

## WordPress Authentication

**Self-Hosted WordPress:**
1. Install [Basic Auth plugin](https://github.com/WP-API/Basic-Auth)
2. Use your WordPress admin username and password

**WordPress.com:**
1. Requires Business plan or higher
2. Generate Application Password in Settings → Security

## Project Structure

```
src/tools/
├── posts.ts          # 15 post management tools
├── pages.ts          # 4 page tools
├── media.ts          # 5 media tools
├── filesystem.ts     # 8 file system tools
├── themes.ts         # 13 theme management tools
├── plugins.ts        # 10 plugin management tools
├── menus.ts          # 8 menu management tools
└── all-features.ts   # Users, categories, tags, comments, settings, SEO

filesystem-plugin/
└── wpmcp-filesystem.php  # Required for file operations
```

## Development

```bash
# Clone repository
git clone https://github.com/RaheesAhmed/wordpress-mcp-server.git
cd wordpress-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## Testing

All features tested on live WordPress:
- ✅ 21/21 tests passed
- ✅ File operations working
- ✅ Theme management verified
- ✅ Plugin control confirmed
- ✅ Security validated


## API Examples

### Create Post
```typescript
{
  "title": "My Post",
  "content": "<p>Content here</p>",
  "status": "publish"
}
```

### Create Child Theme
```typescript
{
  "parentTheme": "twentytwentyfive",
  "childName": "My Custom Theme"
}
```

### Activate Plugin
```typescript
{
  "plugin": "akismet/akismet"
}
```

### Read Theme File
```typescript
{
  "theme": "mytheme",
  "filePath": "functions.php"
}
```

### Write File
```typescript
{
  "path": "wp-content/themes/mytheme/custom.css",
  "content": "/* Custom styles */",
  "createBackup": true
}
```

## Roadmap

**Current:** 109/200 tools (54.5% complete)

- ✅ **Phase 1:** File System Operations (8 tools)
- ✅ **Phase 2:** Theme & Plugin Management (23 tools)
- ✅ **Phase 3:** Advanced WordPress APIs (29 tools) - COMPLETE
  - Menus (8), Custom Types (7), Shortcodes (3), Cron (5), Widgets (6)
- 📅 **Phase 4:** WooCommerce + Gutenberg Blocks (27 tools)
- 📅 **Phase 5:** Security, Performance, Backups, Multisite (33 tools)
- 📅 **Phase 6:** WP-CLI, Debugging, i18n, REST API (40 tools)

**Progress:** 54.5% complete - Over halfway to 200 tools!

See [`FEATURE_GAP_ANALYSIS.md`](./FEATURE_GAP_ANALYSIS.md) for complete roadmap.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE)

---

**Built for AI-powered WordPress development** 🚀
