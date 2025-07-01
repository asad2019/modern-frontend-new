
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/ApiAuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const Users = () => {
  const { data, isLoading } = usePageData(['users', 'departments']);
  const { addData, updateData, deleteData } = useData();
  const { user: currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '', password: '', role: 'User', department_id: '' });

  const handleInputChange = (e, isEdit = false) => {
    const { id, value } = e.target;
    if (isEdit) {
      setEditingUser(prev => ({ ...prev, [id]: value }));
    } else {
      setNewUser(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSelectChange = (id, value, isEdit = false) => {
    if (isEdit) {
      setEditingUser(prev => ({ ...prev, [id]: value }));
    } else {
      setNewUser(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('users', newUser);
    setNewUser({ name: '', email: '', username: '', password: '', role: 'User', department_id: '' });
    setOpen(false);
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user, department_id: user.department?.id || '' });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const { department, ...rest } = editingUser;
    updateData('users', editingUser.id, rest);
    setEditOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteData('users', userId);
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
            <CardTitle className="flex items-center"><UsersIcon className="mr-2 h-6 w-6" /> User Management</CardTitle>
            <CardDescription>Manage system users and their roles.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Input id="name" placeholder="Full Name" value={newUser.name} onChange={handleInputChange} required />
                <Input id="username" placeholder="Username" value={newUser.username} onChange={handleInputChange} required />
                <Input id="email" type="email" placeholder="Email Address" value={newUser.email} onChange={handleInputChange} required />
                <Input id="password" type="password" placeholder="Password" value={newUser.password} onChange={handleInputChange} required />
                <Select onValueChange={v => handleSelectChange('role', v)} value={newUser.role}>
                    <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="User">User</SelectItem>
                    </SelectContent>
                </Select>
                 <Select onValueChange={v => handleSelectChange('department_id', v)} value={newUser.department_id}>
                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>{data.departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
                <DialogFooter><Button type="submit">Save User</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.users?.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} disabled={user.id === currentUser.id}>
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
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Input id="name" placeholder="Full Name" value={editingUser.name} onChange={e => handleInputChange(e, true)} required />
              <Input id="username" placeholder="Username" value={editingUser.username} onChange={e => handleInputChange(e, true)} required />
              <Input id="email" type="email" placeholder="Email Address" value={editingUser.email} onChange={e => handleInputChange(e, true)} required />
              <Input id="password" type="password" placeholder="New Password (optional)" onChange={e => handleInputChange(e, true)} />
              <Select onValueChange={v => handleSelectChange('role', v, true)} value={editingUser.role}>
                  <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                  </SelectContent>
              </Select>
               <Select onValueChange={v => handleSelectChange('department_id', v, true)} value={editingUser.department_id}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>{data.departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
              <DialogFooter><Button type="submit">Update User</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Users;
