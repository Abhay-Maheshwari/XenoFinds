const { prisma } = require('../config/prisma');
const DataIngestionService = require('./ingestion.service');

/**
 * SchedulerService - Handles scheduled data synchronization
 */
class SchedulerService {
  constructor() {
    this.syncInterval = null;
    this.syncIntervalMinutes = process.env.SYNC_INTERVAL_MINUTES || 60;
  }

  /**
   * Start the scheduler
   */
  start() {
    console.log(`Starting scheduler with interval of ${this.syncIntervalMinutes} minutes`);
    
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Set up new interval
    this.syncInterval = setInterval(async () => {
      await this.syncAllTenants();
    }, this.syncIntervalMinutes * 60 * 1000);
    
    // Run initial sync
    this.syncAllTenants();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('Stopping scheduler');
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync data for all active tenants
   */
  async syncAllTenants() {
    try {
      console.log('Starting scheduled sync for all tenants');
      
      // Get all active tenants with Shopify credentials
      const tenants = await prisma.tenant.findMany({
        where: {
          isActive: true,
          shopifyApiKey: { not: null },
          shopifyApiSecret: { not: null },
          shopifyStoreUrl: { not: null }
        }
      });
      
      console.log(`Found ${tenants.length} active tenants to sync`);
      
      // Sync each tenant
      for (const tenant of tenants) {
        try {
          console.log(`Syncing data for tenant ${tenant.id} (${tenant.name})`);
          await DataIngestionService.syncAllData(tenant);
          console.log(`Successfully synced data for tenant ${tenant.id}`);
        } catch (error) {
          console.error(`Failed to sync data for tenant ${tenant.id}:`, error);
        }
      }
      
      console.log('Completed scheduled sync for all tenants');
    } catch (error) {
      console.error('Failed to run scheduled sync:', error);
    }
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;
