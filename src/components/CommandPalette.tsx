import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from './AppIcon';

interface Command {
    id: string;
    label: string;
    description: string;
    icon: string;
    path: string;
    category: string;
}

const commands: Command[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'View overview and KPIs',
        icon: 'dashboard',
        path: '/dashboard',
        category: 'Navigation'
    },
    {
        id: 'shipments',
        label: 'Shipments',
        description: 'View all active shipments',
        icon: 'shipments',
        path: '/shipments',
        category: 'Navigation'
    },
    {
        id: 'create-shipment',
        label: 'Create Shipment',
        description: 'Create a new shipment',
        icon: 'create',
        path: '/shipments/create',
        category: 'Actions'
    },
    {
        id: 'upload-docs',
        label: 'Upload Documents',
        description: 'Upload shipment documents',
        icon: 'upload',
        path: '/documents/upload',
        category: 'Actions'
    },
    {
        id: 'ai-extraction',
        label: 'AI Extraction',
        description: 'Extract data from documents',
        icon: 'ai-extract',
        path: '/ai-extraction',
        category: 'AI Tools'
    },
    {
        id: 'ai-validator',
        label: 'AI Validator',
        description: 'Validate documents with AI',
        icon: 'verification',
        path: '/ai-validator',
        category: 'AI Tools'
    },
    {
        id: 'ai-compliance',
        label: 'AI Compliance',
        description: 'Check compliance requirements',
        icon: 'shield',
        path: '/ai-compliance',
        category: 'AI Tools'
    },
    {
        id: 'notifications',
        label: 'Notifications',
        description: 'View all notifications',
        icon: 'notifications',
        path: '/notifications',
        category: 'Navigation'
    },
    {
        id: 'team',
        label: 'Team',
        description: 'Manage team members',
        icon: 'team',
        path: '/team',
        category: 'Navigation'
    }
];

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const filteredCommands = search.trim()
        ? commands.filter(
            (cmd) =>
                cmd.label.toLowerCase().includes(search.toLowerCase()) ||
                cmd.description.toLowerCase().includes(search.toLowerCase())
        )
        : commands;

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) {
            acc[cmd.category] = [];
        }
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, Command[]>);

    const allCommands = Object.values(groupedCommands).flat();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSelectedIndex(0);
            setSearch('');
        }
    }, [isOpen]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % allCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + allCommands.length) % allCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (allCommands[selectedIndex]) {
                    handleNavigate(allCommands[selectedIndex]);
                }
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, selectedIndex, allCommands]);

    const handleNavigate = (cmd: Command) => {
        navigate(cmd.path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl animate-slide-down"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                    {/* Search Input */}
                    <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <AppIcon name="search" className="h-5 w-5 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search commands, pages, and actions..."
                                className="w-full bg-transparent text-lg text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setSelectedIndex(0);
                                }}
                            />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ESC</span>
                        </div>
                    </div>

                    {/* Commands List */}
                    <div className="max-h-96 overflow-y-auto">
                        {allCommands.length > 0 ? (
                            <div>
                                {Object.entries(groupedCommands).map(([category, cmds]) => {
                                    const filteredCmds = cmds.filter((cmd) =>
                                        filteredCommands.includes(cmd)
                                    );
                                    if (filteredCmds.length === 0) return null;

                                    return (
                                        <div key={category}>
                                            <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30">
                                                {category}
                                            </div>
                                            {filteredCmds.map((cmd, idx) => {
                                                const globalIdx = allCommands.indexOf(cmd);
                                                const isSelected = globalIdx === selectedIndex;

                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        onClick={() => handleNavigate(cmd)}
                                                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${isSelected
                                                                ? 'bg-teal-50 dark:bg-teal-900/20'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isSelected
                                                                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
                                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                                }`}>
                                                                <AppIcon name={cmd.icon as any} className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-semibold text-navy-800 dark:text-slate-100">
                                                                    {cmd.label}
                                                                </div>
                                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                    {cmd.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${isSelected
                                                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                            }`}>
                                                            ↵
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    No commands found
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold">↑↓</span>
                                <span>to navigate</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold">↵</span>
                                <span>to select</span>
                            </div>
                        </div>
                        <span>Cmd + K to open</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
