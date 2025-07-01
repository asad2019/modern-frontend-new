
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Package, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageLoader from '@/components/common/PageLoader';

const Packing = () => {
    const { data, isLoading } = usePageData(['processingOrders', 'clients']);
    const { createProcessingOrder, updateProcessingOrderStatus } = useData();
    
    const [packingData, setPackingData] = useState({ sewing_order_id: '', packages: '', package_type: '', status: 'Pending', type: 'packing' });
    const [shipmentData, setShipmentData] = useState({ packing_order_id: '', client_id: '', tracking_number: '', status: 'Pending', type: 'shipment' });

    const handlePackingSubmit = (e) => {
        e.preventDefault();
        createProcessingOrder(packingData);
        setPackingData({ sewing_order_id: '', packages: '', package_type: '', status: 'Pending', type: 'packing' });
    };

    const handleShipmentSubmit = (e) => {
        e.preventDefault();
        createProcessingOrder(shipmentData);
        setShipmentData({ packing_order_id: '', client_id: '', tracking_number: '', status: 'Pending', type: 'shipment' });
    };

    const handleStatusChange = (orderId, status) => {
        updateProcessingOrderStatus(orderId, status);
    };

    const packingOrders = data.processingOrders?.filter(o => o.type === 'packing') || [];
    const shipmentOrders = data.processingOrders?.filter(o => o.type === 'shipment') || [];
    const sewingOrders = data.processingOrders?.filter(o => o.type === 'sewing' && o.status === 'Completed') || [];
    const completedPackingOrders = data.processingOrders?.filter(o => o.type === 'packing' && o.status === 'Completed') || [];

    if (isLoading) {
        return <PageLoader type="table" />;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Tabs defaultValue="packing">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="packing">Packing</TabsTrigger>
                    <TabsTrigger value="shipments">Shipments</TabsTrigger>
                </TabsList>
                <TabsContent value="packing" className="mt-4">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5" />Create Packing Order</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePackingSubmit} className="space-y-4">
                                        <Select onValueChange={v => setPackingData({...packingData, sewing_order_id: v})} value={packingData.sewing_order_id}>
                                            <SelectTrigger><SelectValue placeholder="Select Sewing Order" /></SelectTrigger>
                                            <SelectContent>
                                                {sewingOrders.map(o => <SelectItem key={o.id} value={o.id}>Order {o.id.slice(-4)} - {o.garment_type}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input placeholder="Package Type (e.g., Box, Bag)" value={packingData.package_type} onChange={e => setPackingData({...packingData, package_type: e.target.value})} required/>
                                        <Input type="number" placeholder="Number of packages" value={packingData.packages} onChange={e => setPackingData({...packingData, packages: e.target.value})} required/>
                                        <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Create Order</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader><CardTitle>Packing Orders</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Sewing Order</TableHead><TableHead>Package Type</TableHead><TableHead>Packages</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {packingOrders.map(o => (
                                                <TableRow key={o.id}>
                                                    <TableCell>Order {o.sewing_order_id?.slice(-4)}</TableCell>
                                                    <TableCell>{o.package_type}</TableCell>
                                                    <TableCell>{o.packages}</TableCell>
                                                    <TableCell><Badge>{o.status}</Badge></TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">Update Status</Button></DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(o.id, 'Completed')}>Completed</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="shipments" className="mt-4">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center"><Truck className="mr-2 h-5 w-5" />Create Shipment</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleShipmentSubmit} className="space-y-4">
                                        <Select onValueChange={v => setShipmentData({...shipmentData, packing_order_id: v})} value={shipmentData.packing_order_id}>
                                            <SelectTrigger><SelectValue placeholder="Select Packing Order" /></SelectTrigger>
                                            <SelectContent>
                                                {completedPackingOrders.map(o => <SelectItem key={o.id} value={o.id}>Order {o.id.slice(-4)} - {o.packages} packages</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select onValueChange={v => setShipmentData({...shipmentData, client_id: v})} value={shipmentData.client_id}>
                                            <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                                            <SelectContent>
                                                {data.clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input placeholder="Tracking Number" value={shipmentData.tracking_number} onChange={e => setShipmentData({...shipmentData, tracking_number: e.target.value})} required/>
                                        <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Create Shipment</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader><CardTitle>Shipments</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Packing Order</TableHead><TableHead>Client</TableHead><TableHead>Tracking #</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {shipmentOrders.map(o => {
                                                const client = data.clients?.find(c => c.id === o.client_id);
                                                return (
                                                    <TableRow key={o.id}>
                                                        <TableCell>Order {o.packing_order_id?.slice(-4)}</TableCell>
                                                        <TableCell>{client?.name}</TableCell>
                                                        <TableCell className="font-mono text-xs">{o.tracking_number}</TableCell>
                                                        <TableCell><Badge>{o.status}</Badge></TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">Update Status</Button></DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(o.id, 'Shipped')}>Shipped</DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(o.id, 'Delivered')}>Delivered</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default Packing;
