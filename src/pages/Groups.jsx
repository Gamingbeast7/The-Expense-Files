import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Users, Plus, X, ArrowRight } from "lucide-react";
import { useExpenses } from "../context/ExpenseContext";
import { useNavigate } from "react-router-dom";

export function Groups() {
    const { groups, createGroup } = useExpenses();
    const navigate = useNavigate();
    const [iscreateOpen, setIsCreateOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [friends, setFriends] = useState([]);
    const [friendInput, setFriendInput] = useState("");

    const handleAddFriend = () => {
        if (friendInput.trim()) {
            setFriends([...friends, friendInput.trim()]);
            setFriendInput("");
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName) return;
        await createGroup(newGroupName, friends);
        setIsCreateOpen(false);
        setNewGroupName("");
        setFriends([]);
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
                    <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                        <Plus size={18} />
                        New Group
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white-5 rounded-2xl border border-white-10">
                            <Users size={48} className="mx-auto text-gray-500 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Groups Yet</h3>
                            <p className="text-gray-400 mb-6">Create a group to split expenses with friends.</p>
                            <Button onClick={() => setIsCreateOpen(true)}>Create Group</Button>
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
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Add Friends (Virtual)</label>
                                    <div className="flex gap-2 mb-3">
                                        <Input
                                            placeholder="Friend's Name"
                                            value={friendInput}
                                            onChange={(e) => setFriendInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFriend())}
                                        />
                                        <Button type="button" onClick={handleAddFriend} variant="secondary">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {friends.map((friend, index) => (
                                            <div key={index} className="bg-white-10 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                                {friend}
                                                <button
                                                    type="button"
                                                    onClick={() => setFriends(friends.filter((_, i) => i !== index))}
                                                    className="hover:text-red-400"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
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
