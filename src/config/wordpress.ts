/**
 * WordPress Configuration
 * Loads environment variables and provides configuration
 */

export const config = {
  url: process.env.WORDPRESS_URL || '',
  username: process.env.WORDPRESS_USERNAME || '',
  password: process.env.WORDPRESS_PASSWORD || '',
  
  // Create Basic Auth token
  getAuthToken: (): string => {
    const { username, password } = config;
    return Buffer.from(`${username}:${password}`).toString('base64');
  },
  
  // Validate configuration
  validate: (): void => {
    if (!config.url || !config.username || !config.password) {
      console.error('❌ Error: Missing required environment variables');
      console.error('Please set: WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_PASSWORD');
      process.exit(1);
    }
  }
};
