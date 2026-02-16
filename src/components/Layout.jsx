import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpenses } from "../context/ExpenseContext";
import { X, User } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Footer } from "./Footer";
import logo from "../assets/logo.png";

export function Layout({ children }) {
    const { user, updateUser } = useExpenses();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [newName, setNewName] = useState(user?.name || "");

    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
        : "JD";

    const handleSave = (e) => {
        e.preventDefault();
        updateUser(newName);
        setIsProfileOpen(false);
    };

    return (
        <div className="min-h-screen w-full bg-dark text-white p-4 md:p-8 flex items-center justify-center font-sans selection:bg-accent-blue selection:text-white">
            <div className="max-w-[1400px] w-full mx-auto relative z-10">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="The Expense Files Logo" className="w-12 h-12 rounded-xl shadow-lg shadow-accent-blue/20" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                The Expense Files
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Manage your finances with style.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setNewName(user.name);
                            setIsProfileOpen(true);
                        }}
                        className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white-10 flex items-center justify-center hover:ring-2 hover:ring-accent-blue transition-all"
                    >
                        <span className="text-xs font-bold text-white">{initials}</span>
                    </button>
                </motion.header>
                {children}
                <Footer />
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isProfileOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1C1C1E] border border-white-10 rounded-2xl p-6 w-full max-w-sm relative"
                        >
                            <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                            <div className="flex flex-col items-center mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mb-4 text-xl font-bold">
                                    {initials}
                                </div>
                                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
                                    <Input
                                        autoFocus
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <Button type="submit" className="w-full">Save Changes</Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Background Ambience */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/20 blur-[120px] rounded-full pointer-events-none opacity-20" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/20 blur-[120px] rounded-full pointer-events-none opacity-20" />
        </div>
    );
}
