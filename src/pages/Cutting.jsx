
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { usePageData } from '@/hooks/usePageData';
import PageLoader from '@/components/common/PageLoader';

const Cutting = () => {
    const { data, isLoading } = usePageData(['processingOrders', 'fabricStock', 'fabricQualities']);
    const { createProcessingOrder, updateProcessingOrderStatus } = useData();
    
    const [formData, setFormData] = useState({ 
        fabric_stock_id: '', 
        quantity_meters: '', 
        pieces: '', 
        status: 'Pending', 
        type: 'cutting' 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createProcessingOrder(formData);
        setFormData({ 
            fabric_stock_id: '', 
            quantity_meters: '', 
            pieces: '', 
            status: 'Pending', 
            type: 'cutting' 
        });
    };

    const handleStatusChange = (orderId, status) => {
        updateProcessingOrderStatus(orderId, status);
    };

    const cuttingOrders = data.processingOrders?.filter(o => o.type === 'cutting') || [];

    if (isLoading) {
        return <PageLoader type="table" />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Cutting Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="fabric_stock_id">Fabric Stock</Label>
                                <Select 
                                    onValueChange={v => setFormData({...formData, fabric_stock_id: v})} 
                                    value={formData.fabric_stock_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Fabric Stock" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.fabricStock?.map(stock => (
                                            <SelectItem key={stock.id} value={stock.id}>
                                                {stock.quality_name} - {stock.available_meters}m
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="quantity_meters">Quantity (meters)</Label>
                                <Input
                                    id="quantity_meters"
                                    type="number"
                                    value={formData.quantity_meters}
                                    onChange={e => setFormData({...formData, quantity_meters: e.target.value})}
                                    placeholder="Enter meters to cut"
                                />
                            </div>
                            <div>
                                <Label htmlFor="pieces">Expected Pieces</Label>
                                <Input
                                    id="pieces"
                                    type="number"
                                    value={formData.pieces}
                                    onChange={e => setFormData({...formData, pieces: e.target.value})}
                                    placeholder="Enter expected pieces"
                                />
                            </div>
                            <Button type="submit">Create Cutting Order</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cutting Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Pieces</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cuttingOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs">
                                            {order.id.slice(-8)}
                                        </TableCell>
                                        <TableCell>{order.quantity_meters}m</TableCell>
                                        <TableCell>{order.pieces}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {order.status !== 'Completed' && (
                                                <Select 
                                                    onValueChange={v => handleStatusChange(order.id, v)}
                                                    value={order.status}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};

export default Cutting;
