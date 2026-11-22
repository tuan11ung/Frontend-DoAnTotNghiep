import { ScrollableTable, type ScrollableTableProps } from '../ScrollableTable';
import './admin-table.css';

/** Opt-in table presentation for administration screens only. */
export function AdminTable({ className = '', stickyActions = false, ...props }: ScrollableTableProps & { stickyActions?: boolean }) {
  return <ScrollableTable {...props} className={`medconnect-admin-table ${stickyActions ? 'medconnect-admin-table--sticky-actions' : ''} ${className}`} />;
}

export function AdminTableColumns({ widths }: { widths: number[] }) {
  return <colgroup>{widths.map((width, index) => <col key={index} style={{ width }} />)}</colgroup>;
}
