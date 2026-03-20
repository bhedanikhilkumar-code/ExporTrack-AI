import AppIcon from './AppIcon';
import { AutomationStatus, STATUS_ORDER, getStatusStep } from '../services/shipmentStatusService';

interface ShipmentProgressBarProps {
    status: string;
    showLabels?: boolean;
    className?: string;
}

export default function ShipmentProgressBar({
    status,
    showLabels = true,
    className = ''
}: ShipmentProgressBarProps) {
    const currentStep = getStatusStep(status as any);

    const getStepStatus = (index: number) => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'active';
        return 'pending';
    };

    const getStepIcon = (index: number, stepStatus: string) => {
        if (stepStatus === 'completed') return 'check';
        if (stepStatus === 'active') {
            const icons: Record<number, string> = {
                0: 'clock',      // Draft
                1: 'shipments',  // Booked
                2: 'shipments',  // In Transit
                3: 'shield',     // Customs
                4: 'check'       // Delivered
            };
            return icons[index] || 'clock';
        }
        return 'circle';
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Progress track */}
            <div className="relative">
                {/* Background line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />

                {/* Progress line */}
                <div
                    className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(currentStep / (STATUS_ORDER.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                    {STATUS_ORDER.map((step, index) => {
                        const stepStatus = getStepStatus(index);
                        const icon = getStepIcon(index, stepStatus);

                        const stepStyles = {
                            completed: 'bg-emerald-500 border-emerald-500 text-white',
                            active: 'bg-teal-500 border-teal-500 text-white scale-110 shadow-lg shadow-teal-500/30',
                            pending: 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                        };

                        return (
                            <div key={step} className="flex flex-col items-center">
                                {/* Step circle */}
                                <div
                                    className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 z-10
                    ${stepStyles[stepStatus as keyof typeof stepStyles]}
                  `}
                                >
                                    <AppIcon
                                        name={icon as any}
                                        className={`h-4 w-4 ${stepStatus === 'active' ? 'animate-status-pulse' : ''}`}
                                        strokeWidth={2.5}
                                    />
                                </div>

                                {/* Label */}
                                {showLabels && (
                                    <div className={`mt-2 text-center ${stepStatus === 'active' ? 'opacity-100' : stepStatus === 'completed' ? 'opacity-70' : 'opacity-40'}`}>
                                        <span className={`
                      text-xs font-bold uppercase tracking-wider
                      ${stepStatus === 'active' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'}
                    `}>
                                            {step}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile compact view */}
            {!showLabels && (
                <div className="mt-3 flex justify-center">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Step {currentStep + 1} of {STATUS_ORDER.length}
                    </span>
                </div>
            )}
        </div>
    );
}
