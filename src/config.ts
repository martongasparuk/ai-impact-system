// Site-wide config constants. One place to change the booking URL, the public
// contact email, and anything else that would otherwise be hard-coded in
// multiple components.
//
// Values read from Vite env vars at build time. Fallbacks are the current
// placeholders so the site still renders while Marton finishes setup.

const env = import.meta.env;

const readEnv = (key: string, fallback: string): string => {
  const raw = env[key] as string | undefined;
  return raw && raw.trim().length > 0 ? raw : fallback;
};

/** Public-facing contact address used for footer links, waitlist emails. */
export const CONTACT_EMAIL = readEnv(
  'VITE_CONTACT_EMAIL',
  'marton.gaspar.uk@gmail.com',
);

/** Brand / support address on aiimpactsystem.com used by marketing CTAs. */
export const BRAND_EMAIL = readEnv(
  'VITE_BRAND_EMAIL',
  'marton@aiimpactsystem.com',
);

/** Calendly URL used on the main site homepage. */
export const CALENDLY_URL = readEnv(
  'VITE_CALENDLY_URL',
  'https://calendly.com/martongaspar/30min',
);

/** Cal.com URL used on the scorecard result page (Diagnostic Call CTA). */
export const CAL_COM_URL = readEnv(
  'VITE_CAL_URL',
  'https://cal.com/marton-gaspar/diagnostic-call',
);
