const Shopify = require('shopify-api-node');

class ShopifyService {
  static initializeClient(tenant) {
    try {
      if (tenant.accessToken) {
        console.log(`🔗 Initializing Shopify client for ${tenant.shopifyStoreUrl} with access token`);
        return new Shopify({
          shopName: tenant.shopifyStoreUrl.replace('.myshopify.com', ''),
          accessToken: tenant.accessToken
        });
      } else {
        console.log(`🔗 Initializing Shopify client for ${tenant.shopifyStoreUrl} with API key`);
        return new Shopify({
          shopName: tenant.shopifyStoreUrl.replace('.myshopify.com', ''),
          apiKey: tenant.shopifyApiKey,
          password: tenant.shopifyApiSecret
        });
      }
    } catch (error) {
      console.error(`Failed to initialize Shopify client for tenant ${tenant.id}:`, error);
      throw new Error('Failed to initialize Shopify client');
    }
  }

  static async fetchCustomers(tenant, options = {}) {
    try {
      const shopify = this.initializeClient(tenant);
      const customers = await shopify.customer.list({
        limit: 250,
        ...options
      });
      return customers;
    } catch (error) {
      console.error(`Failed to fetch customers for tenant ${tenant.id}:`, error);
      throw new Error('Failed to fetch customers from Shopify');
    }
  }

  static async fetchOrders(tenant, options = {}) {
    try {
      const shopify = this.initializeClient(tenant);
      const orders = await shopify.order.list({
        limit: 250,
        status: 'any',
        ...options
      });
      return orders;
    } catch (error) {
      console.error(`Failed to fetch orders for tenant ${tenant.id}:`, error);
      throw new Error('Failed to fetch orders from Shopify');
    }
  }

  static async fetchProducts(tenant, options = {}) {
    try {
      const shopify = this.initializeClient(tenant);
      const products = await shopify.product.list({
        limit: 250,
        ...options
      });
      return products;
    } catch (error) {
      console.error(`Failed to fetch products for tenant ${tenant.id}:`, error);
      throw new Error('Failed to fetch products from Shopify');
    }
  }

  /**
   * Fetch abandoned checkouts from Shopify (for bonus feature)
   * @param {Object} tenant - Tenant object
   * @param {Object} options - Query options (limit, status, etc.)
   * @returns {Array} - List of abandoned checkouts
   */
  static async fetchAbandonedCheckouts(tenant, options = {}) {
    try {
      const shopify = this.initializeClient(tenant);
      const checkouts = await shopify.checkout.list({
        limit: 250,
        status: 'open',
        ...options
      });
      return checkouts;
    } catch (error) {
      console.error(`Failed to fetch abandoned checkouts for tenant ${tenant.id}:`, error);
      throw new Error('Failed to fetch abandoned checkouts from Shopify');
    }
  }
}

module.exports = ShopifyService;
