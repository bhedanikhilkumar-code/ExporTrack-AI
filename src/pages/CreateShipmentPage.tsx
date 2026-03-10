import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../context/AppContext';
import { ShipmentStatus } from '../types';

const statuses: ShipmentStatus[] = ['Awaiting Documents', 'In Transit', 'Under Verification', 'Customs Hold', 'Delivered'];

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const {
    createShipment,
    state: { teamMembers }
  } = useAppContext();

  const assigneeOptions = useMemo(() => teamMembers.map((member) => member.name), [teamMembers]);

  const [shipmentId, setShipmentId] = useState(`EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`);
  const [clientName, setClientName] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [containerNumber, setContainerNumber] = useState('');
  const [status, setStatus] = useState<ShipmentStatus>('Awaiting Documents');
  const [assignedTo, setAssignedTo] = useState(assigneeOptions[0] ?? 'Ops Team');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = createShipment({
      shipmentId,
      clientName,
      destinationCountry,
      shipmentDate,
      containerNumber,
      status,
      assignedTo
    });
    navigate(`/shipments/${created.id}`);
  };

  return (
    <div>
      <PageHeader title="Create Shipment" subtitle="Register a new shipment, assign owner, and initialize its verification workflow." />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="shipment-id" className="mb-1 block text-sm font-medium text-slate-700">
              Shipment ID
            </label>
            <input id="shipment-id" value={shipmentId} onChange={(event) => setShipmentId(event.target.value)} required className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring" />
          </div>
          <div>
            <label htmlFor="client-name" className="mb-1 block text-sm font-medium text-slate-700">
              Client Name
            </label>
            <input id="client-name" value={clientName} onChange={(event) => setClientName(event.target.value)} required className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring" placeholder="Client company name" />
          </div>
          <div>
            <label htmlFor="destination-country" className="mb-1 block text-sm font-medium text-slate-700">
              Destination Country
            </label>
            <input id="destination-country" value={destinationCountry} onChange={(event) => setDestinationCountry(event.target.value)} required className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring" placeholder="Germany" />
          </div>
          <div>
            <label htmlFor="shipment-date" className="mb-1 block text-sm font-medium text-slate-700">
              Shipment Date
            </label>
            <input id="shipment-date" type="date" value={shipmentDate} onChange={(event) => setShipmentDate(event.target.value)} required className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring" />
          </div>
          <div>
            <label htmlFor="container-number" className="mb-1 block text-sm font-medium text-slate-700">
              Container Number
            </label>
            <input id="container-number" value={containerNumber} onChange={(event) => setContainerNumber(event.target.value)} required className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring" placeholder="MSCU-123456-7" />
          </div>
          <div>
            <label htmlFor="shipment-status" className="mb-1 block text-sm font-medium text-slate-700">
              Shipment Status
            </label>
            <select id="shipment-status" value={status} onChange={(event) => setStatus(event.target.value as ShipmentStatus)} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring">
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="assignee" className="mb-1 block text-sm font-medium text-slate-700">
              Assigned Team Member
            </label>
            <select id="assignee" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-teal-200 focus:ring">
              {assigneeOptions.map((memberName) => (
                <option key={memberName} value={memberName}>
                  {memberName}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-xs text-teal-900">
            <span>Tip: Assign an owner so approvals and reminders have clear accountability.</span>
            <span className="font-semibold">Hackathon-ready workflow</span>
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

