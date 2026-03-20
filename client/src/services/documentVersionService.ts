/**
 * Document Version History Service
 * Keeps track of all versions of uploaded documents per shipment
 * Each upload creates a new version — old versions are preserved
 */
import type { DocumentType, DocStatus } from '../types';

export interface DocumentVersion {
    versionId: string;
    documentId: string;
    shipmentId: string;
    type: DocumentType;
    fileName: string;
    fileFormat: 'PDF' | 'JPG' | 'PNG';
    status: DocStatus;
    uploadedAt: string;
    uploadedBy: string;
    versionNumber: number;
    notes?: string;
    isLatest: boolean;
}

const STORAGE_KEY = 'exportrack_doc_versions';

function getAll(): DocumentVersion[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as DocumentVersion[]) : [];
    } catch {
        return [];
    }
}

function saveAll(versions: DocumentVersion[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
    } catch {
        // Storage full
    }
}

/**
 * Add a new version when a document is uploaded
 */
export function addDocumentVersion(
    shipmentId: string,
    documentId: string,
    doc: {
        type: DocumentType;
        fileName: string;
        fileFormat: 'PDF' | 'JPG' | 'PNG';
        status: DocStatus;
        uploadedBy: string;
        notes?: string;
    }
): DocumentVersion {
    const all = getAll();

    // Get existing versions for this doc type in this shipment
    const existing = all.filter(
        (v) => v.shipmentId === shipmentId && v.type === doc.type
    );

    // Mark all previous as not latest
    existing.forEach((v) => {
        v.isLatest = false;
    });

    const newVersion: DocumentVersion = {
        versionId: `VER-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        documentId,
        shipmentId,
        type: doc.type,
        fileName: doc.fileName,
        fileFormat: doc.fileFormat,
        status: doc.status,
        uploadedAt: new Date().toISOString(),
        uploadedBy: doc.uploadedBy,
        versionNumber: existing.length + 1,
        notes: doc.notes,
        isLatest: true,
    };

    saveAll([...all, newVersion]);
    return newVersion;
}

/**
 * Get all versions for a specific document type in a shipment
 */
export function getDocumentVersions(
    shipmentId: string,
    docType: DocumentType
): DocumentVersion[] {
    return getAll()
        .filter((v) => v.shipmentId === shipmentId && v.type === docType)
        .sort((a, b) => b.versionNumber - a.versionNumber);
}

/**
 * Get all document versions for a shipment
 */
export function getAllVersionsForShipment(shipmentId: string): DocumentVersion[] {
    return getAll()
        .filter((v) => v.shipmentId === shipmentId)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

/**
 * Get latest version of each document type for a shipment
 */
export function getLatestVersions(shipmentId: string): DocumentVersion[] {
    return getAll().filter((v) => v.shipmentId === shipmentId && v.isLatest);
}

/**
 * Update status of a specific version
 */
export function updateVersionStatus(versionId: string, status: DocStatus): void {
    const all = getAll();
    const idx = all.findIndex((v) => v.versionId === versionId);
    if (idx !== -1) {
        all[idx].status = status;
        saveAll(all);
    }
}

/**
 * Get total version count for a shipment
 */
export function getVersionCount(shipmentId: string): number {
    return getAll().filter((v) => v.shipmentId === shipmentId).length;
}
