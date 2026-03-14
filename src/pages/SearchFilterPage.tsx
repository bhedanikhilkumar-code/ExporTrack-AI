import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { REQUIRED_DOCUMENT_TYPES } from '../types';

export default function SearchFilterPage() {
  const {
    state: { shipments }
  } = useAppContext();

  const [shipmentId, setShipmentId] = useState('');
  const [clientName, setClientName] = useState('');
  const [destination, setDestination] = useState('');
  const [shipmentDate, setShipmentDate] = useState('');
  const [docType, setDocType] = useState('');

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const matchesShipmentId = shipment.id.toLowerCase().includes(shipmentId.toLowerCase());
      const matchesClient = shipment.clientName.toLowerCase().includes(clientName.toLowerCase());
      const matchesDestination = shipment.destinationCountry.toLowerCase().includes(destination.toLowerCase());
      const matchesDate = shipmentDate ? shipment.shipmentDate === shipmentDate : true;
      const matchesDocType = docType ? shipment.documents.some((doc) => doc.type === docType) : true;

      return matchesShipmentId && matchesClient && matchesDestination && matchesDate && matchesDocType;
    });
  }, [shipments, shipmentId, clientName, destination, shipmentDate, docType]);

  return (
    <div className="page-stack">
      <PageHeader title="Smart Search & Filter" subtitle="Find shipments quickly by ID, client, destination, date, and document type." />

      <section className="card-panel">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="shipment-id-filter" className="input-label">
              Shipment ID
            </label>
            <input
              id="shipment-id-filter"
              value={shipmentId}
              onChange={(event) => setShipmentId(event.target.value)}
              className="input-field"
              placeholder="EXP-2026-001"
            />
          </div>
          <div>
            <label htmlFor="client-filter" className="input-label">
              Client Name
            </label>
            <input
              id="client-filter"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              className="input-field"
              placeholder="Apex Retail Imports"
            />
          </div>
          <div>
            <label htmlFor="destination-filter" className="input-label">
              Destination Country
            </label>
            <input
              id="destination-filter"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="input-field"
              placeholder="Germany"
            />
          </div>
          <div>
            <label htmlFor="date-filter" className="input-label">
              Shipment Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={shipmentDate}
              onChange={(event) => setShipmentDate(event.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="doc-type-filter" className="input-label">
              Document Type
            </label>
            <select
              id="doc-type-filter"
              value={docType}
              onChange={(event) => setDocType(event.target.value)}
              className="input-field"
            >
              <option value="">All document types</option>
              {REQUIRED_DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setShipmentId('');
                setClientName('');
                setDestination('');
                setShipmentDate('');
                setDocType('');
              }}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <section className="card-panel">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="card-title text-base md:text-lg">Results ({filteredShipments.length})</h3>
          <p className="text-xs uppercase tracking-wide text-slate-500">Seeded records</p>
        </div>
        <div className="space-y-3">
          {filteredShipments.map((shipment) => {
            const matchingDocCount = docType ? shipment.documents.filter((doc) => doc.type === docType).length : shipment.documents.length;
            return (
              <article key={shipment.id} className="card-muted p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-navy-800 dark:text-white">{shipment.id}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {shipment.clientName} • {shipment.destinationCountry}
                    </p>
                    <p className="text-xs text-slate-500">
                      Date: {shipment.shipmentDate} • Container: {shipment.containerNumber}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Matching docs: {matchingDocCount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={shipment.status} />
                    <Link to={`/shipments/${shipment.id}`} className="btn-secondary btn-xs">
                      Open
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

