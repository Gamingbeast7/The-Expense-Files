import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, endOfDay } from "date-fns";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    getDoc,
    where,
    getDocs,
    arrayUnion
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
    const { currentUser } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [goals, setGoals] = useState([]);
    const [budget, setBudget] = useState(0);
    const [user, setUser] = useState({ name: currentUser?.displayName || "User" });
    const [loading, setLoading] = useState(true);

    // Sync User Profile
    useEffect(() => {
        if (currentUser) {
            setUser({
                name: currentUser.displayName || "User",
                email: currentUser.email,
                photoURL: currentUser.photoURL
            });
        }
    }, [currentUser]);

    // Fetch Expenses and Goals from Firestore
    useEffect(() => {
        if (!currentUser) {
            setExpenses([]);
            setGoals([]);
            setBudget(0);
            setLoading(false);
            return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const expensesRef = collection(userDocRef, "expenses");
        const goalsRef = collection(userDocRef, "goals");

        // Real-time listener for Expenses
        const unsubscribeExpenses = onSnapshot(query(expensesRef, orderBy("date", "desc")), (snapshot) => {
            const expensesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setExpenses(expensesData);
        });

        // Real-time listener for Goals
        const unsubscribeGoals = onSnapshot(goalsRef, (snapshot) => {
            const goalsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGoals(goalsData);
        });

        // Fetch User Budget/Settings
        // We can store budget directly on the user document
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.budget) setBudget(data.budget);
            } else {
                // Create user doc if it doesn't exist
                setDoc(userDocRef, {
                    email: currentUser.email,
                    createdAt: new Date()
                }, { merge: true });
            }
        });

        setLoading(false);

        return () => {
            unsubscribeExpenses();
            unsubscribeGoals();
            unsubscribeUser();
        };
    }, [currentUser]);

    // Group Features State
    const [groups, setGroups] = useState([]);
    const [groupExpenses, setGroupExpenses] = useState([]);
    const [currentGroup, setCurrentGroup] = useState(null);

    // Fetch User's Groups
    useEffect(() => {
        if (!currentUser) {
            setGroups([]);
            return;
        }

        // In a real app, we'd query groups where 'members' array-contains currentUser.uid
        // For MVP with "Virtual Friends", we just store groups under the user's document for now
        // OR we create a top-level 'groups' collection if we want real sharing later.
        // Let's go with top-level 'groups' collection where members include current user.

        const q = query(collection(db, "groups"), where("members", "array-contains", currentUser.uid));
        const unsubscribeGroups = onSnapshot(q, (snapshot) => {
            const groupsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGroups(groupsData);
        });

        return () => unsubscribeGroups();
    }, [currentUser]);

    const createGroup = async (name, friendNames) => {
        if (!currentUser) return;
        try {
            // group members: current user + virtual friends
            // We store virtual friends as simple strings in a 'friends' array
            // Real members (authUser) in 'members' array
            await addDoc(collection(db, "groups"), {
                name,
                members: [currentUser.uid],
                friends: friendNames || [], // ["Alice", "Bob"]
                createdBy: currentUser.uid,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error creating group: ", e);
            throw e;
        }
    };

    const fetchGroupExpenses = (groupId) => {
        const expensesRef = collection(db, "groups", groupId, "expenses");
        return onSnapshot(query(expensesRef, orderBy("date", "desc")), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGroupExpenses(data);
        });
    };

    const addGroupExpense = async (groupId, expenseData) => {
        // expenseData: { title, amount, date, paidBy, splitType, involvedMembers, syncToPersonal }
        if (!currentUser) return;
        try {
            await addDoc(collection(db, "groups", groupId, "expenses"), {
                ...expenseData,
                createdBy: currentUser.uid,
                createdAt: new Date()
            });

            // Sync to personal expenses if requested and user paid
            // We assume if "paidBy" is "Me" or currentUser.uid, then it's an expense for the user.
            // Logic: Users usually want to track what THEY spent.
            if (expenseData.syncToPersonal && (expenseData.paidBy === "Me" || expenseData.paidBy === currentUser.uid)) {
                await addExpense({
                    title: `[Group] ${expenseData.title}`,
                    amount: expenseData.amount, // Full amount they paid
                    date: expenseData.date,
                    category: "Shared", // Or let them choose, but default to Shared for now
                });
            }
        } catch (e) {
            console.error("Error adding group expense: ", e);
            throw e;
        }
    };

    const updateUser = async (name) => {
        // In a real app we might update the Firebase Auth profile or a custom user document
        // For now, just local state update for UI, and maybe custom doc
        setUser(prev => ({ ...prev, name }));
        // functionality to update firebase profile could go here
    };

    const addExpense = async (expense) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, "users", currentUser.uid, "expenses"), {
                ...expense,
                date: expense.date || new Date().toISOString(),
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error adding expense: ", e);
        }
    };

    const deleteExpense = async (id) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "expenses", id));
        } catch (e) {
            console.error("Error deleting expense: ", e);
        }
    };

    const addGoal = async (goal) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, "users", currentUser.uid, "goals"), {
                ...goal,
                createdAt: new Date()
            });
        } catch (e) {
            console.error("Error adding goal: ", e);
        }
    };

    const updateGoal = async (id, amount) => {
        if (!currentUser) return;
        // This logic is a bit specific: existing 'updateGoal' added amount to current.
        // We need to find the goal first or trust the passed logic. 
        // For simplicity, let's assume we pass the NEW current value or we read it first.
        // Actually the UI likely passes the amount to ADD.

        const goalToUpdate = goals.find(g => g.id === id);
        if (!goalToUpdate) return;

        const newCurrent = (goalToUpdate.current || 0) + parseFloat(amount);

        try {
            await updateDoc(doc(db, "users", currentUser.uid, "goals", id), {
                current: newCurrent
            });
        } catch (e) {
            console.error("Error updating goal: ", e);
        }
    };

    const deleteGoal = async (id) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "goals", id));
        } catch (e) {
            console.error("Error deleting goal: ", e);
        }
    };

    const updateBudget = async (newBudget) => {
        if (!currentUser) return;
        try {
            await setDoc(doc(db, "users", currentUser.uid), { budget: newBudget }, { merge: true });
            setBudget(newBudget);
        } catch (e) {
            console.error("Error updating budget: ", e);
        }
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

    const searchUsers = async (searchTerm) => {
        // Query users where username >= searchTerm and username <= searchTerm + '\uf8ff'
        // This is a standard Firestore prefix search technique
        const q = query(
            collection(db, "users"),
            where("username", ">=", searchTerm),
            where("username", "<=", searchTerm + '\uf8ff')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    };

    const updateGroup = async (groupId, data) => {
        if (!currentUser) return;
        await updateDoc(doc(db, "groups", groupId), data);
    };

    const deleteGroup = async (groupId) => {
        if (!currentUser) return;
        await deleteDoc(doc(db, "groups", groupId));
    };

    const addMemberToGroup = async (groupId, newMember) => {
        // newMember: { uid, username, displayName }
        if (!currentUser) return;
        const groupRef = doc(db, "groups", groupId);
        // We need to update 'members' array (uids) and 'friends' array (for display/virtual)
        // Note: Our previous createGroup used 'friends' as full objects now? 
        // Let's check createGroup in Groups.jsx. It passes selectedFriends array of objects.
        // But createGroup in ExpenseContext uses 'friends' field.

        await updateDoc(groupRef, {
            members: arrayUnion(newMember.uid),
            friends: arrayUnion(newMember)
        });
    };

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
            setBudget: updateBudget,
            goals,
            addGoal,
            updateGoal,
            deleteGoal,
            user,
            updateUser,
            loading,
            // Group Features
            groups,
            createGroup,
            addGroupExpense,
            groupExpenses,
            fetchGroupExpenses,
            currentGroup,
            setCurrentGroup,
            searchUsers,
            updateGroup,
            deleteGroup,
            addMemberToGroup
        }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export const useExpenses = () => useContext(ExpenseContext);
