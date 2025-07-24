import React, { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PageLoader from '@/components/common/PageLoader';

const ReturnPO = () => {
  const { data, isLoading } = usePageData(['processingOrders', 'fabricStock']);
  const { updateProcessingOrder } = useData();
  const [formData, setFormData] = useState({
    id: '',
    fresh: '',
    bg: '',
    cp: '',
    total: '',
    gl: '',
    percent: '',
    PUOrderNumber: '',
    status: 'Pending',
    type: 'returnpo'
  });
  const [poItemTotals, setPoItemTotals] = useState(0);
  const [selectedPO, setSelectedPO] = useState(null);

  // Calculate total, gl, percent when fields change
  React.useEffect(() => {
    const fresh = parseFloat(formData.fresh) || 0;
    const bg = parseFloat(formData.bg) || 0;
    const cp = parseFloat(formData.cp) || 0;
    const total = fresh + bg + cp;
    setFormData(f => ({ ...f, total: total }));
  }, [formData.fresh, formData.bg, formData.cp]);
  React.useEffect(() => {
    if (formData.id) {
      const po = data.processingOrders?.find(po => po.id == formData.id);
      if (po) {
        setSelectedPO(po);
        // Use finish_width if available, else sum of item totals
        const finishWidth = po.finish_width ? parseFloat(po.finish_width) : null;
        const itemTotals = po.items?.reduce((sum, item) => sum + parseFloat(item.total || 0), 0) || 0;
        setPoItemTotals(finishWidth || itemTotals);
        // Auto-fill total from PO
        setFormData(f => ({
          ...f,
          total: finishWidth || itemTotals
        }));
      }
    } else {
      setSelectedPO(null);
      setPoItemTotals(0);
      setFormData(f => ({
        ...f,
        total: ''
      }));
    }
  }, [formData.id, data.processingOrders]);

  React.useEffect(() => {
    const total = parseFloat(formData.total) || 0;
    const gl = total - poItemTotals;
    const percent = poItemTotals ? ((gl / poItemTotals) * 100).toFixed(2) : '';
    setFormData(f => ({ ...f, gl: gl, percent: percent }));
  }, [formData.total, poItemTotals]);

  const handleChange = (field, value) => {
    setFormData(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProcessingOrder(formData.id, formData);
    setFormData({
      id: '',
      fresh: '',
      bg: '',
      cp: '',
      total: '',
      gl: '',
      percent: '',
      PUOrderNumber: '',
      status: 'Pending',
      type: 'returnpo',
    });
  };

  if (isLoading) return <PageLoader type="table" />;

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
      <Card>
        <CardHeader><CardTitle>Receive Finished Fabric (Return PO)</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select onValueChange={v => handleChange('id', v)} value={formData.id}>
              <SelectTrigger><SelectValue placeholder="Select PO Number" /></SelectTrigger>
              <SelectContent>
                {data.processingOrders?.map(po => (
                  <SelectItem key={po.id} value={String(po.id)}>{po.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Fresh" value={formData.fresh} onChange={e => handleChange('fresh', e.target.value)} required />
            <Input type="number" placeholder="B/G" value={formData.bg} onChange={e => handleChange('bg', e.target.value)} />
            <Input type="number" placeholder="C/P" value={formData.cp} onChange={e => handleChange('cp', e.target.value)} />
            <Input type="number" placeholder="Total" value={formData.total} disabled />
            <Input type="number" placeholder="G/L" value={formData.gl} disabled />
            <Input type="number" placeholder="Percent" value={formData.percent} disabled />
            <Input type="text" placeholder="PU Order Number" value={formData.PUOrderNumber} onChange={e => handleChange('PUOrderNumber', e.target.value)} />
            <Button type="submit" className="w-full">Receive Fabric</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnPO;
