import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PO from './PO';
import Product from './Product';
import ShipmentCodes from './ShipmentCodes';
import Shipments from './Shipments';

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
      <Tabs defaultValue="po" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="po">PO</TabsTrigger>
        <TabsTrigger value="product">Product</TabsTrigger>
        <TabsTrigger value="shipmentcodes">Shipment Codes</TabsTrigger>
        <TabsTrigger value="shipments">Shipments</TabsTrigger>
      </TabsList>
      <TabsContent value="po">
        <PO />
      </TabsContent>
      <TabsContent value="product">
        <Product />
      </TabsContent>
      <TabsContent value="shipmentcodes">
        <ShipmentCodes />
      </TabsContent>
      <TabsContent value="shipments">
        <Shipments />
      </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ProcessingDashboard;