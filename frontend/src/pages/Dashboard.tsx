import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  PeopleAlt as CustomersIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  AttachMoney as RevenueIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import dataService, { DashboardStats, OrdersByDate } from '../services/dataService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ordersByDate, setOrdersByDate] = useState<OrdersByDate[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const statsData = await dataService.getDashboardStats();
        setStats(statsData);
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const ordersData = await dataService.getOrdersByDateRange({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
        setOrdersByDate(ordersData.ordersByDate);
        
        const customersData = await dataService.getTopCustomers(5);
        setTopCustomers(customersData.topCustomers);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleSyncData = async () => {
    try {
      console.log('🔄 Starting manual sync from frontend...');
      setSyncLoading(true);
      setSyncSuccess(false);
      setError(null);
      
      const result = await dataService.syncData();
      console.log('✅ Sync completed successfully:', result);
      
      const statsData = await dataService.getDashboardStats();
      setStats(statsData);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const ordersData = await dataService.getOrdersByDateRange({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      setOrdersByDate(ordersData.ordersByDate);
      
      const customersData = await dataService.getTopCustomers(5);
      setTopCustomers(customersData.topCustomers);
      
      setSyncSuccess(true);
    } catch (err: any) {
      console.error('❌ Sync failed:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to sync data');
    } finally {
      setSyncLoading(false);
    }
  };

  const orderChartData = {
    labels: ordersByDate.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Orders',
        data: ordersByDate.map(item => item.count),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const revenueChartData = {
    labels: ordersByDate.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Revenue',
        data: ordersByDate.map(item => item.totalRevenue),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const topCustomersChartData = {
    labels: topCustomers.map(customer => `${customer.firstName} ${customer.lastName}`),
    datasets: [
      {
        label: 'Total Spent',
        data: topCustomers.map(customer => customer.totalSpent),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SyncIcon />}
          onClick={handleSyncData}
          disabled={syncLoading}
        >
          {syncLoading ? 'Syncing...' : 'Sync Data'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {syncSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Data synchronized successfully!
        </Alert>
      )}
      
      {stats && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  bgcolor: 'primary.light',
                  color: 'white'
                }}
              >
                <Box display="flex" alignItems="center">
                  <CustomersIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography component="h2" variant="h6" gutterBottom>
                    Customers
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  {stats.stats.totalCustomers}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  bgcolor: 'secondary.light',
                  color: 'white'
                }}
              >
                <Box display="flex" alignItems="center">
                  <OrdersIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography component="h2" variant="h6" gutterBottom>
                    Orders
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  {stats.stats.totalOrders}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  bgcolor: 'success.light',
                  color: 'white'
                }}
              >
                <Box display="flex" alignItems="center">
                  <ProductsIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography component="h2" variant="h6" gutterBottom>
                    Products
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  {stats.stats.totalProducts}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  bgcolor: 'warning.light',
                  color: 'white'
                }}
              >
                <Box display="flex" alignItems="center">
                  <RevenueIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography component="h2" variant="h6" gutterBottom>
                    Revenue
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  ${stats.stats.totalRevenue.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card elevation={3}>
                <CardHeader title="Orders by Date (Last 30 Days)" />
                <Divider />
                <CardContent>
                  <Box height={300}>
                    <Line
                      data={orderChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardHeader title="Top 5 Customers" />
                <Divider />
                <CardContent>
                  <Box height={300}>
                    <Bar
                      data={topCustomersChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                          x: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardHeader title="Revenue by Date (Last 30 Days)" />
                <Divider />
                <CardContent>
                  <Box height={300}>
                    <Line
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box mt={3} textAlign="right">
            <Typography variant="body2" color="textSecondary">
              Last synced: {stats.lastSyncedAt ? format(new Date(stats.lastSyncedAt), 'MMM dd, yyyy HH:mm') : 'Never'}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
