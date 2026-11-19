import type { EncounterDraftState } from '@/src/shared/lib/encounter-draft';
export function EncounterDraftNotice({ state, onChoice }: { state: EncounterDraftState; onChoice?: () => void }) {
  if (!state.notice) return null;
  return <aside role="status" className="space-y-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
    <p>{state.notice}</p>
    {state.hasConflict && <div className="flex flex-wrap gap-3">
      {state.canRestore && <button type="button" className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-semibold" onClick={() => { state.restoreConflict(); onChoice?.(); }}>Phục hồi nháp cũ để đối chiếu</button>}
      <button type="button" className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-semibold" onClick={() => { state.discardConflict(); onChoice?.(); }}>Bỏ nháp cũ, giữ dữ liệu hiện tại</button>
    </div>}
  </aside>;
}
