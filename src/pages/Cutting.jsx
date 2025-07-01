
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Scissors } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import TableSkeleton from '@/components/layout/TableSkeleton';

const Cutting = () => {
    const { data, createProcessingOrder, updateProcessingOrderStatus, fetchDataByKey, loadingStates } = useData();
    const { toast } = useToast();
    
    const [formData, setFormData] = useState({ fabricStockId: '', quantityMeters: '', pieces: '', status: 'Pending', type: 'cutting' });

    useEffect(() => {
        fetchDataByKey('processingOrders');
        fetchDataByKey('fabricStock');
        fetchDataByKey('fabricQualities');
    }, [fetchDataByKey]);

    const isLoading = loadingStates.processingOrders !== false;

    const handleSubmit = (e) => {
        e.preventDefault();
        createProcessingOrder(formData);
        setFormData({ fabricStockId: '', quantityMeters: '', pieces: '', status: 'Pending', type: 'cutting' });
    };

    const handleStatusChange = (orderId, status) => {
        updateProcessingOrderStatus(orderId, status);
    };

    const cuttingOrders = data.processingOrders.filter(o => o.type === 'cutting');

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Scissors className="mr-2 h-5 w-5" />Create Cutting Order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Select onValueChange={v => setFormData({...formData, fabricStockId: v})} value={formData.fabricStockId}>
                                    <SelectTrigger><SelectValue placeholder="Select Fabric Stock" /></SelectTrigger>
                                    <SelectContent>
                                        {data.fabricStock.map(f => {
                                            const quality = data.fabricQualities.find(q=>q.id===f.fabricQualityId);
                                            return <SelectItem key={f.id} value={f.id}>{quality?.name} - {f.quantityMeters}m</SelectItem>
                                        })}
                                    </SelectContent>
                                </Select>
                                <Input type="number" placeholder="Meters to cut" value={formData.quantityMeters} onChange={e => setFormData({...formData, quantityMeters: e.target.value})} required/>
                                <Input type="number" placeholder="Number of pieces" value={formData.pieces} onChange={e => setFormData({...formData, pieces: e.target.value})} required/>
                                <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Create Order</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>Cutting Orders</CardTitle></CardHeader>
                        <CardContent>
                            {isLoading ? <TableSkeleton rows={5} cells={5} /> : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Fabric</TableHead><TableHead>Quantity</TableHead><TableHead>Pieces</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {cuttingOrders.map(o => {
                                            const stock = data.fabricStock.find(s => s.id === o.fabricStockId);
                                            const quality = stock ? data.fabricQualities.find(q => q.id === stock.fabricQualityId) : null;
                                            return (
                                                <TableRow key={o.id}>
                                                    <TableCell>{quality?.name || 'N/A'}</TableCell>
                                                    <TableCell>{o.quantityMeters}m</TableCell>
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
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default Cutting;
