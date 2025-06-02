# Handlingsplan for oppgave/steghåndtering

Dette dokumentet beskriver en enkel struktur for automatiserte oppgaver bestående av steg og handlinger. Strukturen er inspirert av tidligere diskusjon om `task → step → actions` og gir mulighet til å navigere, klikke, fylle inn verdier og hente ut data.

## Struktur

- **Task** – inneholder en liste av steg som utføres sekvensielt.
- **Step** – hvert steg består av en liste av handlinger.
- **Action** – konkrete operasjoner som `navigate`, `click`, `fill` og `extract`.
- **MockPage** – enkel implementasjon som logger handlingene og kan simulere uttrekk av data fra et definert DOM‑lignende objekt.

## Eksempel

```ts
const actions: Action[] = [
  { type: 'navigate', url: 'https://example.com' },
  { type: 'click', selector: '#open' },
  { type: 'fill', selector: '#search', value: 'shoes' },
  {
    type: 'extract',
    container: '.product-card',
    fields: [
      { key: 'title', selector: '.title' },
      { key: 'price', selector: '.price' },
    ],
  },
];
```

Se `automation.ts` for implementasjonen og `automation.test.ts` for enkle tester som verifiserer at strukturen fungerer som forventet.
