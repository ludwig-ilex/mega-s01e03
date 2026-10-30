<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { splitTicket, type Problem } from '#lib/kb/split';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // Inline count of one problem in a ticket: <ProblemCount ticket={4471} problem="hint" />
  let { ticket, problem }: { ticket: number; problem: Problem } = $props();

  const n = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove).rows.find((r) => r.problem === problem)?.reports.length ?? 0);
</script>

<strong>{n}</strong>
