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
    const [expenses, setExpenses] = useState(() => {
        if (currentUser?.uid) {
            try {
                const saved = localStorage.getItem(`expenses_${currentUser.uid}`);
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });
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

        // 1. Immediately load from local cache if available
        try {
            const cached = localStorage.getItem(`expenses_${currentUser.uid}`);
            if (cached) {
                setExpenses(JSON.parse(cached));
            }
        } catch (e) {}

        const userDocRef = doc(db, "users", currentUser.uid);
        const expensesRef = collection(userDocRef, "expenses");
        const goalsRef = collection(userDocRef, "goals");

        // Helper to process and sort expenses
        const handleExpensesSnapshot = (snapshot) => {
            const expensesData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    amount: parseFloat(data.amount) || 0,
                    date: data.date || new Date().toISOString()
                };
            });

            expensesData.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            setExpenses(expensesData);
            try {
                localStorage.setItem(`expenses_${currentUser.uid}`, JSON.stringify(expensesData));
            } catch (e) {}
        };

        // Real-time listener for Expenses
        let unsubscribeExpenses = () => {};
        try {
            unsubscribeExpenses = onSnapshot(
                query(expensesRef, orderBy("date", "desc")),
                handleExpensesSnapshot,
                (err) => {
                    console.warn("Ordered snapshot failed, falling back to unordered listener:", err);
                    // Fallback to unordered query if composite index or mixed types fail
                    unsubscribeExpenses = onSnapshot(expensesRef, handleExpensesSnapshot, (fallbackErr) => {
                        console.error("Expenses listener failed:", fallbackErr);
                    });
                }
            );
        } catch (e) {
            unsubscribeExpenses = onSnapshot(expensesRef, handleExpensesSnapshot, console.error);
        }

        // Real-time listener for Goals
        const unsubscribeGoals = onSnapshot(goalsRef, (snapshot) => {
            const goalsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGoals(goalsData);
        }, (err) => {
            console.error("Goals listener error:", err);
        });

        // Fetch User Budget/Settings
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.budget) setBudget(data.budget);
            } else {
                setDoc(userDocRef, {
                    email: currentUser.email,
                    createdAt: new Date().toISOString()
                }, { merge: true }).catch(console.error);
            }
        }, (err) => {
            console.error("User doc listener error:", err);
        });

        setLoading(false);

        return () => {
            if (typeof unsubscribeExpenses === 'function') unsubscribeExpenses();
            if (typeof unsubscribeGoals === 'function') unsubscribeGoals();
            if (typeof unsubscribeUser === 'function') unsubscribeUser();
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

    const createGroup = async (name, friendObjectsOrNames) => {
        if (!currentUser) return;
        try {
            const rawFriends = friendObjectsOrNames || [];
            // Format friends into consistent objects
            const friendsList = rawFriends.map(f => {
                if (typeof f === 'string') {
                    return {
                        uid: `friend_${Date.now()}_${f.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
                        username: f.replace(/^@/, ''),
                        displayName: f.replace(/^@/, '')
                    };
                }
                return f;
            });

            // Extract uids of registered friends
            const friendUids = friendsList
                .map(f => (f.uid && !f.uid.startsWith('friend_') && !f.uid.startsWith('virtual_') ? f.uid : null))
                .filter(Boolean);

            const allMemberUids = Array.from(new Set([currentUser.uid, ...friendUids]));

            await addDoc(collection(db, "groups"), {
                name: name.trim(),
                members: allMemberUids,
                friends: friendsList,
                createdBy: currentUser.uid,
                creatorEmail: (currentUser.email || "").toLowerCase(),
                createdAt: new Date().toISOString()
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
        if (!currentUser || !groupId) return;
        try {
            const validAmount = parseFloat(expenseData.amount) || 0;
            const validDate = expenseData.date ? new Date(expenseData.date).toISOString() : new Date().toISOString();

            const cleanGroupExpense = {
                title: (expenseData.title || "").trim(),
                amount: validAmount,
                date: validDate,
                paidBy: expenseData.paidBy || "Me",
                splitType: expenseData.splitType || "EQUAL",
                involvedMembers: expenseData.involvedMembers || [],
                payers: expenseData.payers || [],
                syncToPersonal: !!expenseData.syncToPersonal,
                createdBy: currentUser.uid,
                creatorEmail: (currentUser.email || "").toLowerCase(),
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, "groups", groupId, "expenses"), cleanGroupExpense);

            // Sync to personal expenses if requested and user paid
            if (expenseData.syncToPersonal) {
                let personalAmount = validAmount;
                if ((expenseData.splitType === 'EQUAL' || !expenseData.splitType) && Array.isArray(expenseData.involvedMembers) && expenseData.involvedMembers.length > 0) {
                    const amIInvolved = expenseData.involvedMembers.includes('Me') ||
                        expenseData.involvedMembers.includes(currentUser.uid) ||
                        expenseData.involvedMembers.includes(currentUser.displayName) ||
                        expenseData.involvedMembers.includes(currentUser.username);

                    if (amIInvolved) {
                        personalAmount = validAmount / expenseData.involvedMembers.length;
                    }
                }

                if (personalAmount > 0) {
                    await addExpense({
                        title: `[Group] ${cleanGroupExpense.title}`,
                        amount: parseFloat(personalAmount.toFixed(2)),
                        date: validDate,
                        category: "Shared",
                        paymentSource: "Group Split"
                    });
                }
            }
        } catch (e) {
            console.error("Error adding group expense: ", e);
            throw e;
        }
    };

    const updateGroupExpense = async (groupId, expenseId, data) => {
        if (!currentUser || !groupId || !expenseId) return;
        try {
            const expenseRef = doc(db, "groups", groupId, "expenses", expenseId);
            await updateDoc(expenseRef, data);
        } catch (e) {
            console.error("Error updating group expense: ", e);
            throw e;
        }
    };

    const deleteGroupExpense = async (groupId, expenseId) => {
        if (!currentUser || !groupId || !expenseId) return;
        try {
            await deleteDoc(doc(db, "groups", groupId, "expenses", expenseId));
        } catch (e) {
            console.error("Error deleting group expense: ", e);
            throw e;
        }
    };

    const updateUser = async (name) => {
        setUser(prev => ({ ...prev, name }));
    };

    const addExpense = async (expense) => {
        if (!currentUser) return;
        const tempId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const validAmount = parseFloat(expense.amount) || 0;
        const validDate = expense.date ? new Date(expense.date).toISOString() : new Date().toISOString();

        const cleanExpense = {
            id: tempId,
            title: (expense.title || "").trim(),
            amount: validAmount,
            category: expense.category || "Other",
            date: validDate,
            paymentSource: expense.paymentSource || "UPI",
            image: typeof expense.image === 'string' ? expense.image : '',
            createdAt: new Date().toISOString(),
            userId: currentUser.uid
        };

        // 1. Instantly update local state and localStorage
        setExpenses(prev => {
            const updated = [cleanExpense, ...prev.filter(e => e.id !== tempId)];
            try {
                localStorage.setItem(`expenses_${currentUser.uid}`, JSON.stringify(updated));
            } catch (err) {}
            return updated;
        });

        // 2. Persist to Firestore
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const docRef = await addDoc(collection(userDocRef, "expenses"), {
                title: cleanExpense.title,
                amount: cleanExpense.amount,
                category: cleanExpense.category,
                date: cleanExpense.date,
                paymentSource: cleanExpense.paymentSource,
                image: cleanExpense.image,
                createdAt: cleanExpense.createdAt
            });

            // Replace temporary ID with Firestore ID
            setExpenses(prev => {
                const updated = prev.map(e => e.id === tempId ? { ...e, id: docRef.id } : e);
                try {
                    localStorage.setItem(`expenses_${currentUser.uid}`, JSON.stringify(updated));
                } catch (err) {}
                return updated;
            });
        } catch (e) {
            console.error("Error adding expense to Firestore: ", e);
        }
    };

    const deleteExpense = async (id) => {
        if (!currentUser || !id) return;
        // Optimistic delete
        setExpenses(prev => {
            const updated = prev.filter(e => e.id !== id);
            try {
                localStorage.setItem(`expenses_${currentUser.uid}`, JSON.stringify(updated));
            } catch (err) {}
            return updated;
        });

        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            await deleteDoc(doc(userDocRef, "expenses", id));
        } catch (e) {
            console.error("Error deleting expense from Firestore: ", e);
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
        if (!searchTerm) return [];
        const cleanTerm = searchTerm.trim().toLowerCase().replace(/^@/, '');
        if (cleanTerm.length < 2) return [];

        try {
            // Query users where username matches prefix
            const qUsername = query(
                collection(db, "users"),
                where("username", ">=", cleanTerm),
                where("username", "<=", cleanTerm + '\uf8ff')
            );

            // Query by email
            const qEmail = query(
                collection(db, "users"),
                where("email", ">=", cleanTerm),
                where("email", "<=", cleanTerm + '\uf8ff')
            );

            const [usernameSnap, emailSnap] = await Promise.allSettled([
                getDocs(qUsername),
                getDocs(qEmail)
            ]);

            const results = new Map();

            if (usernameSnap.status === 'fulfilled') {
                usernameSnap.value.docs.forEach(doc => {
                    const data = doc.data();
                    results.set(doc.id, {
                        uid: doc.id,
                        ...data,
                        username: data.username || doc.id
                    });
                });
            }

            if (emailSnap.status === 'fulfilled') {
                emailSnap.value.docs.forEach(doc => {
                    if (!results.has(doc.id)) {
                        const data = doc.data();
                        results.set(doc.id, {
                            uid: doc.id,
                            ...data,
                            username: data.username || data.email?.split('@')[0] || doc.id
                        });
                    }
                });
            }

            // Exclude current user from search results
            if (currentUser?.uid) {
                results.delete(currentUser.uid);
            }

            return Array.from(results.values());
        } catch (err) {
            console.error("searchUsers failed:", err);
            return [];
        }
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
        if (!currentUser || !groupId || !newMember) return;
        const groupRef = doc(db, "groups", groupId);
        
        const updates = {
            friends: arrayUnion(newMember)
        };

        if (newMember.uid && !newMember.uid.startsWith('friend_') && !newMember.uid.startsWith('virtual_')) {
            updates.members = arrayUnion(newMember.uid);
        }

        await updateDoc(groupRef, updates);
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
            updateGroupExpense,
            deleteGroupExpense,
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
