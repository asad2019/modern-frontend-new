
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageLoader from '@/components/common/PageLoader';

const Maintenance = () => {
  const { data, isLoading } = usePageData(['maintenanceSchedules', 'looms', 'machines']);
  const { addData, updateData, deleteData } = useData();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({ machine_id: '', task: '', scheduled_date: '', status: 'Scheduled' });

  const allMachines = [...(data.looms || []), ...(data.machines || [])];

  const handleInputChange = (e, isEdit = false) => {
    const { id, value } = e.target;
    const targetSetter = isEdit ? setEditingSchedule : setNewSchedule;
    targetSetter(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value, isEdit = false) => {
    const targetSetter = isEdit ? setEditingSchedule : setNewSchedule;
    targetSetter(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('maintenanceSchedules', { ...newSchedule, scheduled_date: new Date(newSchedule.scheduled_date).toISOString() });
    setNewSchedule({ machine_id: '', task: '', scheduled_date: '', status: 'Scheduled' });
    setOpen(false);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule({ ...schedule, scheduled_date: schedule.scheduled_date.split('T')[0] });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('maintenanceSchedules', editingSchedule.id, { ...editingSchedule, scheduled_date: new Date(editingSchedule.scheduled_date).toISOString() });
    setEditOpen(false);
    setEditingSchedule(null);
  };

  const handleDelete = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this maintenance task?')) {
      deleteData('maintenanceSchedules', scheduleId);
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
            <CardTitle className="flex items-center"><Wrench className="mr-2 h-6 w-6" /> Maintenance Schedule</CardTitle>
            <CardDescription>Plan and track all machine maintenance.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Schedule Task</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule New Maintenance Task</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Select onValueChange={v => handleSelectChange('machine_id', v)} value={newSchedule.machine_id}>
                  <SelectTrigger><SelectValue placeholder="Select Machine" /></SelectTrigger>
                  <SelectContent>{allMachines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="date" id="scheduled_date" value={newSchedule.scheduled_date} onChange={handleInputChange} required />
                <Textarea id="task" placeholder="Describe the maintenance task..." value={newSchedule.task} onChange={handleInputChange} required />
                <DialogFooter><Button type="submit">Schedule</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Machine</TableHead><TableHead>Task</TableHead><TableHead>Scheduled Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.maintenanceSchedules?.map((schedule) => {
                const machine = allMachines.find(m => m.id === schedule.machine_id);
                return (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{machine?.name || 'N/A'}</TableCell>
                    <TableCell>{schedule.task}</TableCell>
                    <TableCell>{new Date(schedule.scheduled_date).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={schedule.status === 'Completed' ? 'default' : 'secondary'}>{schedule.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(schedule)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(schedule.id)}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>Edit Maintenance Task</DialogTitle></DialogHeader>
          {editingSchedule && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Select onValueChange={v => handleSelectChange('machine_id', v, true)} value={editingSchedule.machine_id}>
                <SelectTrigger><SelectValue placeholder="Select Machine" /></SelectTrigger>
                <SelectContent>{allMachines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" id="scheduled_date" value={editingSchedule.scheduled_date} onChange={(e) => handleInputChange(e, true)} required />
              <Textarea id="task" value={editingSchedule.task} onChange={(e) => handleInputChange(e, true)} required />
              <Select onValueChange={v => handleSelectChange('status', v, true)} value={editingSchedule.status}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter><Button type="submit">Update Task</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Maintenance;
