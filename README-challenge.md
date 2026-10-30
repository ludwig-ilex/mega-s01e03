# MEGA.dev S01E03 · what it shows

#4471 holds three problems. One issue per problem:

- [#1](https://github.com/ludwig-ilex/mega-s01e03/issues/1) `parser`
- [#2](https://github.com/ludwig-ilex/mega-s01e03/issues/2) `hint`
- [#3](https://github.com/ludwig-ilex/mega-s01e03/issues/3) `shift`

The kb page:

- source: [`src/routes/kb/incidents/4471-split/+page.svx`](src/routes/kb/incidents/4471-split/+page.svx)
- as the desk sees it: [`build/kb/incidents/4471-split.html`](build/kb/incidents/4471-split.html)

The logic is in `src/lib/kb/split.ts` and `SplitTable.svelte`. `npm run build` renders the kb. `npm run split` writes the issue bodies to `issues/`.
