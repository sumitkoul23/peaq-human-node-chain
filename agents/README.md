# PHN Agent Operators

These are safe local operators for PHN launch operations.

- `ui-guardian.js`: audits pages for viewport readiness, logo presence, shared runtime, PWA metadata, local links and mojibake.
- `intelligence-agent.js`: passively checks public design/SEO signals from relevant public sites and writes recommendations.
- `marketing-listing-agent.js`: maintains PHN listing and organic marketing execution queue.
- `run-daily-agents.ps1`: runs all agents and writes reports.

Run:

```powershell
powershell -ExecutionPolicy Bypass -File agents\run-daily-agents.ps1
```

Safety boundaries:

- These agents do not execute wallet transactions.
- They do not create social accounts or enter credentials.
- They do not run intrusive scans against third-party websites.
- They produce reports and safe local recommendations; production publishing remains a deliberate action.
