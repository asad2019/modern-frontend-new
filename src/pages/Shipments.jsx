import React, { useEffect, useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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

const Shipments = () => {
  const { data, isLoading } = usePageData(['shipments', 'clients', 'products']);
  const { addData } = useData();
  const [shipments, setShipments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (data.shipments) setShipments(data.shipments);
  }, [data.shipments]);

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedProductObj = data.products?.find(p => p.id === selectedProducts[0]);
    const shipmentCodeId = selectedProductObj?.shipment_code_id || '';
    const payload = {
      client_id: data.clients?.[0]?.id || '', // Replace with selected client
      shipment_code_id: shipmentCodeId,
      products: selectedProducts.map(pid => ({ productId: pid, quantity: 1 })), // Add quantity selection if needed
      date: new Date().toISOString().slice(0, 10)
    };
    addData('shipments', payload)
      .then(() => {
        setShowModal(false);
        setSelectedProducts([]);
      });
  };

  if (isLoading) return <PageLoader type="table" />;

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Shipments</CardTitle>
        <Button onClick={() => setShowModal(true)}>Create Shipment</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Client</TableHead><TableHead>Shipment Code</TableHead></TableRow></TableHeader>
          <TableBody>
            {shipments.map(shipment => (
              <TableRow key={shipment.id}>
                <TableCell>{shipment.id || 'N/A'}</TableCell>
                <TableCell>{data.clients?.find(c => c.id === shipment.client_id)?.name}</TableCell>
                <TableCell>{shipment.shipment_code_id || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Card>
          <CardHeader><CardTitle>Create Shipment</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-y-2">
                <label className="text-sm font-semibold">Select Products</label>
                <div className="max-h-60 overflow-y-auto border rounded p-2">
                  {data.products?.map(product => (
                    <div key={product.id} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                      />
                      <span className="font-semibold">{product.id || 'N/A'}</span>
                      <span className="text-xs text-gray-500 ml-2">Shipment Code: {product.shipment_code_id || 'N/A'}</span>
                      <span className="text-xs text-gray-500 ml-2">Client: {product.client?.name || 'N/A'}</span>
                      <span className="text-xs text-gray-500 ml-2">Fabric Quality: {product.fabric_quality?.name || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">Create Shipment</Button>
            </form>
          </CardContent>
        </Card>
      </Modal>
    </Card>
  );
};

export default Shipments;
