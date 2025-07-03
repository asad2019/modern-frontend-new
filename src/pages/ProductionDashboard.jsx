import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Contracts from './Contracts';
import Clients from './Clients';
import Qualities from './Qualities';
import YarnManagement from './YarnManagement';
import DailyProduction from './DailyProduction';

const ProductionDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold">Production Dashboard</h1>
        <p className="text-muted-foreground">Manage the entire production lifecycle from here.</p>
      </div>
      <Tabs defaultValue="contracts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="qualities">Qualities</TabsTrigger>
          <TabsTrigger value="yarn">Yarn Management</TabsTrigger>
          <TabsTrigger value="production">Daily Production</TabsTrigger>
        </TabsList>
        <TabsContent value="contracts">
          <Contracts />
        </TabsContent>
        <TabsContent value="clients">
          <Clients />
        </TabsContent>
        <TabsContent value="qualities">
          <Qualities />
        </TabsContent>
        <TabsContent value="yarn">
          <YarnManagement />
        </TabsContent>
        <TabsContent value="production">
          <DailyProduction />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ProductionDashboard;