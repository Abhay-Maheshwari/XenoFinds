const { prisma } = require('../config/prisma');
const ShopifyService = require('./shopify.service');

class DataIngestionService {
  /**
   * Ingest customers from Shopify for a tenant
   * @param {Object} tenant - Tenant object
   * @returns {Object} - Result of the ingestion process
   */
  static async ingestCustomers(tenant) {
    try {
      console.log(`🔄 Starting customer ingestion for ${tenant.name}`);
      const customers = await ShopifyService.fetchCustomers(tenant);
      let created = 0;
      let updated = 0;
      
      console.log(`📥 Fetched ${customers.length} customers from Shopify`);
      
      for (const shopifyCustomer of customers) {
        try {
          // Check if customer exists
          const existingCustomer = await prisma.customer.findFirst({
            where: {
              tenantId: tenant.id,
              shopifyCustomerId: shopifyCustomer.id.toString()
            }
          });

          const customerData = {
            firstName: shopifyCustomer.first_name,
            lastName: shopifyCustomer.last_name,
            email: shopifyCustomer.email,
            phone: shopifyCustomer.phone,
            acceptsMarketing: shopifyCustomer.accepts_marketing || false,
            totalSpent: parseFloat(shopifyCustomer.total_spent || 0),
            ordersCount: shopifyCustomer.orders_count || 0,
            state: shopifyCustomer.state,
            tags: shopifyCustomer.tags || null
          };

          if (existingCustomer) {
            await prisma.customer.update({
              where: { id: existingCustomer.id },
              data: customerData
            });
            updated++;
          } else {
            await prisma.customer.create({
              data: {
                ...customerData,
                shopifyCustomerId: shopifyCustomer.id.toString(),
                tenantId: tenant.id
              }
            });
            created++;
          }
        } catch (customerError) {
          console.error(`Error processing customer ${shopifyCustomer.id}:`, customerError.message);
        }
      }
      
      console.log(`✅ Customer ingestion completed: ${created} created, ${updated} updated`);
      
      return {
        success: true,
        message: `Ingested ${customers.length} customers (${created} created, ${updated} updated)`,
        created,
        updated
      };
    } catch (error) {
      console.error(`Failed to ingest customers for tenant ${tenant.id}:`, error);
      throw new Error('Failed to ingest customers');
    }
  }

  /**
   * Ingest products from Shopify for a tenant
   * @param {Object} tenant - Tenant object
   * @returns {Object} - Result of the ingestion process
   */
  static async ingestProducts(tenant) {
    try {
      console.log(`🔄 Starting product ingestion for ${tenant.name}`);
      const products = await ShopifyService.fetchProducts(tenant);
      let created = 0;
      let updated = 0;
      
      console.log(`📥 Fetched ${products.length} products from Shopify`);
      
      for (const shopifyProduct of products) {
        try {
          // Check if product exists
          const existingProduct = await prisma.product.findFirst({
            where: {
              tenantId: tenant.id,
              shopifyProductId: shopifyProduct.id.toString()
            }
          });

          const productData = {
            title: shopifyProduct.title,
            handle: shopifyProduct.handle,
            vendor: shopifyProduct.vendor,
            productType: shopifyProduct.product_type,
            status: shopifyProduct.status,
            totalInventory: shopifyProduct.variants?.reduce((sum, variant) => sum + (variant.inventory_quantity || 0), 0) || 0,
            tags: shopifyProduct.tags || null
          };

          if (existingProduct) {
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: productData
            });
            updated++;
          } else {
            await prisma.product.create({
              data: {
                ...productData,
                shopifyProductId: shopifyProduct.id.toString(),
                tenantId: tenant.id
              }
            });
            created++;
          }
        } catch (productError) {
          console.error(`Error processing product ${shopifyProduct.id}:`, productError.message);
        }
      }
      
      console.log(`✅ Product ingestion completed: ${created} created, ${updated} updated`);
      
