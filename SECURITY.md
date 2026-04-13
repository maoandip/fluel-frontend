# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in fluel, please report it privately so we can investigate and fix it before it is disclosed publicly.

**Do not open a public GitHub issue for security vulnerabilities.**

### How to report

Email: **contact@fluel.io**

Please include:

- A description of the vulnerability
- Steps to reproduce (proof of concept if possible)
- The potential impact
- Any suggested mitigations

### What to expect

- Acknowledgement within **48 hours**
- Initial assessment within **5 working days**
- Regular updates on progress until resolution
- Credit in release notes once the fix is deployed (if you want it)

## Scope

In scope for this repository:

- The public marketing site (`site/`)
- The Telegram Mini App (`webapp/`)

Out of scope (report directly to the service):

- The private backend (Telegram bot, API, database) — report via `contact@fluel.io`
- Third-party services we depend on:
  - Privy — wallet infrastructure
  - Li.Fi — cross-chain routing
  - Telegram — bot platform
  - Cloudflare — CDN and email routing
- Vulnerabilities in dependencies not exploitable in fluel's context
- Social engineering, phishing, or physical attacks

## Safe harbour

We will not pursue legal action against researchers who:

- Act in good faith
- Do not access, modify, or exfiltrate user data beyond what is necessary to demonstrate the vulnerability
- Give us reasonable time to investigate and remediate before public disclosure
- Do not spam, DoS, or disrupt our service

## Not a bug bounty (yet)

fluel does not currently offer a paid bug bounty programme. We may introduce one as the user base grows. In the meantime, we offer public acknowledgement and our sincere thanks.
