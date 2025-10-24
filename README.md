# WordPress MCP Server

A MCP server that provides 57+ tools for complete WordPress site management through AI - including secure file system access for theme and plugin customization.

[![GitHub](https://img.shields.io/badge/GitHub-wordpress--mcp--server-blue?logo=github)](https://github.com/RaheesAhmed/wordpress-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## What This Does

This MCP server enables AI agents (Claude, LangGraph, etc.) to manage WordPress sites through natural language. It connects to WordPress via REST API and provides specialized tools for posts, pages, media, users, categories, comments, and site settings.

## Features

- **57+ WordPress Tools** - Complete CRUD operations for all WordPress content types
- **🆕 File System Access** - Read/write theme and plugin files securely
- **Type Safe** - Full TypeScript implementation
- **Production Ready** - Proper error handling and validation
- **Well Organized** - Clean file structure for easy maintenance
- **Security First** - Built-in validation, backups, and permission checks

### Available Tools

| Category | Count | Tools |
|----------|-------|-------|
| Posts | 15 | create, update, delete, get, search, schedule, publish, duplicate, revisions, bulk operations |
| Pages | 4 | create, update, delete, get with hierarchy |
| Media | 5 | upload, get, update, delete, featured images |
| Users | 4 | create, get, update, delete |
| Categories | 4 | create, get, update, delete |
| Tags | 2 | create, get |
| Comments | 4 | create, get, update, delete |
| Settings | 4 | get site info, test connection, get/update settings |
| Plugins/Themes | 2 | get installed plugins and themes |
| SEO | 2 | set SEO meta (Yoast, Rank Math, AIOSEO), custom meta |
| **🆕 File System** | **8** | **read, write, delete, copy, move files, list directories, file info** |

## Installation

### Option 1: Install from npm (Recommended)

```bash
# Install globally
npm i -g wpmcp

# Or use with npx
npx wpmcp
```

### MCP Client Setup

Add to your MCP client configuration (e.g., Claude Desktop, Cline):

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "npx",
      "args": ["-y", "wpmcp"],
      "env": {
        "WORDPRESS_URL": "https://yourblog.com",
        "WORDPRESS_USERNAME": "admin",
        "WORDPRESS_PASSWORD": "your-password"
      }
    }
  }
}
```

### Option 2: Clone from GitHub

```bash
# Clone repository
git clone https://github.com/RaheesAhmed/wordpress-mcp-server.git
cd wordpress-mcp-server

# Install dependencies
npm install

# Configure WordPress credentials
cp .env.example .env
# Edit .env with your WordPress URL, username, and password

# Build
npm run build

# Run
npm start
```

## Configuration

### Environment Variables

```bash
WORDPRESS_URL=https://yourblog.com
WORDPRESS_USERNAME=admin
WORDPRESS_PASSWORD=your-app-password
```

### WordPress Authentication

**Self-Hosted WordPress(localhost):**
- Install [Basic Auth plugin](https://github.com/WP-API/Basic-Auth)
- Use your WordPress username and password

**WordPress.com:**
- Requires Business plan or higher
- Generate Application Password: Settings → Security → Application Passwords

### 🆕 File System Plugin (Required for File Operations)

To enable file system operations, install the companion plugin:

1. Copy `wordpress-plugin/wpmcp-filesystem.php` to your WordPress plugins directory
2. Activate via **WordPress Admin → Plugins → WPMCP File System Manager**
3. Ensure you have `edit_themes` and `edit_plugins` capabilities

See [`wordpress-plugin/README.md`](./wordpress-plugin/README.md) for detailed installation and security information.

## Usage

Once configured, ask your AI:

**Content Management:**
```
"Create a blog post about AI with 1000 words and publish it"
"Get all draft posts"
"Upload an image and set it as featured image for post 123"
"List all WordPress users"
"Get all installed plugins"
```

**🆕 File System Operations:**
```
"Read the style.css file from my theme"
"Modify the functions.php file to add a new feature"
"Create a custom CSS file in my theme"
"List all files in my plugin directory"
"Copy my theme's footer.php to footer-backup.php"
```

## API Examples

### Create Post

```typescript
{
  "title": "My Post Title",
  "content": "<p>Post content</p>",
  "status": "publish",
  "categories": [1],
  "tags": [2, 3]
}
```

### Upload Media

```typescript
{
  "fileBase64": "base64-encoded-file-content",
  "filename": "image.jpg",
  "altText": "Image description"
}
```

### Create User

```typescript
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "roles": ["author"]
}
```

### 🆕 Read Theme File

```typescript
{
  "path": "wp-content/themes/twentytwentyfour/style.css"
}
```

### 🆕 Write File (with Backup)

```typescript
{
  "path": "wp-content/themes/mytheme/custom.css",
  "content": "/* Custom styles */\n.my-class { color: blue; }",
  "createBackup": true
}
```

### 🆕 List Plugin Files

```typescript
{
  "path": "wp-content/plugins/myplugin/",
  "recursive": true
}
```

## Project Structure

```
src/
├── index.ts              # Server entry point
├── config/               # Configuration
├── types/                # TypeScript definitions
├── utils/                # API wrapper and helpers
└── tools/                # WordPress tool implementations
    ├── posts.ts          # 15 post tools
    ├── pages.ts          # 4 page tools
    ├── media.ts          # 5 media tools
    └── all-features.ts   # Additional tools
```

## Development

```bash
# Run in development mode
npm run dev

```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE)


---

**Built for AI-powered WordPress automation**
