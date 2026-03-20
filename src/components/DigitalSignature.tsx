/**
 * Digital Signature Component
 * Canvas-based e-signature pad for signing export documents
 * Saves signature as base64 PNG
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import AppIcon from './AppIcon';

export interface SignatureData {
    signatureBase64: string; // base64 PNG
    signedBy: string;
    signedAt: string;
    documentId?: string;
}

interface DigitalSignatureProps {
    onSign: (data: SignatureData) => void;
    onCancel?: () => void;
    signerName: string;
    documentTitle?: string;
}

export default function DigitalSignature({
    onSign,
    onCancel,
    signerName,
    documentTitle,
}: DigitalSignatureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsDrawing(true);
        setIsEmpty(false);
        const pos = getPos(e, canvas);
        setLastPos(pos);
    }, []);

    const draw = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            if (!isDrawing) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const pos = getPos(e, canvas);
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            setLastPos(pos);
        },
        [isDrawing, lastPos]
    );

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
    }, []);

    function clearSignature() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
    }

    function handleSign() {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return;
        const signatureBase64 = canvas.toDataURL('image/png');
        onSign({
            signatureBase64,
            signedBy: signerName,
            signedAt: new Date().toISOString(),
        });
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                    <AppIcon name="pen-tool" className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Digital Signature</h3>
                    {documentTitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{documentTitle}</p>
                    )}
                </div>
            </div>

            {/* Signer info */}
            <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400">Signing as</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{signerName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date().toLocaleString('en-IN')}
                </p>
            </div>

            {/* Canvas */}
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden bg-white">
                <canvas
                    ref={canvasRef}
                    width={480}
                    height={180}
                    className="w-full touch-none cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-slate-300 text-sm select-none">Sign here ✍️</p>
                    </div>
                )}
                {/* Baseline */}
                <div className="absolute bottom-8 left-8 right-8 border-b border-slate-200 pointer-events-none" />
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
                Draw your signature above using mouse or touch
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
                <button
                    onClick={clearSignature}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <AppIcon name="refresh" className="w-4 h-4" />
                    Clear
                </button>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleSign}
                    disabled={isEmpty}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <AppIcon name="check" className="w-4 h-4" />
                    Apply Signature
                </button>
            </div>
        </div>
    );
}

/**
 * Signature storage service
 */
const SIG_STORAGE_KEY = 'exportrack_signatures';

export interface StoredSignature extends SignatureData {
    id: string;
    shipmentId: string;
    documentType: string;
}

export function saveSignature(
    shipmentId: string,
    documentType: string,
    data: SignatureData
): StoredSignature {
    const stored: StoredSignature = {
        ...data,
        id: `SIG-${Date.now()}`,
        shipmentId,
        documentType,
    };
    try {
        const existing = getSignatures();
        localStorage.setItem(SIG_STORAGE_KEY, JSON.stringify([...existing, stored]));
    } catch {
        // ignore
    }
    return stored;
}

export function getSignatures(): StoredSignature[] {
    try {
        const raw = localStorage.getItem(SIG_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as StoredSignature[]) : [];
    } catch {
        return [];
    }
}

export function getSignatureForDocument(
    shipmentId: string,
    documentType: string
): StoredSignature | undefined {
    return getSignatures()
        .filter((s) => s.shipmentId === shipmentId && s.documentType === documentType)
        .sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime())[0];
}
