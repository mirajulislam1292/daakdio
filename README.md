# ডাক দিও · DaakDio

Personalized Bengali and English event invitations with four interactive Three.js themes.

Live: https://daakdio.vercel.app  
Demo: https://daakdio.vercel.app/i/demo

## Features

- Phone-first Bangladesh signup without SMS; private access code for return login.
- Guest-specific links, personal messages, relationship-based wording and RSVP.
- Four distinct 3D scenes, responsive layouts, reduced-motion support and animation pause.
- Private original-file albums, with up to three host-selected invitation photos.
- Supabase row-level security and server-enforced pilot quotas.

## Local development

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Fill the two public Supabase settings in `.env.local`. Never put service-role credentials in frontend environment variables.

```sh
npm run build
```

## Backend

`database/` contains the database SQL and Supabase Edge Function source. These files document the existing deployment; review them before applying to another project. They are not all repeatable migrations.

## Deployment

The current Vercel production site was deployed from locally built static files. This repository is source backup; automatic deployment is not configured. See `LAUNCH.md` for pilot limits and remaining product work.

Local credentials, Vercel linkage, dependencies and generated build output are excluded from version control.

## Interface and typography

The interface pairs Noto Serif Bengali headings with Anek Bangla body text, with
Cormorant Garamond and Manrope for Latin text. Fonts load through Google Fonts
with `display=swap`. Bengali headings use natural letter spacing and generous
line height. Shared design tokens and responsive refinements live in
`src/premium.css`; the four invitation worlds retain their individual palettes.

The homepage includes an interactive four-theme preview, an animation pause
control, personal invitation/RSVP/album explanations, and keyboard-accessible
FAQ disclosures. Bengali and English demo content lives in `src/demo.ts`.
Saved invitations continue to use the language chosen by their host.

## UI verification

```sh
npm run check:ui
npm run build
```

The UI check renders both languages and all four theme covers, plus the demo
invitation and RSVP markup, without making backend writes. It does not replace
browser interaction, mobile layout, WebGL, or authenticated end-to-end testing.
The local homepage and sample invitations work without Supabase credentials;
account, real invitation, and dashboard operations require the existing public
Supabase environment settings.
