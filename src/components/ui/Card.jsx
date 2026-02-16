import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Card({ className, children, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "glass rounded-3xl p-6 relative overflow-hidden group cursor-pointer",
                "hover:scale-[1.01] hover:border-white/20 transition-all duration-300 ease-out",
                "active:scale-[0.98] active:border-white/30",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-white-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            {children}
        </motion.div>
    );
}
