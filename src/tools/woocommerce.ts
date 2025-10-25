/**
 * WordPress WooCommerce Integration Tools
 * Complete e-commerce management for WooCommerce-powered sites
 */

import { Responses } from 'quickmcp-sdk';
import { callWordPressAPI } from '../utils/api.js';
import { buildQueryString } from '../utils/helpers.js';

export function registerWooCommerceTools(server: any) {
  
  // ========== PRODUCT MANAGEMENT ==========
  
  /**
   * Create WooCommerce product
   */
  server.tool('wordpress_wc_create_product', async (args: any) => {
    const {
      name,
      type = 'simple',
      regular_price,
      description = '',
      short_description = '',
      categories = [],
      images = [],
      status = 'publish'
    } = args;
    
    try {
      const productData: any = {
        name,
        type,
        regular_price,
        description,
        short_description,
        categories,
        images,
        status
      };
      
      const product = await callWordPressAPI('/products', 'POST', productData, 'wc/v3');
      
      return Responses.success(
        {
          id: product.id,
          name: product.name,
          price: product.regular_price,
          sku: product.sku,
          permalink: product.permalink
        },
        `✅ Created product: "${name}" (ID: ${product.id})`
      );
    } catch (error) {
      return Responses.error(`Failed to create product: ${(error as Error).message}`);
    }
  }, {
    description: 'Create a new WooCommerce product',
    schema: {
      name: 'string',
      regular_price: 'string'
    }
  });
  
  /**
   * Update WooCommerce product
   */
  server.tool('wordpress_wc_update_product', async (args: any) => {
    const { productId, updates } = args;
    
    try {
      const product = await callWordPressAPI(`/products/${productId}`, 'PUT', updates, 'wc/v3');
      
      return Responses.success(
        {
          id: product.id,
          name: product.name,
          updated: true
        },
        `✅ Updated product ID ${productId}`
      );
    } catch (error) {
      return Responses.error(`Failed to update product: ${(error as Error).message}`);
    }
  }, {
    description: 'Update WooCommerce product',
    schema: {
      productId: 'number',
      updates: 'object'
    }
  });
  
  /**
   * Get WooCommerce products
   */
  server.tool('wordpress_wc_get_products', async (args: any) => {
    const { perPage = 10, page = 1, search, status, category } = args || {};
    
    try {
      const params: any = { per_page: perPage, page };
      if (search) params.search = search;
      if (status) params.status = status;
      if (category) params.category = category;
      
      const queryString = buildQueryString(params);
      const products = await callWordPressAPI(`/products?${queryString}`, 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          products: products.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: p.price,
            regular_price: p.regular_price,
            sale_price: p.sale_price,
            stock_status: p.stock_status,
            stock_quantity: p.stock_quantity
          })),
          total: products.length
        },
        `🛍️ Retrieved ${products.length} products`
      );
    } catch (error) {
      return Responses.error(`Failed to get products: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WooCommerce products with filtering',
    schema: {}
  });
  
  /**
   * Delete WooCommerce product
   */
  server.tool('wordpress_wc_delete_product', async (args: any) => {
    const { productId, force = false } = args;
    
    try {
      const params = force ? '?force=true' : '';
      await callWordPressAPI(`/products/${productId}${params}`, 'DELETE', undefined, 'wc/v3');
      
      return Responses.success(
        {
          id: productId,
          deleted: true
        },
        `✅ Deleted product ID ${productId}`
      );
    } catch (error) {
      return Responses.error(`Failed to delete product: ${(error as Error).message}`);
    }
  }, {
    description: 'Delete WooCommerce product',
    schema: {
      productId: 'number',
      force: 'boolean'
    }
  });
  
  // ========== ORDER MANAGEMENT ==========
  
  /**
   * Get WooCommerce orders
   */
  server.tool('wordpress_wc_get_orders', async (args: any) => {
    const { perPage = 10, page = 1, status, customer } = args || {};
    
    try {
      const params: any = { per_page: perPage, page };
      if (status) params.status = status;
      if (customer) params.customer = customer;
      
      const queryString = buildQueryString(params);
      const orders = await callWordPressAPI(`/orders?${queryString}`, 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          orders: orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.number,
            status: o.status,
            total: o.total,
            customerName: o.billing?.first_name + ' ' + o.billing?.last_name,
            dateCreated: o.date_created,
            paymentMethod: o.payment_method_title
          })),
          total: orders.length
        },
        `📦 Retrieved ${orders.length} orders`
      );
    } catch (error) {
      return Responses.error(`Failed to get orders: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WooCommerce orders with filtering',
    schema: {}
  });
  
  /**
   * Update order status
   */
  server.tool('wordpress_wc_update_order_status', async (args: any) => {
    const { orderId, status } = args;
    
    try {
      const order = await callWordPressAPI(`/orders/${orderId}`, 'PUT', { status }, 'wc/v3');
      
      return Responses.success(
        {
          id: order.id,
          status: order.status,
          updated: true
        },
        `✅ Updated order ${orderId} to ${status}`
      );
    } catch (error) {
      return Responses.error(`Failed to update order: ${(error as Error).message}`);
    }
  }, {
    description: 'Update WooCommerce order status',
    schema: {
      orderId: 'number',
      status: 'string'
    }
  });
  
  // ========== CUSTOMER MANAGEMENT ==========
  
  /**
   * Get WooCommerce customers
   */
  server.tool('wordpress_wc_get_customers', async (args: any) => {
    const { perPage = 10, page = 1, search, role } = args || {};
    
    try {
      const params: any = { per_page: perPage, page };
      if (search) params.search = search;
      if (role) params.role = role;
      
      const queryString = buildQueryString(params);
      const customers = await callWordPressAPI(`/customers?${queryString}`, 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          customers: customers.map((c: any) => ({
            id: c.id,
            email: c.email,
            firstName: c.first_name,
            lastName: c.last_name,
            username: c.username,
            ordersCount: c.orders_count || 0,
            totalSpent: c.total_spent || '0'
          })),
          total: customers.length
        },
        `👥 Retrieved ${customers.length} customers`
      );
    } catch (error) {
      return Responses.error(`Failed to get customers: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WooCommerce customers',
    schema: {}
  });
  
  // ========== INVENTORY MANAGEMENT ==========
  
  /**
   * Update product stock
   */
  server.tool('wordpress_wc_update_stock', async (args: any) => {
    const { productId, stockQuantity, stockStatus } = args;
    
    try {
      const updates: any = {};
      if (stockQuantity !== undefined) updates.stock_quantity = stockQuantity;
      if (stockStatus) updates.stock_status = stockStatus;
      
      const product = await callWordPressAPI(`/products/${productId}`, 'PUT', updates, 'wc/v3');
      
      return Responses.success(
        {
          id: product.id,
          name: product.name,
          stock_quantity: product.stock_quantity,
          stock_status: product.stock_status
        },
        `✅ Updated stock for product ${productId}`
      );
    } catch (error) {
      return Responses.error(`Failed to update stock: ${(error as Error).message}`);
    }
  }, {
    description: 'Update product inventory/stock levels',
    schema: {
      productId: 'number'
    }
  });
  
  // ========== COUPON MANAGEMENT ==========
  
  /**
   * Create WooCommerce coupon
   */
  server.tool('wordpress_wc_create_coupon', async (args: any) => {
    const {
      code,
      discount_type = 'percent',
      amount,
      description = '',
      expiry_date
    } = args;
    
    try {
      const couponData: any = {
        code,
        discount_type,
        amount,
        description
      };
      
      if (expiry_date) couponData.date_expires = expiry_date;
      
      const coupon = await callWordPressAPI('/coupons', 'POST', couponData, 'wc/v3');
      
      return Responses.success(
        {
          id: coupon.id,
          code: coupon.code,
          amount: coupon.amount,
          type: coupon.discount_type
        },
        `✅ Created coupon: ${code}`
      );
    } catch (error) {
      return Responses.error(`Failed to create coupon: ${(error as Error).message}`);
    }
  }, {
    description: 'Create WooCommerce discount coupon',
    schema: {
      code: 'string',
      amount: 'string'
    }
  });
  
  /**
   * Get WooCommerce coupons
   */
  server.tool('wordpress_wc_get_coupons', async (args: any) => {
    const { perPage = 10, page = 1 } = args || {};
    
    try {
      const params = { per_page: perPage, page };
      const queryString = buildQueryString(params);
      const coupons = await callWordPressAPI(`/coupons?${queryString}`, 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          coupons: coupons.map((c: any) => ({
            id: c.id,
            code: c.code,
            amount: c.amount,
            type: c.discount_type,
            usageCount: c.usage_count || 0
          })),
          total: coupons.length
        },
        `🎫 Retrieved ${coupons.length} coupons`
      );
    } catch (error) {
      return Responses.error(`Failed to get coupons: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WooCommerce coupons',
    schema: {}
  });
  
  // ========== PAYMENT & SHIPPING ==========
  
  /**
   * Get payment gateways
   */
  server.tool('wordpress_wc_get_payment_gateways', async () => {
    try {
      const gateways = await callWordPressAPI('/payment_gateways', 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          gateways: gateways.map((g: any) => ({
            id: g.id,
            title: g.title,
            description: g.description,
            enabled: g.enabled,
            order: g.order
          })),
          total: gateways.length
        },
        `💳 Retrieved ${gateways.length} payment gateways`
      );
    } catch (error) {
      return Responses.error(`Failed to get payment gateways: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WooCommerce payment gateways',
    schema: {}
  });
  
  /**
   * Get shipping zones
   */
  server.tool('wordpress_wc_get_shipping_zones', async () => {
    try {
      const zones = await callWordPressAPI('/shipping/zones', 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          zones: zones.map((z: any) => ({
            id: z.id,
            name: z.name,
            order: z.order
          })),
          total: zones.length
        },
        `📍 Retrieved ${zones.length} shipping zones`
      );
    } catch (error) {
      return Responses.error(`Failed to get shipping zones: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WooCommerce shipping zones',
    schema: {}
  });
  
  // ========== REPORTS & ANALYTICS ==========
  
  /**
   * Get sales report
   */
  server.tool('wordpress_wc_get_sales_report', async (args: any) => {
    const { period = 'week', date_min, date_max } = args || {};
    
    try {
      const params: any = { period };
      if (date_min) params.date_min = date_min;
      if (date_max) params.date_max = date_max;
      
      const queryString = buildQueryString(params);
      const report = await callWordPressAPI(`/reports/sales?${queryString}`, 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          totalSales: report.total_sales || '0',
          netSales: report.net_sales || '0',
          totalOrders: report.total_orders || 0,
          totalItems: report.total_items || 0,
          totalTax: report.total_tax || '0',
          totalShipping: report.total_shipping || '0',
          averageOrderValue: report.average_sales || '0'
        },
        `📊 Sales report for ${period}`
      );
    } catch (error) {
      return Responses.error(`Failed to get sales report: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WooCommerce sales report/analytics',
    schema: {}
  });
  
  /**
   * Get top sellers
   */
  server.tool('wordpress_wc_get_top_sellers', async (args: any) => {
    const { perPage = 10, period = 'week' } = args || {};
    
    try {
      const params = { per_page: perPage, period };
      const queryString = buildQueryString(params);
      const topSellers = await callWordPressAPI(`/reports/top_sellers?${queryString}`, 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          products: topSellers.map((p: any) => ({
            productId: p.product_id,
            title: p.title,
            quantity: p.quantity
          })),
          total: topSellers.length
        },
        `🏆 Top ${topSellers.length} selling products`
      );
    } catch (error) {
      return Responses.error(`Failed to get top sellers: ${(error as Error).message}`);
    }
  }, {
    description: 'Get top selling products',
    schema: {}
  });
  
  // ========== CATEGORIES & ATTRIBUTES ==========
  
  /**
   * Get product categories
   */
  server.tool('wordpress_wc_get_product_categories', async (args: any) => {
    const { perPage = 100 } = args || {};
    
    try {
      const params = { per_page: perPage };
      const queryString = buildQueryString(params);
      const categories = await callWordPressAPI(`/products/categories?${queryString}`, 'GET', undefined, 'wc/v3');
      
      return Responses.success(
        {
          categories: categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            parent: c.parent,
            count: c.count
          })),
          total: categories.length
        },
        `📁 Retrieved ${categories.length} product categories`
      );
    } catch (error) {
      return Responses.error(`Failed to get categories: ${(error as Error).message}`);
    }
  }, {
    description: 'Get WooCommerce product categories',
    schema: {}
  });
  
  /**
   * Check if WooCommerce is active
   */
  server.tool('wordpress_wc_is_active', async () => {
    try {
      const plugins = await callWordPressAPI('/plugins');
      const woocommerce = plugins.find((p: any) => p.plugin === 'woocommerce/woocommerce.php');
      
      return Responses.success(
        {
          installed: !!woocommerce,
          active: woocommerce?.status === 'active',
          version: woocommerce?.version || null
        },
        woocommerce?.status === 'active' 
          ? `✅ WooCommerce ${woocommerce.version} is active` 
          : `❌ WooCommerce not active`
      );
    } catch (error) {
      return Responses.error(`Failed to check WooCommerce: ${(error as Error).message}`);
    }
  }, {
    description: 'Check if WooCommerce is installed and active',
    schema: {}
  });
}