import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Contracts from '@/pages/Contracts';
import Clients from '@/pages/Clients';
import Brokers from '@/pages/Brokers';
import Suppliers from '@/pages/Suppliers';
import Sizing from '@/pages/Sizing';
import Stock from '@/pages/Stock';
import Looms from '@/pages/Looms';
import Qualities from '@/pages/Qualities';
import Costing from '@/pages/Costing';
import Reports from '@/pages/Reports';
import ActivityLog from '@/pages/ActivityLog';
import Users from '@/pages/Users';
import Departments from '@/pages/Departments';
import Profile from '@/pages/Profile';
import ProductionDashboard from '@/pages/ProductionDashboard';
import ProcessingDashboard from '@/pages/ProcessingDashboard';
import DailyProduction from '@/pages/DailyProduction';
import YarnManagement from '@/pages/YarnManagement';
import Transactions from '@/pages/Transactions';
import FabricManagement from '@/pages/FabricManagement';
import Invoices from '@/pages/Invoices';
import Finishing from '@/pages/Finishing';
import FinishingUnits from '@/pages/FinishingUnits';
import Cutting from '@/pages/Cutting';
import Sewing from '@/pages/Sewing';
import Packing from '@/pages/Packing';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import HomeRedirect from '@/components/auth/HomeRedirect';
import Settings from '@/pages/Settings';
import Machines from '@/pages/Machines';
import Maintenance from '@/pages/Maintenance';
import QualityControl from '@/pages/QualityControl';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route path="dashboard" element={<ProtectedRoute permissions={['all']}><Dashboard /></ProtectedRoute>} />

        <Route path="production-dashboard" element={<ProtectedRoute permissions={['production-dashboard']}><ProductionDashboard /></ProtectedRoute>} />
        <Route path="yarn" element={<ProtectedRoute permissions={['yarn']}><YarnManagement /></ProtectedRoute>} />
        <Route path="fabric" element={<ProtectedRoute permissions={['yarn']}><FabricManagement /></ProtectedRoute>} />
        <Route path="daily-production" element={<ProtectedRoute permissions={['daily-production']}><DailyProduction /></ProtectedRoute>} />

        <Route path="processing-dashboard" element={<ProtectedRoute permissions={['processing-dashboard']}><ProcessingDashboard /></ProtectedRoute>} />
        <Route path="finishing" element={<ProtectedRoute permissions={['processing-dashboard']}><Finishing /></ProtectedRoute>} />
        <Route path="cutting" element={<ProtectedRoute permissions={['processing-dashboard']}><Cutting /></ProtectedRoute>} />
        <Route path="sewing" element={<ProtectedRoute permissions={['processing-dashboard']}><Sewing /></ProtectedRoute>} />
        <Route path="packing" element={<ProtectedRoute permissions={['processing-dashboard']}><Packing /></ProtectedRoute>} />

        <Route path="contracts" element={<ProtectedRoute permissions={['contracts']}><Contracts /></ProtectedRoute>} />
        <Route path="clients" element={<ProtectedRoute permissions={['clients']}><Clients /></ProtectedRoute>} />
        <Route path="brokers" element={<ProtectedRoute permissions={['clients']}><Brokers /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute permissions={['all']}><Suppliers /></ProtectedRoute>} />
        <Route path="finishing-units" element={<ProtectedRoute permissions={['all']}><FinishingUnits /></ProtectedRoute>} />
        <Route path="sizing" element={<ProtectedRoute permissions={['clients']}><Sizing /></ProtectedRoute>} />
        <Route path="stock" element={<ProtectedRoute permissions={['all']}><Stock /></ProtectedRoute>} />
        <Route path="looms" element={<ProtectedRoute permissions={['production-dashboard']}><Looms /></ProtectedRoute>} />
        <Route path="qualities" element={<ProtectedRoute permissions={['qualities']}><Qualities /></ProtectedRoute>} />
        <Route path="transactions" element={<ProtectedRoute permissions={['transactions']}><Transactions /></ProtectedRoute>} />

        <Route path="machines" element={<ProtectedRoute permissions={['machines']}><Machines /></ProtectedRoute>} />
        <Route path="maintenance" element={<ProtectedRoute permissions={['maintenance']}><Maintenance /></ProtectedRoute>} />
        <Route path="quality-control" element={<ProtectedRoute permissions={['quality_control']}><QualityControl /></ProtectedRoute>} />

        <Route path="costing" element={<ProtectedRoute permissions={['all']}><Costing /></ProtectedRoute>} />
        <Route path="invoices" element={<ProtectedRoute permissions={['all']}><Invoices /></ProtectedRoute>} />
            <Route path="/invoice/:id" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute permissions={['reports']}><Reports /></ProtectedRoute>} />
        <Route path="activity-log" element={<ProtectedRoute permissions={['all']}><ActivityLog /></ProtectedRoute>} />

        <Route path="users" element={<ProtectedRoute permissions={['all']}><Users /></ProtectedRoute>} />
        <Route path="departments" element={<ProtectedRoute permissions={['all']}><Departments /></ProtectedRoute>} />

        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<ProtectedRoute permissions={['settings']}><Settings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default App;