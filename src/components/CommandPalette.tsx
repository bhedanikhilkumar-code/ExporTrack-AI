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
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl animate-in slide-in-from-top-4 duration-300 px-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800/60 dark:bg-slate-900/95 overflow-hidden flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 border-b border-slate-200/60 px-4 py-4 dark:border-slate-800/60">
                        <AppIcon name="search" className="h-5 w-5 text-slate-400 shrink-0" strokeWidth={2.5} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search commands, pages, and actions..."
                            className="flex-1 bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSelectedIndex(0);
                            }}
                        />
                        <button 
                          onClick={onClose}
                          className="flex h-6 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                            ESC
                        </button>
                    </div>

                    {/* Commands List */}
                    <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent dark:scrollbar-thumb-slate-800 p-2">
                        {allCommands.length > 0 ? (
                            <div className="space-y-4 py-1">
                                {Object.entries(groupedCommands).map(([category, cmds]) => {
                                    const filteredCmds = cmds.filter((cmd) =>
                                        filteredCommands.includes(cmd)
                                    );
                                    if (filteredCmds.length === 0) return null;

                                    return (
                                        <div key={category}>
                                            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                {category}
                                            </div>
                                            <div className="space-y-0.5">
                                              {filteredCmds.map((cmd) => {
                                                  const globalIdx = allCommands.indexOf(cmd);
                                                  const isSelected = globalIdx === selectedIndex;

                                                  return (
                                                      <button
                                                          key={cmd.id}
                                                          onClick={() => handleNavigate(cmd)}
                                                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${isSelected
                                                                  ? 'bg-slate-100 dark:bg-slate-800/80 shadow-sm'
                                                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                              }`}
                                                      >
                                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isSelected
                                                                      ? 'bg-white text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 shadow-sm'
                                                                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400'
                                                                  }`}>
                                                                  <AppIcon name={cmd.icon as any} className="h-4 w-4" strokeWidth={isSelected ? 2.5 : 2} />
                                                              </div>
                                                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                  <div className={`text-xs font-bold truncate ${isSelected ? 'text-teal-700 dark:text-teal-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                                                      {cmd.label}
                                                                  </div>
                                                                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                                      {cmd.description}
                                                                  </div>
                                                              </div>
                                                          </div>
                                                          {isSelected && (
                                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white text-teal-600 shadow-sm dark:bg-slate-700 dark:text-teal-400 ml-3">
                                                                <span className="text-[10px] font-bold">↵</span>
                                                            </div>
                                                          )}
                                                      </button>
                                                  );
                                              })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-sm border border-slate-200 dark:border-slate-700">
                                   <AppIcon name="search" className="h-4 w-4" />
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    No commands found
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">
                                    Try a different search term
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200/60 bg-slate-50/50 px-4 py-2.5 dark:border-slate-800/60 dark:bg-slate-900/50 flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <div className="flex items-center gap-4 hidden sm:flex">
                            <div className="flex items-center gap-1.5">
                                <span className="flex h-4 px-1 items-center justify-center rounded bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shadow-sm">↑↓</span>
                                <span>Navigate</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="flex h-4 w-4 items-center justify-center rounded bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shadow-sm">↵</span>
                                <span>Select</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                          <span>Cmd + K to open</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
