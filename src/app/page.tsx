import { PublicHeader } from '@/src/layouts/PublicHeader';
import { PublicFooter } from '@/src/layouts/PublicFooter';
import { HomeScreen } from '@/src/features/home/HomeScreen';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <HomeScreen />
      </main>
      <PublicFooter />
    </div>
  );
}
