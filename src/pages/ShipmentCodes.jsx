import React, { useEffect, useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PageLoader from '@/components/common/PageLoader';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[90vw] relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

const ShipmentCodes = () => {
  const { data, isLoading, refresh } = usePageData(['shipmentCodes', 'clients']);
  const { addData } = useData();
  const [codes, setCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: '', shipmentCode: '' });

  useEffect(() => {
    if (data.shipmentCodes) setCodes(data.shipmentCodes);
  }, [data.shipmentCodes]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Example payload, adjust as needed for your backend
    const payload = {
      client_id: form.client,
      code: form.shipmentCode
    };
    addData('shipmentCodes', payload)
      .then(() => {
        if (typeof refresh === 'function') refresh();
        setShowModal(false);
        setForm({ client: '', shipmentCode: '' });
      });
  };

  if (isLoading) return <PageLoader type="table" />;

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Shipment Codes</CardTitle>
        <Button onClick={() => setShowModal(true)}>Create Shipment Code</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Shipment Code</TableHead></TableRow></TableHeader>
          <TableBody>
            {codes.map(code => (
              <TableRow key={code.id}>
                <TableCell>{data.clients?.find(c => c.id === code.client_id)?.name}</TableCell>
                <TableCell>{code.shipment_code || code.code}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Card>
          <CardHeader><CardTitle>Create Shipment Code</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select onValueChange={v => handleChange('client', v)} value={form.client}>
                <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                <SelectContent>
                  {data.clients?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="text" placeholder="Shipment Code" value={form.shipmentCode} onChange={e => handleChange('shipmentCode', e.target.value)} />
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </CardContent>
        </Card>
      </Modal>
    </Card>
  );
};

export default ShipmentCodes;
