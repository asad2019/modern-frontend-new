
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
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageLoader from '@/components/common/PageLoader';

const Looms = () => {
  const { data, isLoading } = usePageData(['looms', 'fabricQualities', 'contracts']);
  const { addData, updateData, deleteData } = useData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingLoom, setEditingLoom] = useState(null);
  const [newLoom, setNewLoom] = useState({ name: '', status: 'Inactive', fabric_quality_id: null, contract_id: null });

  const handleInputChange = (e, isEdit = false) => {
    const { id, value } = e.target;
    if (isEdit) {
      setEditingLoom(prev => ({ ...prev, [id]: value }));
    } else {
      setNewLoom(prev => ({ ...prev, [id]: value }));
    }
  };
  
  const handleSelectChange = (id, value, isEdit = false) => {
     if (isEdit) {
      setEditingLoom(prev => ({ ...prev, [id]: value }));
    } else {
      setNewLoom(prev => ({ ...prev, [id]: value }));
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('looms', newLoom);
    setNewLoom({ name: '', status: 'Inactive', fabric_quality_id: null, contract_id: null });
    setOpen(false);
  };

  const handleEdit = (loom) => {
    setEditingLoom({ ...loom });
    setEditOpen(true);
  };
  
  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedLoom = { ...editingLoom };
    if (updatedLoom.status !== 'Active') {
      updatedLoom.fabric_quality_id = null;
      updatedLoom.contract_id = null;
    }
    updateData('looms', editingLoom.id, updatedLoom);
    setEditOpen(false);
    setEditingLoom(null);
  };

  const handleDelete = (loomId) => {
    if (window.confirm('Are you sure you want to delete this loom?')) {
      deleteData('looms', loomId);
    }
  };
  
  if (isLoading) {
    return <PageLoader type="table" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Looms Management</CardTitle>
            <CardDescription>Track status and assignment of all looms.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Loom</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a New Loom</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Input id="name" placeholder="Loom Name (e.g. Loom 004)" value={newLoom.name} onChange={handleInputChange} required />
                <Select onValueChange={v => handleSelectChange('status', v)} value={newLoom.status}>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <DialogFooter><Button type="submit">Save Loom</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Loom Name</TableHead><TableHead>Status</TableHead><TableHead>Current Quality</TableHead><TableHead>Contract</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.looms?.map((loom) => {
                const quality = data.fabricQualities?.find(q => q.id === loom.fabric_quality_id);
                const contract = data.contracts?.find(c => c.id === loom.contract_id);
                return (
                  <TableRow key={loom.id}>
                    <TableCell className="font-medium">{loom.name}</TableCell>
                    <TableCell>
                      <Badge variant={loom.status === 'Active' ? 'default' : 'secondary'}>{loom.status}</Badge>
                    </TableCell>
                    <TableCell>{quality?.name || 'N/A'}</TableCell>
                    <TableCell>{contract?.id || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(loom)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(loom.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Loom</DialogTitle></DialogHeader>
          {editingLoom && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Input id="name" placeholder="Loom Name" value={editingLoom.name} onChange={(e) => handleInputChange(e, true)} required />
              <Select onValueChange={v => handleSelectChange('status', v, true)} value={editingLoom.status}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {editingLoom.status === 'Active' && (
                <>
                  <Select onValueChange={v => handleSelectChange('fabric_quality_id', v, true)} value={editingLoom.fabric_quality_id || ''}>
                    <SelectTrigger><SelectValue placeholder="Assign Fabric Quality" /></SelectTrigger>
                    <SelectContent>{data.fabricQualities?.map(q => <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={v => handleSelectChange('contract_id', v, true)} value={editingLoom.contract_id || ''}>
                    <SelectTrigger><SelectValue placeholder="Assign Contract" /></SelectTrigger>
                    <SelectContent>{data.contracts?.filter(c => c.status === 'In Process').map(c => <SelectItem key={c.id} value={c.id}>{c.id}</SelectItem>)}</SelectContent>
                  </Select>
                </>
              )}
              <DialogFooter><Button type="submit">Update Loom</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Looms;
