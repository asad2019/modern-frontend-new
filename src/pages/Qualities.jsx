
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const Qualities = () => {
  const { data, isLoading } = usePageData(['yarnQualities', 'fabricQualities']);
  const { addData, updateData, deleteData } = useData();

  const [yarnOpen, setYarnOpen] = useState(false);
  const [fabricOpen, setFabricOpen] = useState(false);
  const [editYarnOpen, setEditYarnOpen] = useState(false);
  const [editFabricOpen, setEditFabricOpen] = useState(false);

  const [editingYarn, setEditingYarn] = useState(null);
  const [editingFabric, setEditingFabric] = useState(null);

  const [newYarn, setNewYarn] = useState({ count: '', ply: '', ratio: '' });
  const [newFabric, setNewFabric] = useState({ name: '', reed: '', pick: '', warp: '', weft: '', warp_count_margin: '', weft_count_margin: '' });

  const handleYarnSubmit = (e) => {
    e.preventDefault();
    addData('yarnQualities', newYarn);
    setNewYarn({ count: '', ply: '', ratio: '' });
    setYarnOpen(false);
  };

  const handleFabricSubmit = (e) => {
    e.preventDefault();
    addData('fabricQualities', newFabric);
    setNewFabric({ name: '', reed: '', pick: '', warp: '', weft: '', warp_count_margin: '', weft_count_margin: '' });
    setFabricOpen(false);
  };

  const handleEditYarn = (yarn) => {
    setEditingYarn({ ...yarn });
    setEditYarnOpen(true);
  }

  const handleUpdateYarn = (e) => {
    e.preventDefault();
    updateData('yarnQualities', editingYarn.id, editingYarn);
    setEditYarnOpen(false);
    setEditingYarn(null);
  }

  const handleDeleteYarn = (id) => {
    if (window.confirm('Are you sure?')) {
      deleteData('yarnQualities', id);
    }
  }

  const handleEditFabric = (fabric) => {
    setEditingFabric({ ...fabric });
    setEditFabricOpen(true);
  }

  const handleUpdateFabric = (e) => {
    e.preventDefault();
    updateData('fabricQualities', editingFabric.id, editingFabric);
    setEditFabricOpen(false);
    setEditingFabric(null);
  }

  const handleDeleteFabric = (id) => {
    if (window.confirm('Are you sure?')) {
      deleteData('fabricQualities', id);
    }
  }

  if (isLoading) {
    return <PageLoader type="table" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="fabric">
        <TabsList className="mb-4"><TabsTrigger value="fabric">Fabric Qualities</TabsTrigger><TabsTrigger value="yarn">Yarn Qualities</TabsTrigger></TabsList>
        <TabsContent value="fabric">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fabric Qualities</CardTitle>
              <Dialog open={fabricOpen} onOpenChange={setFabricOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Fabric Quality
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Fabric Quality</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFabricSubmit} className="space-y-4">
                    <Input placeholder="Quality Name" value={newFabric.name} onChange={e => setNewFabric({ ...newFabric, name: e.target.value })} required />
                    <Input placeholder="Reed" value={newFabric.reed} onChange={e => setNewFabric({ ...newFabric, reed: e.target.value })} required />
                    <Input placeholder="Pick" value={newFabric.pick} onChange={e => setNewFabric({ ...newFabric, pick: e.target.value })} required />
                    <Input placeholder="Warp" value={newFabric.warp} onChange={e => setNewFabric({ ...newFabric, warp: e.target.value })} required />
                    <Input placeholder="Warp Count Margin" value={newFabric.warp_count_margin} onChange={e => setNewFabric({ ...newFabric, warp_count_margin: e.target.value })} required />
                    <Input placeholder="Weft" value={newFabric.weft} onChange={e => setNewFabric({ ...newFabric, weft: e.target.value })} required />
                    <Input placeholder="Weft Count Margin" value={newFabric.weft_count_margin} onChange={e => setNewFabric({ ...newFabric, weft_count_margin: e.target.value })} required />
                    <Input placeholder="G-Width" value={newFabric.g_width} onChange={e => setNewFabric({ ...newFabric, g_width: e.target.value })} required />
                    <DialogFooter>
                      <Button type="submit">Save</Button>
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
                    <TableHead>Reed</TableHead>
                    <TableHead>Pick</TableHead>
                    <TableHead>Warp</TableHead>
                    <TableHead>Warp Count Margin</TableHead>
                    <TableHead>Weft</TableHead>
                    <TableHead>Weft Count Margin</TableHead>
                    <TableHead>G-Width</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.fabricQualities?.map(fq => {
                    const warpYarn = data.yarnQualities?.find(y => y.id === fq.warp);
                    const weftYarn = data.yarnQualities?.find(y => y.id === fq.weft);
                    return (
                      <TableRow key={fq.id}>
                        <TableCell>{fq.name}</TableCell>
                        <TableCell>{fq.reed}</TableCell>
                        <TableCell>{fq.pick}</TableCell>
                        <TableCell>{fq.warp}</TableCell>
                        <TableCell>{fq.warp_count_margin}</TableCell>
                        <TableCell>{fq.weft}</TableCell>
                        <TableCell>{fq.weft_count_margin}</TableCell>
                        <TableCell>{fq.g_width}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditFabric(fq)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteFabric(fq.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="yarn">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Yarn Qualities</CardTitle><Dialog open={yarnOpen} onOpenChange={setYarnOpen}><DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Yarn Quality</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add New Yarn Quality</DialogTitle></DialogHeader><form onSubmit={handleYarnSubmit} className="space-y-4"><Input placeholder="Count (e.g. 30/1)" value={newYarn.count} onChange={e => setNewYarn({ ...newYarn, count: e.target.value })} required /><Input placeholder="Ply (e.g. Single)" value={newYarn.ply} onChange={e => setNewYarn({ ...newYarn, ply: e.target.value })} required /><Input placeholder="Ratio (e.g. 100% Cotton)" value={newYarn.ratio} onChange={e => setNewYarn({ ...newYarn, ratio: e.target.value })} required /><DialogFooter><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog></CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>Count</TableHead><TableHead>Ply</TableHead><TableHead>Ratio</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>{data.yarnQualities?.map(yq => <TableRow key={yq.id}><TableCell>{yq.count}</TableCell><TableCell>{yq.ply}</TableCell><TableCell>{yq.ratio}</TableCell><TableCell><div className="flex space-x-2"><Button variant="ghost" size="sm" onClick={() => handleEditYarn(yq)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDeleteYarn(yq.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={editFabricOpen} onOpenChange={setEditFabricOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fabric Quality</DialogTitle>
          </DialogHeader>
          {editingFabric && <form onSubmit={handleUpdateFabric} className="space-y-4">
            <Input placeholder="Quality Name" value={editingFabric.name} onChange={e => setEditingFabric({ ...editingFabric, name: e.target.value })} required />
            <Input placeholder="Reed" value={editingFabric.reed} onChange={e => setEditingFabric({ ...editingFabric, reed: e.target.value })} required />
            <Input placeholder="Pick" value={editingFabric.pick} onChange={e => setEditingFabric({ ...editingFabric, pick: e.target.value })} required />
            <Input placeholder="Warp" value={editingFabric.warp} onChange={e => setEditingFabric({ ...editingFabric, warp: e.target.value })} required />
            <Input placeholder="Warp Count Margin" value={editingFabric.warp_count_margin} onChange={e => setEditingFabric({ ...editingFabric, warp_count_margin: e.target.value })} required />
            <Input placeholder="Weft" value={editingFabric.weft} onChange={e => setEditingFabric({ ...editingFabric, weft: e.target.value })} required />
            <Input placeholder="Weft Count Margin" value={editingFabric.weft_count_margin} onChange={e => setEditingFabric({ ...editingFabric, weft_count_margin: e.target.value })} required />
            <Input placeholder="G-Width" value={editingFabric.g_width} onChange={e => setEditingFabric({ ...editingFabric, g_width: e.target.value })} required />
            <DialogFooter><Button type="submit">Update</Button></DialogFooter>
          </form>}
        </DialogContent>
      </Dialog>
      <Dialog open={editYarnOpen} onOpenChange={setEditYarnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Yarn Quality</DialogTitle>
          </DialogHeader>
          {editingYarn && <form onSubmit={handleUpdateYarn} className="space-y-4">
            <Input placeholder="Count" value={editingYarn.count} onChange={e => setEditingYarn({ ...editingYarn, count: e.target.value })} required />
            <Input placeholder="Ply" value={editingYarn.ply} onChange={e => setEditingYarn({ ...editingYarn, ply: e.target.value })} required />
            <Input placeholder="Ratio" value={editingYarn.ratio} onChange={e => setEditingYarn({ ...editingYarn, ratio: e.target.value })} required />
            <DialogFooter><Button type="submit">Update</Button></DialogFooter>
          </form>}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Qualities;
