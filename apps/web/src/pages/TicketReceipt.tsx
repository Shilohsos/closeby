import { useParams } from 'wouter';

export default function TicketReceipt() {
  const { referenceCode } = useParams();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Ticket Receipt</h1>
      <p className="text-gray-500">Reference: {referenceCode}</p>
    </div>
  );
}
