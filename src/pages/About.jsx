import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Github, Linkedin, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import prathamImg from "../assets/Pratham.JPG";
import yashImg from "../assets/Yash.jpeg";
import krrishImg from "../assets/Krrish.jpeg";
import vishalImg from "../assets/Vishal.jpeg";

// import prathamImg from "../assets/pratham.jpg";

const TEAM = [
    { name: "Pratham Jain", role: "Full Stack Developer", image: prathamImg },
    { name: "Yash Jain", role: "Frontend Developer", image: yashImg },
    { name: "Krrish Jain", role: "UI/UX Designer", image: krrishImg },
    { name: "Vishal S", role: "Backend Developer", image: vishalImg },
];

export function About() {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <button
                onClick={() => navigate("/")}
                className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink bg-clip-text text-transparent mb-6">
                    Stephen Bhawkings
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Building the future of personal finance, one pixel at a time.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                <Card className="p-8 border-accent-blue/20 bg-accent-blue/5">
                    <h2 className="text-2xl font-bold text-white mb-4">The Mission</h2>
                    <p className="text-gray-400 leading-relaxed">
                        To simplify expense tracking for everyone. We believe managing money shouldn't be a chore—it should be a delightful, insightful experience that empowers you to reach your financial goals.
                    </p>
                </Card>
                <Card className="p-8 border-accent-purple/20 bg-accent-purple/5">
                    <h2 className="text-2xl font-bold text-white mb-4">The Spark</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Born from the "Sparkathon" hackathon, this project represents our commitment to clean code, beautiful design, and solving real-world problems with modern technology.
                    </p>
                </Card>
            </div>

            <h2 className="text-2xl font-bold text-white mb-8 text-center">Meet the Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TEAM.map((member, index) => (
                    <motion.div
                        key={member.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="text-center h-full hover:bg-white-10 transition-colors">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white-10 mx-auto mb-4 flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                                {member.image ? (
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    member.name.split(" ").map(n => n[0]).join("")
                                )}
                            </div>
                            <h3 className="font-bold text-white">{member.name}</h3>
                            <p className="text-xs text-accent-blue mt-1">{member.role}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="mt-20 text-center border-t border-white-5 pt-10">
                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} The Expense Files. All rights reserved.
                </p>
            </div>
        </div>
    );
}
