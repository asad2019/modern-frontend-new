
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/ApiAuthContext";
import { useParams } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import PageLoader from "../../components/common/PageLoader";
import api from "../../lib/api";

const ClientInvoice = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  const fetchInvoice = async (invoiceId) => {
    setLoading(true);
    try {
      const response = await api.get(`/invoice/by/id/${invoiceId}`);
      const data = response?.data?.data;
      if (data) {
        setFormData(data);
      } else {
        toast({
          title: "Error",
          description: "No data found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Error fetching invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <PageLoader type="form" />;
  }

  if (!formData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No invoice selected or found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>
            View and print invoice details
          </CardDescription>
          <Button onClick={handlePrint} className="w-fit">
            <Download className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </CardHeader>
      </Card>

      <div className="p-6 print:p-0">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-gray-800 p-4 space-y-2">
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Invoice Number:</span>
                  <span>{formData?.invoice_number || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Date:</span>
                  <span>{formData?.date || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Payment Terms:</span>
                  <span>{formData?.payment_terms || "N/A"}</span>
                </div>
              </div>
              <div className="border-2 border-l-0 border-gray-800 p-4 space-y-2">
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Shipment:</span>
                  <span>{formData?.shipment || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">Buyer PO:</span>
                  <span>{formData?.buyer_po || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold">GD Number:</span>
                  <span>{formData?.gd_number || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="border-2 border-t-0 border-gray-800 p-4">
              <div className="grid grid-cols-2 border-b-2 border-gray-800 pb-2 mb-2">
                <span className="font-semibold">Discharge Port:</span>
                <span>{formData?.discharge_port || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="font-semibold">Goods Description:</span>
                <span>{formData?.goods_description || "N/A"}</span>
              </div>
            </div>
          </div>
          
          <div className="border-2 border-l-0 border-gray-800 p-4 space-y-2">
            <div className="grid grid-cols-2">
              <span className="font-semibold">Shipping Marks:</span>
              <span>{formData?.shippment_marks || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold">Quantity:</span>
              <span>{formData?.quantity || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold">Gr.Wt:</span>
              <span>{formData?.gr_wt || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold">Net Wt:</span>
              <span>{formData?.net_wt || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold">Container Number:</span>
              <span>{formData?.container_number || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="font-semibold">Total Bales:</span>
              <span>{formData?.total_bales || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Invoice Details Table */}
        {formData?.invoice_details && formData.invoice_details.length > 0 && (
          <div className="mt-6 border-2 border-gray-800">
            <div className="grid grid-cols-11 gap-2 p-3 font-semibold border-b-2 border-gray-800 text-xs">
              <div>Item Code</div>
              <div className="col-span-2 text-center">Description</div>
              <div className="text-center">Carton</div>
              <div className="text-center">Carton No.</div>
              <div className="text-center">Total Carton</div>
              <div className="text-center">Pcs</div>
              <div className="text-center">Quantity</div>
              <div className="text-center">Gr.wt</div>
              <div className="text-center">Net.wt</div>
              <div className="text-center">Price Unit</div>
            </div>
            
            {formData.invoice_details.map((item, index) => (
              <div key={index} className="grid grid-cols-11 gap-2 p-2 border-b border-gray-300 text-xs">
                <div>{item.code || "-"}</div>
                <div className="col-span-2 text-center">{item.description || "-"}</div>
                <div className="text-center">{item.carton || "-"}</div>
                <div className="text-center">{item.carton_two || "-"}</div>
                <div className="text-center">{item.total_carton || "-"}</div>
                <div className="text-center">{item.pcs || "-"}</div>
                <div className="text-center">{item.quantity || "-"}</div>
                <div className="text-center">{item.gr_wt || "-"}</div>
                <div className="text-center">{item.net_weight || "-"}</div>
                <div className="text-center">{item.price_unit || "-"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientInvoice;
