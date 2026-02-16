import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn, formatCompactNumber } from "../lib/utils";
import { useExpenses } from "../context/ExpenseContext";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, startOfYear, endOfYear, eachMonthOfInterval, isSameMonth, getDay } from "date-fns";

export function Analytics() {
    const { expenses, monthlySpending, lastMonthSpending } = useExpenses();
    const [viewMode, setViewMode] = useState("weekly");

    // Calculate Weekly Data (Income vs Expense)
    // Note: We only have expenses, so Income is mocked or 0 for now unless we add Income type.
    // For this demo, we'll assume a "Budget" per day or just show Expenses. 
    // The user request is about "Graph not changing", so we stick to Expenses.
    const weeklyData = useMemo(() => {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(now, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dailyExpense = expenses
                .filter(e => isSameDay(new Date(e.date), day))
                .reduce((acc, curr) => acc + curr.amount, 0);

            return {
                name: format(day, "EEE"),
                income: 0, // No income tracking yet
                expense: dailyExpense
            };
        });
    }, [expenses]);

    // Calculate Monthly Data
    const monthlyData = useMemo(() => {
        const now = new Date();
        const start = startOfYear(now);
        const end = endOfYear(now);
        const months = eachMonthOfInterval({ start, end });

        return months.map(month => {
            const monthlyExpense = expenses
                .filter(e => isSameMonth(new Date(e.date), month))
                .reduce((acc, curr) => acc + curr.amount, 0);

            return {
                name: format(month, "MMM"),
                income: 0,
                expense: monthlyExpense
            };
        });
    }, [expenses]);

    const data = viewMode === "weekly" ? weeklyData : monthlyData;

    // Highest Spending Day Calculation
    const highestSpendingDay = useMemo(() => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayTotals = new Array(7).fill(0);

        expenses.forEach(e => {
            const dayIndex = getDay(new Date(e.date));
            dayTotals[dayIndex] += e.amount;
        });

        const maxAmount = Math.max(...dayTotals);
        const maxIndex = dayTotals.indexOf(maxAmount);

        return {
            day: days[maxIndex],
            amount: maxAmount
        };
    }, [expenses]);

    // Monthly Comparison
    const percentageChange = lastMonthSpending > 0
        ? ((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100
        : 100;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <BackButton />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
                    <p className="text-gray-400">Deep dive into your financial health.</p>
                </div>

                <Card className="h-[400px] mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white">{viewMode === "weekly" ? "Weekly" : "Monthly"} Spend</h3>
                        <div className="flex items-center gap-2 bg-white-5 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("weekly")}
                                className={cn(
                                    "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                                    viewMode === "weekly" ? "bg-white-10 text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setViewMode("monthly")}
                                className={cn(
                                    "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                                    viewMode === "monthly" ? "bg-white-10 text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(value) => `₹${formatCompactNumber(value)}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                formatter={(value) => `₹${formatCompactNumber(value)}`}
                            />
                            {/* Removed Income bar since we don't track it, keeping it simple or just Expenses */}
                            <Bar dataKey="expense" fill="#FF3B30" radius={[4, 4, 0, 0]} name="Expense" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-gray-400 text-sm font-medium uppercase mb-4">Highest Spending Day</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{highestSpendingDay.day}</span>
                            <span className="text-accent-red">₹{formatCompactNumber(highestSpendingDay.amount)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Total spending on all {highestSpendingDay.day}s.</p>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-gray-400 text-sm font-medium uppercase mb-4">Monthly Spending</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">₹{formatCompactNumber(monthlySpending)}</span>
                            <span className={percentageChange > 0 ? "text-accent-red" : "text-accent-green"}>
                                {percentageChange > 0 ? "+" : ""}{percentageChange.toFixed(1)}% vs last month
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Total expenses for this month.</p>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
