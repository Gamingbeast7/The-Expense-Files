import { useState } from "react";
import { motion } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Upload, Calendar, ArrowRight } from "lucide-react";
import { useExpenses } from "../context/ExpenseContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
    { id: "Food & Dining", name: "Food", emoji: "🍔" },
    { id: "Transportation", name: "Travel", emoji: "🚕" },
    { id: "Entertainment", name: "Entertainment", emoji: "🎮" },
    { id: "Shopping", name: "Shopping", emoji: "🛍️" },
    { id: "Utilities", name: "Bills", emoji: "💡" },
    { id: "Health", name: "Health", emoji: "💊" },
    { id: "Education", name: "Education", emoji: "📚" },
    { id: "Other", name: "Other", emoji: "📦" },
];

export function AddExpense() {
    const { addExpense } = useExpenses();
    const navigate = useNavigate();

    const [amount, setAmount] = useState("0");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("Food & Dining");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [paymentSource, setPaymentSource] = useState("UPI");
    const [customSource, setCustomSource] = useState("");
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !description) return;

        addExpense({
            title: description,
            amount: parseFloat(amount),
            category,
            date: date || new Date().toISOString(),
            paymentSource: paymentSource === "Other" ? customSource : paymentSource,
            image: preview // Store URL for demo
        });

        navigate("/transactions");
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <BackButton />
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">New Expense</h1>
                        <p className="text-gray-400">Log a new transaction.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl font-bold">₹</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-10 text-xl font-bold h-14"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        className="pl-10"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-4">Category</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {CATEGORIES.map((cat) => (
                                        <div
                                            key={cat.id}
                                            onClick={() => setCategory(cat.id)}
                                            className={`
                                                flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all border-2 aspect-square
                                                ${category === cat.id
                                                    ? "bg-white-10 border-accent-blue text-white shadow-[0_0_15px_rgba(0,122,255,0.3)]"
                                                    : "bg-white-5 border-transparent hover:bg-white-10 text-gray-500 hover:border-white-10"}
                                            `}
                                        >
                                            <span className="text-3xl mb-1 filter drop-shadow-md">{cat.emoji}</span>
                                            <span className={`text-[10px] font-medium leading-tight ${category === cat.id ? 'text-white' : 'text-gray-400'}`}>
                                                {cat.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Payment Source</label>
                            <div className="grid grid-cols-4 gap-3">
                                {["Cash", "UPI", "Card", "Other"].map((source) => (
                                    <div
                                        key={source}
                                        onClick={() => setPaymentSource(source)}
                                        className={`
                                            flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all border
                                            ${paymentSource === source
                                                ? "bg-accent-blue text-white border-accent-blue"
                                                : "bg-white-5 border-transparent hover:bg-white-10 text-gray-400"}
                                        `}
                                    >
                                        <span className="text-sm font-medium">{source}</span>
                                    </div>
                                ))}
                            </div>
                            {paymentSource === "Other" && (
                                <Input
                                    placeholder="Enter payment method (e.g. NetBanking)"
                                    value={customSource}
                                    onChange={(e) => setCustomSource(e.target.value)}
                                    className="mt-4"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                            <Input
                                placeholder="What was this for?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Attachment</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="border-2 border-dashed border-white-10 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-white/30 hover:bg-white-5 transition-colors cursor-pointer overflow-hidden relative"
                                >
                                    {preview ? (
                                        <div className="absolute inset-0">
                                            <img src={preview} alt="Receipt preview" className="w-full h-full object-cover opacity-50" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                                                <Upload size={32} className="mb-2 text-white" />
                                                <p className="text-sm text-white">Change Receipt</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={32} className="mb-2" />
                                            <p className="text-sm">Click to upload receipt</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <input type="checkbox" id="recurring" className="rounded border-white-10 bg-white-5 text-accent-blue focus:ring-accent-blue" />
                            <label htmlFor="recurring" className="text-sm text-gray-300">This is a recurring expense</label>
                        </div>

                        <Button type="submit" className="w-full py-4 text-lg">
                            Save Transaction
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
