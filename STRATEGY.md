# Client Deployment & Conversion Strategies

This project is built with a **White-Label** architecture, allowing you to deploy the AI Assistant for any dentist (or similar service business) in minutes.

## 1. White-Label Configuration
All brand-specific data is centralized in `brandConfig.ts`. To "convert" a client:
1. Update `BRAND_CONFIG` with the client's name, slogan, services, and doctors.
2. Update the `colors` object to match the client's brand identity (e.g., `'blue'`, `'purple'`, `'emerald'`).
3. Deploy the frontend and provide the client with their unique Dashboard link.

## 2. Integration Strategies

### Strategy A: The Widget (Easy)
Keep the client's existing website and only add the AI Assistant as a floating bubble.
- **How:** Embed the `LiveVoiceSession` component (or the entire app as an iframe) into their site.
- **Benefit:** Zero friction. No need to touch their existing code.

### Strategy B: Frontend Swap (Premium)
Replace their old, static website with this modern, responsive, and AI-powered landing page.
- **How:** Point their domain to this React app.
- **Benefit:** Maximum impact. The client gets a high-converting, modern web presence.

### Strategy C: AI Wrapper (Hybrid)
Add a "Book with AI" button to their existing site that redirects to a dedicated booking page on this platform.
- **How:** Simple link or "Deep Link" from their current site.
- **Benefit:** Minimal change to their current site while adding high-value AI functionality.

## 3. Deployment Checklist
- [ ] Update `brandConfig.ts`.
- [ ] Set up Firebase project (or use a shared one with different collections).
- [ ] Configure `constants.ts` for the appropriate Gemini/OpenAI models.
- [ ] Update `.env` with the new project's API keys.
- [ ] Run `npm run build` and deploy to Vercel/Netlify/Firebase Hosting.
