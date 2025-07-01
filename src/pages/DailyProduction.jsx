
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const DailyProduction = () => {
  const { data, isLoading } = usePageData(['dailyProduction', 'looms', 'contracts', 'fabricQualities']);
  const { addDailyProduction } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], contract_id: '', loom_id: '', fabric_quality_id: '', produced_meters: ''});

  const handleSubmit = (e) => {
    e.preventDefault();
    const loom = data.looms.find(l => l.id === formData.loom_id);
    if (loom && loom.quality !== formData.fabric_quality_id) {
        toast({ title: "Error", description: "The selected fabric quality does not match the loom's assigned quality.", variant: "destructive" });
        return;
    }
    addDailyProduction(formData);
    setFormData({ date: new Date().toISOString().split('T')[0], contract_id: '', loom_id: '', fabric_quality_id: '', produced_meters: '' });
  };

  const activeLooms = data.looms?.filter(l => l.status === 'Active') || [];
  
  if(isLoading) {
    return <PageLoader type="table" />
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
            <CardHeader><CardTitle>Log Daily Production</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    <Select onValueChange={v => setFormData({...formData, loom_id: v})} value={formData.loom_id}><SelectTrigger><SelectValue placeholder="Select Active Loom" /></SelectTrigger><SelectContent>{activeLooms.map(l=><SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
                    <Select onValueChange={v => setFormData({...formData, contract_id: v})} value={formData.contract_id}><SelectTrigger><SelectValue placeholder="Select Contract" /></SelectTrigger><SelectContent>{data.contracts?.filter(c => !c.is_internal).map(c=><SelectItem key={c.id} value={c.id}>{c.id}</SelectItem>)}</SelectContent></Select>
                    <Select onValueChange={v => setFormData({...formData, fabric_quality_id: v})} value={formData.fabric_quality_id}><SelectTrigger><SelectValue placeholder="Select Fabric Quality" /></SelectTrigger><SelectContent>{data.fabricQualities?.map(f=><SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select>
                    <Input type="number" placeholder="Produced Meters" value={formData.produced_meters} onChange={e => setFormData({...formData, produced_meters: e.target.value})} required/>
                    <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Production Log</Button>
                </form>
            </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
            <CardHeader><CardTitle>Recent Production Logs</CardTitle><CardDescription>Last 10 production entries.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Loom</TableHead><TableHead>Quality</TableHead><TableHead>Meters</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {data.dailyProduction?.slice(0,10).map(p => {
                            const loom = data.looms?.find(l => l.id === p.loom_id);
                            const quality = data.fabricQualities?.find(f => f.id === p.fabric_quality_id);
                            return (
                                <TableRow key={p.id}>
                                    <TableCell>{p.date}</TableCell>
                                    <TableCell>{loom?.name}</TableCell>
                                    <TableCell>{quality?.name}</TableCell>
                                    <TableCell>{p.produced_meters}m</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default DailyProduction;
