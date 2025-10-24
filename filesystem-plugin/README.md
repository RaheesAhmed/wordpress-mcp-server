# WPMCP File System Manager Plugin

**Version:** 1.0.0  
**Requires WordPress:** 5.0 or higher  
**License:** MIT

## Overview

This plugin enables the WordPress MCP Server to perform secure file system operations on your WordPress installation. It provides REST API endpoints for reading, writing, and managing theme/plugin files with comprehensive security controls.

## Features

✅ **Secure File Operations**
- Read theme and plugin files
- Write/modify files with automatic backups
- Delete files with backup option
- Copy and move files
- List directory contents

✅ **Built-in Security**
- Whitelist-based directory access
- File extension validation
- User permission checks (requires `edit_themes` and `edit_plugins` capabilities)
- Automatic backups before modifications
- Protected backup directory

✅ **Supported Operations**
1. **Read File** - View contents of any allowed file
2. **Write File** - Create or modify files with backup
3. **Delete File** - Remove files with optional backup
4. **Copy File** - Duplicate files
5. **Move File** - Relocate or rename files
6. **List Files** - Browse directory contents (recursive option)
7. **File Info** - Get file metadata (size, modified date, permissions)

## Installation

### Method 1: Manual Upload

1. Download `wpmcp-filesystem.php`
2. Upload to your WordPress plugins directory: `/wp-content/plugins/wpmcp-filesystem/`
3. Activate via **WordPress Admin → Plugins**

### Method 2: Direct File Placement

```bash
# SSH into your WordPress server
cd /path/to/wordpress/wp-content/plugins
mkdir wpmcp-filesystem
cd wpmcp-filesystem

# Copy the plugin file
# Upload wpmcp-filesystem.php to this directory

# Set proper permissions
chmod 644 wpmcp-filesystem.php

# Then activate via WordPress admin
```

### Method 3: WP-CLI

```bash
wp plugin install /path/to/wpmcp-filesystem.zip
wp plugin activate wpmcp-filesystem
```

## Configuration

### Allowed Directories

The plugin restricts file operations to these directories:
- `wp-content/themes/`
- `wp-content/plugins/`
- `wp-content/uploads/`
- `wp-content/mu-plugins/`

### Allowed File Extensions

- **Code:** `.php`, `.js`, `.css`, `.scss`, `.sass`, `.less`
- **Config:** `.json`, `.xml`, `.txt`, `.md`
- **Templates:** `.html`, `.htm`
- **Images:** `.svg`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

### Security Settings

**Permissions Required:**
- User must have `edit_themes` capability
- User must have `edit_plugins` capability

**File Size Limit:** 10MB per file

**Backup Location:** `wp-content/wpmcp-backups/`

## API Endpoints

All endpoints require authentication and proper permissions.

### Base URL
```
https://yoursite.com/wp-json/wpmcp/v1/file/
```

### Available Endpoints

#### 1. Read File
```http
POST /wp-json/wpmcp/v1/file/read
Content-Type: application/json

{
  "path": "wp-content/themes/mytheme/style.css"
}
```

**Response:**
```json
{
  "content": "/* Theme CSS content */",
  "size": 1024,
  "modified": "2024-01-01 12:00:00"
}
```

---

#### 2. Write File
```http
POST /wp-json/wpmcp/v1/file/write
Content-Type: application/json

{
  "path": "wp-content/themes/mytheme/custom.css",
  "content": "/* New CSS */",
  "createBackup": true
}
```

**Response:**
```json
{
  "success": true,
  "backup": "backup_abc123.bak",
  "bytes_written": 256
}
```

---

#### 3. Delete File
```http
POST /wp-json/wpmcp/v1/file/delete
Content-Type: application/json

{
  "path": "wp-content/themes/mytheme/old-file.css",
  "createBackup": true
}
```

---

#### 4. List Files
```http
POST /wp-json/wpmcp/v1/file/list
Content-Type: application/json

{
  "path": "wp-content/themes/mytheme/",
  "recursive": false
}
```

**Response:**
```json
{
  "files": [
    {
      "path": "wp-content/themes/mytheme/style.css",
      "name": "style.css",
      "type": "file",
      "size": 1024,
      "modified": "2024-01-01 12:00:00"
    }
  ]
}
```

---

#### 5. Copy File
```http
POST /wp-json/wpmcp/v1/file/copy
Content-Type: application/json

{
  "source": "wp-content/themes/mytheme/style.css",
  "destination": "wp-content/themes/mytheme/style-backup.css"
}
```

---

