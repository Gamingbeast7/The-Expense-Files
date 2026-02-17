import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { useExpenses } from "../context/ExpenseContext";
import { Plus, X, Receipt, ArrowRight, User, Check, Settings, Trash2, UserPlus } from "lucide-react";
import { format } from "date-fns";

export function GroupDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { groups, fetchGroupExpenses, groupExpenses, addGroupExpense, user } = useExpenses();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Helpers for Add Expense Form
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState("Me");
    const [splitType, setSplitType] = useState("EQUAL");
    const [involvedMembers, setInvolvedMembers] = useState([]); // Members involved in split
    const [syncToPersonal, setSyncToPersonal] = useState(false); // Sync to personal dashboard

    // Group Settings State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const group = groups.find(g => g.id === groupId);
    const allMembers = useMemo(() => group ? ["Me", ...(group.friends?.map(f => f.username || f.name || f) || [])] : [], [group]);

    useEffect(() => {
        if (groupId) {
            const unsubscribe = fetchGroupExpenses(groupId);
            return () => unsubscribe();
        }
    }, [groupId]);

    // Initialize involvedMembers when group loads
    useEffect(() => {
        if (allMembers.length > 0 && involvedMembers.length === 0) {
            setInvolvedMembers(allMembers);
        }
    }, [allMembers]);

    // Calculate Balances
    const balances = useMemo(() => {
        if (!group) return {};
        const bals = {};
        allMembers.forEach(m => bals[m] = 0);

        groupExpenses.forEach(exp => {
            const payer = exp.paidBy === user.uid ? "Me" : exp.paidBy;
            const cost = exp.amount;

            // Only split among involves members or all if not specified
            const splitAmong = exp.involvedMembers || allMembers;
            const splitCount = splitAmong.length;
            const splitAmount = cost / splitCount;

            if (bals[exp.paidBy] !== undefined) bals[exp.paidBy] += cost;

            splitAmong.forEach(member => {
                if (bals[member] !== undefined) bals[member] -= splitAmount;
            });
        });

        return bals;
    }, [group, groupExpenses, user, allMembers]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!title || !amount) return;

        await addGroupExpense(groupId, {
            title,
            amount: parseFloat(amount),
            date: new Date().toISOString(),
            paidBy,
            splitType,
            involvedMembers,
            syncToPersonal
        });

        setIsAddOpen(false);
        setTitle("");
        setAmount("");
        setPaidBy("Me");
        setInvolvedMembers(allMembers);
        setSyncToPersonal(false);
    };

    // Group Settings Logic
    const [editName, setEditName] = useState("");
    const { updateGroup, deleteGroup, searchUsers, addMemberToGroup } = useExpenses();

    // Search State for Add Member
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (group) setEditName(group.name);
    }, [group]);

    useEffect(() => {
        const search = async () => {
            if (searchInput.length < 3) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await searchUsers(searchInput);
                // Filter out existing members
                const currentUids = group?.members || [];
                // Also filter by username if virtual friend exists? For now just UIDs.
                setSearchResults(results.filter(r => !currentUids.includes(r.uid)));
            } catch (e) {
                console.error("Search failed", e);
            }
            setIsSearching(false);
        };
        const timeout = setTimeout(search, 500);
        return () => clearTimeout(timeout);
    }, [searchInput, group, searchUsers]);

    const handleUpdateName = async () => {
        if (!group || !editName.trim()) return;
        await updateGroup(groupId, { name: editName });
        setIsSettingsOpen(false);
    };

    const handleDeleteGroup = async () => {
        if (!group) return;
        if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
            await deleteGroup(groupId);
            navigate("/groups");
        }
    };

    const handleAddNewMember = async (user) => {
        if (!group) return;
        await addMemberToGroup(groupId, user); // user: { uid, username, displayName }
        setSearchInput("");
        setSearchResults([]);
    };

    if (!group) return <div className="p-8 text-center text-gray-400">Loading group...</div>;

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
                    <div className="flex gap-2">
                        <Button onClick={() => setIsSettingsOpen(true)} variant="secondary" className="px-3">
                            <Settings size={20} />
                        </Button>
                        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
                            <Plus size={18} />
                            Add Expense
                        </Button>
                    </div>
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

                                {/* Split With */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Split With</label>
                                    <div className="flex flex-wrap gap-2">
                                        {allMembers.map(m => (
                                            <div
                                                key={m}
                                                onClick={() => {
                                                    if (involvedMembers.includes(m)) {
                                                        // Prevent removing self if only 1 left? No, allow full control
                                                        setInvolvedMembers(involvedMembers.filter(im => im !== m));
                                                    } else {
                                                        setInvolvedMembers([...involvedMembers, m]);
                                                    }
                                                }}
                                                className={`
                                                    cursor-pointer px-3 py-1 rounded-full text-xs border transition-all select-none flex items-center gap-1
                                                    ${involvedMembers.includes(m) ? 'bg-accent-blue/20 border-accent-blue text-accent-blue' : 'bg-white-5 border-transparent text-gray-500'}
                                                `}
                                            >
                                                {m}
                                                {involvedMembers.includes(m) && <Check size={12} />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sync to Personal */}
                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="sync"
                                        checked={syncToPersonal}
                                        onChange={(e) => setSyncToPersonal(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-600 bg-white-5 text-accent-blue focus:ring-accent-blue"
                                    />
                                    <label htmlFor="sync" className="text-sm text-gray-300 cursor-pointer select-none">
                                        Also add to my personal expenses
                                    </label>
                                </div>

                                <Button type="submit" className="w-full py-3">
                                    Add Expense
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Group Settings Modal */}
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1C1C1E] border border-white-10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Group Settings</h2>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Edit Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Group Name</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                        <Button onClick={handleUpdateName} variant="secondary">Save</Button>
                                    </div>
                                </div>

                                {/* Add Member */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Add Member</label>
                                    <div className="relative mb-3">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <div className="text-gray-500">@</div>
                                        </div>
                                        <Input
                                            placeholder="Search username to add"
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                            className="pl-8"
                                        />
                                        {isSearching && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Results */}
                                    {searchResults.length > 0 && (
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar bg-white-5 rounded-xl p-2">
                                            {searchResults.map(user => (
                                                <div
                                                    key={user.uid}
                                                    onClick={() => handleAddNewMember(user)}
                                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white-10 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-xs font-bold">
                                                            {user.displayName ? user.displayName[0] : user.username[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{user.displayName || "User"}</p>
                                                            <p className="text-xs text-gray-500">@{user.username}</p>
                                                        </div>
                                                    </div>
                                                    <UserPlus size={16} className="text-accent-green" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Delete Group */}
                                <div className="pt-4 border-t border-white-10">
                                    <Button
                                        onClick={handleDeleteGroup}
                                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                    >
                                        <Trash2 size={18} />
                                        Delete Group
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
