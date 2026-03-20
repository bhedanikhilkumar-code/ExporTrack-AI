import { FormEvent, useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import { ShipmentStatus } from '../types';
import jsPDF from 'jspdf';

const statuses: ShipmentStatus[] = ['Shipment Created', 'In Transit', 'Under Verification', 'Customs Hold', 'Delivered', 'Delayed'];

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const {
    createShipment,
    state: { teamMembers }
  } = useAppContext();

  const location = useLocation();
  const prefill = location.state?.prefill;
  const message = location.state?.message;

  const assigneeOptions = useMemo(() => teamMembers.map((member) => member.name), [teamMembers]);

  const [shipmentId, setShipmentId] = useState(`EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`);
  const [clientName, setClientName] = useState(prefill?.clientName ?? '');
  const [destinationCountry, setDestinationCountry] = useState(prefill?.destinationCountry ?? '');
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [containerNumber, setContainerNumber] = useState(prefill?.containerNumber ?? '');
  const [status, setStatus] = useState<ShipmentStatus>('Shipment Created');
  const [assignedTo, setAssignedTo] = useState(assigneeOptions[0] ?? 'Ops Team');

  // If prefill changed (though unlikely for this page), update state
  useEffect(() => {
    if (prefill) {
      if (prefill.clientName) setClientName(prefill.clientName);
      if (prefill.destinationCountry) setDestinationCountry(prefill.destinationCountry);
      if (prefill.containerNumber) setContainerNumber(prefill.containerNumber);
    }
  }, [prefill]);

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

  const handleSaveAndExportPdf = () => {
    const created = createShipment({
      shipmentId,
      clientName,
      destinationCountry,
      shipmentDate,
      containerNumber,
      status,
      assignedTo
    });

    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('ExporTrack AI - Shipment Manifest', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Shipment ID: ${shipmentId}`, 20, 40);
    doc.text(`Client Name: ${clientName}`, 20, 50);
    doc.text(`Destination: ${destinationCountry}`, 20, 60);
    doc.text(`Date: ${shipmentDate}`, 20, 70);
    doc.text(`Container #: ${containerNumber}`, 20, 80);
    doc.text(`Status: ${status}`, 20, 90);
    doc.text(`Assigned To: ${assignedTo}`, 20, 100);
    
    doc.text('Authorized by ExporTrack AI Neural Core', 20, 130);
    
    doc.save(`shipment-${shipmentId}.pdf`);
    
    navigate(`/shipments/${created.id}`);
  };

  return (
    <div className="page-stack">
      <PageHeader title="Create Shipment" subtitle="Register a new shipment, assign owner, and initialize its verification workflow." />
      
      {message && (
        <div className="mb-6 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
             <AppIcon name="ai-extract" className="h-4 w-4" />
           </div>
           <p className="text-xs font-bold text-teal-700 dark:text-teal-400">{message}</p>
        </div>
      )}

      <section className="card-panel">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="shipment-id" className="input-label">
              Shipment ID
            </label>
            <input id="shipment-id" value={shipmentId} onChange={(event) => setShipmentId(event.target.value)} required className="input-field" />
          </div>
          <div>
            <label htmlFor="client-name" className="input-label">
              Client Name
            </label>
            <input id="client-name" value={clientName} onChange={(event) => setClientName(event.target.value)} required className="input-field" placeholder="Client company name" />
          </div>
          <div>
            <label htmlFor="destination-country" className="input-label">
              Destination Country
            </label>
            <input id="destination-country" value={destinationCountry} onChange={(event) => setDestinationCountry(event.target.value)} required className="input-field" placeholder="Germany" />
          </div>
          <div>
            <label htmlFor="shipment-date" className="input-label">
              Shipment Date
            </label>
            <input id="shipment-date" type="date" value={shipmentDate} onChange={(event) => setShipmentDate(event.target.value)} required className="input-field" />
          </div>
          <div>
            <label htmlFor="container-number" className="input-label">
              Container Number
            </label>
            <input id="container-number" value={containerNumber} onChange={(event) => setContainerNumber(event.target.value)} required className="input-field" placeholder="MSCU-123456-7" />
          </div>
          <div>
            <label htmlFor="shipment-status" className="input-label">
              Shipment Status
            </label>
            <select id="shipment-status" value={status} onChange={(event) => setStatus(event.target.value as ShipmentStatus)} className="input-field">
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="assignee" className="input-label">
              Assigned Team Member
            </label>
            <select id="assignee" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="input-field">
              {assigneeOptions.map((memberName) => (
                <option key={memberName} value={memberName}>
                  {memberName}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-teal-100 dark:border-teal-800/50 bg-teal-50 dark:bg-teal-950/30 px-4 py-3 text-xs text-teal-900 dark:text-teal-300">
            <span>Tip: Assign an owner so approvals and reminders have clear accountability.</span>
            <span className="font-semibold">Hackathon-ready workflow</span>
          </div>
          <div className="md:col-span-2 flex gap-4">
            <button type="submit" className="btn-primary flex-1">
              Save Shipment
            </button>
            <button 
              type="button" 
              onClick={handleSaveAndExportPdf}
              className="btn-secondary flex-1 border-teal-500 text-teal-600 hover:bg-teal-50"
            >
              <AppIcon name="file" className="mr-2 h-4 w-4" />
              Save & Export PDF
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

