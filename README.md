# AI IMPACT — AI Strategy Consulting

A single-page marketing site for AI strategy consulting services.

## Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS 4** for styling
- **Lucide React** for icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_CALENDLY_URL` | Your Calendly booking link |
| `VITE_CONTACT_EMAIL` | Contact email address |

## Project Structure

```
src/
  App.jsx        — All page sections and components
  App.css        — Tailwind base (minimal)
  main.jsx       — React entry point
public/
  privacy.html   — Privacy policy page
  terms.html     — Terms of service page
```

## Deployment

Build with `npm run build` and deploy the `dist/` directory to any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

For Vercel: connect the repo and it auto-detects Vite. No extra config needed.

## Lint

```bash
npm run lint
```