      return {
        success: true,
        message: `Ingested ${products.length} products (${created} created, ${updated} updated)`,
        created,
        updated
      };
    } catch (error) {
      console.error(`Failed to ingest products for tenant ${tenant.id}:`, error);
      throw new Error('Failed to ingest products');
    }
  }

  /**
   * Ingest orders from Shopify for a tenant
   * @param {Object} tenant - Tenant object
   * @returns {Object} - Result of the ingestion process
   */
  /**
   * Sync all data from Shopify for a tenant (simplified for demo)
   * @param {Object} tenant - Tenant object
   * @returns {Object} - Result of the sync process
   */
  static async syncAllData(tenant) {
    try {
      console.log(`🚀 Starting full data sync for ${tenant.name}`);
      
      const results = {
        customers: { created: 0, updated: 0 },
        products: { created: 0, updated: 0 },
        orders: { created: 0, updated: 0 }
      };

      // Sync products first (most important for your store)
      try {
        const productResult = await this.ingestProducts(tenant);
        results.products = { created: productResult.created, updated: productResult.updated };
      } catch (error) {
        console.error('Product sync failed:', error.message);
      }

      // Sync customers
      try {
        const customerResult = await this.ingestCustomers(tenant);
        results.customers = { created: customerResult.created, updated: customerResult.updated };
      } catch (error) {
        console.error('Customer sync failed:', error.message);
      }

      // Update tenant's last synced timestamp
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { lastSyncedAt: new Date() }
      });

      console.log(`🎉 Full sync completed for ${tenant.name}:`, results);
      
      return {
        success: true,
        message: 'Data synchronized successfully',
        results
      };
    } catch (error) {
      console.error(`Failed to sync all data for tenant ${tenant.id}:`, error);
      throw new Error('Failed to sync all data');
    }
  }

  static async ingestOrders(tenant) {
    try {
      console.log(`🔄 Starting order ingestion for ${tenant.name}`);
      const orders = await ShopifyService.fetchOrders(tenant);
      let created = 0;
      let updated = 0;
      
      for (const shopifyOrder of orders) {
        // Find customer by Shopify ID
        let customer = null;
        if (shopifyOrder.customer) {
          customer = await Customer.findOne({
            where: {
              tenantId: tenant.id,
              shopifyCustomerId: shopifyOrder.customer.id.toString()
            },
            transaction
          });
        }
        
        const [order, isCreated] = await Order.findOrCreate({
          where: {
            tenantId: tenant.id,
            shopifyOrderId: shopifyOrder.id.toString()
          },
          defaults: {
            customerId: customer ? customer.id : null,
            orderNumber: shopifyOrder.name,
            orderDate: new Date(shopifyOrder.created_at),
            totalPrice: parseFloat(shopifyOrder.total_price || 0),
            subtotalPrice: parseFloat(shopifyOrder.subtotal_price || 0),
            totalTax: parseFloat(shopifyOrder.total_tax || 0),
            totalDiscounts: parseFloat(shopifyOrder.total_discounts || 0),
            totalShipping: this.calculateShippingTotal(shopifyOrder),
            currency: shopifyOrder.currency,
            financialStatus: shopifyOrder.financial_status,
            fulfillmentStatus: shopifyOrder.fulfillment_status,
            shippingAddress: shopifyOrder.shipping_address,
            billingAddress: shopifyOrder.billing_address,
            lineItems: shopifyOrder.line_items,
            tags: shopifyOrder.tags ? shopifyOrder.tags.split(',') : [],
            metadata: {
              note: shopifyOrder.note,
              cancel_reason: shopifyOrder.cancel_reason,
              cancelled_at: shopifyOrder.cancelled_at,
              closed_at: shopifyOrder.closed_at,
              processed_at: shopifyOrder.processed_at
            }
          },
          transaction
        });
        
        if (isCreated) {
          created++;
        } else {
          // Update existing order
          await order.update({
            customerId: customer ? customer.id : null,
            orderNumber: shopifyOrder.name,
            orderDate: new Date(shopifyOrder.created_at),
            totalPrice: parseFloat(shopifyOrder.total_price || 0),
            subtotalPrice: parseFloat(shopifyOrder.subtotal_price || 0),
            totalTax: parseFloat(shopifyOrder.total_tax || 0),
            totalDiscounts: parseFloat(shopifyOrder.total_discounts || 0),
            totalShipping: this.calculateShippingTotal(shopifyOrder),
            currency: shopifyOrder.currency,
            financialStatus: shopifyOrder.financial_status,
            fulfillmentStatus: shopifyOrder.fulfillment_status,
            shippingAddress: shopifyOrder.shipping_address,
            billingAddress: shopifyOrder.billing_address,
            lineItems: shopifyOrder.line_items,
            tags: shopifyOrder.tags ? shopifyOrder.tags.split(',') : [],
            metadata: {
              note: shopifyOrder.note,
              cancel_reason: shopifyOrder.cancel_reason,
              cancelled_at: shopifyOrder.cancelled_at,
              closed_at: shopifyOrder.closed_at,
              processed_at: shopifyOrder.processed_at
            }
          }, { transaction });
          
          updated++;
        }
      }
      
      await transaction.commit();
      
      return {
        success: true,
        message: `Ingested ${orders.length} orders (${created} created, ${updated} updated)`
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`Failed to ingest orders for tenant ${tenant.id}:`, error);
      throw new Error('Failed to ingest orders');
    }
  }

  /**
   * Calculate shipping total from order
   * @param {Object} order - Shopify order object
   * @returns {number} - Total shipping amount
   */
  static calculateShippingTotal(order) {
    if (!order.shipping_lines || !order.shipping_lines.length) {
      return 0;
    }
    
    return order.shipping_lines.reduce((total, line) => {
      return total + parseFloat(line.price || 0);
    }, 0);
  }

  /**
   * Ingest products from Shopify for a tenant
   * @param {Object} tenant - Tenant object
   * @returns {Object} - Result of the ingestion process
   */
  static async ingestProducts(tenant) {
    const transaction = await sequelize.transaction();
    
    try {
      const products = await ShopifyService.fetchProducts(tenant);
      let created = 0;
      let updated = 0;
      
      for (const shopifyProduct of products) {
        const [product, isCreated] = await Product.findOrCreate({
          where: {
            tenantId: tenant.id,
            shopifyProductId: shopifyProduct.id.toString()
          },
          defaults: {
            title: shopifyProduct.title,
            description: shopifyProduct.body_html,
            vendor: shopifyProduct.vendor,
            productType: shopifyProduct.product_type,
            handle: shopifyProduct.handle,
            status: shopifyProduct.status,
            publishedAt: shopifyProduct.published_at,
            images: shopifyProduct.images,
            variants: shopifyProduct.variants,
            options: shopifyProduct.options,
            tags: shopifyProduct.tags ? shopifyProduct.tags.split(',') : [],
            metadata: {
              template_suffix: shopifyProduct.template_suffix,
              published_scope: shopifyProduct.published_scope
            }
          },
          transaction
        });
        
        if (isCreated) {
          created++;
        } else {
          // Update existing product
          await product.update({
            title: shopifyProduct.title,
            description: shopifyProduct.body_html,
            vendor: shopifyProduct.vendor,
            productType: shopifyProduct.product_type,
            handle: shopifyProduct.handle,
            status: shopifyProduct.status,
            publishedAt: shopifyProduct.published_at,
            images: shopifyProduct.images,
            variants: shopifyProduct.variants,
            options: shopifyProduct.options,
            tags: shopifyProduct.tags ? shopifyProduct.tags.split(',') : [],
            metadata: {
              template_suffix: shopifyProduct.template_suffix,
              published_scope: shopifyProduct.published_scope
            }
          }, { transaction });
          
          updated++;
        }
      }
      
      await transaction.commit();
      
      return {
        success: true,
        message: `Ingested ${products.length} products (${created} created, ${updated} updated)`
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`Failed to ingest products for tenant ${tenant.id}:`, error);
      throw new Error('Failed to ingest products');
    }
  }

  /**
   * Ingest abandoned checkouts from Shopify for a tenant (bonus feature)
   * @param {Object} tenant - Tenant object
   * @returns {Object} - Result of the ingestion process
   */
  static async ingestAbandonedCheckouts(tenant) {
    const transaction = await sequelize.transaction();
    
    try {
      const checkouts = await ShopifyService.fetchAbandonedCheckouts(tenant);
      let created = 0;
      
      for (const checkout of checkouts) {
        // Find customer by Shopify ID
        let customer = null;
        if (checkout.customer) {
          customer = await Customer.findOne({
            where: {
              tenantId: tenant.id,
              shopifyCustomerId: checkout.customer.id.toString()
            },
            transaction
          });
        }
        
        // Check if event already exists
        const existingEvent = await CustomEvent.findOne({
          where: {
            tenantId: tenant.id,
            eventType: 'cart_abandoned',
            shopifyId: checkout.id.toString()
          },
          transaction
        });
        
        if (!existingEvent) {
          await CustomEvent.create({
            tenantId: tenant.id,
            eventType: 'cart_abandoned',
            shopifyId: checkout.id.toString(),
            customerId: customer ? customer.id : null,
            eventDate: new Date(checkout.created_at),
            data: {
              checkout: checkout
            }
          }, { transaction });
          
          created++;
        }
      }
      
      await transaction.commit();
      
      return {
        success: true,
        message: `Ingested ${created} abandoned checkout events`
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`Failed to ingest abandoned checkouts for tenant ${tenant.id}:`, error);
      throw new Error('Failed to ingest abandoned checkouts');
    }
  }

  /**
   * Sync all data for a tenant
   * @param {Object} tenant - Tenant object
   * @returns {Object} - Result of the sync process
   */
  static async syncAllData(tenant) {
    try {
      const customerResult = await this.ingestCustomers(tenant);
      const orderResult = await this.ingestOrders(tenant);
      const productResult = await this.ingestProducts(tenant);
      
      // Update last synced timestamp
      await tenant.update({
        lastSyncedAt: new Date()
      });
      
      return {
        success: true,
        customers: customerResult,
        orders: orderResult,
        products: productResult
      };
    } catch (error) {
      console.error(`Failed to sync all data for tenant ${tenant.id}:`, error);
      throw new Error('Failed to sync all data');
    }
  }
}

module.exports = DataIngestionService;
