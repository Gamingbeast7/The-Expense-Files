import { useNavigate } from "react-router-dom";
import { TotalBalance } from "../components/widgets/TotalBalance";
import { SmartInput } from "../components/widgets/SmartInput";
import { DesignCharts } from "../components/widgets/DesignCharts";
import { Insights } from "../components/widgets/Insights";
import { BudgetProgress } from "../components/widgets/BudgetProgress";
import { Comparison } from "../components/widgets/Comparison";
import { Savings } from "../components/widgets/Savings";
import { Plus, ShoppingBag, Coffee, Car, Zap, Film } from "lucide-react";
import { useExpenses } from "../context/ExpenseContext";
import { Card } from "../components/ui/Card";
import { format } from "date-fns";

const ICONS = {
    "Food & Dining": <Coffee size={20} />,
    "Transportation": <Car size={20} />,
    "Entertainment": <Film size={20} />,
    "Shopping": <ShoppingBag size={20} />,
    "Utilities": <Zap size={20} />,
};

export function Dashboard() {
    const navigate = useNavigate();
    const { expenses } = useExpenses();

    // Get last 4 transactions
    const recentTransactions = expenses.slice(0, 4);

    return (
        <div className="grid grid-cols-12 gap-6 pb-24 relative">
            <div className="col-span-12 flex flex-col md:flex-row gap-6 mb-2">
                {/* Top row with Date Range Picker and Actions could go here */}
            </div>

            {/* Row 1: Hero & Input */}
            <div onClick={() => navigate("/transactions")} className="col-span-12 md:col-span-6 lg:col-span-4 cursor-pointer">
                <TotalBalance />
            </div>
            <div onClick={() => navigate("/add-expense")} className="col-span-12 md:col-span-8 lg:col-span-5 cursor-pointer">
                <SmartInput />
            </div>
            <div onClick={() => navigate("/goals")} className="col-span-12 md:col-span-6 lg:col-span-3 cursor-pointer">
                <Savings />
            </div>

            {/* Row 2: Charts */}
            <DesignCharts />

            {/* Row 3: Insights & More Stats */}
            <div onClick={() => navigate("/analytics")} className="col-span-12 md:col-span-6 lg:col-span-3 cursor-pointer">
                <BudgetProgress />
            </div>
            <div onClick={() => navigate("/analytics")} className="col-span-12 md:col-span-6 lg:col-span-3 cursor-pointer">
                <Comparison />
            </div>

            {/* Recent Transactions Widget (New) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-6">
                <Card className="h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Recent Transactions</h3>
                        <button onClick={() => navigate("/transactions")} className="text-xs text-accent-blue hover:text-white transition-colors">View All</button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {recentTransactions.map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between p-2 hover:bg-white-5 rounded-lg transition-colors cursor-pointer" onClick={() => navigate("/transactions")}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white-10 flex items-center justify-center text-accent-blue scale-90">
                                        {ICONS[expense.category] || <ShoppingBag size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">{expense.title}</h4>
                                        <p className="text-xs text-gray-500">{format(new Date(expense.date), "MMM d")}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-white text-sm">₹{expense.amount.toFixed(0)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Row 4: Insights */}
            <div className="col-span-12">
                <Insights />
            </div>

            {/* Floating Action Button (FAB) (New) */}
            <button
                onClick={() => navigate("/add-expense")}
                className="fixed bottom-6 right-6 w-14 h-14 bg-accent-green text-black rounded-full shadow-lg shadow-accent-green/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}
