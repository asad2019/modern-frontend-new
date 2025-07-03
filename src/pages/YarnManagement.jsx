
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
  const { data, isLoading } = usePageData(['yarnStock', 'yarnQualities', 'suppliers', 'stockLocations', 'contracts', 'sizingAccounts']);
  const { receiveYarn, purchaseYarn, issueYarn } = useData();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    contractId: '',
    supplierId: '',
    qualityId: '',
    stockLocationId: '',
    yarn_count_warp: '',
    yarn_count_weft: '',
    cloth_qty: '',
    remarks: '',
    warp_qty: '',
    warp_rate: '',
    warp_total: '',
    weft_qty: '',
    weft_rate: '',
    weft_total: '',
    income_tax: '',
    total_weight: '',
    net_amount: '',
    bilty_number: '',
    bilty_date: new Date().toISOString().split('T')[0],
    transporter: '',
    received_by: '',
    total_bag: '',
    issued_to: '',
    issued_type: '',
    sizing_account_id: '',
    issued_date: new Date().toISOString().split('T')[0],
    received_date: new Date().toISOString().split('T')[0]
  });

  const [showContracts, setShowContracts] = useState(false);
  const [showSizingAccounts, setShowSizingAccounts] = useState(false);

  if (isLoading) {
    return <PageLoader />;
  }

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));

    // Auto-calculate totals
    if (key === 'warp_qty' || key === 'warp_rate') {
      const qty = key === 'warp_qty' ? parseFloat(value) : parseFloat(formData.warp_qty);
      const rate = key === 'warp_rate' ? parseFloat(value) : parseFloat(formData.warp_rate);
      if (!isNaN(qty) && !isNaN(rate)) {
        setFormData(prev => ({
          ...prev,
          warp_total: (qty * rate).toFixed(2)
        }));
      }
    }

    if (key === 'weft_qty' || key === 'weft_rate') {
      const qty = key === 'weft_qty' ? parseFloat(value) : parseFloat(formData.weft_qty);
      const rate = key === 'weft_rate' ? parseFloat(value) : parseFloat(formData.weft_rate);
      if (!isNaN(qty) && !isNaN(rate)) {
        setFormData(prev => ({
          ...prev,
          weft_total: (qty * rate).toFixed(2)
        }));
      }
    }

    // Handle issued_to selection
    if (key === 'issued_to') {
      if (value === 'client' || value === 'production') {
        setShowContracts(true);
        setShowSizingAccounts(false);
      } else if (value === 'sizing') {
        setShowSizingAccounts(true);
        setShowContracts(false);
      } else {
        setShowContracts(false);
        setShowSizingAccounts(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dialogType === 'receive') {
        await receiveYarn(formData);
        toast({ title: "Success", description: "Yarn received successfully" });
      } else if (dialogType === 'purchase') {
        await purchaseYarn(formData);
        toast({ title: "Success", description: "Yarn purchased successfully" });
      } else if (dialogType === 'issue') {
        await issueYarn(formData);
        toast({ title: "Success", description: "Yarn issued successfully" });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      contractId: '',
      supplierId: '',
      qualityId: '',
      stockLocationId: '',
      yarn_count_warp: '',
      yarn_count_weft: '',
      cloth_qty: '',
      remarks: '',
      warp_qty: '',
      warp_rate: '',
      warp_total: '',
      weft_qty: '',
      weft_rate: '',
      weft_total: '',
      income_tax: '',
      total_weight: '',
      net_amount: '',
      bilty_number: '',
      bilty_date: new Date().toISOString().split('T')[0],
      transporter: '',
      received_by: '',
      total_bag: '',
      issued_to: '',
      issued_type: '',
      sizing_account_id: '',
      issued_date: new Date().toISOString().split('T')[0],
      received_date: new Date().toISOString().split('T')[0]
    });
    setShowContracts(false);
    setShowSizingAccounts(false);
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
            <div className="text-2xl font-bold">{totalStock.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground">All yarn qualities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items below 100kg</p>
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
                <TableHead>Contract</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Warp Qty</TableHead>
                <TableHead>Weft Qty</TableHead>
                <TableHead>Total Weight</TableHead>
                <TableHead>Total Bags</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data.yarnStock) && data.yarnStock.map((yarn) => {
                const quality = Array.isArray(data.yarnQualities) ? data.yarnQualities.find(q => q.id === yarn.quality_id) : null;
                const supplier = Array.isArray(data.suppliers) ? data.suppliers.find(s => s.id === yarn.supplier_id) : null;
                const location = Array.isArray(data.stockLocations) ? data.stockLocations.find(l => l.id === yarn.location_id) : null;
                const contract = Array.isArray(data.contracts) ? data.contracts.find(c => c.id === yarn.contract_id) : null;
                const totalWeight = parseFloat(yarn.total_weight || 0);
                
                return (
                  <TableRow key={yarn.id}>
                    <TableCell className="font-medium">{contract?.id || yarn.contract_id || 'N/A'}</TableCell>
                    <TableCell>{quality?.name || 'Unknown'}</TableCell>
                    <TableCell>{supplier?.name || 'Unknown'}</TableCell>
                    <TableCell>{location?.name || 'Unknown'}</TableCell>
                    <TableCell>{parseFloat(yarn.warp_qty || 0).toFixed(2)}</TableCell>
                    <TableCell>{parseFloat(yarn.weft_qty || 0).toFixed(2)}</TableCell>
                    <TableCell>{totalWeight.toFixed(2)} kg</TableCell>
                    <TableCell>{yarn.total_bag || 0}</TableCell>
                    <TableCell>
                      <Badge variant={totalWeight < 100 ? 'destructive' : totalWeight < 500 ? 'secondary' : 'default'}>
                        {totalWeight < 100 ? 'Low Stock' : totalWeight < 500 ? 'Medium' : 'Good Stock'}
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
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'receive' && 'Stock Receive Voucher'}
              {dialogType === 'purchase' && 'Purchase Yarn'}
              {dialogType === 'issue' && 'Issue Yarn'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mandatory Fields Section */}
            <div className="border border-gray-200 p-4 rounded-md">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Mandatory Fields</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier</Label>
                  <Select value={formData.supplierId} onValueChange={(value) => handleInputChange('supplierId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supplier" />
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
                  <Label htmlFor="qualityId">Item Quality</Label>
                  <Select value={formData.qualityId} onValueChange={(value) => handleInputChange('qualityId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Quality" />
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
                      <Label htmlFor="issued_to">Issue To</Label>
                      <Select value={formData.issued_to} onValueChange={(value) => handleInputChange('issued_to', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select who to issue to" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="sizing">Sizing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {showContracts && (
                      <div className="space-y-2">
                        <Label htmlFor="contractId">Select Contract</Label>
                        <Select value={formData.contractId} onValueChange={(value) => handleInputChange('contractId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Contract" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(data.contracts) && data.contracts.map((contract) => (
                              <SelectItem key={contract.id} value={contract.id.toString()}>
                                {contract.id} - {contract.client_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {showSizingAccounts && (
                      <div className="space-y-2">
                        <Label htmlFor="sizing_account_id">Select Sizing Account</Label>
                        <Select value={formData.sizing_account_id} onValueChange={(value) => handleInputChange('sizing_account_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Sizing Account" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(data.sizingAccounts) && data.sizingAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {dialogType === 'issue' && (
                  <div className="space-y-2">
                    <Label htmlFor="contractId">Contract #</Label>
                    <Select value={formData.contractId} onValueChange={(value) => handleInputChange('contractId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Contract" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(data.contracts) && data.contracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id.toString()}>
                            {contract.id} - {contract.client_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
            </div>

            {/* Yarn Details Section */}
            <div className="border border-gray-200 p-4 rounded-md">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Yarn Details</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stockLocationId">Stock Location</Label>
                  <Select value={formData.stockLocationId} onValueChange={(value) => handleInputChange('stockLocationId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stock Location" />
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
                  <Label htmlFor="yarn_count_warp">Yarn Warp</Label>
                  <Select value={formData.yarn_count_warp} onValueChange={(value) => handleInputChange('yarn_count_warp', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Yarn Warp" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(data.yarnQualities) && data.yarnQualities.map((yarn) => (
                        <SelectItem key={yarn.id} value={yarn.id.toString()}>
                          {yarn.count} - {yarn.ratio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warp_qty">Warp Qty</Label>
                    <Input
                      id="warp_qty"
                      type="number"
                      step="0.01"
                      value={formData.warp_qty}
                      onChange={(e) => handleInputChange('warp_qty', e.target.value)}
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warp_rate">Warp Rate</Label>
                    <Input
                      id="warp_rate"
                      type="number"
                      step="0.01"
                      value={formData.warp_rate}
                      onChange={(e) => handleInputChange('warp_rate', e.target.value)}
                      placeholder="Rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warp_total">Warp Total</Label>
                    <Input
                      id="warp_total"
                      type="number"
                      step="0.01"
                      value={formData.warp_total}
                      readOnly
                      placeholder="Total Amount"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yarn_count_weft">Yarn Weft</Label>
                  <Select value={formData.yarn_count_weft} onValueChange={(value) => handleInputChange('yarn_count_weft', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Yarn Weft" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(data.yarnQualities) && data.yarnQualities.map((yarn) => (
                        <SelectItem key={yarn.id} value={yarn.id.toString()}>
                          {yarn.count} - {yarn.ratio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weft_qty">Weft Qty</Label>
                    <Input
                      id="weft_qty"
                      type="number"
                      step="0.01"
                      value={formData.weft_qty}
                      onChange={(e) => handleInputChange('weft_qty', e.target.value)}
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weft_rate">Weft Rate</Label>
                    <Input
                      id="weft_rate"
                      type="number"
                      step="0.01"
                      value={formData.weft_rate}
                      onChange={(e) => handleInputChange('weft_rate', e.target.value)}
                      placeholder="Rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weft_total">Weft Total</Label>
                    <Input
                      id="weft_total"
                      type="number"
                      step="0.01"
                      value={formData.weft_total}
                      readOnly
                      placeholder="Total Amount"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_weight">Total Weight</Label>
                    <Input
                      id="total_weight"
                      type="number"
                      step="0.01"
                      value={formData.total_weight}
                      onChange={(e) => handleInputChange('total_weight', e.target.value)}
                      placeholder="Total Weight"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_bag">Total Bags</Label>
                    <Input
                      id="total_bag"
                      type="number"
                      value={formData.total_bag}
                      onChange={(e) => handleInputChange('total_bag', e.target.value)}
                      placeholder="Total Bags"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income_tax">Income Tax</Label>
                    <Input
                      id="income_tax"
                      type="number"
                      step="0.01"
                      value={formData.income_tax}
                      onChange={(e) => handleInputChange('income_tax', e.target.value)}
                      placeholder="Income Tax"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net_amount">Net Amount</Label>
                    <Input
                      id="net_amount"
                      type="number"
                      step="0.01"
                      value={formData.net_amount}
                      onChange={(e) => handleInputChange('net_amount', e.target.value)}
                      placeholder="Net Amount"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Yarn Specific Fields */}
            {dialogType === 'issue' && (
              <div className="border border-gray-200 p-4 rounded-md">
                <h3 className="text-md font-semibold text-gray-700 mb-4">Issue Details</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="issued_to">Issue To</Label>
                    <Select value={formData.issued_to} onValueChange={(value) => handleInputChange('issued_to', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who to issue to" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="sizing">Sizing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showContracts && (
                    <div className="space-y-2">
                      <Label htmlFor="contract_selection">Select Contract</Label>
                      <Select value={formData.contract_selection} onValueChange={(value) => handleInputChange('contract_selection', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Contract" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(data.contracts) && data.contracts.map((contract) => (
                            <SelectItem key={contract.id} value={contract.id.toString()}>
                              {contract.id} - {contract.client_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {showSizingAccounts && (
                    <div className="space-y-2">
                      <Label htmlFor="sizing_account_id">Select Sizing Account</Label>
                      <Select value={formData.sizing_account_id} onValueChange={(value) => handleInputChange('sizing_account_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sizing Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(data.sizingAccounts) && data.sizingAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="issued_date">Issue Date</Label>
                    <Input
                      id="issued_date"
                      type="date"
                      value={formData.issued_date}
                      onChange={(e) => handleInputChange('issued_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {dialogType === 'receive' && 'Receive Yarn'}
                {dialogType === 'purchase' && 'Purchase Yarn'}
                {dialogType === 'issue' && 'Issue Yarn'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default YarnManagement;
