
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageData } from '@/hooks/usePageData';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Repeat } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

const Transactions = () => {
    const { data, isLoading } = usePageData(['yarnStock', 'fabricStock', 'contracts']);
    const { performTransaction } = useData();
    const [type, setType] = useState('yarn');
    const [itemId, setItemId] = useState('');
    const [fromContractId, setFromContractId] = useState('');
    const [toContractId, setToContractId] = useState('');

    const stockItems = type === 'yarn' ? data.yarnStock : data.fabricStock;
    const availableItems = stockItems?.filter(i => i.contract_id === fromContractId) || [];
    
    const allContracts = [ ...(data.contracts?.filter(c => !c.is_internal) || []), { id: 'in-house', name: 'In-House Stock' } ];

    const handleSubmit = (e) => {
        e.preventDefault();
        performTransaction({ type, item_id: itemId, from_contract_id: fromContractId, to_contract_id: toContractId });
        setItemId('');
        setFromContractId('');
        setToContractId('');
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Transfer Stock</CardTitle>
                    <CardDescription>Move yarn or fabric between contracts or to in-house stock.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select onValueChange={setType} value={type}><SelectTrigger><SelectValue placeholder="Select Stock Type" /></SelectTrigger><SelectContent><SelectItem value="yarn">Yarn</SelectItem><SelectItem value="fabric">Fabric</SelectItem></SelectContent></Select>
                        <Select onValueChange={setFromContractId} value={fromContractId}><SelectTrigger><SelectValue placeholder="From Contract..." /></SelectTrigger><SelectContent>{allContracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name || c.id}</SelectItem>)}</SelectContent></Select>
                        <Select onValueChange={setItemId} value={itemId} disabled={!fromContractId}><SelectTrigger><SelectValue placeholder={`Select ${type} to transfer...`} /></SelectTrigger><SelectContent>{availableItems.map(i => <SelectItem key={i.id} value={i.id}>{type === 'yarn' ? `${i.quantity_kg}kg` : `${i.quantity_meters}m`} (ID: ...{i.id.slice(-4)})</SelectItem>)}</SelectContent></Select>
                        <Select onValueChange={setToContractId} value={toContractId}><SelectTrigger><SelectValue placeholder="To Contract..." /></SelectTrigger><SelectContent>{allContracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name || c.id}</SelectItem>)}</SelectContent></Select>
                        <Button type="submit" className="w-full" disabled={!itemId || !fromContractId || !toContractId}><Repeat className="mr-2 h-4 w-4" /> Perform Transfer</Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default Transactions;
