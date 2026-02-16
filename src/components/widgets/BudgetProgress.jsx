import { useState } from "react";
import { Card } from "../ui/Card";
import { motion } from "framer-motion";
import { useExpenses } from "../../context/ExpenseContext";
import { Edit2, Check } from "lucide-react";

export function BudgetProgress() {
    const { monthlySpending, budget, setBudget } = useExpenses();
    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(budget);

    const percentage = Math.min(Math.round((monthlySpending / budget) * 100), 100);
    const isOverBudget = percentage > 80;

    const handleSave = (e) => {
        e.stopPropagation();
        setBudget(Number(newBudget));
        setIsEditing(false);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setNewBudget(budget);
        setIsEditing(true);
    };

    const handleInputClick = (e) => {
        e.stopPropagation();
    };

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col justify-center relative group">
            <div className="flex justify-between items-end mb-2">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Monthly Budget</h3>
                <span className="text-white font-bold">{percentage}%</span>
            </div>
            <div className="h-4 bg-white-10 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${isOverBudget ? 'bg-accent-red' : 'bg-accent-green'}`}
                />
            </div>

            <div className="flex justify-end items-center mt-2 gap-2">
                <p className="text-xs text-gray-500">
                    ₹{monthlySpending.toLocaleString()} /
                </p>
                {isEditing ? (
                    <div className="flex items-center gap-1" onClick={handleInputClick}>
                        <span className="text-xs text-white font-bold">₹</span>
                        <input
                            type="number"
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            className="w-16 bg-white-10 border-none rounded px-1 py-0.5 text-xs text-white font-bold focus:ring-1 focus:ring-accent-blue"
                            autoFocus
                        />
                        <button onClick={handleSave} className="p-1 hover:bg-white-10 rounded-full text-accent-green">
                            <Check size={12} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 group/edit cursor-pointer" onClick={handleEditClick}>
                        <span className="text-xs text-gray-500">₹{budget.toLocaleString()}</span>
                        <Edit2 size={10} className="text-gray-600 group-hover/edit:text-accent-blue transition-colors" />
                    </div>
                )}
            </div>
        </Card>
    );
}
