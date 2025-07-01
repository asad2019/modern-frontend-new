
import React, { useEffect, useState } from "react";
import SheetInput from "../../components/ui/SheetInput";
import { useAuth } from "../../contexts/ApiAuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Trash2, Plus, Download, Save } from "lucide-react";
import api from "../../lib/api";

const CIC = () => {
  const initialFormData = {
    consignee_name: "",
    shipper: "",
    address: "",
    country: "",
    details: [],
    invoice_number: "",
    date: "",
    gd_number: "",
    payment_terms: "",
    shipment: "",
    buyer_po: "",
    shippment_marks: "",
    article_number: "",
    quantity: "",
    gr_wt: "",
    net_wt: "",
    discharge_port: "",
    container_number: "",
    goods_description: "",
    total_bales: "",
    tel: "+92-321-2438974",
    fax: "+02-41-8812081",
    email: "awais.nasir@gmail.com",
    url: "www.modewe.com",
  };

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("cicFormData");
    return savedData ? JSON.parse(savedData) : initialFormData;
  });
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [totals, setTotals] = useState({ totalQuantity: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const response = await api.get('/client/list');
      setClients(response.data?.data || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async (clientId) => {
    try {
      const response = await api.get(`/product/show/by/client/${clientId}`);
      setProducts(response.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    localStorage.setItem("cicFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    calculateTotals();
  }, [formData.details]);

  const calculateTotals = () => {
    const newTotals = formData.details.reduce(
      (acc, detail) => {
        acc.totalQuantity += parseFloat(detail.quantity || 0);
        acc.totalPrice += parseFloat(detail.total_price || 0);
        return acc;
      },
      { totalQuantity: 0, totalPrice: 0 }
    );
    setTotals(newTotals);
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      fetchProducts(selectedClient.id);
      setFormData({
        ...initialFormData,
        consignee_name: selectedClient.name,
        address: selectedClient.address,
        city: selectedClient.city,
        state: selectedClient.state,
        country: selectedClient.country,
        details: [{
          code: "",
          local_description: "",
          quantity: "",
          price_unit: "",
          total_price: "",
        }],
      });
    }
  };

  const handleProductChange = (productId, index) => {
    const selectedProduct = products.find(product => product.id === productId);
    const newDetails = [...formData.details];
    
    if (selectedProduct) {
      newDetails[index] = {
        code: selectedProduct.code,
        local_description: selectedProduct.local_description,
        quantity: "",
        price_unit: "",
        total_price: "",
      };
    }
    
    setFormData({ ...formData, details: newDetails });
  };

  const handleInputChange = (index, field, value) => {
    const newDetails = [...formData.details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };

    // Calculate total price
    if (field === "quantity" || field === "price_unit") {
      const quantity = parseFloat(newDetails[index].quantity || 0);
      const priceUnit = parseFloat(newDetails[index].price_unit || 0);
      newDetails[index].total_price = (quantity * priceUnit).toFixed(2);
    }

    setFormData({ ...formData, details: newDetails });
  };

  const handleValueChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const addProductRow = () => {
    setFormData((prevData) => ({
      ...prevData,
      details: [
        ...prevData.details,
        {
          code: "",
          local_description: "",
          quantity: "",
          price_unit: "",
          total_price: "",
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
    try {
      const selectedClient = clients.find(client => client.name === formData.consignee_name);
      const payload = {
        client_id: selectedClient?.id,
        details: formData.details,
        ...formData,
      };

      await api.post('/invoice/store', payload);
      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getAvailableProducts = (index) => {
    const selectedCodes = formData.details.map((detail) => detail.code);
    return products.filter(
      (product) =>
        !selectedCodes.includes(product.code) ||
        product.code === formData.details[index]?.code
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:max-w-none">
      {/* Header */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Commercial Invoice</CardTitle>
          <CardDescription>
            Create a commercial invoice for your shipment
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
      <div className="p-6 print:p-0">
        {/* Company Header */}
        <div className="text-center py-5 border-b-2 border-gray-800 mb-6">
          <h1 className="text-3xl font-bold">Modern Textiles</h1>
          <p className="text-lg">496-D Peoples Colony Faisalabad</p>
        </div>

        {/* Invoice Title */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-semibold">Commercial Invoice</h2>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-3 gap-6 border-2 border-gray-800">
          {/* Left Section */}
          <div className="col-span-2 border-r-2 border-gray-800 p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="font-semibold">Invoice #:</label>
                  <SheetInput
                    value={formData.invoice_number}
                    onChange={(e) => handleValueChange("invoice_number", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="font-semibold">Date:</label>
                  <SheetInput
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleValueChange("date", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="font-semibold">Payment Terms:</label>
                  <SheetInput
                    value={formData.payment_terms}
                    onChange={(e) => handleValueChange("payment_terms", e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="font-semibold">Buyer:</label>
                  <SheetInput
                    value={formData.shipment}
                    onChange={(e) => handleValueChange("shipment", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="font-semibold">Po#:</label>
                  <SheetInput
                    value={formData.buyer_po}
                    onChange={(e) => handleValueChange("buyer_po", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="font-semibold">GD#:</label>
                  <SheetInput
                    value={formData.gd_number}
                    onChange={(e) => handleValueChange("gd_number", e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            <div className="border-y-2 border-gray-800 py-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="font-semibold">Shipment:</label>
                  <SheetInput
                    value={formData.shipment}
                    onChange={(e) => handleValueChange("shipment", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-2">
                  <label className="font-semibold">Discharge Port:</label>
                  <SheetInput
                    value={formData.discharge_port}
                    onChange={(e) => handleValueChange("discharge_port", e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Buyer Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="font-semibold">Buyer:</label>
                <div className="col-span-2">
                  <Select onValueChange={handleClientChange} value="">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="font-semibold">Buyer Address:</label>
                <div className="col-span-2">
                  <SheetInput
                    value={formData.address}
                    onChange={(e) => handleValueChange("address", e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 items-center gap-2">
              <label className="font-semibold text-sm">Shipping Marks & No:</label>
              <SheetInput
                value={formData.shippment_marks}
                onChange={(e) => handleValueChange("shippment_marks", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <label className="font-semibold text-sm">Bale No.:</label>
              <SheetInput
                value={formData.total_bales}
                onChange={(e) => handleValueChange("total_bales", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <label className="font-semibold text-sm">Quantity:</label>
              <SheetInput
                value={formData.quantity}
                onChange={(e) => handleValueChange("quantity", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <label className="font-semibold text-sm">Gr.Wt:</label>
              <SheetInput
                value={formData.gr_wt}
                onChange={(e) => handleValueChange("gr_wt", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <label className="font-semibold text-sm">Container #:</label>
              <SheetInput
                value={formData.container_number}
                onChange={(e) => handleValueChange("container_number", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Product Details Table */}
        <div className="border-2 border-t-0 border-gray-800">
          <div className="grid grid-cols-6 gap-2 p-3 font-semibold border-b-2 border-gray-800">
            <div>Item Code</div>
            <div className="col-span-2 text-center">Description</div>
            <div className="text-center">Quantity</div>
            <div className="text-center">Price/Unit US$</div>
            <div className="text-center">Total (US$)</div>
          </div>

          {formData.details.map((detail, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 p-2 items-center border-b border-gray-300">
              <Select 
                onValueChange={(value) => handleProductChange(value, index)}
                value={detail.code || ""}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableProducts(index).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="col-span-2 text-center text-sm">
                {detail.local_description}
              </div>

              <SheetInput
                type="number"
                value={detail.quantity || ""}
                onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
                className="h-8 text-center"
              />

              <div className="flex items-center gap-1">
                <span className="text-sm">$</span>
                <SheetInput
                  type="number"
                  value={detail.price_unit || ""}
                  onChange={(e) => handleInputChange(index, "price_unit", e.target.value)}
                  className="h-8"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">$</span>
                <span>{detail.total_price || "0.00"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteProductRow(index)}
                  className="h-6 w-6 p-0 print:hidden"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="p-2 print:hidden">
            <Button onClick={addProductRow} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-800 p-4">
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-3"></div>
              <div className="text-center font-semibold">
                Total Qty: {totals.totalQuantity}
              </div>
              <div></div>
              <div className="text-center font-semibold">
                Total: ${totals.totalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CIC;
