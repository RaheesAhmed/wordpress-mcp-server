/**
 * WordPress REST API Wrapper
 * Handles all API calls to WordPress
 */

import fetch from 'node-fetch';
import { config } from '../config/wordpress.js';

/**
 * Call WordPress REST API
 * @param endpoint - API endpoint (e.g., '/posts', '/users/me')
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param body - Request body for POST/PUT requests
 * @returns API response data
 */
export async function callWordPressAPI(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const url = `${config.url}/wp-json/wp/v2${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${config.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to call WordPress API: ${(error as Error).message}`);
  }
}

/**
 * Call WordPress root API (for site info)
 * @returns Site information
 */
export async function callWordPressRootAPI(): Promise<any> {
  const url = `${config.url}/wp-json/`;
  
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Basic ${config.getAuthToken()}` }
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to call WordPress root API: ${(error as Error).message}`);
  }
}

/**
 * Call custom WordPress REST API endpoint (with custom namespace)
 * @param fullEndpoint - Complete endpoint path (e.g., '/wp-json/wpmcp/v1/file/read')
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param body - Request body for POST/PUT requests
 * @returns API response data
 */
export async function callCustomAPI(
  fullEndpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  // Remove leading slash if present
  const cleanEndpoint = fullEndpoint.startsWith('/') ? fullEndpoint.slice(1) : fullEndpoint;
  const url = `${config.url}/${cleanEndpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${config.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to call WordPress API: ${(error as Error).message}`);
  }
}

/**
 * Upload media file to WordPress
 * @param fileBase64 - Base64 encoded file
 * @param filename - File name
 * @returns Media object
 */
export async function uploadMediaFile(fileBase64: string, filename: string): Promise<any> {
  const buffer = Buffer.from(fileBase64, 'base64');
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
  
  const body = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    'Content-Type: application/octet-stream',
    '',
    buffer.toString('binary'),
    `--${boundary}--`
  ].join('\r\n');

  const url = `${config.url}/wp-json/wp/v2/media`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${config.getAuthToken()}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to upload media: ${(error as Error).message}`);
  }
}
