
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/ApiAuthContext";
import { useToast } from "../../components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Save, Download, Plus, Trash2 } from "lucide-react";
import api from "../../lib/api";

const PLC = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    invoice_number: "",
    date: new Date().toISOString().split("T")[0],
    payment_terms: "",
    shipment: "",
    buyer_po: "",
    gd_number: "",
    consignee_name: "",
    consignee_address: "",
    consignee_city: "",
    consignee_state: "",
    consignee_country: "",
    discharge_port: "",
    container_number: "",
    goods_description: "",
    total_bales: "",
    shippment_marks: "",
    article_number: "",
    quantity: "",
    gr_wt: "",
    net_wt: "",
    details: [
      {
        code: "",
        local_description: "",
        carton: "",
        carton_two: "",
        total_carton: "",
        pcs: "",
        quantity: "",
        gr_wt: "",
        net_weight: "",
      },
    ],
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleValueChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleDetailChange = (index, key, value) => {
    setFormData((prevData) => {
      const newDetails = [...prevData.details];
      newDetails[index][key] = value;
      return { ...prevData, details: newDetails };
    });
  };

  const addProductRow = () => {
    setFormData((prevData) => ({
      ...prevData,
      details: [
        ...prevData.details,
        {
          code: "",
          local_description: "",
          carton: "",
          carton_two: "",
          total_carton: "",
          pcs: "",
          quantity: "",
          gr_wt: "",
          net_weight: "",
        },
      ],
    }));
  };

  const deleteProductRow = (index) => {
    setFormData((prevData) => {
      const newDetails = [...prevData.details];
      newDetails.splice(index, 1);
      return { ...prevData, details: newDetails };
    });
  };

  const submitData = async () => {
    setLoading(true);
    const selectedClientId = clients.find(
      (client) => client.name === formData.consignee_name
    )?.id;

    const payload = {
      client_id: selectedClientId,
      details: formData.details,
      ...formData,
    };

    try {
      const response = await api.post("/invoice/store", payload);
      toast({
        title: "Success",
        description: "Packing list saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save packing list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:max-w-none">
      {/* Header */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Packing List</CardTitle>
          <CardDescription>
            Create a detailed packing list for your shipment
          </CardDescription>
          <div className="flex gap-2">
            <Button onClick={submitData} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Packing List
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Packing List Form */}
      <div className="p-6 print:p-0 text-xs print:text-[14px]">
        {/* Company Header */}
        <div className="text-center py-5 border-b-2 border-gray-800 mb-6">
          <h1 className="text-3xl font-bold">Modern Textiles</h1>
          <p className="text-lg">496-D Peoples Colony Faisalabad Pakistan</p>
        </div>

        {/* Document Title */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-semibold">PACKING LIST</h2>
        </div>

        {/* Document Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border-2 border-gray-800 p-4">
            <h3 className="font-semibold mb-3 text-center p-2">SHIPPER</h3>
            <div className="space-y-2">
              <p className="font-semibold">Modern Textiles</p>
              <p>496-D Peoples Colony</p>
              <p>Faisalabad Pakistan</p>
            </div>
          </div>
          <div className="border-2 border-gray-800 p-4">
            <h3 className="font-semibold mb-3 text-center p-2">CONSIGNEE</h3>
            <div className="space-y-2">
              <Input
                placeholder="Company Name"
                className="h-7"
                value={formData.consignee_name}
                onChange={(e) => handleValueChange("consignee_name", e.target.value)}
              />
              <Input
                placeholder="Address"
                className="h-7"
                value={formData.consignee_address}
                onChange={(e) => handleValueChange("consignee_address", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  className="h-7"
                  value={formData.consignee_city}
                  onChange={(e) => handleValueChange("consignee_city", e.target.value)}
                />
                <Input
                  placeholder="State"
                  className="h-7"
                  value={formData.consignee_state}
                  onChange={(e) => handleValueChange("consignee_state", e.target.value)}
                />
              </div>
              <Input
                placeholder="Country"
                className="h-7"
                value={formData.consignee_country}
                onChange={(e) => handleValueChange("consignee_country", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Invoice Information */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 border-2 border-gray-800">
          <div>
            <label className="font-semibold">Invoice No:</label>
            <Input
              className="mt-1 h-8"
              value={formData.invoice_number}
              onChange={(e) => handleValueChange("invoice_number", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Date:</label>
            <Input
              type="date"
              className="mt-1 h-8"
              value={formData.date}
              onChange={(e) => handleValueChange("date", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">GD Number:</label>
            <Input
              className="mt-1 h-8"
              value={formData.gd_number}
              onChange={(e) => handleValueChange("gd_number", e.target.value)}
            />
          </div>
        </div>

        {/* Shipping Information */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 border border-gray-400">
          <div>
            <label className="font-semibold">Container Number:</label>
            <Input
              className="mt-1 h-8"
              value={formData.container_number}
              onChange={(e) => handleValueChange("container_number", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Discharge Port:</label>
            <Input
              className="mt-1 h-8"
              value={formData.discharge_port}
              onChange={(e) => handleValueChange("discharge_port", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Total Bales:</label>
            <Input
              className="mt-1 h-8"
              value={formData.total_bales}
              onChange={(e) => handleValueChange("total_bales", e.target.value)}
            />
          </div>
        </div>

        {/* Packing Details Table */}
        <div className="border-2 border-gray-800 mb-4">
          <div className="grid grid-cols-8 font-semibold text-center p-2 border-b border-gray-800">
            <div>Marks & Numbers</div>
            <div>Description</div>
            <div>Cartons From</div>
            <div>Cartons To</div>
            <div>Total Cartons</div>
            <div>Pieces</div>
            <div>Gross Weight</div>
            <div>Net Weight</div>
          </div>
          {formData.details.map((detail, index) => (
            <div key={index} className="grid grid-cols-8 gap-1 p-1 border-b border-gray-300">
              <Input
                className="h-6 text-xs"
                value={detail.code}
                placeholder="Marks"
                onChange={(e) => handleDetailChange(index, "code", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.local_description}
                placeholder="Description"
                onChange={(e) => handleDetailChange(index, "local_description", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.carton}
                placeholder="From"
                onChange={(e) => handleDetailChange(index, "carton", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.carton_two}
                placeholder="To"
                onChange={(e) => handleDetailChange(index, "carton_two", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.total_carton}
                placeholder="Total"
                onChange={(e) => handleDetailChange(index, "total_carton", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.pcs}
                placeholder="PCS"
                onChange={(e) => handleDetailChange(index, "pcs", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.gr_wt}
                placeholder="Gross Wt"
                onChange={(e) => handleDetailChange(index, "gr_wt", e.target.value)}
              />
              <div className="flex gap-1">
                <Input
                  className="h-6 text-xs flex-1"
                  value={detail.net_weight}
                  placeholder="Net Wt"
                  onChange={(e) => handleDetailChange(index, "net_weight", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 w-6 p-0 print:hidden"
                  onClick={() => deleteProductRow(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={addProductRow}
          className="mb-4 print:hidden"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>

        {/* Summary Section */}
        <div className="mt-6 p-4 border border-gray-400">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Goods Description:</label>
              <Input
                className="mt-1"
                value={formData.goods_description}
                onChange={(e) => handleValueChange("goods_description", e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold">Shipment Marks:</label>
              <Input
                className="mt-1"
                value={formData.shippment_marks}
                onChange={(e) => handleValueChange("shippment_marks", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs">
          <p className="font-semibold">DECLARATION</p>
          <p className="mt-2">We hereby declare that the above particulars are true and correct.</p>
        </div>
      </div>
    </div>
  );
};

export default PLC;
