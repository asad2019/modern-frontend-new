
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, MinusCircle, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TableSkeleton from '@/components/layout/TableSkeleton';

const YarnManagement = () => {
  const { data, receiveYarn, issueYarn, purchaseYarn, fetchDataByKey, loadingStates } = useData();
  const { toast } = useToast();
  
  const [receiveData, setReceiveData] = useState({ contractId: '', yarnQualityId: '', quantityBags: '', quantityKg: '', type: 'weft', locationId: '' });
  const [issueData, setIssueData] = useState({ yarnStockId: '', quantityKg: '', purpose: '' });
  const [purchaseData, setPurchaseData] = useState({ supplierId: '', yarnQualityId: '', quantityBags: '', quantityKg: '', type: 'weft', locationId: '' });

  useEffect(() => {
    fetchDataByKey('yarnStock');
    fetchDataByKey('contracts');
    fetchDataByKey('yarnQualities');
    fetchDataByKey('stockLocations');
    fetchDataByKey('suppliers');
  }, [fetchDataByKey]);

  const isLoading = loadingStates.yarnStock !== false;

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    receiveYarn(receiveData);
    setReceiveData({ contractId: '', yarnQualityId: '', quantityBags: '', quantityKg: '', type: 'weft', locationId: '' });
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    issueYarn(issueData);
    setIssueData({ yarnStockId: '', quantityKg: '', purpose: '' });
  };

  const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    purchaseYarn(purchaseData);
    setPurchaseData({ supplierId: '', yarnQualityId: '', quantityBags: '', quantityKg: '', type: 'weft', locationId: '' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="stock">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stock">Yarn Stock</TabsTrigger>
          <TabsTrigger value="receive">Receive Yarn</TabsTrigger>
          <TabsTrigger value="issue">Issue Yarn</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Yarn</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Current Yarn Stock</CardTitle><CardDescription>Live view of all yarn inventory.</CardDescription></CardHeader>
            <CardContent>
              {isLoading ? <TableSkeleton rows={10} cells={6} /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Contract</TableHead><TableHead>Yarn Quality</TableHead><TableHead>Type</TableHead><TableHead>Bags</TableHead><TableHead>KG</TableHead><TableHead>Location</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.yarnStock.map(stock => {
                      const contract = data.contracts.find(c => c.id === stock.contractId);
                      const yarn = data.yarnQualities.find(y => y.id === stock.yarnQualityId);
                      const location = data.stockLocations.find(l => l.id === stock.locationId);
                      return (
                        <TableRow key={stock.id}>
                          <TableCell>{contract?.name || contract?.id}</TableCell>
                          <TableCell>{yarn ? `${yarn.count} ${yarn.ratio}` : 'N/A'}</TableCell>
                          <TableCell>{stock.type}</TableCell>
                          <TableCell>{stock.quantityBags}</TableCell>
                          <TableCell>{stock.quantityKg}</TableCell>
                          <TableCell>{location?.name}</TableCell>
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
              <CardTitle>Receive Yarn</CardTitle>
              <CardDescription>Log new yarn received from clients.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceiveSubmit} className="space-y-4">
                <Select onValueChange={v => setReceiveData({...receiveData, contractId: v})}><SelectTrigger><SelectValue placeholder="Select Contract" /></SelectTrigger><SelectContent>{data.contracts.filter(c=>!c.isInternal).map(c=><SelectItem key={c.id} value={c.id}>{c.id}</SelectItem>)}</SelectContent></Select>
                <Select onValueChange={v => setReceiveData({...receiveData, yarnQualityId: v})}><SelectTrigger><SelectValue placeholder="Select Yarn Quality" /></SelectTrigger><SelectContent>{data.yarnQualities.map(y=><SelectItem key={y.id} value={y.id}>{y.count} {y.ratio}</SelectItem>)}</SelectContent></Select>
                <Select onValueChange={v => setReceiveData({...receiveData, type: v})}><SelectTrigger><SelectValue placeholder="Select Yarn Type" /></SelectTrigger><SelectContent><SelectItem value="warp">Warp</SelectItem><SelectItem value="weft">Weft</SelectItem></SelectContent></Select>
                <Select onValueChange={v => setReceiveData({...receiveData, locationId: v})}><SelectTrigger><SelectValue placeholder="Select Stock Location" /></SelectTrigger><SelectContent>{data.stockLocations.map(l=><SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
                <Input type="number" placeholder="Quantity in Bags" onChange={e => setReceiveData({...receiveData, quantityBags: e.target.value})} required />
                <Input type="number" placeholder="Quantity in KG" onChange={e => setReceiveData({...receiveData, quantityKg: e.target.value})} required />
                <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Receive Yarn</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="issue" className="mt-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Issue Yarn</CardTitle>
              <CardDescription>Issue yarn for production or other purposes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <Select onValueChange={v => setIssueData({...issueData, yarnStockId: v})}><SelectTrigger><SelectValue placeholder="Select Yarn Stock" /></SelectTrigger><SelectContent>{data.yarnStock.map(y => {
                  const quality = data.yarnQualities.find(q => q.id === y.yarnQualityId);
                  return <SelectItem key={y.id} value={y.id}>{quality?.count} - {y.quantityKg}kg</SelectItem>
                })}</SelectContent></Select>
                <Input placeholder="Purpose (e.g., Warping, Production)" onChange={e => setIssueData({...issueData, purpose: e.target.value})} required />
                <Input type="number" placeholder="Quantity in KG" onChange={e => setIssueData({...issueData, quantityKg: e.target.value})} required />
                <Button type="submit" className="w-full"><MinusCircle className="mr-2 h-4 w-4"/>Issue Yarn</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="purchase" className="mt-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Purchase Yarn</CardTitle>
              <CardDescription>Log new yarn purchased from suppliers.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                <Select onValueChange={v => setPurchaseData({...purchaseData, supplierId: v})}><SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger><SelectContent>{data.suppliers.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
                <Select onValueChange={v => setPurchaseData({...purchaseData, yarnQualityId: v})}><SelectTrigger><SelectValue placeholder="Select Yarn Quality" /></SelectTrigger><SelectContent>{data.yarnQualities.map(y=><SelectItem key={y.id} value={y.id}>{y.count} {y.ratio}</SelectItem>)}</SelectContent></Select>
                <Select onValueChange={v => setPurchaseData({...purchaseData, type: v})}><SelectTrigger><SelectValue placeholder="Select Yarn Type" /></SelectTrigger><SelectContent><SelectItem value="warp">Warp</SelectItem><SelectItem value="weft">Weft</SelectItem></SelectContent></Select>
                <Select onValueChange={v => setPurchaseData({...purchaseData, locationId: v})}><SelectTrigger><SelectValue placeholder="Select Stock Location" /></SelectTrigger><SelectContent>{data.stockLocations.map(l=><SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
                <Input type="number" placeholder="Quantity in Bags" onChange={e => setPurchaseData({...purchaseData, quantityBags: e.target.value})} required />
                <Input type="number" placeholder="Quantity in KG" onChange={e => setPurchaseData({...purchaseData, quantityKg: e.target.value})} required />
                <Button type="submit" className="w-full"><ShoppingCart className="mr-2 h-4 w-4"/>Purchase Yarn</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default YarnManagement;
