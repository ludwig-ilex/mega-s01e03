<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import split from '#lib/data/split-4471.json';
  import { splitTicket, type Problem } from '#lib/kb/split';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  let { ticket }: { ticket: number } = $props();

  const result = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const issue = (p: Problem | 'unplaced') => (split.issues as Record<string, { url: string; title: string }>)[p];
</script>

<p class="sum">
  <strong>{result.merged}</strong> reports merged into #{ticket} ·
  <strong>{result.rows.length}</strong>
  {result.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each result.rows as row (row.problem)}
      <tr class:unplaced={!issue(row.problem)}>
        <td><code>{row.problem}</code></td>
        <td>{row.reports.length}</td>
        <td>{row.tenants}</td>
        <td>{row.firstSeen} → {row.lastSeen}</td>
        <td>
          {#if issue(row.problem)}<a href={issue(row.problem).url}>{issue(row.problem).title}</a>{:else}no ticket yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .unplaced td { background: var(--warn-bg); color: var(--warn); }
</style>
