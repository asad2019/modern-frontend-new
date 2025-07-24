
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/ApiAuthContext";
import { useToast } from "../../components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Save, Download, Plus, Trash2 } from "lucide-react";
import api from "../../lib/api";

const CICustom = () => {
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
      type: "CICustom",
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
        description: "Custom invoice saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save custom invoice",
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
          <CardTitle>Custom Commercial Invoice</CardTitle>
          <CardDescription>
            Create a custom format commercial invoice with enhanced features
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
        <div className="text-center py-5 border-b-2 mb-6">
          <h1 className="text-4xl font-bold">Modern Textiles</h1>
          <p className="text-lg">496-D Peoples Colony Faisalabad Pakistan</p>
          <p className="text-sm">Phone: +92-41-2345678 | Email: info@moderntextiles.com</p>
        </div>

        {/* Invoice Title with Custom Styling */}
        <div className="text-center py-4 border rounded mb-4">
          <h2 className="text-2xl font-semibold">COMMERCIAL INVOICE</h2>
          <p className="text-sm">Custom Format</p>
        </div>

        {/* Enhanced Invoice Details */}
        <div className="grid grid-cols-3 border-2 mb-4 rounded">
          <div className="col-span-2 border-r-2">
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-2 p-3 gap-y-3 border-r-2">
                <div className="font-semibold">Invoice #:</div>
                <Input
                  className="h-8"
                  value={formData.invoice_number}
                  onChange={(e) => handleValueChange("invoice_number", e.target.value)}
                />
                <div className="font-semibold">Date:</div>
                <Input
                  type="date"
                  className="h-8"
                  value={formData.date}
                  onChange={(e) => handleValueChange("date", e.target.value)}
                />
                <div className="font-semibold">Payment Terms:</div>
                <Input
                  className="h-8"
                  value={formData.payment_terms}
                  onChange={(e) => handleValueChange("payment_terms", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 p-3 gap-y-3">
                <div className="font-semibold">Shipment:</div>
                <Input
                  className="h-8"
                  value={formData.shipment}
                  onChange={(e) => handleValueChange("shipment", e.target.value)}
                />
                <div className="font-semibold">Po#:</div>
                <Input
                  className="h-8"
                  value={formData.buyer_po}
                  onChange={(e) => handleValueChange("buyer_po", e.target.value)}
                />
                <div className="font-semibold">GD Number:</div>
                <Input
                  className="h-8"
                  value={formData.gd_number}
                  onChange={(e) => handleValueChange("gd_number", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="font-semibold mb-2">Consignee Details:</div>
            <div className="space-y-2">
              <Input
                placeholder="Company Name"
                className="h-7 text-xs"
                value={formData.consignee_name}
                onChange={(e) => handleValueChange("consignee_name", e.target.value)}
              />
              <Input
                placeholder="Address"
                className="h-7 text-xs"
                value={formData.consignee_address}
                onChange={(e) => handleValueChange("consignee_address", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-1">
                <Input
                  placeholder="City"
                  className="h-7 text-xs"
                  value={formData.consignee_city}
                  onChange={(e) => handleValueChange("consignee_city", e.target.value)}
                />
                <Input
                  placeholder="State"
                  className="h-7 text-xs"
                  value={formData.consignee_state}
                  onChange={(e) => handleValueChange("consignee_state", e.target.value)}
                />
              </div>
              <Input
                placeholder="Country"
                className="h-7 text-xs"
                value={formData.consignee_country}
                onChange={(e) => handleValueChange("consignee_country", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Product Details Table */}
        <div className="border-2 mb-4 rounded overflow-hidden">
          <div className="grid grid-cols-10 bg-gray-300 text-black font-semibold text-center p-3">
            <div>S.No</div>
            <div>Code</div>
            <div className="col-span-2">Description</div>
            <div>Carton</div>
            <div>Carton 2</div>
            <div>Total</div>
            <div>PCS</div>
            <div>Gr.Wt</div>
            <div>Net Wt</div>
          </div>
          {formData.details.map((detail, index) => (
            <div key={index} className={`grid grid-cols-10 gap-1 p-2 border-b`}>
              <div className="flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <Input
                className="h-7 text-xs"
                value={detail.code}
                onChange={(e) => handleDetailChange(index, "code", e.target.value)}
              />
              <Input
                className="h-7 text-xs col-span-2"
                value={detail.local_description}
                onChange={(e) => handleDetailChange(index, "local_description", e.target.value)}
              />
              <Input
                className="h-7 text-xs"
                value={detail.carton}
                onChange={(e) => handleDetailChange(index, "carton", e.target.value)}
              />
              <Input
                className="h-7 text-xs"
                value={detail.carton_two}
                onChange={(e) => handleDetailChange(index, "carton_two", e.target.value)}
              />
              <Input
                className="h-7 text-xs"
                value={detail.total_carton}
                onChange={(e) => handleDetailChange(index, "total_carton", e.target.value)}
              />
              <Input
                className="h-7 text-xs"
                value={detail.pcs}
                onChange={(e) => handleDetailChange(index, "pcs", e.target.value)}
              />
              <Input
                className="h-7 text-xs"
                value={detail.gr_wt}
                onChange={(e) => handleDetailChange(index, "gr_wt", e.target.value)}
              />
              <div className="flex gap-1">
                <Input
                  className="h-7 text-xs flex-1"
                  value={detail.net_weight}
                  onChange={(e) => handleDetailChange(index, "net_weight", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 w-7 p-0 print:hidden"
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
          className="mb-4 print:hidden hover:bg-gray-300"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product Row
        </Button>

        {/* Enhanced Additional Information */}
        <div className="grid grid-cols-2 gap-4 p-4 border rounded">
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
          <div>
            <label className="font-semibold">Goods Description:</label>
            <Input
              className="mt-1"
              value={formData.goods_description}
              onChange={(e) => handleValueChange("goods_description", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Total Bales:</label>
            <Input
              className="mt-1"
              value={formData.total_bales}
              onChange={(e) => handleValueChange("total_bales", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs border-t pt-4">
          <p>This is a computer generated invoice and does not require signature</p>
          <p className="mt-1">For any queries, please contact us at info@moderntextiles.com</p>
        </div>
      </div>
    </div>
  );
};

export default CICustom;
