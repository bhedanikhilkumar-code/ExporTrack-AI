import { Shipment, CreateShipmentInput, ShipmentDocument, UploadDocumentInput, ShipmentTimelineEvent, ShipmentComment } from '../../types';

const API_BASE = '/api/shipments';

export const shipmentApi = {
  async getAll(): Promise<Shipment[]> {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch shipments');
    const shipments = await response.json();

    // Fetch related data for each shipment
    for (const shipment of shipments) {
      const [docsResp, timelineResp, commentsResp] = await Promise.all([
        fetch(`${API_BASE}/${shipment.id}/documents`),
        fetch(`${API_BASE}/${shipment.id}/timeline`),
        fetch(`${API_BASE}/${shipment.id}/comments`)
      ]);

      if (docsResp.ok) shipment.documents = await docsResp.json();
      if (timelineResp.ok) shipment.timeline = await timelineResp.json();
      if (commentsResp.ok) shipment.comments = await commentsResp.json();
    }

    return shipments;
  },

  async getById(id: string): Promise<Shipment> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch shipment');
    const shipment = await response.json();

    // Fetch related data
    const [docsResp, timelineResp, commentsResp] = await Promise.all([
      fetch(`${API_BASE}/${id}/documents`),
      fetch(`${API_BASE}/${id}/timeline`),
      fetch(`${API_BASE}/${id}/comments`)
    ]);

    if (docsResp.ok) shipment.documents = await docsResp.json();
    if (timelineResp.ok) shipment.timeline = await timelineResp.json();
    if (commentsResp.ok) shipment.comments = await commentsResp.json();

    return shipment;
  },

  async create(input: CreateShipmentInput & { id: string; userId?: string }): Promise<void> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error('Failed to create shipment');
  },

  async update(id: string, updates: Partial<Shipment>): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update shipment');
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete shipment');
  },

  async addDocument(shipmentId: string, doc: ShipmentDocument): Promise<void> {
    const response = await fetch(`${API_BASE}/${shipmentId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    if (!response.ok) throw new Error('Failed to add document');
  },

  async addTimelineEvent(shipmentId: string, event: ShipmentTimelineEvent): Promise<void> {
    const response = await fetch(`${API_BASE}/${shipmentId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    if (!response.ok) throw new Error('Failed to add timeline event');
  },

  async updateDocumentStatus(shipmentId: string, documentId: string, status: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${shipmentId}/documents/${documentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update document status');
  },

  async addComment(shipmentId: string, comment: ShipmentComment): Promise<void> {
    const response = await fetch(`${API_BASE}/${shipmentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    });
    if (!response.ok) throw new Error('Failed to add comment');
  }
};
