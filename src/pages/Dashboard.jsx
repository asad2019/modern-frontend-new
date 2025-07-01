
import React from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Package, Factory, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const Dashboard = () => {
  const { data, isLoading } = usePageData([
    'clients', 'contracts', 'looms', 'machines', 'yarnStock', 'fabricStock', 
    'dailyProduction', 'maintenanceSchedules', 'qcRecords', 'activityLog'
  ]);

  if (isLoading) {
    return <PageLoader type="dashboard" />;
  }

  const stats = [
    {
      title: "Total Clients",
      value: data.clients?.length || 0,
      icon: Users,
      description: "Active clients in system"
    },
    {
      title: "Active Contracts",
      value: data.contracts?.filter(c => c.status === 'In Process').length || 0,
      icon: FileText,
      description: "Contracts in progress"
    },
    {
      title: "Active Looms",
      value: data.looms?.filter(l => l.status === 'Active').length || 0,
      icon: Factory,
      description: "Currently operational"
    },
    {
      title: "Total Machines",
      value: data.machines?.length || 0,
      icon: Package,
      description: "All factory machines"
    }
  ];

  const recentActivities = data.activityLog?.slice(0, 5) || [];
  const pendingMaintenance = data.maintenanceSchedules?.filter(m => m.status === 'Scheduled').length || 0;
  const qcFailures = data.qcRecords?.filter(q => q.status === 'Fail').length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your textile manufacturing operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.details}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingMaintenance > 0 && (
                <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Pending Maintenance</p>
                    <p className="text-sm text-muted-foreground">
                      {pendingMaintenance} machine(s) need maintenance
                    </p>
                  </div>
                </div>
              )}
              
              {qcFailures > 0 && (
                <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Quality Issues</p>
                    <p className="text-sm text-muted-foreground">
                      {qcFailures} QC failure(s) need attention
                    </p>
                  </div>
                </div>
              )}

              {pendingMaintenance === 0 && qcFailures === 0 && (
                <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">All Systems Normal</p>
                    <p className="text-sm text-muted-foreground">
                      No critical alerts at this time
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;
