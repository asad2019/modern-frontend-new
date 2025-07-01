
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
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const Clients = () => {
  const { data, isLoading } = usePageData(['clients']);
  const { addData, updateData, deleteData } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });

  const handleInputChange = (e, isEdit = false) => {
    const { id, value } = e.target;
    if (isEdit) {
      setEditingClient(prev => ({ ...prev, [id]: value }));
    } else {
      setNewClient(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('clients', newClient);
    toast({ title: "Success", description: "New client has been added." });
    setNewClient({ name: '', email: '', phone: '', address: '' });
    setOpen(false);
  };

  const handleEdit = (client) => {
    setEditingClient({ ...client });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('clients', editingClient.id, editingClient);
    toast({ title: "Success", description: "Client has been updated." });
    setEditOpen(false);
    setEditingClient(null);
  };

  const handleDelete = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteData('clients', clientId);
      toast({ title: "Success", description: "Client has been deleted." });
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
            <CardTitle>Clients Management</CardTitle>
            <CardDescription>View and manage all your clients.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Client</DialogTitle>
                <DialogDescription>Fill in the details below to add a new client.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newClient.name} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={newClient.email} onChange={handleInputChange} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input id="phone" value={newClient.phone} onChange={handleInputChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">Address</Label>
                    <Input id="address" value={newClient.address} onChange={handleInputChange} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Client</Button>
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
                <TableHead>Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}>
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
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information.</DialogDescription>
          </DialogHeader>
          {editingClient && (
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={editingClient.name} onChange={(e) => handleInputChange(e, true)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={editingClient.email} onChange={(e) => handleInputChange(e, true)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input id="phone" value={editingClient.phone} onChange={(e) => handleInputChange(e, true)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Address</Label>
                  <Input id="address" value={editingClient.address} onChange={(e) => handleInputChange(e, true)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Client</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Clients;
