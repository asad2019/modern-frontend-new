
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
import { PlusCircle, Edit, Trash2, HardHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageLoader from '@/components/common/PageLoader';

const Machines = () => {
  const { data, isLoading } = usePageData(['machines']);
  const { addData, updateData, deleteData } = useData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [newMachine, setNewMachine] = useState({ name: '', type: '', status: 'Active' });

  const handleInputChange = (e, isEdit = false) => {
    const { id, value } = e.target;
    const targetSetter = isEdit ? setEditingMachine : setNewMachine;
    targetSetter(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value, isEdit = false) => {
    const targetSetter = isEdit ? setEditingMachine : setNewMachine;
    targetSetter(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('machines', newMachine);
    setNewMachine({ name: '', type: '', status: 'Active' });
    setOpen(false);
  };

  const handleEdit = (machine) => {
    setEditingMachine({ ...machine });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('machines', editingMachine.id, editingMachine);
    setEditOpen(false);
    setEditingMachine(null);
  };

  const handleDelete = (machineId) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      deleteData('machines', machineId);
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
            <CardTitle className="flex items-center"><HardHat className="mr-2 h-6 w-6" /> Machine Management</CardTitle>
            <CardDescription>Track all factory machinery.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Machine</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a New Machine</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Input id="name" placeholder="Machine Name (e.g. Warping 02)" value={newMachine.name} onChange={handleInputChange} required />
                <Input id="type" placeholder="Machine Type (e.g. Sizing)" value={newMachine.type} onChange={handleInputChange} required />
                <Select onValueChange={v => handleSelectChange('status', v)} value={newMachine.status}>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <DialogFooter><Button type="submit">Save Machine</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.machines?.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.name}</TableCell>
                  <TableCell>{machine.type}</TableCell>
                  <TableCell><Badge variant={machine.status === 'Active' ? 'default' : 'secondary'}>{machine.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(machine)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(machine.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Machine</DialogTitle></DialogHeader>
          {editingMachine && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Input id="name" value={editingMachine.name} onChange={(e) => handleInputChange(e, true)} required />
              <Input id="type" value={editingMachine.type} onChange={(e) => handleInputChange(e, true)} required />
              <Select onValueChange={v => handleSelectChange('status', v, true)} value={editingMachine.status}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter><Button type="submit">Update Machine</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Machines;
