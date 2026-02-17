import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { useExpenses } from "../context/ExpenseContext";
import { Plus, X, Receipt, ArrowRight, User } from "lucide-react";
import { format } from "date-fns";

export function GroupDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { groups, fetchGroupExpenses, groupExpenses, addGroupExpense, user } = useExpenses();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Helpers for Add Expense Form
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState("Me"); // "Me" or friend name
    const [splitType, setSplitType] = useState("EQUAL"); // EQUAL, UNEQUAL (Future)

    const group = groups.find(g => g.id === groupId);

    useEffect(() => {
        if (groupId) {
            const unsubscribe = fetchGroupExpenses(groupId);
            return () => unsubscribe();
        }
    }, [groupId]);

    // Calculate Balances
    const balances = useMemo(() => {
        if (!group) return {};
        // Initialize balances
        const bals = {};
        // "Me" is the current user.
        // Friends are in group.friends.
        const allMembers = ["Me", ...(group.friends || [])];
        allMembers.forEach(m => bals[m] = 0);

        groupExpenses.forEach(exp => {
            const payer = exp.paidBy === user.uid ? "Me" : exp.paidBy; // Assuming we stored name or mapped it. 
            // Actually, let's simplify. 'paidBy' in DB might be 'Me' (if we stored it as name for virtual) or UID. 
            // In createGroup we stored virtual friends as strings. 
            // Let's assume for this MVP we store the NAME in paidBy for virtual friends, and "Me" for user.

            const cost = exp.amount;
            const splitCount = allMembers.length;
            const splitAmount = cost / splitCount;

            // Payer gets +cost (they paid)
            // Everyone gets -splitAmount (they owe)
            // Net balance = (Paid) - (Owed)

            if (bals[exp.paidBy] !== undefined) bals[exp.paidBy] += cost;

            allMembers.forEach(member => {
                if (bals[member] !== undefined) bals[member] -= splitAmount;
            });
        });

        return bals;
    }, [group, groupExpenses, user]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!title || !amount) return;

        await addGroupExpense(groupId, {
            title,
            amount: parseFloat(amount),
            date: new Date().toISOString(),
            paidBy, // "Me" or "Alice"
            splitType
        });

        setIsAddOpen(false);
        setTitle("");
        setAmount("");
        setPaidBy("Me");
    };

    if (!group) return <div className="p-8 text-center text-gray-400">Loading group...</div>;

    const allMembers = ["Me", ...(group.friends || [])];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <BackButton />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
                        <p className="text-gray-400">
                            Members: You, {group.friends?.join(", ")}
                        </p>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
                        <Plus size={18} />
                        Add Expense
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Balances Widget */}
                    <Card className="lg:col-span-1 p-6 h-fit">
                        <h3 className="text-xl font-bold text-white mb-4">Balances</h3>
                        <div className="space-y-4">
                            {Object.entries(balances).map(([member, amount]) => (
                                <div key={member} className="flex justify-between items-center border-b border-white-5 pb-2 last:border-0">
                                    <span className="text-gray-300 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white-10 flex items-center justify-center text-xs">
                                            {member[0]}
                                        </div>
                                        {member}
                                    </span>
                                    <span className={`font-bold ${amount >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                        {amount >= 0 ? `gets ₹${amount.toFixed(2)}` : `owes ₹${Math.abs(amount).toFixed(2)}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Expenses List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold text-white mb-2">Expenses</h3>
                        {groupExpenses.length === 0 ? (
                            <div className="text-center py-10 bg-white-5 rounded-2xl border border-white-10">
                                <Receipt size={32} className="mx-auto text-gray-500 mb-3" />
                                <p className="text-gray-400">No expenses in this group yet.</p>
                            </div>
                        ) : (
                            groupExpenses.map(exp => (
                                <Card key={exp.id} className="p-4 flex justify-between items-center hover:bg-white-5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center">
                                            <Receipt size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{exp.title}</h4>
                                            <p className="text-xs text-gray-500">
                                                Paid by <span className="text-white">{exp.paidBy}</span> • {format(new Date(exp.date), "MMM d")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-white text-lg">₹{exp.amount.toFixed(2)}</span>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Add Group Expense Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1C1C1E] border border-white-10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Add Group Expense</h2>
                                <button onClick={() => setIsAddOpen(false)} className="text-gray-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddExpense} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                    <Input
                                        placeholder="What was this for?"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold">₹</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="pl-8"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Paid By</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {allMembers.map(m => (
                                            <div
                                                key={m}
                                                onClick={() => setPaidBy(m)}
                                                className={`
                                                    cursor-pointer p-2 rounded-lg text-center text-sm border transition-all
                                                    ${paidBy === m ? 'bg-accent-blue border-accent-blue text-white' : 'bg-white-5 border-transparent text-gray-400 hover:bg-white-10'}
                                                `}
                                            >
                                                {m}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full py-3">
                                    Add Expense
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
