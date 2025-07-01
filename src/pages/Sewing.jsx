
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Shirt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageLoader from '@/components/common/PageLoader';

const Sewing = () => {
    const { data, isLoading } = usePageData(['processingOrders']);
    const { createProcessingOrder, updateProcessingOrderStatus } = useData();
    
    const [formData, setFormData] = useState({ cutting_order_id: '', pieces: '', garment_type: '', status: 'Pending', type: 'sewing' });

    const handleSubmit = (e) => {
        e.preventDefault();
        createProcessingOrder(formData);
        setFormData({ cutting_order_id: '', pieces: '', garment_type: '', status: 'Pending', type: 'sewing' });
    };

    const handleStatusChange = (orderId, status) => {
        updateProcessingOrderStatus(orderId, status);
    };

    const sewingOrders = data.processingOrders?.filter(o => o.type === 'sewing') || [];
    const cuttingOrders = data.processingOrders?.filter(o => o.type === 'cutting' && o.status === 'Completed') || [];

    if (isLoading) {
        return <PageLoader type="table" />;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Shirt className="mr-2 h-5 w-5" />Create Sewing Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Select onValueChange={v => setFormData({...formData, cutting_order_id: v})} value={formData.cutting_order_id}>
                                    <SelectTrigger><SelectValue placeholder="Select Cutting Order" /></SelectTrigger>
                                    <SelectContent>
                                        {cuttingOrders.map(o => <SelectItem key={o.id} value={o.id}>Order {o.id.slice(-4)} - {o.pieces} pieces</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input placeholder="Garment Type (e.g., Shirt, Pants)" value={formData.garment_type} onChange={e => setFormData({...formData, garment_type: e.target.value})} required/>
                                <Input type="number" placeholder="Pieces to sew" value={formData.pieces} onChange={e => setFormData({...formData, pieces: e.target.value})} required/>
                                <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Create Order</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>Sewing Orders</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Cutting Order</TableHead><TableHead>Garment Type</TableHead><TableHead>Pieces</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {sewingOrders.map(o => (
                                        <TableRow key={o.id}>
                                            <TableCell>Order {o.cutting_order_id?.slice(-4)}</TableCell>
                                            <TableCell>{o.garment_type}</TableCell>
                                            <TableCell>{o.pieces}</TableCell>
                                            <TableCell><Badge>{o.status}</Badge></TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">Update Status</Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(o.id, 'In Progress')}>In Progress</DropdownMenuItem>
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
        </motion.div>
    );
};

export default Sewing;
