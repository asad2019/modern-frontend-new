
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const Brokers = () => {
  const { data, isLoading } = usePageData(['brokers']);
  const { addData, updateData, deleteData } = useData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState(null);
  const [newBroker, setNewBroker] = useState({ name: '', email: '', phone: '' });

  const handleInputChange = (e, isEdit = false) => {
    const { id, value } = e.target;
    if (isEdit) {
      setEditingBroker(prev => ({ ...prev, [id]: value }));
    } else {
      setNewBroker(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('brokers', newBroker);
    setNewBroker({ name: '', email: '', phone: '' });
    setOpen(false);
  };

  const handleEdit = (broker) => {
    setEditingBroker({ ...broker });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('brokers', editingBroker.id, editingBroker);
    setEditOpen(false);
    setEditingBroker(null);
  };

  const handleDelete = (brokerId) => {
    if (window.confirm('Are you sure you want to delete this broker?')) {
      deleteData('brokers', brokerId);
    }
  };
  
  if (isLoading) {
    return <PageLoader type="table" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Brokers Management</CardTitle>
            <CardDescription>View and manage all your brokers.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Broker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Broker</DialogTitle>
                <DialogDescription>Fill in the details below to add a new broker.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newBroker.name} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={newBroker.email} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input id="phone" value={newBroker.phone} onChange={handleInputChange} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Broker</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.brokers?.map((broker) => (
                <TableRow key={broker.id}>
                  <TableCell className="font-medium">{broker.name}</TableCell>
                  <TableCell>{broker.email}</TableCell>
                  <TableCell>{broker.phone}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(broker)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(broker.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
          <DialogHeader>
            <DialogTitle>Edit Broker</DialogTitle>
            <DialogDescription>Update broker information.</DialogDescription>
          </DialogHeader>
          {editingBroker && (
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={editingBroker.name} onChange={(e) => handleInputChange(e, true)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={editingBroker.email} onChange={(e) => handleInputChange(e, true)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input id="phone" value={editingBroker.phone} onChange={(e) => handleInputChange(e, true)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Broker</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Brokers;
