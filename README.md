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
