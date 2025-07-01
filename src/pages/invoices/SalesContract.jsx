import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/ApiAuthContext";
import { useToast } from "../../components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Save, Download, Plus, Trash2 } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import api from "../../lib/api";

const SalesContract = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    contract_number: "",
    date: new Date().toISOString().split("T")[0],
    payment_terms: "",
    delivery_terms: "",
    buyer_name: "",
    buyer_address: "",
    buyer_city: "",
    buyer_country: "",
    seller_name: "Modern Textiles",
    seller_address: "496-D Peoples Colony Faisalabad Pakistan",
    contract_value: "",
    currency: "USD",
    delivery_date: "",
    port_of_loading: "",
    port_of_discharge: "",
    terms_conditions: "",
    details: [
      {
        description: "",
        quality: "",
        quantity: "",
        rate: "",
        amount: "",
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
          description: "",
          quality: "",
          quantity: "",
          rate: "",
          amount: "",
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
      (client) => client.name === formData.buyer_name
    )?.id;

    const payload = {
      client_id: selectedClientId,
      details: formData.details,
      ...formData,
    };

    try {
      const response = await api.post("/contracts/store", payload);
      toast({
        title: "Success",
        description: "Sales contract saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save sales contract",
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
          <CardTitle>Sales Contract</CardTitle>
          <CardDescription>
            Create a comprehensive sales contract document
          </CardDescription>
          <div className="flex gap-2">
            <Button onClick={submitData} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Contract
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Contract Form */}
      <div className="p-6 print:p-0 text-sm print:text-[12px]">
        {/* Company Header */}
        <div className="text-center py-5 border-b-2 border-gray-800 mb-6">
          <h1 className="text-3xl font-bold">Modern Textiles</h1>
          <p className="text-lg">496-D Peoples Colony Faisalabad Pakistan</p>
          <p className="text-sm">Phone: +92-41-2345678 | Email: info@moderntextiles.com</p>
        </div>

        {/* Contract Title */}
        <div className="text-center py-4 mb-6">
          <h2 className="text-2xl font-bold">SALES CONTRACT</h2>
        </div>

        {/* Contract Details */}
        <div className="grid grid-cols-2 gap-6 mb-6 p-4 border-2 border-gray-800">
          <div>
            <label className="font-semibold">Contract Number:</label>
            <Input
              className="mt-1 h-8"
              value={formData.contract_number}
              onChange={(e) => handleValueChange("contract_number", e.target.value)}
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
        </div>

        {/* Parties Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border-2 border-gray-800 p-4">
            <h3 className="font-bold mb-3 text-center bg-blue-900 p-2">SELLER</h3>
            <div className="space-y-2">
              <div>
                <label className="font-semibold">Company Name:</label>
                <Input
                  className="mt-1 h-7"
                  value={formData.seller_name}
                  onChange={(e) => handleValueChange("seller_name", e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold">Address:</label>
                <Textarea
                  className="mt-1 h-16"
                  value={formData.seller_address}
                  onChange={(e) => handleValueChange("seller_address", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="border-2 border-gray-800 p-4">
            <h3 className="font-bold mb-3 text-center bg-green-900 p-2">BUYER</h3>
            <div className="space-y-2">
              <div>
                <label className="font-semibold">Company Name:</label>
                <Input
                  className="mt-1 h-7"
                  placeholder="Buyer Company Name"
                  value={formData.buyer_name}
                  onChange={(e) => handleValueChange("buyer_name", e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold">Address:</label>
                <Input
                  className="mt-1 h-7"
                  placeholder="Address"
                  value={formData.buyer_address}
                  onChange={(e) => handleValueChange("buyer_address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold">City:</label>
                  <Input
                    className="mt-1 h-7"
                    placeholder="City"
                    value={formData.buyer_city}
                    onChange={(e) => handleValueChange("buyer_city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold">Country:</label>
                  <Input
                    className="mt-1 h-7"
                    placeholder="Country"
                    value={formData.buyer_country}
                    onChange={(e) => handleValueChange("buyer_country", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Terms */}
        <div className="grid grid-cols-2 gap-6 mb-6 p-4 border border-gray-400">
          <div>
            <label className="font-semibold">Payment Terms:</label>
            <Input
              className="mt-1 h-8"
              placeholder="e.g., 30% advance, 70% on delivery"
              value={formData.payment_terms}
              onChange={(e) => handleValueChange("payment_terms", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Delivery Terms:</label>
            <Input
              className="mt-1 h-8"
              placeholder="e.g., FOB, CIF, CFR"
              value={formData.delivery_terms}
              onChange={(e) => handleValueChange("delivery_terms", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Delivery Date:</label>
            <Input
              type="date"
              className="mt-1 h-8"
              value={formData.delivery_date}
              onChange={(e) => handleValueChange("delivery_date", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Currency:</label>
            <Input
              className="mt-1 h-8"
              value={formData.currency}
              onChange={(e) => handleValueChange("currency", e.target.value)}
            />
          </div>
        </div>

        {/* Shipping Details */}
        <div className="grid grid-cols-2 gap-6 mb-6 p-4 border border-gray-400">
          <div>
            <label className="font-semibold">Port of Loading:</label>
            <Input
              className="mt-1 h-8"
              placeholder="e.g., Karachi Port"
              value={formData.port_of_loading}
              onChange={(e) => handleValueChange("port_of_loading", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Port of Discharge:</label>
            <Input
              className="mt-1 h-8"
              placeholder="e.g., New York Port"
              value={formData.port_of_discharge}
              onChange={(e) => handleValueChange("port_of_discharge", e.target.value)}
            />
          </div>
        </div>

        {/* Product Details Table */}
        <div className="border-2 border-gray-800 mb-4">
          <div className="grid grid-cols-6 font-semibold text-center p-2 border-b border-gray-800">
            <div>Description of Goods</div>
            <div>Quality/Specification</div>
            <div>Quantity</div>
            <div>Rate per Unit</div>
            <div>Amount</div>
            <div>Action</div>
          </div>
          {formData.details.map((detail, index) => (
            <div key={index} className="grid grid-cols-6 gap-1 p-1 border-b border-gray-300">
              <Input
                className="h-8 text-xs"
                placeholder="Product description"
                value={detail.description}
                onChange={(e) => handleDetailChange(index, "description", e.target.value)}
              />
              <Input
                className="h-8 text-xs"
                placeholder="Quality specs"
                value={detail.quality}
                onChange={(e) => handleDetailChange(index, "quality", e.target.value)}
              />
              <Input
                className="h-8 text-xs"
                placeholder="Qty"
                value={detail.quantity}
                onChange={(e) => handleDetailChange(index, "quantity", e.target.value)}
              />
              <Input
                className="h-8 text-xs"
                placeholder="Rate"
                value={detail.rate}
                onChange={(e) => handleDetailChange(index, "rate", e.target.value)}
              />
              <Input
                className="h-8 text-xs"
                placeholder="Amount"
                value={detail.amount}
                onChange={(e) => handleDetailChange(index, "amount", e.target.value)}
              />
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0 print:hidden"
                onClick={() => deleteProductRow(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={addProductRow}
          className="mb-4 print:hidden"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>

        {/* Contract Value */}
        <div className="p-4 border border-gray-400 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Total Contract Value:</label>
              <Input
                className="mt-1 h-8"
                placeholder="Total amount"
                value={formData.contract_value}
                onChange={(e) => handleValueChange("contract_value", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6">
          <label className="font-semibold">Terms and Conditions:</label>
          <Textarea
            className="mt-1 h-32"
            placeholder="Enter detailed terms and conditions..."
            value={formData.terms_conditions}
            onChange={(e) => handleValueChange("terms_conditions", e.target.value)}
          />
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-12 mt-12">
          <div className="text-center">
            <div className="border-t-2 border-gray-800 pt-2 mt-16">
              <p className="font-semibold">SELLER'S SIGNATURE</p>
              <p className="text-sm">Modern Textiles</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-800 pt-2 mt-16">
              <p className="font-semibold">BUYER'S SIGNATURE</p>
              <p className="text-sm">{formData.buyer_name || "Buyer Name"}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>This contract is valid and binding upon both parties.</p>
          <p>Any disputes shall be resolved through arbitration.</p>
        </div>
      </div>
    </div>
  );
};

export default SalesContract;