// The problems inside a merged ticket, one ticket each. Counted as the desk's CauseTable does.
import { groupByCause, readAs, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

// `shift`: the date lands one day early (desk-notes.json, `oneDayMove`). The desk files these under their cause by tenant.
export type Problem = Cause | 'unplaced' | 'shift';

export type ProblemRow = { problem: Problem; reports: number; filedUnder?: Cause | 'unplaced' };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const shifts = groups.flatMap((g) => (readAs(g, oneDayMove) ? [{ problem: 'shift' as const, reports: readAs(g, oneDayMove), filedUnder: g.cause }] : []));
  return { merged: merged.length, rows: [...groups.map((g) => ({ problem: g.cause, reports: g.reports.length })), ...shifts] };
}
