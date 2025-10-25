# WordPress MCP Server Plugin

**Version:** 2.0.0  
**Requires WordPress:** 5.0+  
**Requires PHP:** 7.2+  
**License:** MIT

## Overview

Single comprehensive plugin that enables all WordPress MCP Server features:
- ✅ File System Operations (read, write, delete, copy, move)
- ✅ Shortcode Management (list, execute)
- ✅ Cron Job Scheduling (list, schedule, run)
- ✅ Widget Management (via WordPress REST API)

## Quick Installation

### Method 1: Upload via WordPress Admin

1. Download `wpmcp-plugin.php`
2. Go to **WordPress Admin → Plugins → Add New → Upload Plugin**
3. Upload `wpmcp-plugin.php`
4. Click **Activate**

### Method 2: Manual Upload

```bash
# SSH into your WordPress server
cd /path/to/wordpress/wp-content/plugins

# Create plugin directory
mkdir wpmcp-plugin
cd wpmcp-plugin

# Copy the plugin file
# Upload wpmcp-plugin.php to this directory

# Set permissions
chmod 644 wpmcp-plugin.php

# Activate via WordPress Admin → Plugins
```

### Method 3: WP-CLI

```bash
wp plugin install /path/to/wpmcp-plugin.php
wp plugin activate wpmcp-plugin
```

## Features

### File System Operations

**Endpoints:**
- `/wp-json/wpmcp/v1/file/read` - Read file contents
- `/wp-json/wpmcp/v1/file/write` - Create/modify files
- `/wp-json/wpmcp/v1/file/delete` - Remove files
- `/wp-json/wpmcp/v1/file/copy` - Duplicate files
- `/wp-json/wpmcp/v1/file/move` - Relocate files
- `/wp-json/wpmcp/v1/file/list` - List directory contents
- `/wp-json/wpmcp/v1/file/info` - Get file metadata

**Security:**
- Allowed directories: `wp-content/themes/`, `wp-content/plugins/`, `wp-content/uploads/`, `wp-content/mu-plugins/`
- Allowed extensions: `.php`, `.js`, `.css`, `.scss`, `.json`, `.html`, `.xml`, `.txt`, `.md`, images
- Automatic backups before modifications
- Path validation (prevents directory traversal)
- File size limit: 10MB
- Requires `edit_themes` + `edit_plugins` capabilities

### Shortcode Management

**Endpoints:**
- `/wp-json/wpmcp/v1/shortcodes/list` - Get all registered shortcodes
- `/wp-json/wpmcp/v1/shortcodes/execute` - Process shortcode string

**Use Cases:**
- Discover available shortcodes
- Test shortcode output
- Execute shortcodes programmatically

### Cron Job Scheduling

**Endpoints:**
- `/wp-json/wpmcp/v1/cron/list` - Get all scheduled events
- `/wp-json/wpmcp/v1/cron/schedule` - Create scheduled task
- `/wp-json/wpmcp/v1/cron/unschedule` - Remove scheduled event
- `/wp-json/wpmcp/v1/cron/run` - Trigger cron manually

**Use Cases:**
- Monitor scheduled tasks
- Add custom recurring events
- Debug cron issues
- Run maintenance tasks

### Widget System

**Access via WordPress REST API:**
- `/wp/v2/sidebars` - Widget areas
- `/wp/v2/widgets` - All widgets
- `/wp/v2/widget-types` - Available widget types

**Note:** Widgets use standard WordPress REST API endpoints.

## Configuration

### Permissions Required

**File Operations:**
- User must have `edit_themes` capability
- User must have `edit_plugins` capability

**Advanced Features:**
- User must have `manage_options` capability (administrator)

### Backup System

**Location:** `wp-content/wpmcp-backups/`

**Features:**
- Automatic backups before file modifications
- Metadata stored (.meta files)
- Protected with `.htaccess` (deny web access)
- Manual restore capability

**Backup Structure:**
```
wp-content/wpmcp-backups/
├── backup_xyz123.bak       # Backed up file
├── backup_xyz123.bak.meta  # Metadata (JSON)
└── .htaccess               # Protection
```

## Security

### File System Protection

**Whitelist Approach:**
- Only specified directories allowed
- Only approved file extensions
- Path traversal attempts blocked
- Automatic backup before changes

**Forbidden Directories:**
- WordPress core files
- System directories
- User directories
- Database directories

### Permission System

All endpoints require proper WordPress capabilities:
- File operations: `edit_themes` AND `edit_plugins`
- Admin operations: `manage_options`

### Best Practices

1. ✅ Use strong admin passwords
2. ✅ Enable HTTPS
3. ✅ Keep WordPress updated
4. ✅ Regular backups
5. ✅ Monitor plugin changes
6. ✅ Limit admin access

## API Usage Examples

### Read Theme File

```http
POST /wp-json/wpmcp/v1/file/read
Content-Type: application/json
Authorization: Basic {base64(username:password)}

{
  "path": "wp-content/themes/mytheme/style.css"
}
```

### List Shortcodes

```http
GET /wp-json/wpmcp/v1/shortcodes/list
Authorization: Basic {base64(username:password)}
```

### Schedule Cron Job

```http
POST /wp-json/wpmcp/v1/cron/schedule
Content-Type: application/json
Authorization: Basic {base64(username:password)}

{
  "hook": "my_custom_task",
  "recurrence": "daily",
  "args": []
}
```

## Troubleshooting

### "Permission denied" Error
- Verify user has required capabilities
- Check file permissions on server
- Ensure WordPress user can write to directories

### "File not found" Error
- Check file path is correct
- Verify file exists in WordPress
- Ensure path uses forward slashes

### "Path not allowed" Error
- File must be in allowed directories
- Cannot access core WordPress files
- Cannot access system files

### Plugin Not Working
- Check plugin is activated
- Verify WordPress version 5.0+
- Ensure PHP 7.2+
- Check REST API is enabled

## Changelog

### Version 2.0.0 (2024-10-25)
- Complete rewrite combining all features
- File system operations
- Shortcode management
- Cron job scheduling
- Enhanced security
- Automatic backups
- Comprehensive error handling

### Version 1.0.0 (2024-10-24)
- Initial release (file system only)

## Support

- **GitHub:** https://github.com/RaheesAhmed/wordpress-mcp-server
- **Issues:** Report bugs or request features
- **Documentation:** See main project README

## License

MIT License - See LICENSE in main project

---

**⚠️ Important:** This plugin provides powerful WordPress control. Only install on trusted WordPress installations with proper admin security.