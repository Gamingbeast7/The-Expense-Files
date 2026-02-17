import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Users, Plus, X, ArrowRight } from "lucide-react";
import { useExpenses } from "../context/ExpenseContext";
import { useNavigate } from "react-router-dom";

export function Groups() {
    const { groups, createGroup, searchUsers } = useExpenses();
    const navigate = useNavigate();
    const [iscreateOpen, setIsCreateOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedFriends, setSelectedFriends] = useState([]); // [{uid, name, username}]

    // Search State
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce Search
    useEffect(() => {
        const search = async () => {
            if (searchInput.length < 3) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await searchUsers(searchInput);
                setSearchResults(results);
            } catch (e) {
                console.error("Search failed", e);
            }
            setIsSearching(false);
        };
        const timeout = setTimeout(search, 500);
        return () => clearTimeout(timeout);
    }, [searchInput, searchUsers]);

    const handleAddFriend = (user) => {
        // Prevent adding duplicates if clicked quickly
        if (!selectedFriends.some(f => f.uid === user.uid)) {
            setSelectedFriends([...selectedFriends, user]);
        }
        // Don't clear search input
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName) return;
        // Pass the full user objects (uid, name, username)
        await createGroup(newGroupName, selectedFriends);
        setIsCreateOpen(false);
        setNewGroupName("");
        setSelectedFriends([]);
        setSearchInput("");
        setSearchResults([]);
    };

    const handleCreateDemoGroup = async () => {
        const demoFriends = [
            { uid: "demo1", username: "alice", displayName: "Alice" },
            { uid: "demo2", username: "bob", displayName: "Bob" },
            { uid: "demo3", username: "charlie", displayName: "Charlie" },
            { uid: "demo4", username: "david", displayName: "David" },
            { uid: "demo5", username: "eve", displayName: "Eve" },
            { uid: "demo6", username: "frank", displayName: "Frank" },
        ];
        await createGroup("Trip to Goa (Demo)", demoFriends);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <BackButton />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Groups</h1>
                        <p className="text-gray-400">Manage your shared expenses.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleCreateDemoGroup} variant="secondary" className="text-sm">
                            Demo Group
                        </Button>
                        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-2.5 h-auto text-sm font-semibold shadow-lg shadow-accent-blue/20">
                            <Plus size={18} strokeWidth={2.5} />
                            New Group
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white-5 rounded-2xl border border-white-10">
                            <Users size={48} className="mx-auto text-gray-500 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Groups Yet</h3>
                            <p className="text-gray-400 mb-6">Create a group to split expenses with friends.</p>
                            <div className="flex justify-center gap-4">
                                <Button onClick={handleCreateDemoGroup} variant="secondary">Create Demo Group</Button>
                                <Button onClick={() => setIsCreateOpen(true)}>Create Group</Button>
                            </div>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <Card
                                key={group.id}
                                className="p-6 cursor-pointer hover:bg-white-5 transition-colors group relative overflow-hidden"
                                onClick={() => navigate(`/groups/${group.id}`)}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="text-accent-blue" />
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white mb-4">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                                <p className="text-sm text-gray-400">
                                    {group.friends?.length || 0} friends
                                </p>
                            </Card>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Create Group Modal */}
            <AnimatePresence>
                {iscreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1C1C1E] border border-white-10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Create Group</h2>
                                <button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGroup} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Group Name</label>
                                    <Input
                                        placeholder="e.g. Trip to Vegas"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Add Friends (Search by Username)</label>

                                    {/* Selected Friends - Moved Above Input */}
                                    {selectedFriends.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3 bg-white-5 p-2 rounded-xl border border-white-5">
                                            {selectedFriends.map((friend) => (
                                                <div key={friend.uid} className="bg-accent-blue/20 text-accent-blue px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-accent-blue/20">
                                                    @{friend.username}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedFriends(selectedFriends.filter((f) => f.uid !== friend.uid))}
                                                        className="hover:text-white transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative mb-3">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <div className="text-gray-500">@</div>
                                        </div>
                                        <Input
                                            placeholder="Search username or email"
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
                                            className="pl-8"
                                        />
                                        {isSearching && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <div className="mb-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {searchResults
                                                .filter(user => !selectedFriends.some(f => f.uid === user.uid))
                                                .map(user => (
                                                    <div
                                                        key={user.uid}
                                                        onClick={() => handleAddFriend(user)}
                                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white-5 cursor-pointer transition-colors border border-transparent hover:border-white-5"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center text-xs font-bold">
                                                                {user.displayName ? user.displayName[0] : user.username[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-white">{user.displayName || "User"}</p>
                                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                                            </div>
                                                        </div>
                                                        <Plus size={16} className="text-accent-blue" />
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" className="w-full py-3">
                                    Create Group
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
