import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import logo from "../assets/logo.png";
import { Loader2 } from "lucide-react";

export function Login() {
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    const handleLogin = async () => {
        try {
            await login();
            navigate("/");
        } catch (error) {
            console.error("Failed to login", error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-dark text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1C1C1E] border border-white-10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

                {/* Background Ambience within card */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-accent-blue/5 blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        src={logo}
                        alt="Logo"
                        className="w-20 h-20 rounded-2xl shadow-lg shadow-accent-blue/20 mb-6"
                    />

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
                    >
                        Welcome Back
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-gray-400 mb-8"
                    >
                        Sign in to manage your expenses and track your goals.
                    </motion.p>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        onClick={handleLogin}
                        className="w-full h-12 rounded-xl bg-white text-dark font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        Sign in with Google
                    </motion.button>
                </div>
            </div>

            {/* Page Background Ambience */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/20 blur-[120px] rounded-full pointer-events-none opacity-20" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/20 blur-[120px] rounded-full pointer-events-none opacity-20" />
        </div>
    );
}
