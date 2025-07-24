import React, { useState } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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

const Product = () => {
  const { data } = usePageData(['clients', 'shipmentCodes', 'fabricQualities', 'products']);
  const { addData, updateData } = useData();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCuttingModal, setShowCuttingModal] = useState(false);
  const [showSewingModal, setShowSewingModal] = useState(false);
  const [productForm, setProductForm] = useState({
    client_id: '',
    shipment_code_id: '',
    fabric_quality_id: '',
  });
  const [cuttingForm, setCuttingForm] = useState({
    product: '',
    local_description: '',
    export_description: '',
    LOF: '',
    WOF: '',
    finished_size: '',
    width: '',
  });
  const [showPackingModal, setShowPackingModal] = useState(false);
  const [packingForm, setPackingForm] = useState({
    product: '',
    total_cartons: '',
    poly_bag_per_carton: '',
    bundle_per_poly_bag: '',
  });
  const [sewingForm, setSewingForm] = useState({
    top_hem: { size: '', colourThread: '', left: '', right: '', RFID: '' },
    bottom_hem: { size: '', colourThread: '', left: '', right: '', RFID: '' },
    sides: { size: '', colourThread: '', sideLabel: '' },
  });

  // Filter shipment codes by client_id
  const filteredShipmentCodes = data.shipmentCodes?.filter(code => code.client_id === productForm.client_id);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowProductModal(true)}>Add Product</Button>
          <Button onClick={() => setShowCuttingModal(true)}>Cutting</Button>
          <Button onClick={() => setShowSewingModal(true)}>Sewing</Button>
          <Button onClick={() => setShowPackingModal(true)}>Packing</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse divide-y divide-gray-300 table-auto">
          <thead>
            <tr>
              <th className="py-3 px-4 border-r text-left text-sm bg-vblue">Client</th>
              <th className="py-3 px-4 border-r text-left text-sm bg-vblue">Shipment Code</th>
              <th className="py-3 px-4 border-r text-left text-sm bg-vblue">Fabric Quality</th>
              <th className="py-3 px-4 border-r text-left text-sm bg-vblue">Cutting</th>
              <th className="py-3 px-4 border-r text-left text-sm bg-vblue">Top Hem</th>
              <th className="py-3 px-4 border-r text-left text-sm bg-vblue">Bottom Hem</th>
              <th className="py-3 px-4 border-r text-left text-sm bg-vblue">Sides</th>
              <th className="py-3 px-4 border-r text-left text-sm bg-vblue">Packing</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data.products) && data.products.length > 0 ? (
              data.products.map((prod, idx) => (
                <tr key={prod.id || idx} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4 border-r">{prod.client?.name || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{prod.shipment_code_id || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{prod.fabric_quality?.name || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">
                    <div>Local: {prod.local_description || 'N/A'}</div>
                    <div>Export: {prod.export_description || 'N/A'}</div>
                    <div>LOF: {prod.LOF || 'N/A'}</div>
                    <div>WOF: {prod.WOF || 'N/A'}</div>
                    <div>Finished: {prod.finished_size || 'N/A'}</div>
                    <div>Width: {prod.width || 'N/A'}</div>
                  </td>
                  <td className="py-3 px-4 border-r">
                    {prod.top_hem ? (
                      <ul className="space-y-1">
                        {Object.entries(prod.top_hem).map(([key, value]) => (
                          <li key={key}>{key}: {value}</li>
                        ))}
                      </ul>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 border-r">
                    {prod.bottom_hem ? (
                      <ul className="space-y-1">
                        {Object.entries(prod.bottom_hem).map(([key, value]) => (
                          <li key={key}>{key}: {value}</li>
                        ))}
                      </ul>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 border-r">
                    {prod.sides ? (
                      <ul className="space-y-1">
                        {Object.entries(prod.sides).map(([key, value]) => (
                          <li key={key}>{key}:{value}</li>
                        ))}
                      </ul>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 border-r">
                    <div>Total Cartons: {prod.total_cartons || 'N/A'}</div>
                    <div>Poly Bag/Carton: {prod.poly_bag_per_carton || 'N/A'}</div>
                    <div>Bundle/Poly Bag: {prod.bundle_per_poly_bag || 'N/A'}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add Product Modal */}
      <Modal open={showProductModal} onClose={() => setShowProductModal(false)}>
        <Card>
          <CardHeader><CardTitle>Add Product</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={e => {
              e.preventDefault();
              if (typeof addData === 'function') {
                const payload = {
                  client_id: productForm.client_id,
                  shipment_code_id: productForm.shipment_code_id,
                  fabric_quality_id: productForm.fabric_quality_id
                };
                addData('products', payload).then(() => {
                  setShowProductModal(false);
                  setProductForm({ client_id: '', shipment_code_id: '', fabric_quality_id: '' });
                });
              }
            }}>
              <Select onValueChange={v => setProductForm(f => ({ ...f, client_id: v }))} value={productForm.client_id}>
                <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                <SelectContent>
                  {data.clients?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={v => setProductForm(f => ({ ...f, shipment_code_id: v }))} value={productForm.shipment_code_id}>
                <SelectTrigger><SelectValue placeholder="Select Shipment Code" /></SelectTrigger>
                <SelectContent>
                  {filteredShipmentCodes?.map(code => (
                    <SelectItem key={code.id} value={code.code}>{code.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={v => setProductForm(f => ({ ...f, fabric_quality_id: v }))} value={productForm.fabric_quality_id}>
                <SelectTrigger><SelectValue placeholder="Select Fabric Quality" /></SelectTrigger>
                <SelectContent>
                  {data.fabricQualities?.map(q => (
                    <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">Add Product</Button>
            </form>
          </CardContent>
        </Card>
      </Modal>
      {/* Cutting Modal */}
      <Modal open={showCuttingModal} onClose={() => setShowCuttingModal(false)}>
        <Card>
          <CardHeader><CardTitle>Cutting</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async e => {
                e.preventDefault();
                if (!cuttingForm.product || typeof addData !== 'function') return;
                const payload = {
                    productId: cuttingForm.product,
                    local_description: cuttingForm.local_description,
                    export_description: cuttingForm.export_description,
                    LOF: cuttingForm.LOF,
                    WOF: cuttingForm.WOF,
                    finished_size: cuttingForm.finished_size,
                    width: cuttingForm.width
                };
                await updateData('products', payload.productId, payload);
                setShowCuttingModal(false);
                setCuttingForm({
                  product: '',
                  local_description: '',
                  export_description: '',
                  LOF: '',
                  WOF: '',
                  finished_size: '',
                  width: ''
                });
              }}
            >
              <Select onValueChange={v => setCuttingForm(f => ({ ...f, product: v }))} value={cuttingForm.product}>
                <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                <SelectContent>
                  {data.products?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="text" placeholder="Local Description" value={cuttingForm.local_description} onChange={e => setCuttingForm(f => ({ ...f, local_description: e.target.value }))} />
              <Input type="text" placeholder="Export Description" value={cuttingForm.export_description} onChange={e => setCuttingForm(f => ({ ...f, export_description: e.target.value }))} />
              <Input type="text" placeholder="LOF" value={cuttingForm.LOF} onChange={e => setCuttingForm(f => ({ ...f, LOF: e.target.value }))} />
              <Input type="text" placeholder="WOF" value={cuttingForm.WOF} onChange={e => setCuttingForm(f => ({ ...f, WOF: e.target.value }))} />
              <Input type="text" placeholder="Finished Size" value={cuttingForm.finished_size} onChange={e => setCuttingForm(f => ({ ...f, finished_size: e.target.value }))} />
              <Input type="text" placeholder="Width" value={cuttingForm.width} onChange={e => setCuttingForm(f => ({ ...f, width: e.target.value }))} />
              <Button type="submit" className="w-full">Save Cutting</Button>
            </form>
          </CardContent>
        </Card>
      </Modal>
      {/* Sewing Modal */}
      <Modal open={showSewingModal} onClose={() => setShowSewingModal(false)}>
        <Card>
          <CardHeader><CardTitle>Sewing</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={async e => {
                e.preventDefault();
                if (!sewingForm.product || typeof addData !== 'function') return;
                const payload = {
                    productId: sewingForm.product,
                    top_hem: sewingForm.top_hem,
                    bottom_hem: sewingForm.bottom_hem,
                    sides: sewingForm.sides
                };
                await updateData('products', payload.productId, payload);
                setShowSewingModal(false);
                setSewingForm({
                  top_hem: { size: '', colourThread: '', left: '', right: '', RFID: '' },
                  bottom_hem: { size: '', colourThread: '', left: '', right: '', RFID: '' },
                  sides: { size: '', colourThread: '', sideLabel: '' },
                  product: ''
                });
              }}
            >
              <Select onValueChange={v => setSewingForm(f => ({ ...f, product: v }))} value={sewingForm.product || ''}>
                <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                <SelectContent>
                  {data.products?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <h3 className="font-semibold mb-2">Top Hem</h3>
                <div className="grid grid-cols-5 gap-2">
                  <Input type="text" placeholder="Size" value={sewingForm.top_hem.size} onChange={e => setSewingForm(f => ({ ...f, top_hem: { ...f.top_hem, size: e.target.value } }))} />
                  <Input type="text" placeholder="Colour Thread" value={sewingForm.top_hem.colourThread} onChange={e => setSewingForm(f => ({ ...f, top_hem: { ...f.top_hem, colourThread: e.target.value } }))} />
                  <Input type="text" placeholder="Left" value={sewingForm.top_hem.left} onChange={e => setSewingForm(f => ({ ...f, top_hem: { ...f.top_hem, left: e.target.value } }))} />
                  <Input type="text" placeholder="Right" value={sewingForm.top_hem.right} onChange={e => setSewingForm(f => ({ ...f, top_hem: { ...f.top_hem, right: e.target.value } }))} />
                  <Input type="text" placeholder="RFID" value={sewingForm.top_hem.RFID} onChange={e => setSewingForm(f => ({ ...f, top_hem: { ...f.top_hem, RFID: e.target.value } }))} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bottom Hem</h3>
                <div className="grid grid-cols-5 gap-2">
                  <Input type="text" placeholder="Size" value={sewingForm.bottom_hem.size} onChange={e => setSewingForm(f => ({ ...f, bottom_hem: { ...f.bottom_hem, size: e.target.value } }))} />
                  <Input type="text" placeholder="Colour Thread" value={sewingForm.bottom_hem.colourThread} onChange={e => setSewingForm(f => ({ ...f, bottom_hem: { ...f.bottom_hem, colourThread: e.target.value } }))} />
                  <Input type="text" placeholder="Left" value={sewingForm.bottom_hem.left} onChange={e => setSewingForm(f => ({ ...f, bottom_hem: { ...f.bottom_hem, left: e.target.value } }))} />
                  <Input type="text" placeholder="Right" value={sewingForm.bottom_hem.right} onChange={e => setSewingForm(f => ({ ...f, bottom_hem: { ...f.bottom_hem, right: e.target.value } }))} />
                  <Input type="text" placeholder="RFID" value={sewingForm.bottom_hem.RFID} onChange={e => setSewingForm(f => ({ ...f, bottom_hem: { ...f.bottom_hem, RFID: e.target.value } }))} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sides</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Input type="text" placeholder="Size" value={sewingForm.sides.size} onChange={e => setSewingForm(f => ({ ...f, sides: { ...f.sides, size: e.target.value } }))} />
                  <Input type="text" placeholder="Colour Thread" value={sewingForm.sides.colourThread} onChange={e => setSewingForm(f => ({ ...f, sides: { ...f.sides, colourThread: e.target.value } }))} />
                  <Input type="text" placeholder="Side Label" value={sewingForm.sides.sideLabel} onChange={e => setSewingForm(f => ({ ...f, sides: { ...f.sides, sideLabel: e.target.value } }))} />
                </div>
              </div>
              <Button type="submit" className="w-full">Save Sewing</Button>
            </form>
          </CardContent>
        </Card>
      </Modal>
      {/* Packing Modal */}
      <Modal open={showPackingModal} onClose={() => setShowPackingModal(false)}>
        <Card>
          <CardHeader><CardTitle>Packing</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async e => {
                e.preventDefault();
                if (!packingForm.product || typeof addData !== 'function') return;
                const payload = {
                    productId: packingForm.product,
                    total_cartons: packingForm.total_cartons,
                    poly_bag_per_carton: packingForm.poly_bag_per_carton,
                    bundle_per_poly_bag: packingForm.bundle_per_poly_bag
                };
                await updateData('products', payload.productId, payload);
                setShowPackingModal(false);
                setPackingForm({
                  product: '',
                  total_cartons: '',
                  poly_bag_per_carton: '',
                  bundle_per_poly_bag: ''
                });
              }}
            >
              <Select onValueChange={v => setPackingForm(f => ({ ...f, product: v }))} value={packingForm.product}>
                <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                <SelectContent>
                  {data.products?.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Total Cartons" value={packingForm.total_cartons} onChange={e => setPackingForm(f => ({ ...f, total_cartons: e.target.value }))} />
              <Input type="number" placeholder="Poly Bag per Carton" value={packingForm.poly_bag_per_carton} onChange={e => setPackingForm(f => ({ ...f, poly_bag_per_carton: e.target.value }))} />
              <Input type="number" placeholder="Bundle per Poly Bag" value={packingForm.bundle_per_poly_bag} onChange={e => setPackingForm(f => ({ ...f, bundle_per_poly_bag: e.target.value }))} />
              <Button type="submit" className="w-full">Save Packing</Button>
            </form>
          </CardContent>
        </Card>
      </Modal>
    </div>
  );
};

export default Product;
