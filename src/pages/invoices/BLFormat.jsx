import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/ApiAuthContext";
import { useToast } from "../../components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Save, Download, Plus, Trash2 } from "lucide-react";
import api from "../../lib/api";

const BLFormat = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    bl_number: "",
    date: new Date().toISOString().split("T")[0],
    vessel_name: "",
    voyage_number: "",
    port_of_loading: "",
    port_of_discharge: "",
    shipper_name: "Modern Textiles",
    shipper_address: "496-D Peoples Colony Faisalabad Pakistan",
    consignee_name: "",
    consignee_address: "",
    notify_party: "",
    notify_address: "",
    container_numbers: "",
    seal_numbers: "",
    marks_numbers: "",
    description_of_goods: "",
    gross_weight: "",
    measurement: "",
    freight_terms: "",
    number_of_packages: "",
    details: [
      {
        container_no: "",
        seal_no: "",
        marks: "",
        packages: "",
        description: "",
        weight: "",
        measurement: "",
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

  const addContainerRow = () => {
    setFormData((prevData) => ({
      ...prevData,
      details: [
        ...prevData.details,
        {
          container_no: "",
          seal_no: "",
          marks: "",
          packages: "",
          description: "",
          weight: "",
          measurement: "",
        },
      ],
    }));
  };

  const deleteContainerRow = (index) => {
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
      const response = await api.post("/bill-of-lading/store", payload);
      toast({
        title: "Success",
        description: "Bill of Lading saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Bill of Lading",
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
          <CardTitle>Bill of Lading</CardTitle>
          <CardDescription>
            Create a Bill of Lading document for shipping
          </CardDescription>
          <div className="flex gap-2">
            <Button onClick={submitData} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Bill of Lading
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Bill of Lading Form */}
      <div className="p-6 print:p-0 text-xs print:text-[10px]">
        {/* Header */}
        <div className="text-center py-4 border-b-2 border-gray-800 mb-4">
          <h1 className="text-2xl font-bold">BILL OF LADING</h1>
          <p className="text-sm mt-2">Ocean Transportation Document</p>
        </div>

        {/* B/L Details */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 border-2 border-gray-800">
          <div>
            <label className="font-semibold">B/L Number:</label>
            <Input
              className="mt-1 h-7"
              value={formData.bl_number}
              onChange={(e) => handleValueChange("bl_number", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Date:</label>
            <Input
              type="date"
              className="mt-1 h-7"
              value={formData.date}
              onChange={(e) => handleValueChange("date", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Freight Terms:</label>
            <Input
              className="mt-1 h-7"
              placeholder="PREPAID/COLLECT"
              value={formData.freight_terms}
              onChange={(e) => handleValueChange("freight_terms", e.target.value)}
            />
          </div>
        </div>

        {/* Vessel Information */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 border border-gray-400">
          <div>
            <label className="font-semibold">Vessel Name:</label>
            <Input
              className="mt-1 h-7"
              value={formData.vessel_name}
              onChange={(e) => handleValueChange("vessel_name", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Voyage Number:</label>
            <Input
              className="mt-1 h-7"
              value={formData.voyage_number}
              onChange={(e) => handleValueChange("voyage_number", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Number of Packages:</label>
            <Input
              className="mt-1 h-7"
              value={formData.number_of_packages}
              onChange={(e) => handleValueChange("number_of_packages", e.target.value)}
            />
          </div>
        </div>

        {/* Ports Information */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="border-2 border-gray-800 p-3">
            <h3 className="font-semibold mb-2 text-center bg-blue-900 p-1">PORT OF LOADING</h3>
            <Input
              className="h-7"
              placeholder="Port of Loading"
              value={formData.port_of_loading}
              onChange={(e) => handleValueChange("port_of_loading", e.target.value)}
            />
          </div>
          <div className="border-2 border-gray-800 p-3">
            <h3 className="font-semibold mb-2 text-center bg-green-900 p-1">PORT OF DISCHARGE</h3>
            <Input
              className="h-7"
              placeholder="Port of Discharge"
              value={formData.port_of_discharge}
              onChange={(e) => handleValueChange("port_of_discharge", e.target.value)}
            />
          </div>
        </div>

        {/* Parties Information */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Shipper */}
            <div className="border-2 border-gray-800 p-3">
              <h3 className="font-semibold mb-2 text-center bg-yellow-900 p-1">SHIPPER</h3>
              <div className="space-y-1">
                <Input
                  className="h-6 text-xs"
                  value={formData.shipper_name}
                  onChange={(e) => handleValueChange("shipper_name", e.target.value)}
                />
                <Textarea
                  className="h-16 text-xs"
                  value={formData.shipper_address}
                  onChange={(e) => handleValueChange("shipper_address", e.target.value)}
                />
              </div>
            </div>

            {/* Consignee */}
            <div className="border-2 border-gray-800 p-3">
              <h3 className="font-semibold mb-2 text-center bg-red-900 p-1">CONSIGNEE</h3>
              <div className="space-y-1">
                <Input
                  className="h-6 text-xs"
                  placeholder="Consignee Name"
                  value={formData.consignee_name}
                  onChange={(e) => handleValueChange("consignee_name", e.target.value)}
                />
                <Textarea
                  className="h-16 text-xs"
                  placeholder="Consignee Address"
                  value={formData.consignee_address}
                  onChange={(e) => handleValueChange("consignee_address", e.target.value)}
                />
              </div>
            </div>

            {/* Notify Party */}
            <div className="border-2 border-gray-800 p-3">
              <h3 className="font-semibold mb-2 text-center bg-purple-900 p-1">NOTIFY PARTY</h3>
              <div className="space-y-1">
                <Input
                  className="h-6 text-xs"
                  placeholder="Notify Party Name"
                  value={formData.notify_party}
                  onChange={(e) => handleValueChange("notify_party", e.target.value)}
                />
                <Textarea
                  className="h-16 text-xs"
                  placeholder="Notify Party Address"
                  value={formData.notify_address}
                  onChange={(e) => handleValueChange("notify_address", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Container Details Table */}
        <div className="border-2 border-gray-800 mb-4">
          <div className="grid grid-cols-7 font-semibold text-center p-2 border-b border-gray-800">
            <div>Container No.</div>
            <div>Seal No.</div>
            <div>Marks & Numbers</div>
            <div>No. of Packages</div>
            <div>Description of Goods</div>
            <div>Gross Weight</div>
            <div>Measurement</div>
          </div>
          {formData.details.map((detail, index) => (
            <div key={index} className="grid grid-cols-7 gap-1 p-1 border-b border-gray-300">
              <Input
                className="h-6 text-xs"
                value={detail.container_no}
                onChange={(e) => handleDetailChange(index, "container_no", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.seal_no}
                onChange={(e) => handleDetailChange(index, "seal_no", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.marks}
                onChange={(e) => handleDetailChange(index, "marks", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.packages}
                onChange={(e) => handleDetailChange(index, "packages", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.description}
                onChange={(e) => handleDetailChange(index, "description", e.target.value)}
              />
              <Input
                className="h-6 text-xs"
                value={detail.weight}
                onChange={(e) => handleDetailChange(index, "weight", e.target.value)}
              />
              <div className="flex gap-1">
                <Input
                  className="h-6 text-xs flex-1"
                  value={detail.measurement}
                  onChange={(e) => handleDetailChange(index, "measurement", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 w-6 p-0 print:hidden"
                  onClick={() => deleteContainerRow(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={addContainerRow}
          className="mb-4 print:hidden"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Container
        </Button>

        {/* Summary Information */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-3 border border-gray-400">
          <div>
            <label className="font-semibold">Total Gross Weight:</label>
            <Input
              className="mt-1 h-7"
              value={formData.gross_weight}
              onChange={(e) => handleValueChange("gross_weight", e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">Total Measurement:</label>
            <Input
              className="mt-1 h-7"
              value={formData.measurement}
              onChange={(e) => handleValueChange("measurement", e.target.value)}
            />
          </div>
        </div>

        {/* Marks and Numbers */}
        <div className="mb-4">
          <label className="font-semibold">Marks and Numbers:</label>
          <Textarea
            className="mt-1 h-20"
            value={formData.marks_numbers}
            onChange={(e) => handleValueChange("marks_numbers", e.target.value)}
          />
        </div>

        {/* Description of Goods */}
        <div className="mb-6">
          <label className="font-semibold">Description of Goods:</label>
          <Textarea
            className="mt-1 h-24"
            value={formData.description_of_goods}
            onChange={(e) => handleValueChange("description_of_goods", e.target.value)}
          />
        </div>

        {/* Footer Clauses */}
        <div className="text-xs space-y-2 mb-6 p-3 border border-gray-400">
          <p className="font-semibold">CLAUSES:</p>
          <p>1. This Bill of Lading is subject to the terms and conditions on the reverse side.</p>
          <p>2. The goods must be taken delivery of within the prescribed time limit.</p>
          <p>3. All claims must be made in writing within the time specified.</p>
          <p>4. This B/L is non-negotiable unless consigned "TO ORDER".</p>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-12 mt-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-800 pt-2 mt-12">
              <p className="font-semibold">FREIGHT & CHARGES</p>
              <p className="text-xs">As per tariff</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-800 pt-2 mt-12">
              <p className="font-semibold">CARRIER'S SIGNATURE</p>
              <p className="text-xs">Master or Agent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BLFormat;