import { useState } from "react";
import { Card } from "../ui/Card";
import { Input, Select } from "../ui/Input";
import { Button } from "../ui/Button";
import { Plus } from "lucide-react";
import { useExpenses } from "../../context/ExpenseContext";

export function SmartInput() {
    const { addExpense } = useExpenses();
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("0");
    const [category, setCategory] = useState("Food & Dining");

    const handleAdd = () => {
        if (!title || !amount) return;
        addExpense({ title, amount: parseFloat(amount), category });
        setTitle("");
        setAmount("0");
    };

    return (
        <Card className="col-span-12 md:col-span-8 lg:col-span-5 flex flex-col justify-center">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Quick Add</h3>
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What did you buy?"
                        className="flex-1"
                    />
                    <Input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="₹0.00"
                        type="number"
                        className="w-32"
                    />
                </div>
                <div className="flex gap-4">
                    <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1"
                    >
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Utilities">Utilities</option>
                    </Select>
                    <Button onClick={handleAdd} size="icon" className="w-12 h-12 flex-shrink-0 bg-accent-blue hover:bg-accent-blue/80 rounded-xl">
                        <Plus size={24} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
