# wpAgent WordPress MCP Server

[![GitHub](https://img.shields.io/badge/GitHub-RaheesAhmed%2Fwordpress--mcp--server-blue?logo=github)](https://github.com/RaheesAhmed/wordpress-mcp-server)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-18%2B-green)](https://nodejs.org/)

A MCP server for WordPress providing **49+ tools** for complete WordPress site management. Built with QuickMCP SDK and TypeScript with enterprise-level organization.

**🔗 QuickMCP SDK Repository: https://github.com/RaheesAhmed/QuickMCP** 

## 🎯 What This Does

This MCP server allows AI agents (like Claude with LangGraph) to interact with WordPress sites through natural language. It provides comprehensive WordPress management capabilities:

**📝 Posts:** 15 tools - Create, update, delete, publish, schedule, search, duplicate, revisions, bulk operations  
**📄 Pages:** 4 tools - Create, update, delete, hierarchy management  
**🖼️ Media:** 5 tools - Upload, get, update, delete, featured images  
**👥 Users:** 4 tools - Create, get, update, delete with role management  
**📁 Categories:** 4 tools - Create, get, update, delete with hierarchy  
**🏷️ Tags:** 2 tools - Create, get tags  
**💬 Comments:** 4 tools - Create, get, update, delete with moderation  
**⚙️ Settings:** 4 tools - Get/update site configuration, connection testing  
**🔌 Plugins/Themes:** 2 tools - List installed plugins and themes  
**🔍 SEO:** 2 tools - Yoast, Rank Math, All-in-One SEO support, custom meta  

## 🏗️ Project Structure

```
wpmcp/
├── src/
│   ├── index.ts                    # Main server entry
│   ├── config/
│   │   └── wordpress.ts           # Configuration management
│   ├── types/
│   │   └── wordpress.ts           # TypeScript type definitions
│   ├── utils/
│   │   ├── api.ts                 # WordPress REST API wrapper
│   │   └── helpers.ts             # Formatting utilities
│   └── tools/
│       ├── posts.ts               # 15 post management tools
│       ├── pages.ts               # 4 page management tools
│       ├── media.ts               # 5 media library tools
│       └── all-features.ts        # 25+ comprehensive tools
├── dist/                           # Compiled JavaScript
├── .env                           # Environment configuration
└── package.json
```

## 📋 Prerequisites

- Node.js 18+ 
- WordPress site with REST API enabled (WordPress 5.6+)
- WordPress Application Password or Basic Auth plugin

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/RaheesAhmed/wordpress-mcp-server.git
cd wordpress-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure WordPress Credentials

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your WordPress credentials:

```bash
WORDPRESS_URL=https://yourblog.com
WORDPRESS_USERNAME=admin
WORDPRESS_PASSWORD=xxxx xxxx xxxx xxxx
```

**For Self-Hosted WordPress (localhost):**
1. Install Basic Authentication plugin: https://github.com/WP-API/Basic-Auth
2. Use your regular WordPress username and password

**For WordPress.com (Business plan or higher):**
1. Go to WordPress.com → Settings → Security → Application Passwords
2. Create new application password
3. Use that password in .env

### 4. Build the Server

```bash
npm run build
```

### 5. Run the Server

```bash
npm start
```

## 🔧 Development

Run in development mode with auto-reload:

```bash
npm run dev
```

## 📚 Complete Tool Reference

### 📝 Posts Management (15 tools)

#### `wordpress_create_post`
Create a new WordPress post with full control.

**Arguments:**
- `title` (string, required) - Post title
- `content` (string, required) - Post content (HTML)
- `status` (string) - 'draft', 'publish', 'future', 'private' (default: 'draft')
- `date` (string) - ISO 8601 datetime for scheduling
- `categories` (array) - Category IDs
- `tags` (array) - Tag IDs
- `excerpt` (string) - Post excerpt
- `featured_media` (number) - Featured image media ID
- `comment_status` (string) - 'open' or 'closed'
- `ping_status` (string) - 'open' or 'closed'
- `meta` (object) - Custom meta fields

#### `wordpress_update_post`
Update an existing post - can modify any property.

**Arguments:**
- `postId` (number) - Post ID to update
- `updates` (object) - Fields to update

#### `wordpress_delete_post`
Delete a post (trash or permanent).

**Arguments:**
- `postId` (number) - Post ID
- `force` (boolean) - true = permanent delete, false = trash

#### `wordpress_get_posts`
Get posts with advanced filtering.

**Arguments:**
- `perPage` (number) - Posts per page
- `page` (number) - Page number
- `status` (string) - Filter by status
- `orderby` (string) - Sort field
- `order` (string) - 'asc' or 'desc'
- `search` (string) - Search query
- `author` (number) - Filter by author
- `categories` (string) - Filter by categories
- `tags` (string) - Filter by tags

#### `wordpress_get_post`
Get detailed information about a specific post by ID.

#### `wordpress_search_posts`
Search posts by keyword - searches title, content, and excerpt.

**Arguments:**
- `query` (string) - Search query
- `perPage` (number) - Results per page

#### `wordpress_schedule_post`
Schedule a post for future publication.

**Arguments:**
- `postId` (number) - Post ID
- `datetime` (string) - ISO 8601 datetime (YYYY-MM-DDTHH:MM:SS)

#### `wordpress_publish_post`
Publish a draft or pending post immediately.

#### `wordpress_duplicate_post`
Duplicate an existing post with optional new title.

**Arguments:**
- `postId` (number) - Post ID to duplicate
- `newTitle` (string) - New title (optional)

#### `wordpress_get_post_revisions`
Get all revisions/edit history for a post.

#### `wordpress_bulk_create_posts`
Create multiple posts in one operation.

**Arguments:**
- `posts` (array) - Array of post objects

#### `wordpress_bulk_update_posts`
Update multiple posts in one operation.

**Arguments:**
- `updates` (array) - Array of {postId, changes} objects

#### `wordpress_bulk_delete_posts`
Delete multiple posts in one operation.

**Arguments:**
- `postIds` (array) - Array of post IDs
- `force` (boolean) - Permanent delete

### 📄 Pages Management (4 tools)

#### `wordpress_create_page`
Create a new WordPress page with hierarchy support.

**Arguments:**
- `title` (string) - Page title
- `content` (string) - Page content
- `status` (string) - Page status
- `parent` (number) - Parent page ID
- `template` (string) - Page template

#### `wordpress_update_page`
Update an existing page.

#### `wordpress_get_pages`
Get pages with hierarchy and ordering.

#### `wordpress_delete_page`
Delete a page.

### 🖼️ Media Management (5 tools)

#### `wordpress_upload_media`
Upload image or file to WordPress media library.

**Arguments:**
- `fileBase64` (string) - File content as base64
- `filename` (string) - Filename with extension
- `altText` (string) - Alt text for images
- `caption` (string) - Media caption

#### `wordpress_get_media`
Get media library files with filtering.

**Arguments:**
- `perPage` (number) - Items per page
- `page` (number) - Page number
- `mediaType` (string) - Filter by type (image, video, etc.)

#### `wordpress_update_media`
Update media file metadata (alt text, caption, title).

#### `wordpress_delete_media`
Delete a media file from library.

#### `wordpress_set_featured_image`
Set featured image (thumbnail) for a post.

### 👥 User Management (4 tools)

#### `wordpress_create_user`
Create a new WordPress user with roles.

**Arguments:**
- `username` (string) - Username
- `email` (string) - Email address
- `password` (string) - User password
- `roles` (array) - User roles (default: ['subscriber'])
- `name` (string) - Display name

#### `wordpress_get_users`
Get WordPress users with role filtering.

**Arguments:**
- `perPage` (number) - Users per page
- `page` (number) - Page number
- `roles` (string) - Filter by role
- `search` (string) - Search users

#### `wordpress_update_user`
Update user information (name, email, roles, password).

#### `wordpress_delete_user`
Delete a user (reassign their content to another user).

**Arguments:**
- `userId` (number) - User ID to delete
- `reassign` (number) - User ID to reassign content to

### 📁 Categories (4 tools)

#### `wordpress_create_category`
Create a new category with hierarchical support.

**Arguments:**
- `name` (string) - Category name
- `description` (string) - Category description
- `parent` (number) - Parent category ID
- `slug` (string) - URL-friendly slug

#### `wordpress_get_categories`
Get all categories with hierarchy.

#### `wordpress_update_category`
Update category name, description, or parent.

#### `wordpress_delete_category`
Delete a category.

### 🏷️ Tags (2 tools)

#### `wordpress_create_tag`
Create a new tag.

#### `wordpress_get_tags`
Get all tags.

### 💬 Comments (4 tools)

#### `wordpress_create_comment`
Create a comment on a post.

**Arguments:**
- `postId` (number) - Post ID
- `content` (string) - Comment content
- `author` (string) - Author name
- `authorEmail` (string) - Author email

#### `wordpress_get_comments`
Get comments with filtering by post and status.

**Arguments:**
- `postId` (number) - Filter by post
- `perPage` (number) - Comments per page
- `status` (string) - Filter by status (approve, hold, spam, trash)

#### `wordpress_update_comment`
Update comment (approve, spam, trash, edit content).

#### `wordpress_delete_comment`
Delete a comment.

### ⚙️ Site & Settings (4 tools)

#### `wordpress_get_site_info`
Get complete WordPress site information including available API routes.

#### `wordpress_test_connection`
Test WordPress connection and authentication.

#### `wordpress_get_settings`
Get WordPress site settings.

**Returns:**
- Site title, description, URL
- Email, timezone, date/time formats
- Language, posts per page

#### `wordpress_update_settings`
Update site settings (title, description, timezone, etc.).

### 🔌 Plugins & Themes (2 tools)

#### `wordpress_get_plugins`
Get all installed WordPress plugins.

**Returns:**
- Plugin name, status (active/inactive)
- Version, author, description

#### `wordpress_get_themes`
Get all installed WordPress themes.

**Returns:**
- Theme name, status (active/inactive)
- Version, author, description

### 🔍 SEO & Meta (2 tools)

#### `wordpress_set_seo_meta`
Set SEO metadata (Yoast SEO, Rank Math, All-in-One SEO compatible).

**Arguments:**
- `postId` (number) - Post ID
- `metaDescription` (string) - Meta description
- `focusKeyword` (string) - Focus keyword
- `canonicalUrl` (string) - Canonical URL
- `ogTitle` (string) - OpenGraph title
- `ogDescription` (string) - OpenGraph description
- `twitterTitle` (string) - Twitter card title
- `twitterDescription` (string) - Twitter card description

#### `wordpress_set_custom_meta`
Set custom post metadata field - useful for custom fields and plugins.

**Arguments:**
- `postId` (number) - Post ID
- `metaKey` (string) - Meta key name
- `metaValue` (string) - Meta value

## 🔗 Using with MCP Clients

### Claude Desktop Configuration

Add to your Claude Desktop MCP settings (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "wpagent-wordpress": {
      "command": "node",
      "args": ["D:/path/to/wpmcp/dist/index.js"],
      "type": "stdio",
      "env": {
        "WORDPRESS_URL": "your url here",
        "WORDPRESS_USERNAME": "your username",
        "WORDPRESS_PASSWORD": "your password"
      }
    }
  }
}
```

### Example AI Prompts

```
# Content Creation
"Create a blog post about AI in 2025 with 1000 words and publish it"
"Create 10 draft posts about different technology topics"
"Duplicate post ID 7 and schedule it for next Monday"

# Content Management
"Get all draft posts and publish them"
"Search for posts about 'artificial intelligence'"
"Update post 123 with new SEO metadata"

# Media Management
"Upload this image as the featured image for post 456"
"Get all images in the media library"

# User Management
"Create a new author user with email author@example.com"
"List all WordPress users and their roles"
"Update user 5 and change their role to editor"

# Site Administration
"Get all installed plugins"
"Show me the current site settings"
"List all categories with their post counts"
"Get all pending comments for moderation"

# SEO Optimization
"Set SEO metadata for post 789 with focus keyword 'AI tools'"
"Update all posts in category 'Technology' with SEO metadata"

# Complete Workflows
"Create a blog post about machine learning, optimize it for SEO, 
upload a header image, set it as featured image, assign to 'AI' category, 
and schedule for next Monday at 9 AM"
```

## 🔗 Using with LangGraph

### Installation

```bash
npm install @langchain/langgraph @langchain/anthropic @langchain/mcp-adapters
```

### Integration Example

```typescript
import { MCPClient } from "@modelcontextprotocol/sdk/client/index.js";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";

// Initialize MCP client
const wpMcpClient = new MCPClient({
  name: "wpagent-wordpress",
  version: "1.0.0",
});

// Connect to MCP server
await wpMcpClient.connect({
  command: "node",
  args: ["path/to/wpmcp/dist/index.js"],
  env: {
    WORDPRESS_URL: "https://yourblog.com",
    WORDPRESS_USERNAME: "admin",
    WORDPRESS_PASSWORD: "your-app-password"
  }
});

// Load WordPress tools (49+ tools)
const wpTools = await loadMcpTools("wpagent-wordpress", wpMcpClient);

// Create LangGraph ReAct agent
const agent = createReactAgent({
  llm: new ChatAnthropic({ 
    model: "claude-sonnet-4-20250514",
    apiKey: process.env.ANTHROPIC_API_KEY 
  }),
  tools: wpTools
});

// Use the agent
const result = await agent.invoke({
  messages: [{
    role: "user",
    content: "Create 5 blog posts about AI, optimize them for SEO, and publish them"
  }]
});

// Clean up
await wpMcpClient.disconnect();
```

## 🧪 Testing

### Test Connection

```bash
WORDPRESS_URL=https://yourblog.com \
WORDPRESS_USERNAME=admin \
WORDPRESS_PASSWORD="xxxx xxxx xxxx" \
npm start
```

### Test Specific Tools

```bash
# Build first
npm run build

# Test with MCP client (Claude Desktop, Cline, etc.)
# Ask: "Test my WordPress connection"
# Ask: "Get all my WordPress plugins"
# Ask: "Create a test post"
```

## 🔐 Security Notes

- **Never commit `.env` file** - Added to `.gitignore`
- **Use Application Passwords** - Never use main WordPress password
- **Basic Auth for localhost** - Install Basic Auth plugin for local dev
- **HTTPS in production** - Always use HTTPS for remote WordPress sites
- **Restrict permissions** - Only give necessary user capabilities
- **Rotate passwords** - Change credentials periodically

## 🐛 Troubleshooting

### "Authentication failed"
- **WordPress.com:** Requires Business plan or higher + Application Password
- **Self-hosted:** Install Basic Authentication plugin
- **Verify credentials:** Check username and password are correct
- **Check URL:** Ensure WordPress URL doesn't have trailing slash

### "Tool not found"
- Reload VSCode/Claude Desktop to refresh MCP server
- Rebuild project: `npm run build`
- Check MCP settings configuration

### "Cannot find module"
```bash
npm install
npm run build
```

### "CORS error"
- MCP uses stdio transport (no CORS needed)
- If using HTTP transport, enable CORS in WordPress

## 📊 Performance

- **49+ tools** for comprehensive WordPress management
- **Organized structure** for maintainability
- **TypeScript** for type safety
- **Efficient API calls** with reusable wrapper
- **Helper functions** for consistent formatting

## 🤝 Contributing

Contributions welcome! The project is organized for easy extension:

1. Fork the repository: https://github.com/RaheesAhmed/wordpress-mcp-server
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/wordpress-mcp-server.git`
3. Create feature branch: `git checkout -b feature/amazing-feature`
4. Add new tools in `src/tools/` directory
5. Update types in `src/types/wordpress.ts`
6. Build and test: `npm run build && npm start`
7. Commit changes: `git commit -m 'Add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open Pull Request

**Repository:** https://github.com/RaheesAhmed/wordpress-mcp-server

## 📄 License

MIT License - free to use in your projects!

## 📚 Resources

- [GitHub Repository](https://github.com/RaheesAhmed/wordpress-mcp-server)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [QuickMCP SDK](https://github.com/wong2/quickmcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

[![GitHub stars](https://img.shields.io/github/stars/RaheesAhmed/wordpress-mcp-server?style=social)](https://github.com/RaheesAhmed/wordpress-mcp-server)

---

**Built with ❤️ for AI-powered WordPress automation**

**Repository:** https://github.com/RaheesAhmed/wordpress-mcp-server
