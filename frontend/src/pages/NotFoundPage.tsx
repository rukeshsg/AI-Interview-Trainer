
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-slate-50">
      <p className="text-6xl font-bold text-indigo-600 mb-4">404</p>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 text-sm mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Button onClick={() => navigate('/dashboard')} icon={<Home className="w-4 h-4" />}>Back to Dashboard</Button>
    </div>
  );
}
