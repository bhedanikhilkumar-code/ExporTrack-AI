import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../context/AppContext';
import { ShipmentStatus } from '../types';

const statuses: ShipmentStatus[] = ['Awaiting Documents', 'In Transit', 'Under Verification', 'Customs Hold', 'Delivered'];

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const { createShipment } = useAppContext();
  const [shipmentId, setShipmentId] = useState(`EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`);
  const [clientName, setClientName] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [containerNumber, setContainerNumber] = useState('');
  const [status, setStatus] = useState<ShipmentStatus>('Awaiting Documents');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = createShipment({
      shipmentId,
      clientName,
      destinationCountry,
      shipmentDate,
      containerNumber,
      status
    });
    navigate(`/shipments/${created.id}`);
  };

  return (
    <div>
      <PageHeader title="Create Shipment" subtitle="Register a new shipment and initialize its documentation lifecycle." />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="shipment-id" className="mb-1 block text-sm font-medium text-slate-700">
              Shipment ID
            </label>
            <input
              id="shipment-id"
              value={shipmentId}
              onChange={(event) => setShipmentId(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring"
            />
          </div>
          <div>
            <label htmlFor="client-name" className="mb-1 block text-sm font-medium text-slate-700">
              Client Name
            </label>
            <input
              id="client-name"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring"
              placeholder="Client company name"
            />
          </div>
          <div>
            <label htmlFor="destination-country" className="mb-1 block text-sm font-medium text-slate-700">
              Destination Country
            </label>
            <input
              id="destination-country"
              value={destinationCountry}
              onChange={(event) => setDestinationCountry(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring"
              placeholder="Germany"
            />
          </div>
          <div>
            <label htmlFor="shipment-date" className="mb-1 block text-sm font-medium text-slate-700">
              Shipment Date
            </label>
            <input
              id="shipment-date"
              type="date"
              value={shipmentDate}
              onChange={(event) => setShipmentDate(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring"
            />
          </div>
          <div>
            <label htmlFor="container-number" className="mb-1 block text-sm font-medium text-slate-700">
              Container Number
            </label>
            <input
              id="container-number"
              value={containerNumber}
              onChange={(event) => setContainerNumber(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring"
              placeholder="MSCU-123456-7"
            />
          </div>
          <div>
            <label htmlFor="shipment-status" className="mb-1 block text-sm font-medium text-slate-700">
              Shipment Status
            </label>
            <select
              id="shipment-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ShipmentStatus)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring"
            >
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">
              Save Shipment
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
