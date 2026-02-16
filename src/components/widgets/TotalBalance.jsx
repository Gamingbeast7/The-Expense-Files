import { Card } from "../ui/Card";
import { ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useExpenses } from "../../context/ExpenseContext";

const sparklineData = [
    { value: 4000 },
    { value: 3000 },
    { value: 5000 },
    { value: 2780 },
    { value: 1890 },
    { value: 6390 },
    { value: 3490 },
];

export function TotalBalance() {
    const { totalBalance } = useExpenses();

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-4 min-h-[240px] flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Balance</h3>
                <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-bold text-white tracking-tight">
                        ₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="flex items-center gap-1 text-accent-green text-sm font-medium bg-accent-green/10 px-2 py-1 rounded-full">
                        <ArrowUpRight size={14} />
                        +2.4%
                    </span>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-32 opacity-20 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fff" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
