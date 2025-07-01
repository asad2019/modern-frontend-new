
import React, { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PageLoader from '@/components/common/PageLoader';

const Finishing = () => {
    const { data, isLoading } = usePageData(['processingOrders', 'fabricStock', 'fabricQualities']);
    const { createProcessingOrder, updateProcessingOrderStatus } = useData();
    
    const [formData, setFormData] = useState({ fabric_stock_id: '', quantity_meters: '', status: 'Pending', type: 'finishing' });

    const handleSubmit = (e) => {
        e.preventDefault();
        createProcessingOrder(formData);
        setFormData({ fabric_stock_id: '', quantity_meters: '', status: 'Pending', type: 'finishing' });
    };

    const handleStatusChange = (orderId, status) => {
        updateProcessingOrderStatus(orderId, status);
    };

    const finishingOrders = data.processingOrders?.filter(o => o.type === 'finishing') || [];
    
    if (isLoading) {
        return <PageLoader type="table" />
    }

    return (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
                <CardHeader><CardTitle>Create Finishing Order</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select onValueChange={v => setFormData({...formData, fabric_stock_id: v})} value={formData.fabric_stock_id}><SelectTrigger><SelectValue placeholder="Select Fabric Stock" /></SelectTrigger><SelectContent>{data.fabricStock?.map(f => <SelectItem key={f.id} value={f.id}>{data.fabricQualities?.find(q=>q.id===f.fabric_quality_id)?.name} - {f.quantity_meters}m</SelectItem>)}</SelectContent></Select>
                        <Input type="number" placeholder="Meters to process" value={formData.quantity_meters} onChange={e => setFormData({...formData, quantity_meters: e.target.value})} required/>
                        <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Create Order</Button>
                    </form>
                </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
                <CardHeader><CardTitle>Finishing Orders</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Fabric</TableHead><TableHead>Quantity</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {finishingOrders.map(o => {
                                const stock = data.fabricStock?.find(s => s.id === o.fabric_stock_id);
                                const quality = stock ? data.fabricQualities?.find(q => q.id === stock.fabric_quality_id) : null;
                                return (
                                    <TableRow key={o.id}>
                                        <TableCell>{quality?.name || 'N/A'}</TableCell>
                                        <TableCell>{o.quantity_meters}m</TableCell>
                                        <TableCell><Badge>{o.status}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">Update Status</Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(o.id, 'In Progress')}>In Progress</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(o.id, 'Completed')}>Completed</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(o.id, 'Cancelled')}>Cancelled</DropdownMenuItem>
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
    );
};

export default Finishing;
