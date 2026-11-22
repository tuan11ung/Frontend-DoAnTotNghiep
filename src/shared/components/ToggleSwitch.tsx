'use client';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ label, checked, disabled = false, onChange }: ToggleSwitchProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className="relative inline-flex h-7 w-12 shrink-0 items-center align-middle outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span aria-hidden="true" className={`absolute inset-0 rounded-full transition-colors ${checked ? 'bg-emerald-600' : 'bg-slate-300'}`} />
      <span aria-hidden="true" className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}
