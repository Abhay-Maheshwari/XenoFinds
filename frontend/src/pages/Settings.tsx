import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

const shopifyCredentialsSchema = Yup.object({
  shopifyApiKey: Yup.string().required('API Key is required'),
  shopifyApiSecret: Yup.string().required('API Secret is required'),
  shopifyStoreUrl: Yup.string()
    .required('Store URL is required')
    .matches(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/,
      'Must be a valid Shopify store URL (e.g., your-store.myshopify.com)'
    )
});

const Settings: React.FC = () => {
  const { user, updateShopifyCredentials } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const shopifyFormik = useFormik({
    initialValues: {
      shopifyApiKey: user?.shopifyApiKey || '',
      shopifyApiSecret: user?.shopifyApiSecret || '',
      shopifyStoreUrl: user?.shopifyStoreUrl || ''
    },
    validationSchema: shopifyCredentialsSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        await updateShopifyCredentials({
          shopifyApiKey: values.shopifyApiKey,
          shopifyApiSecret: values.shopifyApiSecret,
          shopifyStoreUrl: values.shopifyStoreUrl
        });
        
        setSuccess('Shopify API credentials updated successfully');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update Shopify credentials');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Paper elevation={3} sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Shopify Integration" {...a11yProps(0)} />
            <Tab label="Account Settings" {...a11yProps(1)} />
            <Tab label="Notifications" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Shopify API Credentials
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Enter your Shopify API credentials to connect your store. You can find these in your Shopify Partner dashboard under "Apps" &gt; "Create an app".
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={shopifyFormik.handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="shopifyApiKey"
                  name="shopifyApiKey"
                  label="Shopify API Key"
                  value={shopifyFormik.values.shopifyApiKey}
                  onChange={shopifyFormik.handleChange}
                  error={shopifyFormik.touched.shopifyApiKey && Boolean(shopifyFormik.errors.shopifyApiKey)}
                  helperText={shopifyFormik.touched.shopifyApiKey && shopifyFormik.errors.shopifyApiKey ? String(shopifyFormik.errors.shopifyApiKey) : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="shopifyApiSecret"
                  name="shopifyApiSecret"
                  label="Shopify API Secret"
                  type="password"
                  value={shopifyFormik.values.shopifyApiSecret}
                  onChange={shopifyFormik.handleChange}
                  error={shopifyFormik.touched.shopifyApiSecret && Boolean(shopifyFormik.errors.shopifyApiSecret)}
                  helperText={shopifyFormik.touched.shopifyApiSecret && shopifyFormik.errors.shopifyApiSecret ? String(shopifyFormik.errors.shopifyApiSecret) : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="shopifyStoreUrl"
                  name="shopifyStoreUrl"
                  label="Shopify Store URL"
                  placeholder="your-store.myshopify.com"
                  value={shopifyFormik.values.shopifyStoreUrl}
                  onChange={shopifyFormik.handleChange}
                  error={shopifyFormik.touched.shopifyStoreUrl && Boolean(shopifyFormik.errors.shopifyStoreUrl)}
                  helperText={shopifyFormik.touched.shopifyStoreUrl && shopifyFormik.errors.shopifyStoreUrl ? String(shopifyFormik.errors.shopifyStoreUrl) : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Credentials'}
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h6" gutterBottom>
            Webhook Configuration
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            To enable real-time event tracking (cart abandoned, checkout started), configure the following webhook URL in your Shopify admin:
          </Typography>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              wordBreak: 'break-all'
            }}
          >
            {`${window.location.origin}/api/events/webhook`}
          </Paper>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Account settings will be implemented in a future update.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Notification settings will be implemented in a future update.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Settings;
