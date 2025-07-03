
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, FileText, XCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageLoader from '@/components/common/PageLoader';

const Contracts = () => {
  const { data, isLoading } = usePageData(['contracts', 'clients', 'fabricQualities', 'brokers', 'yarnQualities']);
  const { addData, updateData, deleteData, closeContract } = useData();
  
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [newContract, setNewContract] = useState({
    client_id: '',
    fabric_quality_id: '',
    broker_id: '',
    yarn_count_warp: '',
    yarn_count_weft: '',
    contract_date: '',
    remarks: '',
    read: '',
    pick: '',
    warp: '',
    weft: '',
    width: '',
    quantity: '',
    due_date: '',
    total_bags_req_warp: '',
    total_bags_req_weft: '',
    total_bags_required: '',
    weight_per_40_meter_warp: '',
    weight_per_40_meter_weft: '',
    rate_warp: '',
    rate_weft: '',
    value_yarn_per_40_warp: '',
    value_yarn_per_40_weft: '',
    conv_charges_per_pick: '',
    conv_charges_per_meter: '',
    conv_charges_per_40_meter: '',
    grey_fabric_rate: '',
    deduction_per_meter: '',
    total_yarn_value: '',
    status: 'New'
  });

  // Calculation functions - matching original weaving contract logic
  const calculateValues = (contract) => {
    const calculatedValues = { ...contract };
    
    // Helper functions from original code
    const calculate_weight_warp = () => {
      const read = parseFloat(calculatedValues.read) || 0;
      const width = parseFloat(calculatedValues.width) || 0;
      const warp = parseFloat(calculatedValues.warp) || 1;
      if (warp === 0) return 0;
      return (read * width * 1.0936) / (warp * 800);
    };

    const calculate_weight_weft = () => {
      const pick = parseFloat(calculatedValues.pick) || 0;
      const width = parseFloat(calculatedValues.width) || 0;
      const weft = parseFloat(calculatedValues.weft) || 1;
      if (weft === 0) return 0;
      return (pick * width * 1.0936) / (weft * 800);
    };

    const calculate_fabric_warp = () => {
      const warp = calculate_weight_warp();
      const fabric = parseFloat(calculatedValues.quantity) || 0;
      return ((warp * fabric) / 100).toFixed(4);
    };

    const calculate_fabric_weft = () => {
      const weft = calculate_weight_weft();
      const fabric = parseFloat(calculatedValues.quantity) || 0;
      return ((weft * fabric) / 100).toFixed(4);
    };

    const calculate_bags_required = () => {
      const warp = parseFloat(calculatedValues.total_bags_req_warp) || 0;
      const weft = parseFloat(calculatedValues.total_bags_req_weft) || 0;
      return (warp + weft).toFixed(4);
    };

    const calculate_weight_warp_per_40 = () => {
      const read = parseFloat(calculatedValues.read) || 0;
      const width = parseFloat(calculatedValues.width) || 0;
      const warp = parseFloat(calculatedValues.warp) || 1;
      if (warp === 0) return 0;
      return (((read * width * 1.0936) / (warp * 800)) * 40).toFixed(4);
    };

    const calculate_weight_weft_per_40 = () => {
      const pick = parseFloat(calculatedValues.pick) || 0;
      const width = parseFloat(calculatedValues.width) || 0;
      const weft = parseFloat(calculatedValues.weft) || 1;
      if (weft === 0) return 0;
      return (((pick * width * 1.0936) / (weft * 800)) * 40).toFixed(4);
    };

    // Auto-calculate values
    calculatedValues.total_bags_req_warp = calculate_fabric_warp();
    calculatedValues.total_bags_req_weft = calculate_fabric_weft();
    calculatedValues.total_bags_required = calculate_bags_required();
    calculatedValues.weight_per_40_meter_warp = calculate_weight_warp_per_40();
    calculatedValues.weight_per_40_meter_weft = calculate_weight_weft_per_40();

    // Calculate yarn values per 40 meter (weight * rate)
    if (calculatedValues.weight_per_40_meter_warp && calculatedValues.rate_warp) {
      calculatedValues.value_yarn_per_40_warp = (
        parseFloat(calculatedValues.weight_per_40_meter_warp) * parseFloat(calculatedValues.rate_warp)
      ).toFixed(4);
    }
    
    if (calculatedValues.weight_per_40_meter_weft && calculatedValues.rate_weft) {
      calculatedValues.value_yarn_per_40_weft = (
        parseFloat(calculatedValues.weight_per_40_meter_weft) * parseFloat(calculatedValues.rate_weft)
      ).toFixed(4);
    }
    
    // Calculate conversion charges per meter from per pick
    if (calculatedValues.conv_charges_per_pick && calculatedValues.pick) {
      calculatedValues.conv_charges_per_meter = (
        parseFloat(calculatedValues.conv_charges_per_pick) * parseFloat(calculatedValues.pick)
      ).toFixed(4);
    }
    
    // Calculate conversion charges per 40 meter
    if (calculatedValues.conv_charges_per_meter) {
      calculatedValues.conv_charges_per_40_meter = (
        parseFloat(calculatedValues.conv_charges_per_meter) * 40
      ).toFixed(4);
    }
    
    // Calculate total yarn value
    const valueWarp = parseFloat(calculatedValues.value_yarn_per_40_warp) || 0;
    const valueWeft = parseFloat(calculatedValues.value_yarn_per_40_weft) || 0;
    calculatedValues.total_yarn_value = (valueWarp + valueWeft).toFixed(4);
    
    // Calculate grey fabric rate (total yarn value + conversion charges per 40m)
    const totalYarnValue = parseFloat(calculatedValues.total_yarn_value) || 0;
    const convCharges40m = parseFloat(calculatedValues.conv_charges_per_40_meter) || 0;
    // calculatedValues.grey_fabric_rate = (totalYarnValue + convCharges40m).toFixed(4);
    
    return calculatedValues;
  };

  const autofillFromFabricQuality = (fabricQualityId, prev) => {
    const fq = data.fabricQualities?.find(f => f.id === fabricQualityId);
    if (!fq) return prev;
      return {
        ...prev,
        read: fq.reed || '',
        pick: fq.pick || '',
        warp: fq.warp_count_margin ? String(Number(fq.warp) - Number(fq.warp_count_margin)) : fq.warp || '',
        weft: fq.weft_count_margin ? String(Number(fq.weft) - Number(fq.weft_count_margin)) : fq.weft || '',
        width: fq.g_width || ''
      };
  };

  const handleInputChange = (key, value) => {
    const isValid = /^(\d+(\.\d*)?|\.\d+)?$/.test(value);
    if (isValid || value === "") {
      setNewContract(prev => {
        const updated = {
          ...prev,
          [key]: value
        };
        return calculateValues(updated);
      });
    }
  };

  const handleEditInputChange = (key, value) => {
    const isValid = /^(\d+(\.\d*)?|\.\d+)?$/.test(value);
    if (isValid || value === "") {
      setEditingContract(prev => {
        const updated = {
          ...prev,
          [key]: value
        };
        return calculateValues(updated);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addData('contracts', newContract);
    setNewContract({
      client_id: '',
      fabric_quality_id: '',
      broker_id: '',
      yarn_count_warp: '',
      yarn_count_weft: '',
      contract_date: '',
      remarks: '',
      read: '',
      pick: '',
      warp: '',
      weft: '',
      width: '',
      quantity: '',
      due_date: '',
      total_bags_req_warp: '',
      total_bags_req_weft: '',
      total_bags_required: '',
      weight_per_40_meter_warp: '',
      weight_per_40_meter_weft: '',
      rate_warp: '',
      rate_weft: '',
      value_yarn_per_40_warp: '',
      value_yarn_per_40_weft: '',
      conv_charges_per_pick: '',
      conv_charges_per_meter: '',
      conv_charges_per_40_meter: '',
      grey_fabric_rate: '',
      deduction_per_meter: '',
      total_yarn_value: '',
      status: 'New'
    });
    setOpen(false);
  };

  const handleEdit = (contract) => {
    setEditingContract({ ...contract, broker_id: contract.broker_id || '' });
    setEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateData('contracts', editingContract.id, editingContract);
    setEditOpen(false);
    setEditingContract(null);
  };

  const handleDelete = (contractId) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      deleteData('contracts', contractId);
    }
  };

  const handleCloseContract = (contractId) => {
    closeContract(contractId);
  };
  
  if (isLoading) {
    return <PageLoader type="table" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-6 w-6" /> Weaving Contracts</CardTitle>
            <CardDescription>Manage all weaving contracts with detailed specifications.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> New Contract</Button></DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Weaving Contract</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Client</label>
                    <Select onValueChange={v => setNewContract({...newContract, client_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                      <SelectContent>{data.clients?.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fabric Quality</label>
                    <Select 
                      onValueChange={v => {
                        setNewContract(prev => {
                          const updated = { ...prev, fabric_quality_id: v };
                          return calculateValues(autofillFromFabricQuality(v, updated));
                        });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select Fabric Quality" /></SelectTrigger>
                      <SelectContent>
                        {data.fabricQualities?.map(f=>
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Broker (Optional)</label>
                    <Select onValueChange={v => setNewContract({...newContract, broker_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select Broker" /></SelectTrigger>
                      <SelectContent>{data.brokers?.map(b=><SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Contract Date</label>
                    <Input type="date" value={newContract.contract_date} onChange={e => setNewContract({...newContract, contract_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input type="date" value={newContract.due_date} onChange={e => setNewContract({...newContract, due_date: e.target.value})} />
                  </div>
                </div>

                {/* Yarn Specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Yarn Quality Warp</label>
                    <Select onValueChange={v => setNewContract({...newContract, yarn_count_warp: v})} value={newContract.yarn_count_warp}>
                      <SelectTrigger><SelectValue placeholder="Select Warp Yarn Quality" /></SelectTrigger>
                      <SelectContent>{data.yarnQualities?.map(y=><SelectItem key={y.id} value={y.id}>{y.count} - {y.ratio}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Yarn Quality Weft</label>
                    <Select onValueChange={v => setNewContract({...newContract, yarn_count_weft: v})} value={newContract.yarn_count_weft}>
                      <SelectTrigger><SelectValue placeholder="Select Weft Yarn Quality" /></SelectTrigger>
                      <SelectContent>{data.yarnQualities?.map(y=><SelectItem key={y.id} value={y.id}>{y.count} - {y.ratio}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Fabric Specifications */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Read</label>
                    <Input placeholder="Read" value={newContract.read} onChange={e => handleInputChange('read', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pick</label>
                    <Input placeholder="Pick" value={newContract.pick} onChange={e => handleInputChange('pick', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Warp</label>
                    <Input placeholder="Warp" value={newContract.warp} onChange={e => handleInputChange('warp', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weft</label>
                    <Input placeholder="Weft" value={newContract.weft} onChange={e => handleInputChange('weft', e.target.value)} />
                  </div>
                </div>

                {/* Dimensions & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Width</label>
                    <Input placeholder="Width" value={newContract.width} onChange={e => handleInputChange('width', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input placeholder="Quantity" value={newContract.quantity} onChange={e => handleInputChange('quantity', e.target.value)} />
                  </div>
                </div>

                {/* Bag Requirements */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Total Bags Required Warp</label>
                    <Input placeholder="Total Bags Req Warp" value={newContract.total_bags_req_warp} disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Bags Required Weft</label>
                    <Input placeholder="Total Bags Req Weft" value={newContract.total_bags_req_weft} disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Bags</label>
                    <Input disabled placeholder="Total Bags Required" value={newContract.total_bags_required || ''} />
                  </div>
                </div>

                {/* Weight Specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Weight Per 40 Meter Warp</label>
                    <Input placeholder="Weight Per 40m Warp" value={newContract.weight_per_40_meter_warp} onChange={e => handleInputChange('weight_per_40_meter_warp', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weight Per 40 Meter Weft</label>
                    <Input placeholder="Weight Per 40m Weft" value={newContract.weight_per_40_meter_weft} onChange={e => handleInputChange('weight_per_40_meter_weft', e.target.value)} />
                  </div>
                </div>

                {/* Rates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Yarn Rate Warp</label>
                    <Input placeholder="Yarn Rate Warp" value={newContract.rate_warp} onChange={e => handleInputChange('rate_warp', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Yarn Rate Weft</label>
                    <Input placeholder="Yarn Rate Weft" value={newContract.rate_weft} onChange={e => handleInputChange('rate_weft', e.target.value)} />
                  </div>
                </div>

                {/* Yarn Values - Auto-calculated */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Value Yarn Per 40 Meter Warp</label>
                    <Input 
                      placeholder="Value Yarn Per 40 Meter Warp" 
                      value={newContract.value_yarn_per_40_warp} 
                      disabled 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Value Yarn Per 40 Meter Weft</label>
                    <Input 
                      placeholder="Value Yarn Per 40 Meter Weft" 
                      value={newContract.value_yarn_per_40_weft} 
                      disabled 
                    />
                  </div>
                </div>

                {/* Conversion Charges */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Conv Charges Per Pick</label>
                    <Input placeholder="Conv Charges Per Pick" value={newContract.conv_charges_per_pick} onChange={e => handleInputChange('conv_charges_per_pick', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Conv Charges Per Meter</label>
                    <Input 
                      placeholder="Conv Charges Per Meter" 
                      value={newContract.conv_charges_per_meter} 
                      disabled 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Conv Charges Per 40 Meter</label>
                    <Input 
                      placeholder="Conv Charges Per 40m" 
                      value={newContract.conv_charges_per_40_meter} 
                      disabled 
                    />
                  </div>
                </div>

                {/* Additional Specifications */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Grey Fabric Rate</label>
                    <Input 
                      placeholder="Grey Fabric Rate" 
                      value={newContract.grey_fabric_rate}
                      onChange={e => handleInputChange('grey_fabric_rate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deduction Per Meter</label>
                    <Input placeholder="Deduction Per Meter" value={newContract.deduction_per_meter} onChange={e => handleInputChange('deduction_per_meter', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Yarn Value</label>
                    <Input 
                      placeholder="Total Yarn Value" 
                      value={newContract.total_yarn_value} 
                      disabled 
                    />
                  </div>
                </div>


                <div>
                  <label className="text-sm font-medium">Remarks</label>
                  <Textarea placeholder="Additional remarks..." value={newContract.remarks} onChange={e => setNewContract({...newContract, remarks: e.target.value})} />
                </div>

                <DialogFooter><Button type="submit">Save Contract</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.contracts?.filter(c => !c.is_internal).map((contract) => {
                const client = data.clients?.find(c => c.id === contract.client_id);
                const quality = data.fabricQualities?.find(f => f.id === contract.fabric_quality_id);
                return (
                  <TableRow key={contract.id}>
                    <TableCell>{client?.name || 'N/A'}</TableCell>
                    <TableCell>{quality?.name || 'N/A'}</TableCell>
                    <TableCell>{contract.quantity || 'N/A'}</TableCell>
                    <TableCell>{contract.due_date || 'N/A'}</TableCell>
                    <TableCell><Badge variant={contract.status === 'In Process' ? 'default' : contract.status === 'Closed' ? 'outline' : 'secondary'}>{contract.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(contract)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {contract.status !== 'Closed' && (
                          <Button variant="ghost" size="sm" onClick={() => handleCloseContract(contract.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(contract.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Weaving Contract</DialogTitle></DialogHeader>
          {editingContract && (
            <form onSubmit={handleUpdate} className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <Select onValueChange={v => setEditingContract({...editingContract, client_id: v})} value={editingContract.client_id}>
                    <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                    <SelectContent>{data.clients?.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Fabric Quality</label>
                  <Select 
                    onValueChange={v => {
                      setEditingContract(prev => {
                        const updated = { ...prev, fabric_quality_id: v };
                        return calculateValues(autofillFromFabricQuality(v, updated));
                      });
                    }}
                    value={editingContract.fabric_quality_id}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Fabric Quality" /></SelectTrigger>
                    <SelectContent>
                      {data.fabricQualities?.map(f=>
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Broker (Optional)</label>
                  <Select onValueChange={v => setEditingContract({...editingContract, broker_id: v})} value={editingContract.broker_id || ''}>
                    <SelectTrigger><SelectValue placeholder="Select Broker" /></SelectTrigger>
                    <SelectContent>{data.brokers?.map(b=><SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Contract Date</label>
                  <Input type="date" value={editingContract.contract_date || ''} onChange={e => setEditingContract({...editingContract, contract_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" value={editingContract.due_date || ''} onChange={e => setEditingContract({...editingContract, due_date: e.target.value})} />
                </div>
              </div>

              {/* Yarn Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Yarn Quality Warp</label>
                  <Select onValueChange={v => setEditingContract({...editingContract, yarn_count_warp: v})} value={editingContract.yarn_count_warp || ''}>
                    <SelectTrigger><SelectValue placeholder="Select Warp Yarn Quality" /></SelectTrigger>
                    <SelectContent>{data.yarnQualities?.map(y=><SelectItem key={y.id} value={y.id}>{y.count} - {y.ratio}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Yarn Quality Weft</label>
                  <Select onValueChange={v => setEditingContract({...editingContract, yarn_count_weft: v})} value={editingContract.yarn_count_weft || ''}>
                    <SelectTrigger><SelectValue placeholder="Select Weft Yarn Quality" /></SelectTrigger>
                    <SelectContent>{data.yarnQualities?.map(y=><SelectItem key={y.id} value={y.id}>{y.count} - {y.ratio}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fabric Specifications */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Read</label>
                  <Input placeholder="Read" value={editingContract.read || ''} onChange={e => handleEditInputChange('read', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Pick</label>
                  <Input placeholder="Pick" value={editingContract.pick || ''} onChange={e => handleEditInputChange('pick', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Warp</label>
                  <Input placeholder="Warp" value={editingContract.warp || ''} onChange={e => handleEditInputChange('warp', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Weft</label>
                  <Input placeholder="Weft" value={editingContract.weft || ''} onChange={e => handleEditInputChange('weft', e.target.value)} />
                </div>
              </div>

              {/* Dimensions & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Width</label>
                  <Input placeholder="Width" value={editingContract.width || ''} onChange={e => handleEditInputChange('width', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input placeholder="Quantity" value={editingContract.quantity || ''} onChange={e => handleEditInputChange('quantity', e.target.value)} />
                </div>
              </div>

              {/* Bag Requirements */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Total Bags Required Warp</label>
                  <Input placeholder="Total Bags Req Warp" value={editingContract.total_bags_req_warp || ''} onChange={e => handleEditInputChange('total_bags_req_warp', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Bags Required Weft</label>
                  <Input placeholder="Total Bags Req Weft" value={editingContract.total_bags_req_weft || ''} onChange={e => handleEditInputChange('total_bags_req_weft', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Bags</label>
                  <Input disabled placeholder="Total Bags Required" value={editingContract.total_bags_required || ''} onChange={e => handleEditInputChange('total_bags_required', e.target.value)} />
                </div>
              </div>

              {/* Weight Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Weight Per 40 Meter Warp</label>
                  <Input placeholder="Weight Per 40m Warp" value={editingContract.weight_per_40_meter_warp || ''} onChange={e => handleEditInputChange('weight_per_40_meter_warp', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Weight Per 40 Meter Weft</label>
                  <Input placeholder="Weight Per 40m Weft" value={editingContract.weight_per_40_meter_weft || ''} onChange={e => handleEditInputChange('weight_per_40_meter_weft', e.target.value)} />
                </div>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rate Warp</label>
                  <Input placeholder="Rate Warp" value={editingContract.rate_warp || ''} onChange={e => handleEditInputChange('rate_warp', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Rate Weft</label>
                  <Input placeholder="Rate Weft" value={editingContract.rate_weft || ''} onChange={e => handleEditInputChange('rate_weft', e.target.value)} />
                </div>
              </div>

              {/* Yarn Values - Auto-calculated */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Value Yarn Per 40 Meter Warp</label>
                  <Input 
                    placeholder="Value Yarn Per 40 Meter Warp" 
                    value={editingContract.value_yarn_per_40_warp || ''} 
                    disabled 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Value Yarn Per 40 Meter Weft</label>
                  <Input 
                    placeholder="Value Yarn Per 40 Meter Weft" 
                    value={editingContract.value_yarn_per_40_weft || ''} 
                    disabled 
                  />
                </div>
              </div>

              {/* Conversion Charges */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Conv Charges Per Pick</label>
                  <Input placeholder="Conv Charges Per Pick" value={editingContract.conv_charges_per_pick || ''} onChange={e => handleEditInputChange('conv_charges_per_pick', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Conv Charges Per Meter</label>
                  <Input 
                    placeholder="Conv Charges Per Meter" 
                    value={editingContract.conv_charges_per_meter || ''} 
                    disabled 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Conv Charges Per 40 Meter</label>
                  <Input 
                    placeholder="Conv Charges Per 40m" 
                    value={editingContract.conv_charges_per_40_meter || ''} 
                    disabled 
                  />
                </div>
              </div>

              {/* Additional Specifications */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Grey Fabric Rate</label>
                  <Input 
                    placeholder="Grey Fabric Rate" 
                    value={editingContract.grey_fabric_rate} 
                    onChange={e => handleEditInputChange('grey_fabric_rate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deduction Per Meter</label>
                  <Input placeholder="Deduction Per Meter" value={editingContract.deduction_per_meter || ''} onChange={e => handleEditInputChange('deduction_per_meter', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Yarn Value</label>
                  <Input 
                    placeholder="Total Yarn Value" 
                    value={editingContract.total_yarn_value || ''} 
                    disabled 
                  />
                </div>
              </div>


              <div>
                <label className="text-sm font-medium">Status</label>
                <Select onValueChange={v => setEditingContract({...editingContract, status: v})} value={editingContract.status}>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Process">In Process</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Remarks</label>
                <Textarea placeholder="Additional remarks..." value={editingContract.remarks || ''} onChange={e => setEditingContract({...editingContract, remarks: e.target.value})} />
              </div>

              <DialogFooter><Button type="submit">Update Contract</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Contracts;
