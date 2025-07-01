
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, SprayCan } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const FinishingUnits = () => {
  const { data, isLoading } = usePageData(['finishingUnits']);
  const { addData, updateData, deleteData } = useData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [newUnit, setNewUnit] = useState({ name: '', email: '', phone: '' });

  const handleInputChange = (e, isEdit = false) => {
    const { id, value } = e.target;
    if (isEdit) {
      setEditingUnit(prev => ({ ...prev, [id]: value }));
    } else {
      setNewUnit(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('finishingUnits', newUnit);
    setNewUnit({ name: '', email: '', phone: '' });
    setOpen(false);
  };

  const handleEdit = (unit) => {
    setEditingUnit({ ...unit });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('finishingUnits', editingUnit.id, editingUnit);
    setEditOpen(false);
    setEditingUnit(null);
  };

  const handleDelete = (unitId) => {
    if (window.confirm('Are you sure you want to delete this finishing unit?')) {
      deleteData('finishingUnits', unitId);
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
            <CardTitle className="flex items-center"><SprayCan className="mr-2 h-6 w-6" /> Finishing Units</CardTitle>
            <CardDescription>Manage all your external finishing units.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Unit</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Finishing Unit</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Input id="name" placeholder="Unit Name" value={newUnit.name} onChange={handleInputChange} required />
                <Input id="email" type="email" placeholder="Contact Email" value={newUnit.email} onChange={handleInputChange} required />
                <Input id="phone" placeholder="Phone Number" value={newUnit.phone} onChange={handleInputChange} />
                <DialogFooter><Button type="submit">Save Unit</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.finishingUnits?.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.email}</TableCell>
                  <TableCell>{unit.phone}</TableCell>
                  <TableCell><div className="flex space-x-2"><Button variant="ghost" size="sm" onClick={() => handleEdit(unit)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(unit.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Finishing Unit</DialogTitle></DialogHeader>
          {editingUnit && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Input id="name" value={editingUnit.name} onChange={(e) => handleInputChange(e, true)} required />
              <Input id="email" type="email" value={editingUnit.email} onChange={(e) => handleInputChange(e, true)} required />
              <Input id="phone" value={editingUnit.phone} onChange={(e) => handleInputChange(e, true)} />
              <DialogFooter><Button type="submit">Update Unit</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default FinishingUnits;
