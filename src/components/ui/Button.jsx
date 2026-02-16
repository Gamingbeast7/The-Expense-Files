import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function Button({ className, variant = "primary", size = "md", children, ...props }) {
    const variants = {
        primary: "bg-accent-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20",
        secondary: "bg-white-10 hover:bg-white-20 text-white backdrop-blur-md",
        ghost: "hover:bg-white-5 text-gray-400 hover:text-white",
        danger: "bg-accent-red hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3 text-lg",
        icon: "p-2",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "rounded-full font-medium transition-colors flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}
