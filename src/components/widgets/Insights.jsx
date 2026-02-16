import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useExpenses } from "../../context/ExpenseContext";

export function Insights() {
    const { categoryBreakdown } = useExpenses();

    // Simple logic to find highest spending category
    const highestCategory = categoryBreakdown.reduce((prev, current) => {
        return (prev.value > current.value) ? prev : current;
    }, { name: 'Nothing', value: 0 });

    return (
        <div className="col-span-12 lg:col-span-3 flex items-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-full px-4 py-2 flex items-center gap-3"
            >
                <div className="p-1.5 bg-accent-purple/20 rounded-full text-accent-purple">
                    <Sparkles size={16} />
                </div>
                <span className="text-sm text-gray-200 line-clamp-1">
                    Highest spending: <span className="text-accent-purple font-semibold">{highestCategory.name}</span> (₹{highestCategory.value})
                </span>
            </motion.div>
        </div>
    );
}
