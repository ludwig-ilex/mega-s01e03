// Writes one issue body per problem in #4471 to issues/. Counts as the desk's CauseTable does; each id is listed in one issue only.
import fs from 'node:fs';
import { causeOf, uniqueById, type Report, type Tenant } from '../src/lib/kb/causes.ts';

const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const reports: Report[] = read('src/lib/data/reports-4471.json');
const { oneDayMove } = read('src/lib/data/desk-notes.json');
const tenants = new Map<string, Tenant>(
  fs.readdirSync('src/lib/data/tenants').map((f) => { const t = read(`src/lib/data/tenants/${f}`); return [t.handle, t]; }),
);

const merged = uniqueById(reports).filter((r) => r.mergedInto === 4471);
const problemOf = (r: Report) => (oneDayMove.includes(r.id) ? 'shift' : causeOf(r, tenants.get(r.tenant)) ?? 'unplaced');
const groups = Object.groupBy(merged, problemOf);

const RULE: Record<string, string> = {
  parser: 'A report from a day-first tenant that is not `hint` and not `shift`. The shared parser reads every date month first.',
  hint: 'A report through the form (`channel: form`) from a day-first tenant on `booking-v3`. That form prints `MM/DD/YYYY` under the date field, then reads the date day first.',
  shift: 'A report the desk read as a one-day move (`desk-notes.json`, `oneDayMove`). The invite keeps the date order but lands one day early.',
};

// `shift` reports the desk files under a cause by tenant: counted there, listed in the shift issue.
const filedUnder = (problem: string) =>
  problem === 'shift' ? 0 : (groups.shift ?? []).filter((r) => causeOf(r, tenants.get(r.tenant)) === problem).length;

for (const [problem, rs] of Object.entries(groups)) {
  const days = rs!.map((r) => r.receivedAt.slice(0, 10)).sort();
  const also = filedUnder(problem);
  const body = [
    `**${rs!.length + also} reports** from #4471.`,
    ...(also ? ['', `This count is the desk's CauseTable count. It includes ${also} \`shift\` reports that the desk files here by tenant. Their ids are listed in the shift issue, not here.`] : []),
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
  console.log(problem, rs!.length + also, 'ids', rs!.length);
}
