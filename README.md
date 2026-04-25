# The Hill

Production website for The Hill — an organic farm in Darek, Central Lombok.

Build is in progress. Fuller README with copy-update instructions and deploy notes will land at the end of the build session.

## Reference material

All reference files live under [`/reference/`](./reference):
- `the-hill-claude-code-brief.md` — build brief for this Claude Code session.
- `the-hill-copy.md` — canonical copy doc. Every word on the site is locked here. Do not paraphrase.
- `the-hill-standalone.html` — Claude Design export. Visual source of truth for tokens, type, layout.

## Commands

```
npm install           # install dependencies
npm run dev           # dev server at http://localhost:4321
npm run build         # production build to ./dist/
npm run preview       # preview the production build locally
```

Node >= 22.12 required.
