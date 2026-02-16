import { motion } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { useExpenses } from "../context/ExpenseContext";

export function Categories() {
    const { categoryBreakdown } = useExpenses();
    const sortedCategories = [...categoryBreakdown].sort((a, b) => b.value - a.value);
    const maxVal = sortedCategories[0]?.value || 1;

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <BackButton />
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Category Breakdown</h1>
                    <p className="text-gray-400">Where does your money go?</p>
                </div>

                <div className="space-y-4">
                    {sortedCategories.map((cat, index) => (
                        <Card key={cat.name} className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-medium text-white">{cat.name}</span>
                                </div>
                                <span className="font-bold text-white">₹{cat.value.toLocaleString()}</span>
                            </div>

                            <div className="w-full bg-white-5 rounded-full h-3 mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(cat.value / maxVal) * 100}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className="bg-accent-blue h-full rounded-full"
                                />
                            </div>
                            <p className="text-xs text-gray-500 text-right">
                                {Math.round((cat.value / maxVal) * 100)}% of top category
                            </p>
                        </Card>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
