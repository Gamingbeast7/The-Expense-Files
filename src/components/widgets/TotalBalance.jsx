import { useMemo } from "react";
import { Card } from "../ui/Card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useExpenses } from "../../context/ExpenseContext";
import { subDays, startOfDay, endOfDay, isWithinInterval, format } from "date-fns";

export function TotalBalance() {
    const { totalBalance, monthlySpending, lastMonthSpending, expenses } = useExpenses();

    // Calculate dynamic percentage change vs last month
    const percentChange = useMemo(() => {
        if (lastMonthSpending > 0) {
            return ((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100;
        } else if (monthlySpending > 0) {
            return 100;
        }
        return 0;
    }, [monthlySpending, lastMonthSpending]);

    const isIncrease = percentChange > 0;
    const isZero = percentChange === 0;

    // Real dynamic sparkline from past 7 days of expenses
    const sparklineData = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const day = subDays(now, i);
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);

            const dayTotal = expenses
                .filter(e => {
                    const d = new Date(e.date);
                    return !isNaN(d) && isWithinInterval(d, { start: dayStart, end: dayEnd });
                })
                .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

            days.push({
                date: format(day, "MMM dd"),
                value: dayTotal
            });
        }
        const hasData = days.some(d => d.value > 0);
        return hasData ? days : [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }];
    }, [expenses]);

    return (
        <Card className="col-span-12 md:col-span-6 lg:col-span-4 min-h-[240px] flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Balance</h3>
                <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                        ₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isZero 
                            ? "bg-white-10 text-gray-400"
                            : isIncrease
                            ? "bg-accent-red/10 text-accent-red"
                            : "bg-accent-green/10 text-accent-green"
                    }`}>
                        {isZero ? (
                            <Minus size={12} />
                        ) : isIncrease ? (
                            <ArrowUpRight size={12} />
                        ) : (
                            <ArrowDownRight size={12} />
                        )}
                        {isZero ? "0.0%" : `${isIncrease ? "+" : ""}${percentChange.toFixed(1)}%`}
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
