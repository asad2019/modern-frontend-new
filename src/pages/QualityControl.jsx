
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageLoader from '@/components/common/PageLoader';

const QualityControl = () => {
  const { data, isLoading } = usePageData(['qcRecords', 'fabricStock', 'fabricQualities', 'users']);
  const { addData, updateData, deleteData } = useData();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({ fabric_stock_id: '', notes: '', defects: 0, status: 'Pass' });

  const handleInputChange = (e, isEdit = false) => {
    const { id, value, type } = e.target;
    const targetSetter = isEdit ? setEditingRecord : setNewRecord;
    targetSetter(prev => ({ ...prev, [id]: type === 'number' ? parseInt(value) : value }));
  };

  const handleSelectChange = (id, value, isEdit = false) => {
    const targetSetter = isEdit ? setEditingRecord : setNewRecord;
    targetSetter(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('qcRecords', { ...newRecord, date: new Date().toISOString(), inspector_id: user.id });
    setNewRecord({ fabric_stock_id: '', notes: '', defects: 0, status: 'Pass' });
    setOpen(false);
  };

  const handleEdit = (record) => {
    setEditingRecord({ ...record });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('qcRecords', editingRecord.id, editingRecord);
    setEditOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = (recordId) => {
    if (window.confirm('Are you sure you want to delete this QC record?')) {
      deleteData('qcRecords', recordId);
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
            <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-6 w-6" /> Quality Control</CardTitle>
            <CardDescription>Log and track fabric quality inspections.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add QC Record</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New QC Record</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <Select onValueChange={v => handleSelectChange('fabric_stock_id', v)} value={newRecord.fabric_stock_id}>
                  <SelectTrigger><SelectValue placeholder="Select Fabric Batch" /></SelectTrigger>
                  <SelectContent>{data.fabricStock?.map(fs => {
                      const quality = data.fabricQualities?.find(q => q.id === fs.fabric_quality_id);
                      return <SelectItem key={fs.id} value={fs.id}>{quality?.name} - {fs.quantity_meters}m (ID: {fs.id.slice(0, 6)})</SelectItem>
                  })}</SelectContent>
                </Select>
                <Input id="defects" type="number" placeholder="Number of defects" value={newRecord.defects} onChange={handleInputChange} required />
                <Textarea id="notes" placeholder="Inspection notes..." value={newRecord.notes} onChange={handleInputChange} />
                <Select onValueChange={v => handleSelectChange('status', v)} value={newRecord.status}>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pass">Pass</SelectItem>
                    <SelectItem value="Fail">Fail</SelectItem>
                    <SelectItem value="Review">Needs Review</SelectItem>
                  </SelectContent>
                </Select>
                <DialogFooter><Button type="submit">Save Record</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Fabric</TableHead><TableHead>Inspector</TableHead><TableHead>Defects</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.qcRecords?.map((record) => {
                const fabric = data.fabricStock?.find(fs => fs.id === record.fabric_stock_id);
                const quality = fabric ? data.fabricQualities?.find(q => q.id === fabric.fabric_quality_id) : null;
                const inspector = data.users?.find(u => u.id === record.inspector_id);
                return (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{quality?.name || 'N/A'}</TableCell>
                    <TableCell>{inspector?.name || 'N/A'}</TableCell>
                    <TableCell>{record.defects}</TableCell>
                    <TableCell><Badge variant={record.status === 'Pass' ? 'default' : (record.status === 'Fail' ? 'destructive' : 'secondary')}>{record.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>Edit QC Record</DialogTitle></DialogHeader>
          {editingRecord && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <Select onValueChange={v => handleSelectChange('fabric_stock_id', v, true)} value={editingRecord.fabric_stock_id}>
                <SelectTrigger><SelectValue placeholder="Select Fabric Batch" /></SelectTrigger>
                <SelectContent>{data.fabricStock?.map(fs => {
                    const quality = data.fabricQualities?.find(q => q.id === fs.fabric_quality_id);
                    return <SelectItem key={fs.id} value={fs.id}>{quality?.name} - {fs.quantity_meters}m (ID: {fs.id.slice(0, 6)})</SelectItem>
                })}</SelectContent>
              </Select>
              <Input id="defects" type="number" value={editingRecord.defects} onChange={(e) => handleInputChange(e, true)} required />
              <Textarea id="notes" value={editingRecord.notes} onChange={(e) => handleInputChange(e, true)} />
              <Select onValueChange={v => handleSelectChange('status', v, true)} value={editingRecord.status}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pass">Pass</SelectItem>
                  <SelectItem value="Fail">Fail</SelectItem>
                  <SelectItem value="Review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter><Button type="submit">Update Record</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default QualityControl;
