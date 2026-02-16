import { Card } from "../ui/Card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useExpenses } from "../../context/ExpenseContext";
import { formatCompactNumber } from "../../lib/utils";

export function Comparison() {
    const { monthlySpending, lastMonthSpending } = useExpenses();

    // Calculate percentage change
    let percentChange = 0;
    if (lastMonthSpending > 0) {
        percentChange = ((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100;
    } else if (monthlySpending > 0) {
        percentChange = 100; // 100% increase if last month was 0
    }

    const isIncrease = percentChange > 0;
    const isNeutral = percentChange === 0;

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col justify-center">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Vs Last Month</h3>

            <div className="flex items-end justify-between mb-2">
                <div>
                    <span className="text-xs text-gray-500 block mb-1">Total Spent</span>
                    <span className="block text-2xl font-bold text-white">₹{formatCompactNumber(monthlySpending)}</span>
                </div>

                <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${isNeutral ? 'bg-white-10 text-gray-400' :
                        isIncrease ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-green/10 text-accent-green'
                    }`}>
                    {isNeutral ? <Minus size={16} /> :
                        isIncrease ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span className="text-sm font-bold">{Math.abs(percentChange).toFixed(1)}%</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white-5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Last Month</span>
                    <span className="text-white font-medium">₹{formatCompactNumber(lastMonthSpending)}</span>
                </div>
            </div>
        </Card>
    );
}
