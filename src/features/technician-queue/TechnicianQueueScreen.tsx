import { TechnicianQueueWorkspace } from './TechnicianQueueWorkspace';

export function TechnicianQueueScreen() {
  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
      <div className="min-w-0">
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
          <div className="mx-auto max-w-[1500px] space-y-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Không gian cận lâm sàng</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Hàng chờ CLS</h1></div>
            <TechnicianQueueWorkspace />
          </div>
        </main>
      </div>
    </div>
  );
}
