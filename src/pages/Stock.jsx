
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const Stock = () => {
  const { data, isLoading } = usePageData(['stockLocations']);
  const { addData, updateData, deleteData } = useData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({ name: '' });

  const handleInputChange = (e, isEdit = false) => {
    if (isEdit) {
      setEditingLocation(prev => ({ ...prev, name: e.target.value }));
    } else {
      setNewLocation({ name: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newLocation.name) return;
    addData('stockLocations', newLocation);
    setNewLocation({ name: '' });
    setOpen(false);
  };

  const handleEdit = (location) => {
    setEditingLocation({ ...location });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('stockLocations', editingLocation.id, editingLocation);
    setEditOpen(false);
    setEditingLocation(null);
  };

  const handleDelete = (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      deleteData('stockLocations', locationId);
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
            <CardTitle>Stock Locations</CardTitle>
            <CardDescription>Manage warehouse and floor locations.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Location</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Stock Location</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Input placeholder="Location Name" value={newLocation.name} onChange={handleInputChange} required />
                <DialogFooter><Button type="submit">Save Location</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Location Name</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.stockLocations?.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(location)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(location.id)}>
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
          <DialogHeader><DialogTitle>Edit Stock Location</DialogTitle></DialogHeader>
          {editingLocation && (
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={editingLocation.name} onChange={(e) => handleInputChange(e, true)} className="col-span-3" required />
                </div>
              </div>
              <DialogFooter><Button type="submit">Update Location</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Stock;
