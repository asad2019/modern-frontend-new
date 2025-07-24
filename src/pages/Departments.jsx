
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Truck, Edit, Trash2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const permissionsList = [
  { id: 'all', label: 'Full Administrator Access' },
  { id: 'production-dashboard', label: 'Access Production Dashboard' },
  { id: 'processing-dashboard', label: 'Access Processing Dashboard' },
  { id: 'po', label: 'PO Module' },
  { id: 'product', label: 'Product Module' },
  { id: 'shipmentcodes', label: 'Shipment Codes Module' },
  { id: 'shipments', label: 'Shipments Module' },
  { id: 'contracts', label: 'Manage Contracts' },
  { id: 'clients', label: 'Manage Clients' },
  { id: 'brokers', label: 'Manage Brokers' },
  { id: 'sizing-accounts', label: 'Manage Sizing Accounts' },
  { id: 'qualities', label: 'Manage Qualities' },
  { id: 'yarn', label: 'Manage Yarn/Fabric' },
  { id: 'daily-production', label: 'Log Daily Production' },
  { id: 'transactions', label: 'Perform Stock Transactions' },
  { id: 'reports', label: 'View Reports' },
  // { id: 'machines', label: 'Manage Machines' },
  // { id: 'maintenance', label: 'Manage Maintenance' },
  // { id: 'quality_control', label: 'Manage Quality Control' },
  { id: 'settings', label: 'Access System Settings' },
];

const Departments = () => {
  const { data, isLoading } = usePageData(['departments']);
  const { addData, updateData, deleteData } = useData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', permissions: [] });

  const handlePermsChange = (permId, isEdit = false) => {
    const targetState = isEdit ? editingDept : newDepartment;
    const setTargetState = isEdit ? setEditingDept : setNewDepartment;

    setTargetState(prev => {
        const newPerms = prev.permissions.includes(permId)
            ? prev.permissions.filter(p => p !== permId)
            : [...prev.permissions, permId];
        return { ...prev, permissions: newPerms };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('departments', newDepartment);
    setNewDepartment({ name: '', permissions: [] });
    setOpen(false);
  };
  
  const handleEdit = (dept) => {
    setEditingDept({...dept});
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('departments', editingDept.id, editingDept);
    setEditOpen(false);
    setEditingDept(null);
  };
  
  const handleDelete = (id) => {
    if(window.confirm('Are you sure? This could affect users in this department.')) {
      deleteData('departments', id);
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
            <CardTitle className="flex items-center"><Truck className="mr-2 h-6 w-6" /> Departments</CardTitle>
            <CardDescription>Manage departments and their permissions.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Department</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Create New Department</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Input placeholder="Department Name" value={newDepartment.name} onChange={e => setNewDepartment({...newDepartment, name: e.target.value})} required />
                <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {permissionsList.map(perm => (<div key={perm.id} className="flex items-center space-x-2"><Checkbox id={perm.id} checked={newDepartment.permissions.includes(perm.id)} onCheckedChange={() => handlePermsChange(perm.id)} /><Label htmlFor={perm.id} className="font-normal">{perm.label}</Label></div>))}
                    </div>
                </div>
                <DialogFooter><Button type="submit">Save Department</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.departments?.map((dept) => (
                <Card key={dept.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{dept.name}</CardTitle>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium mb-2">Allowed Actions:</p>
                        <ul className="list-disc list-inside text-muted-foreground text-sm">
                            {dept.permissions.map(p => (<li key={p}>{(permissionsList.find(pl => pl.id === p) || {}).label || p}</li>))}
                        </ul>
                    </CardContent>
                </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
          {editingDept && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Input placeholder="Department Name" value={editingDept.name} onChange={e => setEditingDept({...editingDept, name: e.target.value})} required />
              <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                      {permissionsList.map(perm => (<div key={perm.id} className="flex items-center space-x-2"><Checkbox id={`edit-${perm.id}`} checked={editingDept.permissions.includes(perm.id)} onCheckedChange={() => handlePermsChange(perm.id, true)} /><Label htmlFor={`edit-${perm.id}`} className="font-normal">{perm.label}</Label></div>))}
                  </div>
              </div>
              <DialogFooter><Button type="submit">Update Department</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Departments;
