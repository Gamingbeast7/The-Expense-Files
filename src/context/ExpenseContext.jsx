import { createContext, useContext, useState, useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, endOfDay } from "date-fns";

const ExpenseContext = createContext();

const INITIAL_EXPENSES = [];

const INITIAL_GOALS = [];

export function ExpenseProvider({ children }) {
    const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
    const [goals, setGoals] = useState(INITIAL_GOALS);
    const [budget, setBudget] = useState(0);
    const [user, setUser] = useState({ name: "John Doe" });

    const updateUser = (name) => {
        setUser({ name });
    };

    const addExpense = (expense) => {
        setExpenses(prev => [{ ...expense, id: Date.now(), date: expense.date || new Date().toISOString() }, ...prev]);
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    const addGoal = (goal) => {
        setGoals(prev => [...prev, { ...goal, id: Date.now() }]);
    };

    const updateGoal = (id, amount) => {
        setGoals(prev => prev.map(goal =>
            goal.id === id ? { ...goal, current: goal.current + parseFloat(amount) } : goal
        ));
    };

    const deleteGoal = (id) => {
        setGoals(prev => prev.filter(goal => goal.id !== id));
    };

    const totalBalance = useMemo(() => {
        return expenses.reduce((acc, curr) => acc + curr.amount, 0);
    }, [expenses]);

    const monthlySpending = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        return expenses
            .filter(e => {
                const d = new Date(e.date);
                return d >= start && d <= end;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);
    }, [expenses]);

    const lastMonthSpending = useMemo(() => {
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        const start = startOfMonth(lastMonth);
        const end = endOfMonth(lastMonth);
        return expenses
            .filter(e => {
                const d = new Date(e.date);
                return d >= start && d <= end;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);
    }, [expenses]);

    const categoryBreakdown = useMemo(() => {
        const data = {};
        expenses.forEach(e => {
            if (!data[e.category]) data[e.category] = 0;
            data[e.category] += e.amount;
        });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [expenses]);

    const spendingTrends = useMemo(() => {
        const now = new Date();
        const start = subMonths(now, 1);
        // Group by week for the last month
        const weeks = [
            { name: "Week 1", start: startOfMonth(now), end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 7)) },
            { name: "Week 2", start: new Date(now.getFullYear(), now.getMonth(), 8), end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 14)) },
            { name: "Week 3", start: new Date(now.getFullYear(), now.getMonth(), 15), end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 21)) },
            { name: "Week 4", start: new Date(now.getFullYear(), now.getMonth(), 22), end: endOfMonth(now) },
        ];

        return weeks.map(week => {
            const val = expenses
                .filter(e => {
                    const d = new Date(e.date);
                    return d >= week.start && d <= week.end;
                })
                .reduce((acc, curr) => acc + curr.amount, 0);
            return { name: week.name, value: val };
        });
    }, [expenses]);

    return (
        <ExpenseContext.Provider value={{
            expenses,
            addExpense,
            deleteExpense,
            totalBalance,
            monthlySpending,
            lastMonthSpending,
            categoryBreakdown,
            spendingTrends,
            budget,
            budget,
            setBudget,
            goals,
            addGoal,
            updateGoal,
            goals,
            addGoal,
            updateGoal,
            deleteGoal,
            user,
            updateUser
        }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export const useExpenses = () => useContext(ExpenseContext);
