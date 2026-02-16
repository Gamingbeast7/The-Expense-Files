import { motion } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Search, ShoppingBag, Coffee, Car, Zap, Film, Download, Trash2, Heart, GraduationCap, MoreHorizontal, Paperclip, X } from "lucide-react";
import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { format } from "date-fns";

const ICONS = {
    "Food & Dining": <Coffee size={20} />,
    "Transportation": <Car size={20} />,
    "Entertainment": <Film size={20} />,
    "Shopping": <ShoppingBag size={20} />,
    "Utilities": <Zap size={20} />,
    "Health": <Heart size={20} />,
    "Education": <GraduationCap size={20} />,
    "Other": <MoreHorizontal size={20} />,
};

export function Transactions() {
    const { expenses, deleteExpense } = useExpenses();
    const [selectedImage, setSelectedImage] = useState(null);

    const downloadCSV = () => {
        const headers = ["Date,Title,Category,Amount,Receipt"];
        const rows = expenses.map(e =>
            `${format(new Date(e.date), "yyyy-MM-dd")},"${e.title}","${e.category}",${e.amount},"${e.image || ''}"`
        );
        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            deleteExpense(id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <BackButton />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
                        <p className="text-gray-400">View and manage your transaction history.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <Input placeholder="Search transactions..." className="pl-10 w-full md:w-64 bg-white-5 border-white-10" />
                        </div>
                        <Button onClick={downloadCSV} variant="secondary" className="flex items-center gap-2">
                            <Download size={18} />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {expenses.map((expense) => (
                        <Card key={expense.id} className="flex items-center justify-between p-4 hover:bg-white-5 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white-10 flex items-center justify-center text-accent-blue">
                                    {ICONS[expense.category] || <ShoppingBag size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white flex items-center gap-2">
                                        {expense.title}
                                        {expense.image && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage(expense.image);
                                                }}
                                                className="hover:text-accent-blue transition-colors"
                                            >
                                                <Paperclip size={14} />
                                            </button>
                                        )}
                                    </h4>
                                    <p className="text-sm text-gray-500">{format(new Date(expense.date), "MMM d, yyyy")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="block font-bold text-white">₹{expense.amount.toFixed(2)}</span>
                                    <span className="text-xs text-gray-500">{expense.category}</span>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(expense.id, e)}
                                    className="p-2 text-gray-500 hover:text-accent-red hover:bg-white-10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Transaction"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Card>
                    ))}

                    {/* Dummy infinite scroll loader */}
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No more transactions to load.
                    </div>
                </div>
            </motion.div>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Receipt"
                            className="max-w-full max-h-[85vh] object-contain"
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}
