const bcrypt = require('bcrypt');
const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

const testUsers = [
  {
    id: 'user1',
    name: 'Xeno Finds Store',
    email: 'demo1@example.com',
    password: 'password123',
    shopifyStoreUrl: 'xenofinds.myshopify.com',
    shopifyApiKey: 'c9fb59c113baf471edc6c83973bb0f03',
    shopifyApiSecret: '3740ad2663aefc2f62fbd60b4a8a38b4',
    accessToken: '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'
  },
  {
    id: 'user2', 
    name: 'Fashion Boutique',
    email: 'fashion@example.com',
    password: 'password123',
    shopifyStoreUrl: 'fashion-boutique.myshopify.com',
    shopifyApiKey: 'demo-api-key-2',
    shopifyApiSecret: 'demo-api-secret-2'
  },
  {
    id: 'user3',
    name: 'Tech Gadgets Store',
    email: 'tech@example.com', 
    password: 'password123',
    shopifyStoreUrl: 'tech-gadgets.myshopify.com',
    shopifyApiKey: 'demo-api-key-3',
    shopifyApiSecret: 'demo-api-secret-3'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      testUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );

    // Clear existing data
    await prisma.customEvent.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.tenant.deleteMany();

    // Create tenants
    const createdTenants = await Promise.all(
      hashedUsers.map(async (user) => {
        return await prisma.tenant.create({
          data: {
            name: user.name,
            email: user.email,
            password: user.password,
            shopifyStoreUrl: user.shopifyStoreUrl,
            shopifyApiKey: user.shopifyApiKey,
            shopifyApiSecret: user.shopifyApiSecret,
            accessToken: user.accessToken || null,
            isActive: true
          }
        });
      })
    );

    // Add sample customers for each tenant
    for (const tenant of createdTenants) {
      await prisma.customer.createMany({
        data: [
          {
            shopifyCustomerId: `${tenant.id}_customer_1`,
            firstName: 'John',
            lastName: 'Doe',
            email: `john.doe@${tenant.name.toLowerCase().replace(/\s/g, '')}.com`,
            phone: '+1234567890',
            acceptsMarketing: true,
            totalSpent: 299.99,
            ordersCount: 3,
            tenantId: tenant.id
          },
          {
            shopifyCustomerId: `${tenant.id}_customer_2`,
            firstName: 'Jane',
            lastName: 'Smith',
            email: `jane.smith@${tenant.name.toLowerCase().replace(/\s/g, '')}.com`,
            phone: '+1234567891',
            acceptsMarketing: false,
            totalSpent: 149.50,
            ordersCount: 1,
            tenantId: tenant.id
          }
        ]
      });

      // Add sample products
      await prisma.product.createMany({
        data: [
          {
            shopifyProductId: `${tenant.id}_product_1`,
            title: 'Premium Widget',
            handle: 'premium-widget',
            vendor: 'Widget Co',
            productType: 'Electronics',
            status: 'active',
            totalInventory: 50,
            tags: 'featured,premium',
            tenantId: tenant.id
          },
          {
            shopifyProductId: `${tenant.id}_product_2`,
            title: 'Basic Gadget',
            handle: 'basic-gadget',
            vendor: 'Gadget Inc',
            productType: 'Accessories',
            status: 'active',
            totalInventory: 100,
            tags: 'popular,affordable',
            tenantId: tenant.id
          }
        ]
      });

      // Add sample orders
      const customers = await prisma.customer.findMany({
        where: { tenantId: tenant.id }
      });

      if (customers.length > 0) {
        await prisma.order.createMany({
          data: [
            {
              shopifyOrderId: `${tenant.id}_order_1`,
              orderNumber: '1001',
              totalPrice: 199.99,
              subtotalPrice: 179.99,
              totalTax: 20.00,
              currency: 'USD',
              financialStatus: 'paid',
              fulfillmentStatus: 'fulfilled',
              processedAt: new Date(),
              tenantId: tenant.id,
              customerId: customers[0].id
            },
            {
              shopifyOrderId: `${tenant.id}_order_2`,
              orderNumber: '1002',
              totalPrice: 99.99,
              subtotalPrice: 89.99,
              totalTax: 10.00,
              currency: 'USD',
              financialStatus: 'paid',
              fulfillmentStatus: 'pending',
              processedAt: new Date(),
              tenantId: tenant.id,
              customerId: customers[1].id
            }
          ]
        });
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n🔑 Test Users Created:');
    testUsers.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${createdTenants[index].id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Store: ${user.name}`);
    });

    // Try to sync Shopify data for the first tenant (Xeno Finds Store)
    console.log('\n🔄 Attempting to sync Shopify data...');
    try {
      const DataIngestionService = require('./services/ingestion.service');
      const result = await DataIngestionService.syncAllData(createdTenants[0]);
      console.log('✅ Shopify sync completed:', result);
    } catch (error) {
      console.log('⚠️ Shopify sync failed (this is expected for demo):', error.message);
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, testUsers };
