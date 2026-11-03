import { PublicHeader } from '@/src/shared/components/layout/PublicHeader';
import { PublicFooter } from '@/src/shared/components/layout/PublicFooter';
import { HomePage as HomeFeaturePage } from '@/src/features/home/HomePage';
import { AuthPreviewControls } from '@/src/features/auth/components/AuthPreviewControls';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <AuthPreviewControls />
        <HomeFeaturePage />
      </main>
      <PublicFooter />
    </div>
  );
}
