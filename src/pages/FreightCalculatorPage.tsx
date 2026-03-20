/**
 * Freight Cost Calculator Page
 * Calculate estimated freight costs for export shipments
 * Supports Sea, Air, and Road freight with multiple carriers
 */
import { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import AppIcon from '../components/AppIcon';

type FreightMode = 'Sea' | 'Air' | 'Road';
type ContainerType = '20GP' | '40GP' | '40HC' | 'LCL';

interface FreightRate {
    carrier: string;
    mode: FreightMode;
    origin: string;
    destination: string;
    baseRate: number; // USD per container/kg
    currency: string;
    transitDays: number;
    reliability: number; // 1-5
}

interface CalculationResult {
    carrier: string;
    mode: FreightMode;
    transitDays: number;
    reliability: number;
    freightCost: number;
    fuelSurcharge: number;
    portCharges: number;
    customsClearance: number;
    insurance: number;
    totalCost: number;
    currency: string;
    costPerKg: number;
}

// Freight rate database (approximate market rates)
const FREIGHT_RATES: FreightRate[] = [
    // Sea Freight - India to Major Destinations
    { carrier: 'Maersk', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'Dubai (Jebel Ali)', baseRate: 450, currency: 'USD', transitDays: 7, reliability: 5 },
    { carrier: 'MSC', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'Dubai (Jebel Ali)', baseRate: 420, currency: 'USD', transitDays: 8, reliability: 4 },
    { carrier: 'CMA CGM', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'Dubai (Jebel Ali)', baseRate: 440, currency: 'USD', transitDays: 7, reliability: 4 },
    { carrier: 'Maersk', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'Rotterdam (Netherlands)', baseRate: 1200, currency: 'USD', transitDays: 22, reliability: 5 },
    { carrier: 'MSC', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'Rotterdam (Netherlands)', baseRate: 1150, currency: 'USD', transitDays: 24, reliability: 4 },
    { carrier: 'Hapag-Lloyd', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'Rotterdam (Netherlands)', baseRate: 1180, currency: 'USD', transitDays: 23, reliability: 5 },
    { carrier: 'Maersk', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'New York (USA)', baseRate: 1800, currency: 'USD', transitDays: 28, reliability: 5 },
    { carrier: 'MSC', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'New York (USA)', baseRate: 1750, currency: 'USD', transitDays: 30, reliability: 4 },
    { carrier: 'Maersk', mode: 'Sea', origin: 'Chennai Port', destination: 'Singapore', baseRate: 380, currency: 'USD', transitDays: 5, reliability: 5 },
    { carrier: 'PIL', mode: 'Sea', origin: 'Chennai Port', destination: 'Singapore', baseRate: 350, currency: 'USD', transitDays: 6, reliability: 3 },
    { carrier: 'Maersk', mode: 'Sea', origin: 'Mundra Port', destination: 'Hamburg (Germany)', baseRate: 1250, currency: 'USD', transitDays: 25, reliability: 5 },
    { carrier: 'Evergreen', mode: 'Sea', origin: 'JNPT Mumbai', destination: 'Shanghai (China)', baseRate: 650, currency: 'USD', transitDays: 12, reliability: 4 },

    // Air Freight
    { carrier: 'Air India Cargo', mode: 'Air', origin: 'Mumbai (BOM)', destination: 'Dubai (DXB)', baseRate: 2.5, currency: 'USD/kg', transitDays: 1, reliability: 4 },
    { carrier: 'Emirates SkyCargo', mode: 'Air', origin: 'Mumbai (BOM)', destination: 'Dubai (DXB)', baseRate: 2.8, currency: 'USD/kg', transitDays: 1, reliability: 5 },
    { carrier: 'Lufthansa Cargo', mode: 'Air', origin: 'Delhi (DEL)', destination: 'Frankfurt (FRA)', baseRate: 4.2, currency: 'USD/kg', transitDays: 2, reliability: 5 },
    { carrier: 'Air India Cargo', mode: 'Air', origin: 'Delhi (DEL)', destination: 'Frankfurt (FRA)', baseRate: 3.8, currency: 'USD/kg', transitDays: 2, reliability: 4 },
    { carrier: 'FedEx', mode: 'Air', origin: 'Mumbai (BOM)', destination: 'New York (JFK)', baseRate: 5.5, currency: 'USD/kg', transitDays: 2, reliability: 5 },
    { carrier: 'DHL Express', mode: 'Air', origin: 'Mumbai (BOM)', destination: 'New York (JFK)', baseRate: 5.8, currency: 'USD/kg', transitDays: 2, reliability: 5 },
    { carrier: 'Singapore Airlines Cargo', mode: 'Air', origin: 'Chennai (MAA)', destination: 'Singapore (SIN)', baseRate: 2.2, currency: 'USD/kg', transitDays: 1, reliability: 5 },

    // Road Freight (India domestic + neighboring countries)
    { carrier: 'VRL Logistics', mode: 'Road', origin: 'Mumbai', destination: 'Delhi', baseRate: 18, currency: 'INR/kg', transitDays: 2, reliability: 4 },
    { carrier: 'DTDC Freight', mode: 'Road', origin: 'Mumbai', destination: 'Delhi', baseRate: 16, currency: 'INR/kg', transitDays: 3, reliability: 3 },
    { carrier: 'TCI Express', mode: 'Road', origin: 'Chennai', destination: 'Bangalore', baseRate: 12, currency: 'INR/kg', transitDays: 1, reliability: 4 },
    { carrier: 'Safexpress', mode: 'Road', origin: 'Delhi', destination: 'Kolkata', baseRate: 20, currency: 'INR/kg', transitDays: 2, reliability: 5 },
];

const ORIGINS = [...new Set(FREIGHT_RATES.map((r) => r.origin))].sort();
const DESTINATIONS = [...new Set(FREIGHT_RATES.map((r) => r.destination))].sort();

export default function FreightCalculatorPage() {
    const [mode, setMode] = useState<FreightMode>('Sea');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [containerType, setContainerType] = useState<ContainerType>('20GP');
    const [weight, setWeight] = useState('');
    const [volume, setVolume] = useState('');
    const [cargoValue, setCargoValue] = useState('');
    const [calculated, setCalculated] = useState(false);

    const containerMultiplier: Record<ContainerType, number> = {
        '20GP': 1,
        '40GP': 1.8,
        '40HC': 2,
        'LCL': 0.3,
    };

    const results = useMemo((): CalculationResult[] => {
        if (!calculated || !origin || !destination) return [];

        const matchingRates = FREIGHT_RATES.filter(
            (r) => r.mode === mode && r.origin === origin && r.destination === destination
        );

        if (matchingRates.length === 0) return [];

        const weightKg = parseFloat(weight) || 1000;
        const cargoVal = parseFloat(cargoValue) || 10000;

        return matchingRates.map((rate) => {
            let freightCost: number;

            if (mode === 'Sea') {
                freightCost = rate.baseRate * containerMultiplier[containerType];
            } else if (mode === 'Air') {
                // Chargeable weight = max(actual weight, volumetric weight)
                const vol = parseFloat(volume) || 0;
                const volumetricWeight = vol * 167; // 1 CBM = 167 kg for air
                const chargeableWeight = Math.max(weightKg, volumetricWeight);
                freightCost = rate.baseRate * chargeableWeight;
            } else {
                // Road
                freightCost = (rate.baseRate * weightKg) / 83; // Convert INR to USD approx
            }

            const fuelSurcharge = freightCost * 0.15;
            const portCharges = mode === 'Sea' ? 180 : mode === 'Air' ? 80 : 50;
            const customsClearance = 150;
            const insurance = cargoVal * 0.001; // 0.1% of cargo value
            const totalCost = freightCost + fuelSurcharge + portCharges + customsClearance + insurance;

            return {
                carrier: rate.carrier,
                mode: rate.mode,
                transitDays: rate.transitDays,
                reliability: rate.reliability,
                freightCost: Math.round(freightCost),
                fuelSurcharge: Math.round(fuelSurcharge),
                portCharges,
                customsClearance,
                insurance: Math.round(insurance),
                totalCost: Math.round(totalCost),
                currency: 'USD',
                costPerKg: Math.round((totalCost / weightKg) * 100) / 100,
            };
        }).sort((a, b) => a.totalCost - b.totalCost);
    }, [calculated, origin, destination, mode, containerType, weight, volume, cargoValue]);

    const availableOrigins = ORIGINS.filter((o) =>
        FREIGHT_RATES.some((r) => r.mode === mode && r.origin === o)
    );
    const availableDestinations = DESTINATIONS.filter((d) =>
        FREIGHT_RATES.some((r) => r.mode === mode && r.destination === d && (!origin || r.origin === origin))
    );

    function handleCalculate() {
        if (!origin || !destination) return;
        setCalculated(true);
    }

    function renderStars(count: number) {
        return Array.from({ length: 5 }, (_, i) => (
            <AppIcon
                key={i}
                name="star"
                className={`w-3 h-3 ${i < count ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
            />
        ));
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <PageHeader
                title="Freight Cost Calculator"
                subtitle="Estimate shipping costs for sea, air, and road freight across major trade routes"
            />

            {/* Mode Selector */}
            <div className="flex gap-2">
                {(['Sea', 'Air', 'Road'] as FreightMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => { setMode(m); setOrigin(''); setDestination(''); setCalculated(false); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === m
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-300'
                            }`}
                    >
                        <AppIcon name={m === 'Sea' ? 'globe' : m === 'Air' ? 'share' : 'truck'} className="w-4 h-4" />
                        {m} Freight
                    </button>
                ))}
            </div>

            {/* Calculator Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Shipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Origin */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Origin Port / City</label>
                        <select
                            value={origin}
                            onChange={(e) => { setOrigin(e.target.value); setCalculated(false); }}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">Select origin...</option>
                            {availableOrigins.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Destination Port / City</label>
                        <select
                            value={destination}
                            onChange={(e) => { setDestination(e.target.value); setCalculated(false); }}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">Select destination...</option>
                            {availableDestinations.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Container Type (Sea only) */}
                    {mode === 'Sea' && (
                        <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Container Type</label>
                            <select
                                value={containerType}
                                onChange={(e) => { setContainerType(e.target.value as ContainerType); setCalculated(false); }}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="20GP">20' General Purpose (20GP)</option>
                                <option value="40GP">40' General Purpose (40GP)</option>
                                <option value="40HC">40' High Cube (40HC)</option>
                                <option value="LCL">Less than Container Load (LCL)</option>
                            </select>
                        </div>
                    )}

                    {/* Weight */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Cargo Weight (kg)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 5000"
                            value={weight}
                            onChange={(e) => { setWeight(e.target.value); setCalculated(false); }}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Volume (Air only) */}
                    {mode === 'Air' && (
                        <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Volume (CBM)</label>
                            <input
                                type="number"
                                placeholder="e.g. 2.5"
                                value={volume}
                                onChange={(e) => { setVolume(e.target.value); setCalculated(false); }}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    )}

                    {/* Cargo Value */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Cargo Value (USD) — for insurance</label>
                        <input
                            type="number"
                            placeholder="e.g. 50000"
                            value={cargoValue}
                            onChange={(e) => { setCargoValue(e.target.value); setCalculated(false); }}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    disabled={!origin || !destination}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <AppIcon name="calculator" className="w-5 h-5" />
                    Calculate Freight Cost
                </button>
            </div>

            {/* Results */}
            {calculated && results.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        {results.length} Carrier{results.length > 1 ? 's' : ''} Found
                        <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                            {origin} → {destination}
                        </span>
                    </h3>

                    {results.map((result, i) => (
                        <div
                            key={result.carrier}
                            className={`bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 ${i === 0
                                    ? 'border-teal-400 dark:border-teal-600'
                                    : 'border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {i === 0 && (
                                <div className="flex items-center gap-1.5 mb-3">
                                    <AppIcon name="star" className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Best Price</span>
                                </div>
                            )}

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{result.carrier}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                        {renderStars(result.reliability)}
                                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">Reliability</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600 dark:text-slate-300">
                                        <AppIcon name="clock" className="w-4 h-4" />
                                        {result.transitDays} day{result.transitDays > 1 ? 's' : ''} transit
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        ${result.totalCost.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Total estimated cost</div>
                                    <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                                        ${result.costPerKg}/kg
                                    </div>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Cost Breakdown</p>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {[
                                        { label: 'Freight', value: result.freightCost },
                                        { label: 'Fuel Surcharge', value: result.fuelSurcharge },
                                        { label: 'Port Charges', value: result.portCharges },
                                        { label: 'Customs', value: result.customsClearance },
                                        { label: 'Insurance', value: result.insurance },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">${item.value}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                        * Rates are approximate market estimates. Actual rates may vary based on current market conditions, cargo type, and carrier availability.
                    </p>
                </div>
            )}

            {calculated && results.length === 0 && (
                <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <AppIcon name="alert-triangle" className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium">No rates found for this route</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                        Try a different origin/destination combination or freight mode
                    </p>
                </div>
            )}
        </div>
    );
}
