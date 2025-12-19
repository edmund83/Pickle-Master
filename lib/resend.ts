import { Resend } from 'resend';

// Only instantiate if key exists to avoid runtime errors during build/init
// logic handled in usage or here? Resend constructor doesn't throw immediately usually.
// But let's be safe.

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;
