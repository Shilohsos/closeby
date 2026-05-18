import { useParams } from 'wouter';

export default function BuyTicket() {
  const { id } = useParams();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Buy Ticket</h1>
      <p className="text-gray-500">Event ID: {id}</p>
    </div>
  );
}
