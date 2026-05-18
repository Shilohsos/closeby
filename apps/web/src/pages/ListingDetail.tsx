import { useParams } from 'wouter';

export default function ListingDetail() {
  const { id } = useParams();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Listing Detail</h1>
      <p className="text-gray-500">Listing ID: {id}</p>
    </div>
  );
}
