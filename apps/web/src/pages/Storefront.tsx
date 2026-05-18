import { useParams } from 'wouter';

export default function Storefront() {
  const { userId } = useParams();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Storefront</h1>
      <p className="text-gray-500">User: {userId}</p>
    </div>
  );
}
