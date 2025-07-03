import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Finishing from './Finishing';
import Cutting from './Cutting';
import Sewing from './Sewing';
import Packing from './Packing';

const ProcessingDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold">Processing Dashboard</h1>
        <p className="text-muted-foreground">Manage the production workflow.</p>
      </div>
      <Tabs defaultValue="finishing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="finishing">Finishing</TabsTrigger>
          <TabsTrigger value="cutting">Cutting</TabsTrigger>
          <TabsTrigger value="sewing">Sewing</TabsTrigger>
          <TabsTrigger value="packing">Packing & Shipments</TabsTrigger>
        </TabsList>
        <TabsContent value="finishing">
          <Finishing />
        </TabsContent>
        <TabsContent value="cutting">
          <Cutting />
        </TabsContent>
        <TabsContent value="sewing">
          <Sewing />
        </TabsContent>
        <TabsContent value="packing">
          <Packing />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ProcessingDashboard;