import React, { useState, useEffect } from 'react';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PageLoader from '@/components/common/PageLoader';


import ReturnPO from './ReturnPO';

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

const PO = () => {
  const { data, isLoading, refresh } = usePageData(['fabricStock', 'fabricQualities', 'clients', 'processingOrders', 'looms']);
  const { createProcessingOrder } = useData();
  // PO form fields as per your provided code
  const [formData, setFormData] = useState({
    po_date: '',
    processing_unit: '',
    shipment_date: '',
    loom: '',
    grey_width: '',
    finish_width: '',
    repaired_by: '',
    checked_by: '',
    approved_by: '',
    status: 'Pending',
    type: 'po',
  });
  const [items, setItems] = useState([
    {
      quality_id: '',
      shade_name: [],
      rate: '',
      total: '',
      finished_width: '',
    },
  ]);
  const shadeOptions = ["Single Sing", "Single Bleached", "HeatSet", "Sanfo"];
  const [showPoModal, setShowPoModal] = useState(false);
  const [showReturnPoModal, setShowReturnPoModal] = useState(false);

  const handleChange = (field, value) => {
    setFormData(f => ({ ...f, [field]: value }));
  };

  const addItem = () => {
    setItems([...items, { quality_id: '', shade_name: [], rate: '', total: '', finished_width: '' }]);
  };
  const removeItem = (index) => {
    if (index !== 0) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };
  const handleShadeChange = (index, shade) => {
    const updatedItems = [...items];
    const shadeIndex = updatedItems[index].shade_name.indexOf(shade);
    if (shadeIndex > -1) {
      updatedItems[index].shade_name.splice(shadeIndex, 1);
    } else {
      updatedItems[index].shade_name.push(shade);
    }
    setItems(updatedItems);
  };
  const totalSum = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    createProcessingOrder({ ...formData, items });
    setFormData({
      po_date: '',
      processing_unit: '',
      shipment_date: '',
      loom: '',
      grey_width: '',
      finish_width: '',
      repaired_by: '',
      checked_by: '',
      approved_by: '',
      status: 'Pending',
      type: 'po',
    });
    setItems([
      {
        quality_id: '',
        shade_name: [],
        rate: '',
        total: '',
        finished_width: '',
      },
    ]);
    setShowPoModal(false);
    if (typeof refresh === 'function') refresh();
  };

  if (isLoading) return <PageLoader type="table" />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">PO Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowPoModal(true)}>Create PO</Button>
          <Button onClick={() => setShowReturnPoModal(true)}>Create Return PO</Button>
        </div>
      </div>

      {/* PO Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse divide-y divide-gray-300 table-auto">
          <thead>
            <tr>
              {['PO Number','PO Date','Loom','Processing Unit','Processing Stock','Fresh','B/G','C/P','Total','G/L','%','PU Order #'].map((header, idx) => (
                <th key={idx} className="py-3 px-4 border-r text-left text-sm bg-vblue">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data.processingOrders) && data.processingOrders.length > 0 ? (
              data.processingOrders.map((po, idx) => (
                <tr key={po.id || idx} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4 border-r">{po.po_number || po.poNumber || po.id || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.po_date || po.date || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.loom || po.loom_id || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.processing_unit || po.unit || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.items?.reduce((sum, item) => sum + parseFloat(item.total || 0), 0) || po.total || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.return_po?.fresh || po.fresh || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.return_po?.bg || po.bg || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.return_po?.cp || po.cp || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.return_po?.total || po.total || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.return_po?.gl || po.gl || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.return_po?.percent || po.percent || 'N/A'}</td>
                  <td className="py-3 px-4 border-r">{po.return_po?.PUOrderNumber || po.PUOrderNumber || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="py-4 text-center text-gray-500">No Processing orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PO Modal */}
      <Modal open={showPoModal} onClose={() => setShowPoModal(false)}>
        <Card>
          <CardHeader><CardTitle>Create PO</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
              <div className="grid grid-cols-2 gap-7 p-2">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">PO Date</label>
                  <Input type="date" value={formData.po_date} onChange={e => handleChange('po_date', e.target.value)} placeholder="PO Date" />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">Processing Unit</label>
                  <Input type="text" value={formData.processing_unit} onChange={e => handleChange('processing_unit', e.target.value)} placeholder="Processing Unit" />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">Shipping Date</label>
                  <Input type="date" value={formData.shipment_date} onChange={e => handleChange('shipment_date', e.target.value)} placeholder="Shipping Date" />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">Loom</label>
                  <Select onValueChange={v => handleChange('loom', v)} value={formData.loom}>
                    <SelectTrigger><SelectValue placeholder="Select Loom" /></SelectTrigger>
                    <SelectContent>
                      {data.looms?.map(loom => (
                        <SelectItem key={loom.id} value={loom.name}>{loom.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">Grey Width</label>
                  <Input type="text" value={formData.grey_width} onChange={e => handleChange('grey_width', e.target.value)} placeholder="Grey Width" />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">Finish Width</label>
                  <Input type="text" value={formData.finish_width} onChange={e => handleChange('finish_width', e.target.value)} placeholder="Finish Width" />
                </div>
              </div>
              <div className="p-2 bg-gray-100 rounded-md">
                <div className="font-semibold text-lg mb-3">Items</div>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Quality</th>
                      <th className="border p-2">Shade Name</th>
                      <th className="border p-2">Rate</th>
                      <th className="border p-2">Total</th>
                      <th className="border p-2">Finished Width</th>
                      <th className="border p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">
                          <Select onValueChange={v => handleItemChange(index, 'quality_id', v)} value={item.quality_id}>
                            <SelectTrigger><SelectValue placeholder="Select Quality" /></SelectTrigger>
                            <SelectContent>
                              {data.fabricQualities?.map(q => (
                                <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border p-2">
                          <div className="flex flex-wrap gap-2">
                            {shadeOptions.map(shade => (
                              <label key={shade} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={item.shade_name.includes(shade)}
                                  onChange={() => handleShadeChange(index, shade)}
                                  className="mr-2"
                                />
                                {shade}
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="border p-2">
                          <Input type="text" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} />
                        </td>
                        <td className="border p-2">
                          <Input type="text" value={item.total} onChange={e => handleItemChange(index, 'total', e.target.value)} />
                        </td>
                        <td className="border p-2">
                          <Input type="text" value={item.finished_width} onChange={e => handleItemChange(index, 'finished_width', e.target.value)} />
                        </td>
                        <td className="border p-2 text-center">
                          <button type="button" onClick={() => removeItem(index)} disabled={index === 0} className={`px-2 py-1 rounded-md ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}>Remove</button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="2" className="border p-2 font-bold text-right"></td>
                      <td className="border p-2 font-bold text-vblue">Total Sum: {totalSum}</td>
                      <td colSpan="4" className="border p-2"></td>
                    </tr>
                  </tbody>
                </table>
                <button type="button" onClick={addItem} className="py-1 bg-vblue px-5 shadow-lg rounded-sm flex justify-center font-semibold mt-4">Add Item</button>
              </div>
              <div className="grid grid-cols-3 gap-7 p-2">
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">Repaired By</label>
                  <Input type="text" value={formData.repaired_by} onChange={e => handleChange('repaired_by', e.target.value)} placeholder="Repaired By" />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">Checked By</label>
                  <Input type="text" value={formData.checked_by} onChange={e => handleChange('checked_by', e.target.value)} placeholder="Checked By" />
                </div>
                <div className="flex flex-col gap-y-2">
                  <label className="text-sm font-semibold">Approved By</label>
                  <Input type="text" value={formData.approved_by} onChange={e => handleChange('approved_by', e.target.value)} placeholder="Approved By" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="py-1 px-5 shadow-lg rounded-sm flex justify-center font-semibold mb-5 mx-5">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Modal>

      {/* Return PO Modal */}
      <Modal open={showReturnPoModal} onClose={() => setShowReturnPoModal(false)}>
        <ReturnPO />
      </Modal>
    </div>
  );
};

export default PO;
