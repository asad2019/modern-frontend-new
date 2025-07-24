import React, { useEffect, useRef, useState } from "react";
import SheetInput from "../../components/ui/SheetInput";
import { useAuth } from "../../contexts/ApiAuthContext";
import Select from "react-dropdown-select";
import { useToast } from "../../components/ui/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Trash2 } from "lucide-react";
import api from "../../lib/api";

const PLCus = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

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
    hs_code: "",
    total_bales: "",
    tel: "+92-321-2438974",
    fax: "+02-41-8812081",
    email: "awais.nasir@gmail.com",
    url: "www.modewe.com",
  };

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("plcus_formData");
    return savedData ? JSON.parse(savedData) : initialFormData;
  });

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("plcus_products");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    localStorage.setItem("plcus_formData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem("plcus_products", JSON.stringify(products));
  }, [products]);

  const handleClientChange = (selected) => {
    const selectedClientName = selected[0]?.value;
    const selectedClient = clients.find(
      (client) => client.name === selectedClientName
    );

    if (selectedClient) {
      fetchProducts(selectedClient.id);
      setFormData({
        consignee_name: selectedClientName,
        address: selectedClient.address,
        city: selectedClient.city,
        state: selectedClient.state,
        country: selectedClient.country,
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
        tel: "+92-321-2438974",
        fax: "+02-41-8812081",
        email: "awais.nasir@gmail.com",
        url: "www.modewe.com",
      });
      setProducts([]);
      localStorage.removeItem("plcus_formData");
      localStorage.removeItem("plcus_products");
    }
  };

  const fetchProducts = async (clientId) => {
    try {
      const response = await api.get(`/products/client/${clientId}`);
      setProducts(response.data || []);
      setFormData((prevData) => ({
        ...prevData,
        details:
          prevData.details.length > 0
            ? prevData.details
            : (response.data || []).map(() => ({
                code: "",
                local_description: "",
                carton: "",
                carton_two: "",
                total_carton: "",
                pcs: "",
                quantity: "",
                gr_wt: "",
                net_weight: "",
              })),
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProductChange = (selectedOption, index) => {
    const newDetails = [...formData.details];

    if (selectedOption.length > 0) {
      const selectedProduct = products.find(
        (product) => product.id === selectedOption[0].value
      );

      if (selectedProduct) {
        newDetails[index] = {
          code: selectedProduct.code,
          local_description: selectedProduct.local_description,
          carton: "",
          carton_two: "",
          total_carton: "",
          pcs: "",
          quantity: "",
          gr_wt: "",
          net_weight: "",
        };
      }
    } else {
      newDetails[index] = {
        code: "",
        local_description: "",
        carton: "",
        carton_two: "",
        total_carton: "",
        pcs: "",
        quantity: "",
        gr_wt: "",
        net_weight: "",
      };
    }

    setFormData({ ...formData, details: newDetails });
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

  const getAvailableProducts = (index) => {
    const selectedCodes = formData.details.map((detail) => detail.code);
    return products
      .filter(
        (product) =>
          !selectedCodes.includes(product.code) ||
          product.code === formData.details[index]?.code
      )
      .map((product) => ({ value: product.id, label: product.code }));
  };

  const handleInputChange = (index, field, value) => {
    const newDetails = [...formData.details];

    newDetails[index] = {
      ...newDetails[index],
      [field]: value,
    };

    const updateDependentFields = (i) => {
      const carton = newDetails[i].carton || 0;
      const cartonTwo = newDetails[i].carton_two || 0;

      if (field !== "total_carton") {
        const calculatedTotal = cartonTwo - carton + 1;
        newDetails[i].total_carton = calculatedTotal < 0 ? 0 : calculatedTotal;
      }

      if (field !== "quantity" && newDetails[i].pcs) {
        newDetails[i].quantity = newDetails[i].pcs * newDetails[i].total_carton;
      }

      if (newDetails[i].gr_wt) {
        newDetails[i].net_weight =
          newDetails[i].gr_wt - 0.45 * newDetails[i].total_carton;
      }
    };

    if (field === "carton") {
      const currentCarton = parseInt(value, 10) || 0;
      if (index > 0 && newDetails[index - 1]) {
        newDetails[index - 1].carton_two = Math.max(0, currentCarton - 1);
        updateDependentFields(index - 1);
      }
    }

    updateDependentFields(index);
    setFormData({ ...formData, details: newDetails });
  };

  const handleValueChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.details]);

  const calculateTotals = () => {
    const newTotals = formData.details.reduce(
      (acc, detail) => {
        acc.totalCarton += parseFloat(detail.total_carton || 0);
        acc.totalQuantity += parseFloat(detail.quantity || 0);
        acc.totalGrWt += parseFloat(detail.gr_wt || 0);
        acc.totalNetWt += parseFloat(detail.net_weight || 0);
        return acc;
      },
      { totalCarton: 0, totalQuantity: 0, totalGrWt: 0, totalNetWt: 0 }
    );

    setTotals(newTotals);
  };

  const [totals, setTotals] = useState({
    totalCarton: 0,
    totalQuantity: 0,
    totalGrWt: 0,
    totalNetWt: 0,
  });

  // Unified RESTful API for invoices
  const submitData = async () => {
    const selectedClientId = clients.find(
      (client) => client.name === formData.consignee_name
    )?.id;
    const payload = {
      type: "PLCus",
      client_id: selectedClientId,
      date: formData.date,
      details: formData.details,
      remarks: formData.remarks || "",
      ...formData,
    };
    try {
      await api.post('/api/invoices', payload);
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
    }
  };

  // Print invoice
  const handlePrint = () => {
    window.print();
  };

  // Edit invoice
  const editInvoice = async (id, updatedData) => {
    try {
      await api.put(`/api/invoices/${id}`, updatedData);
      toast({
        title: "Success",
        description: "Packing list updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update packing list",
        variant: "destructive",
      });
    }
  };

  // View invoice
  const viewInvoice = async (id) => {
    try {
      const response = await api.get(`/api/invoices/${id}`);
      setFormData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch packing list",
        variant: "destructive",
      });
    }
  };

  const dateValue = formData?.date ? new Date(formData.date) : null;

  return (
    <div
      className="grid grid-cols-1 text-xs print:p-10 p-3"
      id="container"
    >
      <div className="text-center py-5 m-auto">
        <h1 className="text-3xl font-bold">Modern Textiles</h1>
        <p className="text-lg">496-D Peoples Colony Faisalabad Pakistan</p>
      </div>

      <div className="grid grid-cols-1">
        <div className="font-semibold text-center py-2">
          <span>Packing List (US Format)</span>
          <div className="flex items-center gap-x-2 float-right">
            <button
              className="float-right border-2 px-2 py-1 rounded-sm no-print"
              onClick={handlePrint}
            >
              Download PDF
            </button>
            <button
              className="float-right border-2 px-2 py-1 rounded-sm print:hidden"
              onClick={submitData}
            >
              Save Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 border-2 border-b-0">
          {/* Consignee Section */}
          <div className="flex flex-col px-3 gap-y-1">
            <div className="grid grid-cols-2 items-center print:mt-1">
              <div className="font-semibold">Consignee:</div>
              <Select
                searchable
                options={clients.map((client) => ({
                  value: client.name,
                  label: client.name,
                }))}
                placeholder=""
                onChange={(selected) => handleClientChange(selected)}
                values={
                  formData.consignee_name
                    ? [
                        {
                          value: formData.consignee_name,
                          label: formData.consignee_name,
                        },
                      ]
                    : []
                }
                className="!h-8 print:!h-6 cursor-pointer mt-1 print:!border-none print:placeholder-opacity-0 flex items-center"
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div></div>
              <div className="flex flex-col gap-y-3">
                <p>{formData.address || "---"}</p>
                <p>{formData.city}</p>
                <p>
                  {formData.state || "---"} {formData.country || "---"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 items-start">
              <div className="pt-2 font-semibold">Shipper:</div>
              <div className="flex flex-col gap-y-3 mt-2">
                <span>Modern Textiles</span>
                <span>496-D Peoples Colony</span>
                <span>Faisalabad Pakistan</span>
              </div>
            </div>
          </div>

          {/* Invoice Section */}
          <div className="flex flex-col border-x-2 px-3 gap-y-1">
            <div className="grid grid-cols-2 items-center print:mt-2">
              <div className="font-semibold">Invoice No.</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.invoice_number}
                onChange={(e) =>
                  handleValueChange("invoice_number", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="font-semibold">Date:</div>
              <DatePicker
                className="!h-8 print:!h-6 pl-2 outline-none w-full border"
                selected={dateValue}
                onChange={(date) =>
                  handleValueChange("date", date.toISOString().split("T")[0])
                }
                dateFormat="dd-MM-yyyy"
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="font-semibold">GD#:</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.gd_number}
                onChange={(e) => handleValueChange("gd_number", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 items-center mt-7">
              <div className="font-semibold">Payment Term:</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.payment_terms}
                onChange={(e) =>
                  handleValueChange("payment_terms", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="font-semibold">Shipment:</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.shipment}
                onChange={(e) => handleValueChange("shipment", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="font-semibold">Buyer PO:</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.buyer_po}
                onChange={(e) => handleValueChange("buyer_po", e.target.value)}
              />
            </div>
          </div>

          {/* Shipping Details Section */}
          <div className="flex flex-col gap-y-1 px-3">
            <div className="grid grid-cols-2 items-center print:mt-2">
              <div className="font-semibold whitespace-nowrap">
                Shipping Marks&No.
              </div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.shippment_marks}
                onChange={(e) =>
                  handleValueChange("shippment_marks", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="font-semibold">Article#:</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.article_number}
                onChange={(e) =>
                  handleValueChange("article_number", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="font-semibold">Quantity:</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.quantity}
                onChange={(e) => handleValueChange("quantity", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="font-semibold">Gr.Wt:</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.gr_wt}
                onChange={(e) => handleValueChange("gr_wt", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 items-center">
              <div className="font-semibold">Net Wt:</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.net_wt}
                onChange={(e) => handleValueChange("net_wt", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 border-x-2">
          <div className="grid grid-cols-4 col-span-4 items-center border-r-2 border-t-2">
            <div className="pl-2 font-semibold py-1">Discharge Port:</div>
            <SheetInput
              className="!h-7 print:!h-4 col-span-3"
              value={formData.discharge_port}
              onChange={(e) =>
                handleValueChange("discharge_port", e.target.value)
              }
            />
          </div>
          <div className="col-start-5 col-span-2 items-center border-t-2">
            <div className="grid grid-cols-2 items-center px-3 py-1">
              <div className="font-semibold">Container #</div>
              <SheetInput
                className="!h-7 print:!h-4"
                value={formData.container_number}
                onChange={(e) =>
                  handleValueChange("container_number", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-x-5 border-2">
          <div className="col-span-6 grid grid-cols-6 items-center px-3 py-1">
            <div className="col-span-1 font-semibold whitespace-nowrap">
              Description of Goods:
            </div>
            <SheetInput
              className="!h-7 col-span-2"
              value={formData.goods_description}
              onChange={(e) =>
                handleValueChange("goods_description", e.target.value)
              }
            />
          </div>
          <div className="col-span-6 grid grid-cols-6 items-center px-3 py-1">
            <div className="col-span-1 font-semibold whitespace-nowrap">
              HS Code:
            </div>
            <SheetInput
              className="!h-7 print:!h-5 col-span-2"
              value={formData.hs_code}
              onChange={(e) => handleValueChange("hs_code", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-6 gap-x-5 border-2 border-t-0">
          <div className="col-span-3 grid grid-cols-3 items-center px-3 py-1">
            <div className="font-semibold">Total Bales/Cartons:</div>
            <SheetInput
              type="number"
              className="!h-7 print:!h-4 col-span-2"
              value={formData.total_bales}
              onChange={(e) => handleValueChange("total_bales", e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Product Rows */}
        <div className="grid grid-cols-1 border-2 border-t-0 text-xs gap-y-1">
          <div className="grid grid-cols-11 px-3 font-semibold gap-x-5 border-b-2 py-2">
            <div className="whitespace-nowrap">Item Code</div>
            <div className="col-span-2 text-center whitespace-nowrap font-semibold">
              Description
            </div>
            <div className="text-center whitespace-nowrap font-semibold">
              Construction
            </div>
            <div className="text-center whitespace-nowrap font-semibold">
              Carton#
            </div>
            <div className="text-center whitespace-nowrap font-semibold">
              Total Carton
            </div>
            <div className="text-center whitespace-nowrap font-semibold">
              Pcs/Box
            </div>
            <div className="text-center whitespace-nowrap font-semibold">
              Quantity
            </div>
            <div className="text-center whitespace-nowrap font-semibold">
              Gr.Wt kg
            </div>
            <div className="text-center whitespace-nowrap font-semibold">
              Net Wt.(kg)
            </div>
            <div className="text-center whitespace-nowrap font-semibold print:hidden">
              Action
            </div>
          </div>

          {formData.details.map((detail, index) => (
            <div key={index} className="grid grid-cols-11 gap-x-5 items-center px-3 py-1">
              <Select
                clearable
                options={getAvailableProducts(index)}
                onChange={(selected) => handleProductChange(selected, index)}
                placeholder=""
                values={
                  detail.code
                    ? [{ value: detail.code, label: detail.code }]
                    : []
                }
                className="!h-7 cursor-pointer print:!border-none"
              />
              <div className="col-span-2 text-center">
                {detail.local_description || ""}
              </div>
              <div className="text-center">
                <SheetInput
                  className="!h-7 print:!h-4"
                  type="text"
                  value={detail.construction || ""}
                  onChange={(e) =>
                    handleInputChange(index, "construction", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-x-2">
                <SheetInput
                  type="number"
                  className="!h-7 print:!h-4 w-16"
                  value={detail.carton || ""}
                  onChange={(e) =>
                    handleInputChange(index, "carton", e.target.value)
                  }
                />
                <span>-</span>
                <SheetInput
                  type="number"
                  className="!h-7 print:!h-4 w-16"
                  value={detail.carton_two || ""}
                  onChange={(e) =>
                    handleInputChange(index, "carton_two", e.target.value)
                  }
                />
              </div>
              <SheetInput
                type="number"
                className="!h-7 print:!h-4"
                value={detail.total_carton || ""}
                onChange={(e) =>
                  handleInputChange(index, "total_carton", e.target.value)
                }
              />
              <SheetInput
                type="number"
                className="!h-7 print:!h-4 text-center"
                value={detail.pcs || ""}
                onChange={(e) =>
                  handleInputChange(index, "pcs", e.target.value)
                }
              />
              <SheetInput
                type="number"
                className="!h-7 print:!h-4"
                value={detail.quantity || ""}
                onChange={(e) =>
                  handleInputChange(index, "quantity", e.target.value)
                }
              />
              <SheetInput
                type="number"
                className="!h-7 print:!h-4"
                value={detail.gr_wt || ""}
                onChange={(e) =>
                  handleInputChange(index, "gr_wt", e.target.value)
                }
              />
              <SheetInput
                type="number"
                className="!h-8 text-center print:!h-6"
                value={
                  detail.net_weight
                    ? parseFloat(detail.net_weight).toFixed(1)
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(index, "net_weight", e.target.value)
                }
              />
              <div className="flex justify-center print:hidden">
                <button
                  onClick={() => deleteProductRow(index)}
                  disabled={formData.details.length === 1}
                  className={`${
                    formData.details.length === 1
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-red-100"
                  } border border-gray-300 p-2 rounded-sm`}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex px-3 py-2 print:hidden">
            <button
              onClick={addProductRow}
              className="bg-black text-white px-4 py-2 rounded-md font-bold"
              disabled={formData.details.length >= products.length}
              style={{
                display:
                  formData.details.length < products.length &&
                  formData.details[formData.details.length - 1]?.code
                    ? "block"
                    : "none",
              }}
            >
              + Add Row
            </button>
          </div>

          <div className="grid grid-cols-11 border-t-2">
            <div className="font-semibold px-3 py-2">Total</div>
            <div className="col-span-4"></div>
            <div className="text-center font-semibold border-x-2 py-2">
              {totals.totalCarton
                ? parseFloat(totals.totalCarton).toFixed(2)
                : ""}
            </div>
            <div></div>
            <div className="text-center font-semibold border-r-2 py-2">
              {totals.totalQuantity
                ? parseFloat(totals.totalQuantity).toFixed(2)
                : ""}
            </div>
            <div className="text-center font-semibold border-r-2 py-2">
              {totals.totalGrWt ? parseFloat(totals.totalGrWt).toFixed(2) : ""}
            </div>
            <div className="text-center font-semibold py-2">
              {totals.totalNetWt
                ? parseFloat(totals.totalNetWt).toFixed(2)
                : ""}
              kg
            </div>
            <div className="print:hidden"></div>
          </div>
        </div>

        <div className="grid grid-cols-9 py-3">
          <div className="col-span-9 text-center font-semibold">
            Certified That Merchandise are of Pakistan Origin
          </div>
        </div>

        <div className="grid grid-cols-1 font-semibold px-3">
          <div className="font-semibold pb-5">
            496- D Peoples Colony #1, Faisalabad (38000) Pakistan
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-x-2">
              <span className="font-semibold">Tel:</span>
              <SheetInput
                className="!h-8 print:!h-6 w-full"
                value={formData.tel || ""}
                onChange={(e) => handleValueChange("tel", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-x-2">
              <span className="font-semibold">Fax:</span>
              <SheetInput
                className="!h-8 print:!h-6 w-full"
                value={formData.fax || ""}
                onChange={(e) => handleValueChange("fax", e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-x-2">
              <span className="font-semibold">Email:</span>
              <SheetInput
                className="!h-8 print:!h-6 w-full"
                value={formData.email || ""}
                onChange={(e) => handleValueChange("email", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-x-2">
              <span className="font-semibold">URL:</span>
              <SheetInput
                className="!h-8 print:!h-6 w-full"
                value={formData.url || ""}
                onChange={(e) => handleValueChange("url", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PLCus;