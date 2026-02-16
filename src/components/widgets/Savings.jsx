import { Card } from "../ui/Card";
import { PiggyBank } from "lucide-react";
import { useExpenses } from "../../context/ExpenseContext";

export function Savings() {
    const { budget, monthlySpending } = useExpenses();
    const projectedSavings = Math.max(budget - monthlySpending, 0);
    const isOnTrack = projectedSavings > 0;

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-3 bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border-accent-blue/20">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-accent-blue/20 rounded-2xl text-accent-blue">
                    <PiggyBank size={24} />
                </div>
                {isOnTrack && (
                    <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-lg">On Track</span>
                )}
            </div>
            <div>
                <h3 className="text-gray-300 text-sm font-medium mb-1">Projected Savings</h3>
                <p className="text-3xl font-bold text-white tracking-tight">₹{projectedSavings.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">
                    At this rate, you'll save <span className="text-white font-medium">₹{projectedSavings.toLocaleString()}</span> this month.
                </p>
            </div>
        </Card>
    );
}
