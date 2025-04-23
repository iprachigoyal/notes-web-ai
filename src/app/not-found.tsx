import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/notes">
        <Button>Go to Notes</Button>
      </Link>
    </div>
  );
}