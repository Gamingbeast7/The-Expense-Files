import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function login() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    // Fetch additional user data from Firestore (e.g. username)
                    const userDocRef = doc(db, "users", user.uid);
                    try {
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            setCurrentUser({ ...user, ...userDocSnap.data() });
                        } else {
                            await setDoc(userDocRef, {
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL,
                                createdAt: new Date()
                            }, { merge: true });
                            setCurrentUser(user);
                        }
                    } catch (firestoreErr) {
                        console.warn("Could not fetch or create user document in Firestore:", firestoreErr);
                        setCurrentUser(user);
                    }
                } else {
                    setCurrentUser(null);
                }
            } catch (err) {
                console.error("Auth state change error:", err);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const checkUsernameAvailability = async (username) => {
        try {
            const q = query(collection(db, "users"), where("username", "==", username));
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty;
        } catch (err) {
            console.error("Error checking username availability:", err);
            return true;
        }
    };

    const updateUsername = async (username) => {
        if (!currentUser) return;
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            await setDoc(userDocRef, {
                username,
                email: currentUser.email || "",
                displayName: currentUser.displayName || "",
                photoURL: currentUser.photoURL || "",
                updatedAt: new Date()
            }, { merge: true });
            setCurrentUser(prev => ({ ...prev, username }));
        } catch (err) {
            console.error("Error updating username in Firestore:", err);
            // Fallback: still update user in memory so the app is not blocked
            setCurrentUser(prev => ({ ...prev, username }));
        }
    };

    const value = {
        currentUser,
        login,
        logout,
        checkUsernameAvailability,
        updateUsername
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen w-full bg-dark text-white flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 text-sm font-medium">Loading The Expense Files...</p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
