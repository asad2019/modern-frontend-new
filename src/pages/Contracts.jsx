
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileText, XCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageLoader from '@/components/common/PageLoader';

const Contracts = () => {
  const { data, isLoading } = usePageData(['contracts', 'clients', 'fabricQualities', 'brokers']);
  const { addData, updateData, deleteData, closeContract } = useData();
  
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [newContract, setNewContract] = useState({ client_id: '', fabric_quality_id: '', required_bags: '', status: 'New', broker_id: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('contracts', newContract);
    setNewContract({ client_id: '', fabric_quality_id: '', required_bags: '', status: 'New', broker_id: '' });
    setOpen(false);
  };

  const handleEdit = (contract) => {
    setEditingContract({ ...contract, broker_id: contract.broker_id || '' });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('contracts', editingContract.id, editingContract);
    setEditOpen(false);
    setEditingContract(null);
  };

  const handleDelete = (contractId) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      deleteData('contracts', contractId);
    }
  };

  const handleCloseContract = (contractId) => {
    closeContract(contractId);
  };
  
  if (isLoading) {
    return <PageLoader type="table" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-6 w-6" /> Contracts</CardTitle>
            <CardDescription>Manage all client contracts.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> New Contract</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Contract</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Select onValueChange={v => setNewContract({...newContract, client_id: v})}><SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger><SelectContent>{data.clients?.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                <Select onValueChange={v => setNewContract({...newContract, fabric_quality_id: v})}><SelectTrigger><SelectValue placeholder="Select Fabric Quality" /></SelectTrigger><SelectContent>{data.fabricQualities?.map(f=><SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select>
                <Select onValueChange={v => setNewContract({...newContract, broker_id: v})}><SelectTrigger><SelectValue placeholder="Select Broker (Optional)" /></SelectTrigger><SelectContent>{data.brokers?.map(b=><SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
                <Input type="number" placeholder="Required Bags" value={newContract.required_bags} onChange={e => setNewContract({...newContract, required_bags: e.target.value})} required />
                <DialogFooter><Button type="submit">Save Contract</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Fabric Quality</TableHead><TableHead>Required Bags</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.contracts?.filter(c => !c.is_internal).map((contract) => {
                const client = data.clients?.find(c => c.id === contract.client_id);
                const quality = data.fabricQualities?.find(f => f.id === contract.fabric_quality_id);
                return (
                  <TableRow key={contract.id}>
                    <TableCell>{client?.name || 'N/A'}</TableCell>
                    <TableCell>{quality?.name || 'N/A'}</TableCell>
                    <TableCell>{contract.required_bags}</TableCell>
                    <TableCell><Badge variant={contract.status === 'In Process' ? 'default' : contract.status === 'Closed' ? 'outline' : 'secondary'}>{contract.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {contract.status !== 'Closed' && (
                          <Button variant="ghost" size="sm" onClick={() => handleCloseContract(contract.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(contract.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Contract</DialogTitle></DialogHeader>
          {editingContract && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Select onValueChange={v => setEditingContract({...editingContract, client_id: v})} value={editingContract.client_id}><SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger><SelectContent>{data.clients?.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
              <Select onValueChange={v => setEditingContract({...editingContract, fabric_quality_id: v})} value={editingContract.fabric_quality_id}><SelectTrigger><SelectValue placeholder="Select Fabric Quality" /></SelectTrigger><SelectContent>{data.fabricQualities?.map(f=><SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select>
              <Select onValueChange={v => setEditingContract({...editingContract, broker_id: v})} value={editingContract.broker_id || ''}><SelectTrigger><SelectValue placeholder="Select Broker (Optional)" /></SelectTrigger><SelectContent>{data.brokers?.map(b=><SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
              <Input type="number" placeholder="Required Bags" value={editingContract.required_bags} onChange={e => setEditingContract({...editingContract, required_bags: e.target.value})} required />
              <Select onValueChange={v => setEditingContract({...editingContract, status: v})} value={editingContract.status}><SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger><SelectContent><SelectItem value="New">New</SelectItem><SelectItem value="In Process">In Process</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select>
              <DialogFooter><Button type="submit">Update Contract</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Contracts;