#### 6. Move File
```http
POST /wp-json/wpmcp/v1/file/move
Content-Type: application/json

{
  "source": "wp-content/themes/mytheme/old-name.css",
  "destination": "wp-content/themes/mytheme/new-name.css"
}
```

---

#### 7. File Info
```http
POST /wp-json/wpmcp/v1/file/info
Content-Type: application/json

{
  "path": "wp-content/themes/mytheme/style.css"
}
```

**Response:**
```json
{
  "size": 1024,
  "modified": "2024-01-01 12:00:00",
  "permissions": "0644",
  "type": "file"
}
```

## Security Features

### 1. Path Validation
- Prevents directory traversal (`../`)
- Enforces whitelist of allowed directories
- Validates file extensions

### 2. Automatic Backups
- Creates backup before modifications
- Stores in protected directory (`wp-content/wpmcp-backups/`)
- Includes metadata (original path, timestamp, user ID)
- Protected by `.htaccess` (denies web access)

### 3. Permission Checks
- Requires administrator-level capabilities
- Uses WordPress native permission system
- Checks both `edit_themes` and `edit_plugins`

### 4. File Size Limits
- Maximum 10MB per file
- Prevents memory exhaustion
- Configurable limit

## Usage with WordPress MCP Server

Once installed and activated, the WordPress MCP Server can perform file operations:

```javascript
// Example: Read theme file
const result = await mcp.call('wordpress_read_file', {
  path: 'wp-content/themes/twentytwentyfour/style.css'
});

// Example: Modify theme file
await mcp.call('wordpress_write_file', {
  path: 'wp-content/themes/mytheme/custom.css',
  content: '/* Updated styles */',
  createBackup: true
});

// Example: List plugin files
const files = await mcp.call('wordpress_list_files', {
  path: 'wp-content/plugins/myplugin/',
  recursive: true
});
```

## Backup Management

### Backup Structure
```
wp-content/wpmcp-backups/
├── backup_xyz123.bak          # Backed up file
├── backup_xyz123.bak.meta     # Metadata (JSON)
└── .htaccess                  # Protection
```

### Metadata Format
```json
{
  "original_path": "wp-content/themes/mytheme/style.css",
  "timestamp": "2024-01-01 12:00:00",
  "user_id": 1
}
```

### Restoring from Backup

Backups can be restored manually:

```bash
# Locate backup
cd wp-content/wpmcp-backups

# Check metadata
cat backup_xyz123.bak.meta

# Restore file
cp backup_xyz123.bak ../themes/mytheme/style.css
```

## Troubleshooting

### "File not found" Error
- Check file path is correct
- Ensure file exists in WordPress installation
- Verify path is within allowed directories

### "Permission denied" Error
- Confirm user has `edit_themes` and `edit_plugins` capabilities
- Check file system permissions (should be readable/writable by web server)

### "Path outside allowed directories" Error
- File must be within:
  - `wp-content/themes/`
  - `wp-content/plugins/`
  - `wp-content/uploads/`
  - `wp-content/mu-plugins/`

### "File extension not allowed" Error
- Check file extension is in allowed list
- Contact administrator to add extension if needed

## Customization

### Modify Allowed Directories

Edit the `$allowed_dirs` array in the plugin:

```php
private $allowed_dirs = [
    'wp-content/themes',
    'wp-content/plugins',
    'wp-content/uploads',
    'wp-content/mu-plugins',
    'wp-content/custom-dir'  // Add custom directory
];
```

### Modify File Size Limit

Change the `$max_file_size` property:

```php
private $max_file_size = 20971520; // 20MB
```

### Add File Extensions

Add to `$allowed_extensions` array:

```php
private $allowed_extensions = [
    // ... existing extensions
    'yml', 'yaml', 'ini'  // Add new extensions
];
```

## Security Best Practices

1. ✅ **Use Strong Passwords** - Protect WordPress admin accounts
2. ✅ **Limit User Access** - Only give file editing permissions to trusted users
3. ✅ **Regular Backups** - The plugin creates backups, but also backup your entire site
4. ✅ **Monitor Changes** - Review backup directory regularly
5. ✅ **HTTPS Only** - Always use HTTPS for file operations
6. ✅ **Update WordPress** - Keep WordPress and plugins updated

## Support

For issues, feature requests, or contributions:
- **GitHub:** https://github.com/RaheesAhmed/wordpress-mcp-server
- **Documentation:** See main project README

## Changelog

### Version 1.0.0 (2024-10-24)
- Initial release
- File read/write/delete operations
- Automatic backup system
- Security validation
- REST API endpoints

## License

MIT License - See LICENSE file in main project

---

**⚠️ Warning:** This plugin provides powerful file system access. Only install on trusted WordPress installations and ensure proper user permissions are configured.