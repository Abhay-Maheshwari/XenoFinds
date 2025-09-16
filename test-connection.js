require('dotenv').config();
const { PrismaClient } = require('./backend/src/generated/prisma');
const axios = require('axios');

async function testConnections() {
  console.log('🧪 Testing all connections...\n');

  // Test 1: Database Connection
  console.log('1️⃣ Testing Database Connection...');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const tenantCount = await prisma.tenant.count();
    console.log(`✅ Database connected! Found ${tenantCount} tenants\n`);
  } catch (error) {
    console.log(`❌ Database failed: ${error.message}\n`);
  }

  // Test 2: Backend Server
  console.log('2️⃣ Testing Backend Server...');
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log(`✅ Backend server responding! Status: ${response.status}\n`);
  } catch (error) {
    console.log(`❌ Backend server not responding: ${error.message}\n`);
  }

  // Test 3: API Endpoint
  console.log('3️⃣ Testing API Endpoint...');
  try {
    const response = await axios.get('http://localhost:3000/api/tenants/dashboard-stats', {
      headers: { 'Authorization': 'Bearer demo-jwt-token-for-testing' },
      timeout: 5000
    });
    console.log(`✅ API endpoint working! Data: ${JSON.stringify(response.data, null, 2)}\n`);
  } catch (error) {
    console.log(`❌ API endpoint failed: ${error.message}\n`);
  }

  // Test 4: Frontend Server
  console.log('4️⃣ Testing Frontend Server...');
  try {
    const response = await axios.get('http://localhost:3001', { timeout: 5000 });
    console.log(`✅ Frontend server responding! Status: ${response.status}\n`);
  } catch (error) {
    console.log(`❌ Frontend server not responding: ${error.message}\n`);
  }

  await prisma.$disconnect();
  console.log('🏁 Connection test completed!');
}

testConnections().catch(console.error);
