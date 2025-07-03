
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import PageLoader from '@/components/common/PageLoader';

const YarnManagement = () => {
  const { data, isLoading } = usePageData(['yarnStock', 'yarnQualities', 'suppliers', 'stockLocations']);
  const { receiveYarn, purchaseYarn, issueYarn } = useData();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    quality_id: '',
    supplier_id: '',
    location_id: '',
    quantity_kg: '',
    rate_per_kg: '',
    invoice_number: '',
    received_date: new Date().toISOString().split('T')[0],
    purpose: '',
    issued_to: '',
    issued_date: new Date().toISOString().split('T')[0]
  });

  if (isLoading) {
    return <PageLoader />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dialogType === 'receive') {
        await receiveYarn(formData);
      } else if (dialogType === 'purchase') {
        await purchaseYarn(formData);
      } else if (dialogType === 'issue') {
        await issueYarn(formData);
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      quality_id: '',
      supplier_id: '',
      location_id: '',
      quantity_kg: '',
      rate_per_kg: '',
      invoice_number: '',
      received_date: new Date().toISOString().split('T')[0],
      purpose: '',
      issued_to: '',
      issued_date: new Date().toISOString().split('T')[0]
    });
  };

  const openDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    resetForm();
  };

  const totalStock = Array.isArray(data.yarnStock) ? data.yarnStock.reduce((sum, yarn) => sum + parseFloat(yarn.quantity_kg || 0), 0) : 0;
  const totalValue = Array.isArray(data.yarnStock) ? data.yarnStock.reduce((sum, yarn) => sum + (parseFloat(yarn.quantity_kg || 0) * parseFloat(yarn.rate_per_kg || 0)), 0) : 0;
  const lowStockItems = Array.isArray(data.yarnStock) ? data.yarnStock.filter(yarn => parseFloat(yarn.quantity_kg || 0) < 100) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Yarn Management</h2>
          <p className="text-muted-foreground">Manage yarn inventory, purchases, and issues</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openDialog('receive')}>
            <Plus className="mr-2 h-4 w-4" />
            Receive Yarn
          </Button>
          <Button onClick={() => openDialog('purchase')} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Purchase Yarn
          </Button>
          <Button onClick={() => openDialog('issue')} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Issue Yarn
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toFixed(2)} bags</div>
            <p className="text-xs text-muted-foreground">All yarn qualities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yarn Qualities</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(data.yarnQualities) ? data.yarnQualities.length : 0}</div>
            <p className="text-xs text-muted-foreground">Available qualities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Yarn Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quality</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Bags</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data.yarnStock) && data.yarnStock.map((yarn) => {
                const quality = Array.isArray(data.yarnQualities) ? data.yarnQualities.find(q => q.id === yarn.quality_id) : null;
                const supplier = Array.isArray(data.suppliers) ? data.suppliers.find(s => s.id === yarn.supplier_id) : null;
                const location = Array.isArray(data.stockLocations) ? data.stockLocations.find(l => l.id === yarn.location_id) : null;
                const quantity = parseFloat(yarn.quantity_kg || 0);
                const rate = parseFloat(yarn.rate_per_kg || 0);
                
                return (
                  <TableRow key={yarn.id}>
                    <TableCell className="font-medium">{quality?.name || 'Unknown'}</TableCell>
                    <TableCell>{supplier?.name || 'Unknown'}</TableCell>
                    <TableCell>{location?.name || 'Unknown'}</TableCell>
                    <TableCell>{quantity.toFixed(2)}</TableCell>
                    <TableCell>{rate.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={quantity < 100 ? 'destructive' : quantity < 500 ? 'secondary' : 'default'}>
                        {quantity < 100 ? 'Low Stock' : quantity < 500 ? 'Medium' : 'Good Stock'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'receive' && 'Receive Yarn'}
              {dialogType === 'purchase' && 'Purchase Yarn'}
              {dialogType === 'issue' && 'Issue Yarn'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quality_id">Yarn Quality</Label>
              <Select value={formData.quality_id} onValueChange={(value) => setFormData({...formData, quality_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(data.yarnQualities) && data.yarnQualities.map((quality) => (
                    <SelectItem key={quality.id} value={quality.id.toString()}>
                      {quality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(dialogType === 'receive' || dialogType === 'purchase') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="supplier_id">Supplier</Label>
                  <Select value={formData.supplier_id} onValueChange={(value) => setFormData({...formData, supplier_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(data.suppliers) && data.suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="received_date">Received Date</Label>
                  <Input
                    id="received_date"
                    type="date"
                    value={formData.received_date}
                    onChange={(e) => setFormData({...formData, received_date: e.target.value})}
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="location_id">Location</Label>
              <Select value={formData.location_id} onValueChange={(value) => setFormData({...formData, location_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(data.stockLocations) && data.stockLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_kg">Quantity (kg)</Label>
              <Input
                id="quantity_kg"
                type="number"
                step="0.01"
                value={formData.quantity_kg}
                onChange={(e) => setFormData({...formData, quantity_kg: e.target.value})}
                required
              />
            </div>

            {(dialogType === 'receive' || dialogType === 'purchase') && (
              <div className="space-y-2">
                <Label htmlFor="rate_per_kg">Rate per kg</Label>
                <Input
                  id="rate_per_kg"
                  type="number"
                  step="0.01"
                  value={formData.rate_per_kg}
                  onChange={(e) => setFormData({...formData, rate_per_kg: e.target.value})}
                  required
                />
              </div>
            )}

            {dialogType === 'issue' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issued_to">Issued To</Label>
                  <Input
                    id="issued_to"
                    value={formData.issued_to}
                    onChange={(e) => setFormData({...formData, issued_to: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issued_date">Issue Date</Label>
                  <Input
                    id="issued_date"
                    type="date"
                    value={formData.issued_date}
                    onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {dialogType === 'receive' && 'Receive'}
                {dialogType === 'purchase' && 'Purchase'}
                {dialogType === 'issue' && 'Issue'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default YarnManagement;
