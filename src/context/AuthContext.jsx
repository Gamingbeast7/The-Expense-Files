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
                    const normalizedEmail = (user.email || "").toLowerCase();
                    const cachedUsername = localStorage.getItem(`username_${user.uid}`) || 
                                           (normalizedEmail ? localStorage.getItem(`username_${normalizedEmail}`) : null);

                    let userData = {
                        uid: user.uid,
                        email: normalizedEmail,
                        displayName: user.displayName || "",
                        photoURL: user.photoURL || "",
                        username: cachedUsername || ""
                    };

                    // Fetch additional user data from Firestore
                    const userDocRef = doc(db, "users", user.uid);
                    try {
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            const firestoreData = userDocSnap.data();
                            const resolvedUsername = firestoreData.username || cachedUsername || "";
                            
                            userData = {
                                ...user,
                                ...firestoreData,
                                username: resolvedUsername
                            };

                            if (resolvedUsername) {
                                localStorage.setItem(`username_${user.uid}`, resolvedUsername);
                                if (normalizedEmail) localStorage.setItem(`username_${normalizedEmail}`, resolvedUsername);
                            }
                        } else {
                            // Create document linking email and username
                            await setDoc(userDocRef, {
                                uid: user.uid,
                                email: normalizedEmail,
                                displayName: user.displayName || "",
                                photoURL: user.photoURL || "",
                                username: cachedUsername || "",
                                createdAt: new Date().toISOString()
                            }, { merge: true });

                            userData = {
                                ...user,
                                email: normalizedEmail,
                                username: cachedUsername || ""
                            };
                        }
                    } catch (firestoreErr) {
                        console.warn("Could not fetch or create user document in Firestore:", firestoreErr);
                    }

                    setCurrentUser(userData);
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

    const checkUsernameAvailability = async (rawUsername) => {
        const clean = rawUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
        if (!clean) return false;
        try {
            const q = query(collection(db, "users"), where("username", "==", clean));
            const querySnapshot = await getDocs(q);
            // Available if no docs found, or the only doc found is the current user's
            if (querySnapshot.empty) return true;
            return querySnapshot.docs.every(d => d.id === currentUser?.uid);
        } catch (err) {
            console.error("Error checking username availability:", err);
            return true;
        }
    };

    const updateUsername = async (rawUsername) => {
        if (!currentUser) return;
        const clean = rawUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
        if (!clean) return;

        const normalizedEmail = (currentUser.email || "").toLowerCase();

        // 1. Immediately cache locally
        localStorage.setItem(`username_${currentUser.uid}`, clean);
        if (normalizedEmail) {
            localStorage.setItem(`username_${normalizedEmail}`, clean);
        }

        // 2. Persist to Firestore associated with the user's UID and email
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            await setDoc(userDocRef, {
                uid: currentUser.uid,
                username: clean,
                email: normalizedEmail,
                displayName: currentUser.displayName || "",
                photoURL: currentUser.photoURL || "",
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (err) {
            console.error("Error updating username in Firestore:", err);
        }

        // 3. Update active current user state
        setCurrentUser(prev => ({
            ...prev,
            username: clean,
            email: normalizedEmail
        }));
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
