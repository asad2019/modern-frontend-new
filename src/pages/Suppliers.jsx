
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Building } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const Suppliers = () => {
  const { data, isLoading } = usePageData(['suppliers']);
  const { addData, updateData, deleteData } = useData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '' });

  const handleInputChange = (e, isEdit = false) => {
    const { id, value } = e.target;
    if (isEdit) {
      setEditingSupplier(prev => ({ ...prev, [id]: value }));
    } else {
      setNewSupplier(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('suppliers', newSupplier);
    setNewSupplier({ name: '', email: '' });
    setOpen(false);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier({ ...supplier });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('suppliers', editingSupplier.id, editingSupplier);
    setEditOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteData('suppliers', supplierId);
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
            <CardTitle className="flex items-center"><Building className="mr-2 h-6 w-6" /> Suppliers</CardTitle>
            <CardDescription>Manage all your yarn and material suppliers.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Supplier</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Supplier</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Input id="name" placeholder="Supplier Name" value={newSupplier.name} onChange={handleInputChange} required />
                <Input id="email" type="email" placeholder="Contact Email" value={newSupplier.email} onChange={handleInputChange} required />
                <DialogFooter><Button type="submit">Save Supplier</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.suppliers?.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell><div className="flex space-x-2"><Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(supplier.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Supplier</DialogTitle></DialogHeader>
          {editingSupplier && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Input id="name" value={editingSupplier.name} onChange={(e) => handleInputChange(e, true)} required />
              <Input id="email" type="email" value={editingSupplier.email} onChange={(e) => handleInputChange(e, true)} required />
              <DialogFooter><Button type="submit">Update Supplier</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Suppliers;
