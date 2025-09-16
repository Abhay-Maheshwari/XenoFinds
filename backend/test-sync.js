require('dotenv').config();
const { PrismaClient } = require('./src/generated/prisma');
const DataIngestionService = require('./src/services/ingestion.service');

const prisma = new PrismaClient();

async function testSync() {
  try {
    console.log('🧪 Testing Shopify sync...');
    
    // Get the first tenant (should be Xeno Finds Store)
    const tenant = await prisma.tenant.findFirst({
      where: { 
        isActive: true,
        shopifyStoreUrl: { not: null }
      }
    });
    
    if (!tenant) {
      console.log('❌ No tenant found');
      return;
    }
    
    console.log(`📋 Testing with tenant: ${tenant.name}`);
    console.log(`🏪 Store URL: ${tenant.shopifyStoreUrl}`);
    console.log(`🔑 Has Access Token: ${!!tenant.accessToken}`);
    console.log(`🔑 Has API Key: ${!!tenant.shopifyApiKey}`);
    
    // Attempt sync
    const result = await DataIngestionService.syncAllData(tenant);
    console.log('🎉 Sync test completed successfully:', result);
    
    // Check what was created
    const stats = await Promise.all([
      prisma.customer.count({ where: { tenantId: tenant.id } }),
      prisma.product.count({ where: { tenantId: tenant.id } }),
      prisma.order.count({ where: { tenantId: tenant.id } })
    ]);
    
    console.log(`📊 Database counts after sync:`);
    console.log(`   Customers: ${stats[0]}`);
    console.log(`   Products: ${stats[1]}`);
    console.log(`   Orders: ${stats[2]}`);
    
  } catch (error) {
    console.error('❌ Sync test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSync();
