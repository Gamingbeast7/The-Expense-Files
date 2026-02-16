import { Card } from "../ui/Card";
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { useExpenses } from "../../context/ExpenseContext";
import { useNavigate } from "react-router-dom";
import { formatCompactNumber } from "../../lib/utils";

const CATEGORY_COLORS = {
    "Food & Dining": "#34C759",
    "Transportation": "#007AFF",
    "Utilities": "#AF52DE",
    "Shopping": "#FF9500",
    "Entertainment": "#FF3B30",
};

export function DesignCharts() {
    const { spendingTrends, categoryBreakdown, totalBalance } = useExpenses();
    const navigate = useNavigate();

    const formattedCategoryData = categoryBreakdown.map(item => ({
        ...item,
        color: CATEGORY_COLORS[item.name] || "#888888"
    }));

    return (
        <>
            {/* Monthly Spending Trends */}
            <Card onClick={() => navigate("/analytics")} className="col-span-12 md:col-span-6 lg:col-span-8 min-h-[300px] cursor-pointer">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Monthly Spending</h3>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-accent-blue/50"></span>
                        <span className="text-xs text-gray-500">Trend</span>
                    </div>
                </div>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spendingTrends}>
                            <defs>
                                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={3} fill="url(#colorSpend)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Category Breakdown */}
            <Card onClick={() => navigate("/categories")} className="col-span-12 md:col-span-6 lg:col-span-4 min-h-[300px] flex flex-col items-center justify-center cursor-pointer">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4 self-start w-full">Breakdown</h3>
                <div className="relative w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={formattedCategoryData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {formattedCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-white">
                            ₹{formatCompactNumber(totalBalance)}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {formattedCategoryData.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <span className="text-xs text-gray-400">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
}
