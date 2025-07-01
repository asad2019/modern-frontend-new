
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Download, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageLoader from '@/components/common/PageLoader';

const Invoices = () => {
  const { data, isLoading } = usePageData(['invoices', 'clients']);
  const { createInvoice } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    type: 'fabric',
    amount: '',
    description: '',
    items: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createInvoice(newInvoice);
    setNewInvoice({ client_id: '', type: 'fabric', amount: '', description: '', items: [] });
    setOpen(false);
  };

  const handleDownload = (invoice) => {
    toast({ title: "Download", description: "Invoice download functionality will be implemented." });
  };
  
  if (isLoading) {
    return <PageLoader type="table" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center"><Receipt className="mr-2 h-6 w-6" /> Invoices</CardTitle>
            <CardDescription>Create and manage invoices for clients.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Create Invoice</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Create New Invoice</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                  <Label>Client</Label>
                  <Select onValueChange={v => setNewInvoice({...newInvoice, client_id: v})} value={newInvoice.client_id}>
                    <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                    <SelectContent>{data.clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Invoice Type</Label>
                  <Select onValueChange={v => setNewInvoice({...newInvoice, type: v})} value={newInvoice.type}>
                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fabric">Fabric Sale</SelectItem>
                      <SelectItem value="processing">Processing Charges</SelectItem>
                      <SelectItem value="yarn">Yarn Sale</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Amount" type="number" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} required />
                <Textarea placeholder="Description" value={newInvoice.description} onChange={e => setNewInvoice({...newInvoice, description: e.target.value})} />
                <DialogFooter><Button type="submit">Create Invoice</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.invoices?.map((invoice) => {
                const client = data.clients?.find(c => c.id === invoice.client_id);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-xs">{invoice.invoice_number}</TableCell>
                    <TableCell>{client?.name || 'N/A'}</TableCell>
                    <TableCell><Badge variant="outline">{invoice.type}</Badge></TableCell>
                    <TableCell>${invoice.amount}</TableCell>
                    <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Invoices;
