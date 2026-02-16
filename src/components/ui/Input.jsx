import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "w-full bg-white-5 border border-white-10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500",
                "focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue",
                "transition-all duration-200",
                className
            )}
            {...props}
        />
    );
}

export function Select({ className, children, ...props }) {
    return (
        <div className="relative">
            <select
                className={cn(
                    "w-full bg-white-5 border border-white-10 rounded-xl pl-4 pr-10 py-3 text-white appearance-none",
                    "focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue",
                    "transition-all duration-200 cursor-pointer",
                    className
                )}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                {/* Simple arrow icon */}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
}
