
import React, { useState, useRef } from 'react';
import { UserAccount } from '../types.ts';
import { Upload, RefreshCw, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface UserSettingsProps {
    userAccount: UserAccount;
    onSave: (account: UserAccount) => void;
    onDeleteAccount: () => void;
    onReplayTutorial: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ userAccount, onSave, onDeleteAccount, onReplayTutorial }) => {
    const [formData, setFormData] = useState<UserAccount>(userAccount);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.displayName.trim()) {
            setError("Display name cannot be empty.");
            return;
        }
        onSave(formData);
        setSuccessMsg("Settings saved successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleRandomizeAvatar = () => {
        const randomId = Math.floor(Math.random() * 10000);
        setFormData(prev => ({
            ...prev,
            avatarUrl: `https://picsum.photos/seed/${randomId}/200`
        }));
        setError(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Robustness: Check file size (limit to ~800KB to prevent localStorage quota issues)
            if (file.size > 800 * 1024) {
                setError("Image is too large. Please select an image under 800KB.");
                return;
            }
            
            // Robustness: Check file type
            if (!file.type.startsWith('image/')) {
                setError("Please select a valid image file.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    setFormData(prev => ({
                        ...prev,
                        avatarUrl: result
                    }));
                    setError(null);
                }
            };
            reader.onerror = () => {
                setError("Failed to read file.");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteClick = () => {
        if (window.confirm("Are you sure? This will permanently delete all profiles, dates, and settings stored on this device. This action cannot be undone.")) {
            onDeleteAccount();
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-white">Account Settings</h2>
                <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">Manage your profile and preferences.</p>
            </div>

            <div className="max-w-2xl mx-auto bg-secondary p-8 rounded-2xl shadow-xl border border-tertiary/50">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer" onClick={handleUploadClick}>
                            <div className="w-32 h-32 rounded-full border-4 border-tertiary group-hover:border-accent transition-all duration-300 overflow-hidden bg-primary shadow-lg relative">
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-tertiary">
                                        {formData.displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Upload className="text-white w-8 h-8" />
                                </div>
                            </div>
                            
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleUploadClick}
                                className="flex items-center gap-2 text-sm bg-tertiary px-4 py-2 rounded-lg text-gray-200 hover:bg-accent hover:text-white transition-all shadow-md font-medium"
                            >
                                <Upload size={16} />
                                Upload Picture
                            </button>
                            <button
                                type="button"
                                onClick={handleRandomizeAvatar}
                                className="flex items-center gap-2 text-sm bg-tertiary px-4 py-2 rounded-lg text-gray-200 hover:bg-accent hover:text-white transition-all shadow-md font-medium"
                            >
                                <RefreshCw size={16} />
                                Randomize
                            </button>
                        </div>
                        
                        {error && (
                            <p className="text-red-400 text-sm mt-3 animate-fade-in bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20">
                                {error}
                            </p>
                        )}
                        {successMsg && (
                            <p className="text-green-400 text-sm mt-3 animate-fade-in flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">
                                <CheckCircle2 size={14} /> {successMsg}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="displayName" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Display Name</label>
                            <input
                                type="text"
                                name="displayName"
                                id="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                className="block w-full bg-primary/50 border border-tertiary rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-inner placeholder-gray-600"
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label htmlFor="zipCode" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Zip Code</label>
                            <input
                                type="text"
                                name="zipCode"
                                id="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                placeholder="e.g., 90210"
                                className="block w-full bg-primary/50 border border-tertiary rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-inner placeholder-gray-600"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                For locally relevant recommendations.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-tertiary/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
                         <button
                            type="button"
                            onClick={onReplayTutorial}
                            className="text-sm text-gray-400 hover:text-white hover:underline transition-colors"
                        >
                            Replay Tutorial
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-xl hover:bg-red-600 font-bold transition-all shadow-lg hover:shadow-accent/25 active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>

                <div className="mt-10 pt-8 border-t border-red-500/20">
                    <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Danger Zone
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-red-500/5 p-5 rounded-xl border border-red-500/20 gap-4">
                        <div>
                            <h4 className="text-white font-medium">Delete Account Data</h4>
                            <p className="text-gray-400 text-xs mt-1 max-w-xs">Permanently removes all profiles and saved data.</p>
                        </div>
                         <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="flex items-center gap-2 bg-transparent border border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-medium text-sm"
                        >
                            <Trash2 size={16} />
                            Delete Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
