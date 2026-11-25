import type { ComponentPropsWithoutRef } from 'react';
import { Plus } from 'lucide-react';
import { PrimaryActionButton } from './PrimaryActionButton';

export function AddButton({ children, ...props }: Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'className'>) {
  return (
    <PrimaryActionButton {...props}>
      <Plus aria-hidden="true" className="size-4" />
      {children}
    </PrimaryActionButton>
  );
}
