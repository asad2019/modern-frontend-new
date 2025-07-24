
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/ApiAuthContext";
import { useToast } from "../../components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Save, Download, Plus, Trash2 } from "lucide-react";
import api from "../../lib/api";

const CICus = () => {
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

  // Unified RESTful API for invoices
  const submitData = async () => {
    setLoading(true);
    const selectedClientId = clients.find(
      (client) => client.name === formData.consignee_name
    )?.id;
    const payload = {
      type: "CICus",
      client_id: selectedClientId,
      date: formData.date,
      details: formData.details,
      remarks: formData.remarks || "",
      ...formData,
    };
    try {
      const response = await api.post("/api/invoices", payload);
      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Print invoice
  const handlePrint = () => {
    window.print();
  };

  // Edit invoice
  const editInvoice = async (id, updatedData) => {
    setLoading(true);
    try {
      const response = await api.put(`/api/invoices/${id}`, updatedData);
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // View invoice
  const viewInvoice = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/invoices/${id}`);
      setFormData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:max-w-none">
      {/* Header */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Commercial Invoice (US Format)</CardTitle>
          <CardDescription>
            Create a US format commercial invoice for your shipment
          </CardDescription>
          <div className="flex gap-2">
            <Button onClick={submitData} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Invoice
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Invoice Form */}
      <div className="p-6 print:p-0 text-xs print:text-[14px]">
        {/* Company Header */}
        <div className="text-center py-5 border-b-2 border-gray-800 mb-6">
          <h1 className="text-3xl font-bold">Modern Textiles</h1>
          <p className="text-lg">496-D Peoples Colony Faisalabad Pakistan</p>
        </div>

        {/* Invoice Title */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-semibold">Commercial Invoice</h2>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-3 border-2 border-gray-800 mb-4">
          <div className="col-span-2 border-r-2 border-gray-800">
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-2 p-2 gap-y-2 border-r-2 border-gray-800">
                <div className="font-semibold">Invoice #:</div>
                <Input
                  className="h-7"
                  value={formData.invoice_number}
                  onChange={(e) => handleValueChange("invoice_number", e.target.value)}
                />
                <div className="font-semibold">Date:</div>
                <Input
                  type="date"
                  className="h-7"
                  value={formData.date}
                  onChange={(e) => handleValueChange("date", e.target.value)}
                />
                <div className="font-semibold">Payment Terms:</div>
                <Input
                  className="h-7"
                  value={formData.payment_terms}
                  onChange={(e) => handleValueChange("payment_terms", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 p-2 gap-y-2">
                <div className="font-semibold">Shipment:</div>
                <Input
                  className="h-7"
                  value={formData.shipment}
                  onChange={(e) => handleValueChange("shipment", e.target.value)}
                />
                <div className="font-semibold">Po#:</div>
                <Input
                  className="h-7"
                  value={formData.buyer_po}
                  onChange={(e) => handleValueChange("buyer_po", e.target.value)}
                />
                <div className="font-semibold">GD Number:</div>
                <Input
                  className="h-7"
                  value={formData.gd_number}
                  onChange={(e) => handleValueChange("gd_number", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="p-2">
            <div className="font-semibold mb-2">Consignee:</div>
            <div className="space-y-1">
              <Input
                placeholder="Name"
                className="h-6 text-xs"
                value={formData.consignee_name}
                onChange={(e) => handleValueChange("consignee_name", e.target.value)}
              />
              <Input
                placeholder="Address"
                className="h-6 text-xs"
                value={formData.consignee_address}
                onChange={(e) => handleValueChange("consignee_address", e.target.value)}
              />
              <Input
                placeholder="City"
                className="h-6 text-xs"
                value={formData.consignee_city}
                onChange={(e) => handleValueChange("consignee_city", e.target.value)}
              />
              <Input
                placeholder="State"
                className="h-6 text-xs"
                value={formData.consignee_state}
                onChange={(e) => handleValueChange("consignee_state", e.target.value)}
              />
              <Input
                placeholder="Country"
                className="h-6 text-xs"
                value={formData.consignee_country}
                onChange={(e) => handleValueChange("consignee_country", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Details Table */}
        <div className="border-2 border-gray-800 mb-4">
          <div className="grid grid-cols-9 font-semibold text-center p-2 border-b border-gray-800">
            <div>Code</div>
            <div>Description</div>
            <div>Carton</div>
            <div>Carton 2</div>
            <div>Total Carton</div>
            <div>PCS</div>
            <div>Quantity</div>
            <div>Gr.Wt</div>
            <div>Net Wt</div>
          </div>
          {formData.details.map((detail, index) => (
            <div key={index} className="grid grid-cols-9 gap-1 p-1 border-b border-gray-300">
              <Input
                className="h-6 text-xs"
                value={detail.code}
                onChange={(e) => handleDetailChange(index, "code", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.local_description}
                onChange={(e) => handleDetailChange(index, "local_description", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.carton}
                onChange={(e) => handleDetailChange(index, "carton", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.carton_two}
                onChange={(e) => handleDetailChange(index, "carton_two", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.total_carton}
                onChange={(e) => handleDetailChange(index, "total_carton", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.pcs}
                onChange={(e) => handleDetailChange(index, "pcs", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.quantity}
                onChange={(e) => handleDetailChange(index, "quantity", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.gr_wt}
                onChange={(e) => handleDetailChange(index, "gr_wt", e.target.value)}
              />
              <div className="flex gap-1">
                <Input
                  className="h-6 text-xs flex-1"
                  value={detail.net_weight}
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
          Add Row
        </Button>

        {/* Additional Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Discharge Port:</label>
            <Input
              className="mt-1"
              value={formData.discharge_port}
              onChange={(e) => handleValueChange("discharge_port", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Container Number:</label>
            <Input
              className="mt-1"
              value={formData.container_number}
              onChange={(e) => handleValueChange("container_number", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CICus;
