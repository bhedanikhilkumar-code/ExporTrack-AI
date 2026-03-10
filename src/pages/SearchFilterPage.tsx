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
    <div>
      <PageHeader title="Smart Search & Filter" subtitle="Find shipments quickly by ID, client, destination, date, and document type." />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="shipment-id-filter" className="mb-1 block text-sm font-medium text-slate-700">
              Shipment ID
            </label>
            <input
              id="shipment-id-filter"
              value={shipmentId}
              onChange={(event) => setShipmentId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-200 focus:ring"
              placeholder="EXP-2026-001"
            />
          </div>
          <div>
            <label htmlFor="client-filter" className="mb-1 block text-sm font-medium text-slate-700">
              Client Name
            </label>
            <input
              id="client-filter"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-200 focus:ring"
              placeholder="Apex Retail Imports"
            />
          </div>
          <div>
            <label htmlFor="destination-filter" className="mb-1 block text-sm font-medium text-slate-700">
              Destination Country
            </label>
            <input
              id="destination-filter"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-200 focus:ring"
              placeholder="Germany"
            />
          </div>
          <div>
            <label htmlFor="date-filter" className="mb-1 block text-sm font-medium text-slate-700">
              Shipment Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={shipmentDate}
              onChange={(event) => setShipmentDate(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-200 focus:ring"
            />
          </div>
          <div>
            <label htmlFor="doc-type-filter" className="mb-1 block text-sm font-medium text-slate-700">
              Document Type
            </label>
            <select
              id="doc-type-filter"
              value={docType}
              onChange={(event) => setDocType(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-200 focus:ring"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy-800">Results ({filteredShipments.length})</h3>
          <p className="text-sm text-slate-500">Production-like seeded records</p>
        </div>
        <div className="space-y-3">
          {filteredShipments.map((shipment) => {
            const matchingDocCount = docType ? shipment.documents.filter((doc) => doc.type === docType).length : shipment.documents.length;
            return (
              <article key={shipment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-navy-800">{shipment.id}</p>
                    <p className="text-sm text-slate-700">
                      {shipment.clientName} • {shipment.destinationCountry}
                    </p>
                    <p className="text-xs text-slate-500">
                      Date: {shipment.shipmentDate} • Container: {shipment.containerNumber}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Matching docs: {matchingDocCount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={shipment.status} />
                    <Link
                      to={`/shipments/${shipment.id}`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
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

