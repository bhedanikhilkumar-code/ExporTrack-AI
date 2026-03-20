/**
 * Language Switcher Component
 * Toggle between English and Hindi
 */
import { useState } from 'react';
import { getCurrentLanguage, setLanguage, LANGUAGE_OPTIONS, type Language } from '../services/i18nService';

interface LanguageSwitcherProps {
    onLanguageChange?: (lang: Language) => void;
    compact?: boolean;
}

export default function LanguageSwitcher({ onLanguageChange, compact = false }: LanguageSwitcherProps) {
    const [currentLang, setCurrentLang] = useState<Language>(getCurrentLanguage);

    function handleChange(lang: Language) {
        setLanguage(lang);
        setCurrentLang(lang);
        onLanguageChange?.(lang);
        // Reload page to apply translations globally
        window.location.reload();
    }

    if (compact) {
        return (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => handleChange(opt.value)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${currentLang === opt.value
                                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        title={opt.label}
                    >
                        {opt.nativeLabel}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Language:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => handleChange(opt.value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${currentLang === opt.value
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {opt.nativeLabel}
                    </button>
                ))}
            </div>
        </div>
    );
}
