// Writes one issue body per problem in #4471 to issues/. Counts as the desk's CauseTable does: `shift` reports stay in their cause too.
import fs from 'node:fs';
import { causeOf, uniqueById, type Report, type Tenant } from '../src/lib/kb/causes.ts';

const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const reports: Report[] = read('src/lib/data/reports-4471.json');
const { oneDayMove } = read('src/lib/data/desk-notes.json');
const tenants = new Map<string, Tenant>(
  fs.readdirSync('src/lib/data/tenants').map((f) => { const t = read(`src/lib/data/tenants/${f}`); return [t.handle, t]; }),
);

const merged = uniqueById(reports).filter((r) => r.mergedInto === 4471);
const groups: Record<string, Report[]> = {
  ...Object.groupBy(merged, (r) => causeOf(r, tenants.get(r.tenant)) ?? 'unplaced'),
  shift: merged.filter((r) => oneDayMove.includes(r.id)),
};

const RULE: Record<string, string> = {
  parser: 'A report from a day-first tenant that is not `hint`. The shared parser reads every date month first. As in the desk\'s CauseTable, this count includes the `shift` reports filed here by tenant.',
  hint: 'A report through the form (`channel: form`) from a day-first tenant on `booking-v3`. That form prints `MM/DD/YYYY` under the date field, then reads the date day first.',
  shift: 'A report the desk read as a one-day move (`desk-notes.json`, `oneDayMove`). The invite keeps the date order but lands one day early.',
};

for (const [problem, rs] of Object.entries(groups)) {
  const days = rs!.map((r) => r.receivedAt.slice(0, 10)).sort();
  const body = [
    `**${rs!.length} reports** from #4471.`,
    '',
    `**Rule:** ${RULE[problem] ?? 'No rule places these reports.'}`,
    '',
    `**Seen:** ${days[0]} → ${days.at(-1)}, ${new Set(rs!.map((r) => r.tenant)).size} tenants.`,
    `**Source:** kb export of 2026-10-04, \`reports-4471.json\`, ${merged.length} unique reports (${reports.length} rows, duplicates by id removed).`,
    '',
    '<details><summary>Report ids</summary>',
    '',
    rs!.map((r) => r.id).join(' '),
    '',
    '</details>',
  ].join('\n');
  fs.writeFileSync(`issues/${problem}.md`, body + '\n');
  console.log(problem, rs!.length);
}
