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
    const [quantity, setQuantity] = useState('');
    const [yarnSide, setYarnSide] = useState('warp'); // 'warp' or 'weft'
    const [toYarnSide, setToYarnSide] = useState('warp'); // for transfer to warp/weft

    const stockItems = type === 'yarn' ? data.yarnStock : data.fabricStock;
    const availableItems = stockItems?.filter(i => i.contract_id === parseInt(fromContractId)) || [];
    const allContracts = [...(data.contracts?.filter(c => !c.is_internal) || [])];

    const handleSubmit = (e) => {
        e.preventDefault();
        performTransaction({
            type,
            item_id: itemId,
            from_contract_id: fromContractId,
            to_contract_id: toContractId,
            quantity,
            yarn_side: type === 'yarn' ? yarnSide : undefined,
            to_yarn_side: type === 'yarn' ? toYarnSide : undefined
        });
        setItemId('');
        setFromContractId('');
        setToContractId('');
        setQuantity('');
        setYarnSide('warp');
        setToYarnSide('warp');
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Transfer Stock</CardTitle>
                    <CardDescription>Move yarn or fabric between contracts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select onValueChange={setType} value={type}>
                            <SelectTrigger><SelectValue placeholder="Select Stock Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yarn">Yarn</SelectItem>
                                <SelectItem value="fabric">Fabric</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setFromContractId} value={fromContractId}>
                            <SelectTrigger><SelectValue placeholder="From Contract..." /></SelectTrigger>
                            <SelectContent>
                                {allContracts.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name || c.id}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setItemId} value={itemId} disabled={!fromContractId}>
                            <SelectTrigger><SelectValue placeholder={`Select ${type} to transfer...`} /></SelectTrigger>
                            <SelectContent>
                                {availableItems.map(i =>
                                    <SelectItem key={i.id} value={i.id}>
                                        {type === 'yarn'
                                            ? `${parseFloat(i.warp_bags_quantity) + parseFloat(i.weft_bags_quantity)} bags`
                                            : `${i.total_meters} m`
                                        } (Contract ID: {i.contract_id})
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {type === 'yarn' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">From Side</label>
                                    <Select onValueChange={setYarnSide} value={yarnSide}>
                                        <SelectTrigger><SelectValue placeholder="Select Side" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="warp">Warp</SelectItem>
                                            <SelectItem value="weft">Weft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">To Side</label>
                                    <Select onValueChange={setToYarnSide} value={toYarnSide}>
                                        <SelectTrigger><SelectValue placeholder="Select Side" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="warp">Warp</SelectItem>
                                            <SelectItem value="weft">Weft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <Select onValueChange={setToContractId} value={toContractId}>
                            <SelectTrigger><SelectValue placeholder="To Contract..." /></SelectTrigger>
                            <SelectContent>
                                {allContracts.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name || c.id}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            className="w-full border rounded px-3 py-2"
                            placeholder={`Enter quantity to transfer (${type === 'yarn' ? 'bags' : 'meters'})`}
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!itemId || !fromContractId || !toContractId || !quantity}
                        >
                            <Repeat className="mr-2 h-4 w-4" /> Perform Transfer
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default Transactions;