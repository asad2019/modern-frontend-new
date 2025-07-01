import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/ApiAuthContext';
import { useToast } from '../../components/ui/use-toast';
import PageLoader from '../../components/common/PageLoader';
import api from '../../lib/api';

const AllInvoices = () => {
  const [invoicesData, setInvoicesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/invoice/list');
      setInvoicesData(response.data?.data || []);
      toast({
        title: "Success",
        description: "Invoices fetched successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader type="table" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Invoices</CardTitle>
        <CardDescription>
          Manage and view all your invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Shipment</TableHead>
              <TableHead>Gr.Wt</TableHead>
              <TableHead>Net Wt</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Discharge Port</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoicesData.length > 0 ? (
              invoicesData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link 
                      to={`/invoice/${invoice.id}`} 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {invoice.invoice_number || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell>{invoice.date || "N/A"}</TableCell>
                  <TableCell>{invoice.quantity || "N/A"}</TableCell>
                  <TableCell>{invoice.shipment || "N/A"}</TableCell>
                  <TableCell>{invoice.gr_wt || "N/A"}</TableCell>
                  <TableCell>{invoice.net_wt || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {invoice.payment_terms || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.discharge_port || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/invoice/${invoice.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  No invoices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AllInvoices;