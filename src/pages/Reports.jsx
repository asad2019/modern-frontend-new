
import React from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PageLoader from '@/components/common/PageLoader';
import { Skeleton } from '@/components/ui/skeleton';

const Reports = () => {
  const { data, isLoading } = usePageData([
    'contracts', 'clients', 'yarnStock', 'fabricStock', 'dailyProduction', 
    'processingOrders', 'yarnQualities', 'fabricQualities', 'stockLocations'
  ]);

  const productionStats = {
    totalProduced: data.dailyProduction?.reduce((sum, p) => sum + parseFloat(p.produced_meters || 0), 0) || 0,
    totalYarnStock: data.yarnStock?.reduce((sum, y) => sum + parseFloat(y.quantity_kg || 0), 0) || 0,
    totalFabricStock: data.fabricStock?.reduce((sum, f) => sum + parseFloat(f.quantity_meters || 0), 0) || 0,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="contracts">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Detailed reports for all operations.</p>
          </div>
          <TabsList>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
          </TabsList>
        </div>
        {isLoading ? <PageLoader /> : (
          <>
            <TabsContent value="contracts">
              <Card>
                <CardHeader><CardTitle>Contracts Report</CardTitle><CardDescription>Detailed view of all contracts.</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contract ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Yarn Received (kg)</TableHead>
                        <TableHead>Fabric Produced (m)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.contracts?.filter(c => !c.is_internal).map((contract) => {
                        const client = data.clients?.find(c => c.id === contract.client_id);
                        const yarnReceived = data.yarnStock
                          ?.filter(y => y.contract_id === contract.id)
                          .reduce((sum, y) => sum + parseFloat(y.quantity_kg || 0), 0) || 0;
                        const fabricProduced = data.fabricStock
                          ?.filter(f => f.contract_id === contract.id)
                          .reduce((sum, f) => sum + parseFloat(f.quantity_meters || 0), 0) || 0;
                        return (
                          <TableRow key={contract.id}>
                            <TableCell className="font-mono text-xs">{contract.id}</TableCell>
                            <TableCell>{client?.name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                contract.status === 'In Process' ? 'default' : 
                                contract.status === 'Closed' ? 'outline' : 'secondary'
                              }>{contract.status}</Badge>
                            </TableCell>
                            <TableCell>{yarnReceived.toFixed(2)}</TableCell>
                            <TableCell>{fabricProduced.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="production">
              <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader><CardTitle>Total Production</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold">{productionStats.totalProduced.toFixed(2)}m</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Yarn Stock</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold">{productionStats.totalYarnStock.toFixed(2)}kg</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Fabric Stock</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold">{productionStats.totalFabricStock.toFixed(2)}m</div></CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Daily Production Report</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Loom</TableHead><TableHead>Contract</TableHead><TableHead>Quality</TableHead><TableHead>Produced</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.dailyProduction?.map(p => {
                        const loom = data.looms?.find(l => l.id === p.loom_id);
                        const quality = data.fabricQualities?.find(f => f.id === p.fabric_quality_id);
                        return (
                          <TableRow key={p.id}>
                            <TableCell>{p.date}</TableCell>
                            <TableCell>{loom?.name}</TableCell>
                            <TableCell>{p.contract_id}</TableCell>
                            <TableCell>{quality?.name}</TableCell>
                            <TableCell>{p.produced_meters}m</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="inventory">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Yarn Inventory</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Quality</TableHead><TableHead>Type</TableHead><TableHead>Stock (KG)</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {data.yarnStock?.map(y => {
                          const quality = data.yarnQualities?.find(q => q.id === y.yarn_quality_id);
                          return (
                            <TableRow key={y.id}>
                              <TableCell>{quality?.count}</TableCell>
                              <TableCell>{y.type}</TableCell>
                              <TableCell>{y.quantity_kg}kg</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Fabric Inventory</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Quality</TableHead><TableHead>Stock (M)</TableHead><TableHead>Location</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {data.fabricStock?.map(f => {
                          const quality = data.fabricQualities?.find(q => q.id === f.fabric_quality_id);
                          const location = data.stockLocations?.find(l => l.id === f.location_id);
                          return (
                            <TableRow key={f.id}>
                              <TableCell>{quality?.name}</TableCell>
                              <TableCell>{f.quantity_meters}m</TableCell>
                              <TableCell>{location?.name}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="processing">
              <Card>
                <CardHeader><CardTitle>Processing Orders Report</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Type</TableHead><TableHead>Quantity</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.processingOrders?.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs">{o.id.slice(-8)}</TableCell>
                          <TableCell><Badge variant="outline">{o.type}</Badge></TableCell>
                          <TableCell>{o.quantity_meters ? `${o.quantity_meters}m` : `${o.pieces || o.packages} pcs`}</TableCell>
                          <TableCell><Badge>{o.status}</Badge></TableCell>
                          <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </motion.div>
  );
};

export default Reports;
