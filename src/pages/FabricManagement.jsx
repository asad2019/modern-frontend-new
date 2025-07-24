
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLoader from '@/components/common/PageLoader';

const FabricManagement = () => {
  const { data, isLoading } = usePageData(['fabricStock', 'contracts', 'fabricQualities', 'stockLocations', 'clients']);
  const { receiveFabric, issueFabric } = useData();
  
  const [receiveData, setReceiveData] = useState({ 
    kp_id: '', 
    pp_no: '', 
    a_grade: '', 
    b_grade: '', 
    c_grade: '', 
    fresh_fabric: '',
    conversion_charges_per_pick: '',
    total_amount: '',
    income_tax_amount: '',
    net_total: ''
  });
  
  const [issueData, setIssueData] = useState({ 
    quantity_meters: '', 
    contract_id: '',
    quality: '',
    stock_location_id: '',
    total_meters: '',
    weight: '',
    kp_no: '',
    bail: '',
    ls: ''
  });

  // Calculate fresh fabric when KP# is selected
  const calculateFreshFabric = (kpId, aGrade, bGrade, cGrade) => {
    const kpRecord = data.fabricStock?.find(f => f.id === kpId);
    if (!kpRecord) return 0;
    const totalMeters = parseFloat(kpRecord.total_meters) || 0;
    const aGradeVal = parseFloat(aGrade) || 0;
    const bGradeVal = parseFloat(bGrade) || 0;
    const cGradeVal = parseFloat(cGrade) || 0;
    return totalMeters - (aGradeVal + bGradeVal + cGradeVal);
};

  // Calculate conversion charges from contract
  const getConversionChargesFromContract = (kpId) => {
    const kpRecord = data.fabricStock?.find(f => f.id === kpId);
    if (!kpRecord) return { perPick: 0, perMeter: 0 };
    const contract = data.contracts?.find(c => c.id === kpRecord.contract_id);
    return {
      perPick: parseFloat(contract?.conv_charges_per_pick) || 0,
      perMeter: parseFloat(contract?.conv_charges_per_meter) || 0,
    };
  };

  const calculateTotalAmount = (conversionChargesPerMeter, freshFabric) => {
    return (parseFloat(conversionChargesPerMeter) || 0) * (parseFloat(freshFabric) || 0);
  };

  const handleReceiveInputChange = (field, value) => {
    setReceiveData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate fresh fabric when grades change
      if (['kp_id', 'a_grade', 'b_grade', 'c_grade'].includes(field)) {
        const freshFabric = calculateFreshFabric(
          updated.kp_id,
          updated.a_grade,
          updated.b_grade,
          updated.c_grade
        );
        updated.fresh_fabric = freshFabric;
        // Recalculate conversion charges from the contract
        if (updated.kp_id) {
          const { perPick, perMeter } = getConversionChargesFromContract(updated.kp_id);
          updated.conversion_charges_per_pick = perPick;
          // Calculate total amount using fresh fabric and conversion charges per meter
          updated.total_amount = calculateTotalAmount(perMeter, freshFabric);
          updated.net_total = (parseFloat(updated.total_amount) || 0) + (parseFloat(updated.income_tax_amount) || 0);
        }
      }
      // Recalculate net total when income tax changes
      if (field === 'income_tax_amount') {
        updated.net_total = (parseFloat(updated.total_amount) || 0) + (parseFloat(value) || 0);
      }
      return updated;
    });
  };

  const handleIssueInputChange = (field, value) => {
    setIssueData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-fill quality when contract is selected
      if (field === 'contract_id') {
        const contract = data.contracts?.find(c => c.id === value);
        if (contract) {
          const quality = data.fabricQualities?.find(q => q.id === contract.fabric_quality_id);
          updated.quality = quality?.name || '';
        }
      }
      
      return updated;
    });
  };

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    receiveFabric(receiveData);
    setReceiveData({ 
      kp_id: '', 
      pp_no: '', 
      a_grade: '', 
      b_grade: '', 
      c_grade: '', 
      fresh_fabric: '',
      conversion_charges_per_pick: '',
      total_amount: '',
      income_tax_amount: '',
      net_total: ''
    });
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    issueFabric(issueData);
    setIssueData({ 
      fabric_stock_id: '', 
      quantity_meters: '', 
      client_id: '',
      contract_id: '',
      quality: '',
      stock_location_id: '',
      total_meters: '',
      weight: '',
      kp_no: '',
      bail: '',
      ls: ''
    });
  };
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="stock">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">Fabric Stock</TabsTrigger>
          <TabsTrigger value="issue">Issue Fabric</TabsTrigger>
          <TabsTrigger value="receive">Receive Fabric</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Current Fabric Stock</CardTitle><CardDescription>Live view of all fabric inventory.</CardDescription></CardHeader>
            <CardContent>
              {isLoading ? <PageLoader type="table" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KP#</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Issue (m)</TableHead>
                      <TableHead>Fresh Fabric (m)</TableHead>
                      <TableHead>A Grade (m)</TableHead>
                      <TableHead>B Grade (m)</TableHead>
                      <TableHead>C Grade (m)</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.fabricStock?.map(stock => {
                      const contract = data.contracts?.find(c => c.id === stock.contract_id);
                      const quality = data.fabricQualities?.find(f => f.id === stock.fabric_quality_id);
                      const location = data.stockLocations?.find(l => l.id === stock.stock_location_id);
                      return (
                        <TableRow key={stock.id}>
                          <TableCell>{stock.kp_no || stock.id}</TableCell>
                          <TableCell>{contract?.name || contract?.id}</TableCell>
                          <TableCell>{stock.total_meters || stock.quantity_meters || 0}m</TableCell>
                          <TableCell>{stock.fresh_fabric || 0}m</TableCell>
                          <TableCell>{stock.a_grade || 0}m</TableCell>
                          <TableCell>{stock.b_grade || 0}m</TableCell>
                          <TableCell>{stock.c_grade || 0}m</TableCell>
                          <TableCell>{location?.name}</TableCell>
                          <TableCell>{new Date(stock.date || stock.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="receive" className="mt-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Receive Fabric</CardTitle>
              <CardDescription>Log fabric received from production or external sources.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceiveSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">KP# (Select Issued Fabric)</label>
                    <Select onValueChange={v => handleReceiveInputChange('kp_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Select KP#" /></SelectTrigger>
                      <SelectContent>
                        {data.fabricStock?.map(f => (
                          <SelectItem key={f.id} value={f.id.toString()}>
                            KP#{f.kp_no || f.id} - {f.total_meters || f.quantity_meters}m
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">PP#</label>
                    <Input 
                      placeholder="PP Number" 
                      value={receiveData.pp_no}
                      onChange={e => handleReceiveInputChange('pp_no', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">A Grade</label>
                    <Input 
                      type="number" 
                      placeholder="A Grade Meters" 
                      value={receiveData.a_grade}
                      onChange={e => handleReceiveInputChange('a_grade', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">B Grade</label>
                    <Input 
                      type="number" 
                      placeholder="B Grade Meters" 
                      value={receiveData.b_grade}
                      onChange={e => handleReceiveInputChange('b_grade', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">C Grade</label>
                    <Input 
                      type="number" 
                      placeholder="C Grade Meters" 
                      value={receiveData.c_grade}
                      onChange={e => handleReceiveInputChange('c_grade', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fresh Fabric (Auto-calculated)</label>
                    <Input 
                      type="number" 
                      placeholder="Fresh Fabric" 
                      value={receiveData.fresh_fabric}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Conversion Charges Per Pick</label>
                    <Input 
                      type="number" 
                      placeholder="Conversion Charges" 
                      value={receiveData.conversion_charges_per_pick}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Total Amount (Auto-calculated)</label>
                    <Input 
                      type="number" 
                      placeholder="Total Amount" 
                      value={receiveData.total_amount}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Income Tax Amount</label>
                    <Input 
                      type="number" 
                      placeholder="Income Tax Amount" 
                      value={receiveData.income_tax_amount}
                      onChange={e => handleReceiveInputChange('income_tax_amount', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Net Total (Auto-calculated)</label>
                    <Input 
                      type="number" 
                      placeholder="Net Total" 
                      value={receiveData.net_total}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Receive Fabric</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="issue" className="mt-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Issue Fabric</CardTitle>
              <CardDescription>Issue fabric to clients or for further processing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contract No#</label>
                    <Select onValueChange={v => handleIssueInputChange('contract_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Contract" /></SelectTrigger>
                      <SelectContent>
                        {data.contracts?.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name || c.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quality</label>
                    <Input 
                      placeholder="Quality" 
                      value={issueData.quality}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Stock Location</label>
                    <Select onValueChange={v => handleIssueInputChange('stock_location_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Stock Location" /></SelectTrigger>
                      <SelectContent>
                        {data.stockLocations?.map(l => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Total Meters</label>
                    <Input 
                      type="number" 
                      placeholder="Total Meters" 
                      value={issueData.total_meters}
                      onChange={e => handleIssueInputChange('total_meters', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Weight</label>
                    <Input 
                      type="number" 
                      placeholder="Weight (kg)" 
                      value={issueData.weight}
                      onChange={e => handleIssueInputChange('weight', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">KP#</label>
                    <Input 
                      placeholder="KP Number" 
                      value={issueData.kp_no}
                      onChange={e => handleIssueInputChange('kp_no', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bail</label>
                    <Input 
                      placeholder="Bail" 
                      value={issueData.bail}
                      onChange={e => handleIssueInputChange('bail', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">L/S</label>
                    <Input 
                      placeholder="L/S" 
                      value={issueData.ls}
                      onChange={e => handleIssueInputChange('ls', e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full"><MinusCircle className="mr-2 h-4 w-4"/>Issue Fabric</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default FabricManagement;
