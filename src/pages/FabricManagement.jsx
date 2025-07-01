
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLoader from '@/components/common/PageLoader';

const FabricManagement = () => {
  const { data, isLoading } = usePageData(['fabricStock', 'contracts', 'fabricQualities', 'stockLocations', 'clients']);
  const { receiveFabric, issueFabric } = useData();
  
  const [receiveData, setReceiveData] = useState({ fabric_quality_id: '', contract_id: '', quantity_meters: '', location_id: '' });
  const [issueData, setIssueData] = useState({ fabric_stock_id: '', quantity_meters: '', client_id: '' });

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    receiveFabric(receiveData);
    setReceiveData({ fabric_quality_id: '', contract_id: '', quantity_meters: '', location_id: '' });
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    issueFabric(issueData);
    setIssueData({ fabric_stock_id: '', quantity_meters: '', client_id: '' });
  };
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="stock">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">Fabric Stock</TabsTrigger>
          <TabsTrigger value="receive">Receive Fabric</TabsTrigger>
          <TabsTrigger value="issue">Issue Fabric</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Current Fabric Stock</CardTitle><CardDescription>Live view of all fabric inventory.</CardDescription></CardHeader>
            <CardContent>
              {isLoading ? <PageLoader type="table" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Contract</TableHead><TableHead>Fabric Quality</TableHead><TableHead>Meters</TableHead><TableHead>Location</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.fabricStock?.map(stock => {
                      const contract = data.contracts?.find(c => c.id === stock.contract_id);
                      const quality = data.fabricQualities?.find(f => f.id === stock.fabric_quality_id);
                      const location = data.stockLocations?.find(l => l.id === stock.location_id);
                      return (
                        <TableRow key={stock.id}>
                          <TableCell>{contract?.name || contract?.id}</TableCell>
                          <TableCell>{quality?.name || 'N/A'}</TableCell>
                          <TableCell>{stock.quantity_meters}m</TableCell>
                          <TableCell>{location?.name}</TableCell>
                          <TableCell>{new Date(stock.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="receive" className="mt-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Receive Fabric</CardTitle>
              <CardDescription>Log fabric received from production or external sources.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceiveSubmit} className="space-y-4">
                <Select onValueChange={v => setReceiveData({...receiveData, fabric_quality_id: v})}><SelectTrigger><SelectValue placeholder="Select Fabric Quality" /></SelectTrigger><SelectContent>{data.fabricQualities?.map(f=><SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select>
                <Select onValueChange={v => setReceiveData({...receiveData, contract_id: v})}><SelectTrigger><SelectValue placeholder="Select Contract" /></SelectTrigger><SelectContent>{data.contracts?.filter(c=>!c.is_internal).map(c=><SelectItem key={c.id} value={c.id}>{c.id}</SelectItem>)}</SelectContent></Select>
                <Select onValueChange={v => setReceiveData({...receiveData, location_id: v})}><SelectTrigger><SelectValue placeholder="Select Stock Location" /></SelectTrigger><SelectContent>{data.stockLocations?.map(l=><SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
                <Input type="number" placeholder="Quantity in Meters" onChange={e => setReceiveData({...receiveData, quantity_meters: e.target.value})} required />
                <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Receive Fabric</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="issue" className="mt-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Issue Fabric</CardTitle>
              <CardDescription>Issue fabric to clients or for further processing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <Select onValueChange={v => setIssueData({...issueData, fabric_stock_id: v})}><SelectTrigger><SelectValue placeholder="Select Fabric Stock" /></SelectTrigger><SelectContent>{data.fabricStock?.map(f => {
                  const quality = data.fabricQualities?.find(q => q.id === f.fabric_quality_id);
                  return <SelectItem key={f.id} value={f.id}>{quality?.name} - {f.quantity_meters}m</SelectItem>
                })}</SelectContent></Select>
                <Select onValueChange={v => setIssueData({...issueData, client_id: v})}><SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger><SelectContent>{data.clients?.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                <Input type="number" placeholder="Quantity in Meters" onChange={e => setIssueData({...issueData, quantity_meters: e.target.value})} required />
                <Button type="submit" className="w-full"><MinusCircle className="mr-2 h-4 w-4"/>Issue Fabric</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default FabricManagement;
