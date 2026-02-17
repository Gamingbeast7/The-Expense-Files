import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import { Check, X, AlertCircle } from "lucide-react";

export function UsernameSetup() {
    const { currentUser, checkUsernameAvailability, updateUsername } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null); // null, true, false
    const [error, setError] = useState("");

    useEffect(() => {
        if (currentUser && !currentUser.username) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [currentUser]);

    // Debounce check
    useEffect(() => {
        const check = async () => {
            if (username.length < 3) {
                setIsAvailable(null);
                return;
            }
            setIsChecking(true);
            const available = await checkUsernameAvailability(username);
            setIsAvailable(available);
            setIsChecking(false);
        };

        const timeout = setTimeout(check, 500);
        return () => clearTimeout(timeout);
    }, [username, checkUsernameAvailability]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAvailable || username.length < 3) return;

        try {
            await updateUsername(username);
            setIsOpen(false);
        } catch (e) {
            console.error("Error setting username:", e);
            setError("Failed to set username. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#1C1C1E] border border-white-10 rounded-2xl p-8 w-full max-w-md text-center"
                >
                    <div className="w-16 h-16 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl font-bold">@</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Choose a Username</h2>
                    <p className="text-gray-400 mb-8">
                        Pick a unique username so your friends can find you and add you to groups.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                            <Input
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                                    setError("");
                                }}
                                className={`pl-10 ${isAvailable === true ? "border-green-500/50 focus:border-green-500" : isAvailable === false ? "border-red-500/50 focus:border-red-500" : ""}`}
                                placeholder="username"
                                autoFocus
                            />
                            {isChecking && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                            {!isChecking && isAvailable === true && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                                    <Check size={18} />
                                </div>
                            )}
                            {!isChecking && isAvailable === false && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                                    <X size={18} />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm flex items-center justify-center gap-2">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}
                        {!isChecking && isAvailable === false && (
                            <p className="text-red-400 text-sm">Username is already taken.</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-3"
                            disabled={!isAvailable || isChecking || username.length < 3}
                        >
                            Set Username
                        </Button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
