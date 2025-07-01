
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Receipt, FileText, Package, Ship, Truck } from 'lucide-react';
import CIC from './invoices/CIC';
import CICus from './invoices/CICus';
import CICustom from './invoices/CICustom';
import PLC from './invoices/PLC';
import PLCus from './invoices/PLCus';
import SalesContract from './invoices/SalesContract';
import BLFormat from './invoices/BLFormat';
import AllInvoices from './invoices/AllInvoices';
import ClientInvoice from './invoices/ClientInvoice';

const Invoices = () => {
  const [activeTab, setActiveTab] = useState('list');

  const invoiceTypes = [
    {
      id: 'cic',
      title: 'Commercial Invoice',
      description: 'Standard commercial invoice format',
      icon: Receipt,
      component: CIC
    },
    {
      id: 'cicus',
      title: 'Commercial Invoice (US)',
      description: 'US format commercial invoice',
      icon: Receipt,
      component: CICus
    },
    {
      id: 'cicustom',
      title: 'Custom Commercial Invoice',
      description: 'Custom format commercial invoice',
      icon: Receipt,
      component: CICustom
    },
    {
      id: 'plc',
      title: 'Packing List',
      description: 'Standard packing list format',
      icon: Package,
      component: PLC
    },
    {
      id: 'plcus',
      title: 'Packing List (US)',
      description: 'US format packing list',
      icon: Package,
      component: PLCus
    },
    {
      id: 'sales',
      title: 'Sales Contract',
      description: 'Sales contract document',
      icon: FileText,
      component: SalesContract
    },
    {
      id: 'bl',
      title: 'Bill of Lading',
      description: 'Bill of lading format',
      icon: Ship,
      component: BLFormat
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-6 w-6" />
            Invoice Management
          </CardTitle>
          <CardDescription>
            Create and manage different types of invoices and documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="list">All Invoices</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="formats">Invoice Types</TabsTrigger>
              <TabsTrigger value="view">View Invoice</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <AllInvoices />
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoiceTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Card key={type.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <IconComponent className="mr-2 h-5 w-5" />
                          {type.title}
                        </CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => setActiveTab(type.id)}
                          className="w-full"
                        >
                          Create {type.title}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="formats" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Select an invoice type from the "Create New" tab to start creating documents.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="view" className="space-y-4">
              <ClientInvoice />
            </TabsContent>

            {invoiceTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{type.title}</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('create')}
                  >
                    Back to Types
                  </Button>
                </div>
                <type.component />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Invoices;
