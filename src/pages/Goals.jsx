import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Plus, X, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useExpenses } from "../context/ExpenseContext";
import { formatCompactNumber } from "../lib/utils";

export function Goals() {
    const { goals, addGoal, updateGoal, deleteGoal } = useExpenses();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMoneyModal, setShowMoneyModal] = useState(null); // ID of goal to add money to

    // Add Goal Form State
    const [newGoal, setNewGoal] = useState({ name: "", target: "", current: "0", color: "#007AFF" });

    // Add Money Form State
    const [addAmount, setAddAmount] = useState("");

    const handleAddGoal = (e) => {
        e.preventDefault();
        addGoal({
            name: newGoal.name,
            target: parseFloat(newGoal.target),
            current: parseFloat(newGoal.current),
            color: newGoal.color
        });
        setShowAddModal(false);
        setNewGoal({ name: "", target: "", current: "0", color: "#007AFF" });
    };

    const handleAddMoney = (e) => {
        e.preventDefault();
        if (showMoneyModal && addAmount) {
            updateGoal(showMoneyModal, addAmount);
            setShowMoneyModal(null);
            setAddAmount("");
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <BackButton />
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Savings Goals</h1>
                    <p className="text-gray-400">Track your progress towards financial freedom.</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus size={18} className="mr-2" />
                    Add Goal
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => (
                    <Card key={goal.id} className="flex flex-col items-center p-8 relative group">
                        <button
                            onClick={() => {
                                if (window.confirm("Delete this savings goal?")) {
                                    deleteGoal(goal.id);
                                }
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>
                        <div className="w-48 h-48 relative mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[{ value: goal.current }, { value: Math.max(0, goal.target - goal.current) }]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill={goal.color} />
                                        <Cell fill="rgba(255,255,255,0.05)" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-white">{Math.min(100, Math.round((goal.current / goal.target) * 100))}%</span>
                                <span className="text-xs text-gray-500">Achieved</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{goal.name}</h3>
                        <p className="text-gray-400 mb-6">₹{formatCompactNumber(goal.current)} / ₹{formatCompactNumber(goal.target)}</p>

                        <Button variant="secondary" className="w-full" onClick={() => setShowMoneyModal(goal.id)}>Add Money</Button>
                    </Card>
                ))}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1C1C1E] border border-white-10 rounded-2xl p-6 w-full max-w-md relative"
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-white mb-6">Create New Goal</h2>
                            <form onSubmit={handleAddGoal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Goal Name</label>
                                    <Input
                                        required
                                        placeholder="e.g. New Car"
                                        value={newGoal.name}
                                        onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Target Amount (₹)</label>
                                        <Input
                                            required
                                            type="number"
                                            placeholder="50000"
                                            value={newGoal.target}
                                            onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Current Saved (₹)</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={newGoal.current}
                                            onChange={e => setNewGoal({ ...newGoal, current: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Color</label>
                                    <div className="flex gap-3">
                                        {["#007AFF", "#AF52DE", "#34C759", "#FF9500", "#FF3B30", "#5856D6"].map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewGoal({ ...newGoal, color })}
                                                className={`w-8 h-8 rounded-full transition-transform ${newGoal.color === color ? 'scale-125 ring-2 ring-white' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Button type="submit" className="w-full mt-2">Create Goal</Button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showMoneyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1C1C1E] border border-white-10 rounded-2xl p-6 w-full max-w-sm relative"
                        >
                            <button onClick={() => setShowMoneyModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-white mb-6">Add Money</h2>
                            <form onSubmit={handleAddMoney} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount to Add (₹)</label>
                                    <Input
                                        required
                                        autoFocus
                                        type="number"
                                        placeholder="1000"
                                        value={addAmount}
                                        onChange={e => setAddAmount(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full">Add to Savings</Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
