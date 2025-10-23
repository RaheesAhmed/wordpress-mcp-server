# WordPress MCP Server

A MCP server that provides 49+ tools for complete WordPress site management through AI.

[![GitHub](https://img.shields.io/badge/GitHub-wordpress--mcp--server-blue?logo=github)](https://github.com/RaheesAhmed/wordpress-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## What This Does

This MCP server enables AI agents (Claude, LangGraph, etc.) to manage WordPress sites through natural language. It connects to WordPress via REST API and provides specialized tools for posts, pages, media, users, categories, comments, and site settings.

## Features

- **49+ WordPress Tools** - Complete CRUD operations for all WordPress content types
- **Type Safe** - Full TypeScript implementation
- **Production Ready** - Proper error handling and validation
- **Well Organized** - Clean file structure for easy maintenance

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



## Usage

Once configured, ask your AI:

```
"Create a blog post about AI with 1000 words and publish it"
"Get all draft posts"
"Upload an image and set it as featured image for post 123"
"List all WordPress users"
"Get all installed plugins"
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
