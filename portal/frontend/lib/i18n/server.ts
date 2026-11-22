import { cookies } from 'next/headers';
import { LOCALE_STORAGE_KEY } from './types';

/** Public pages exist in English and Georgian; anything else reads as English. */
export type PublicLocale = 'en' | 'ka';

export async function getLocale(): Promise<PublicLocale> {
  const value = (await cookies()).get(LOCALE_STORAGE_KEY)?.value;
  return value === 'ka' ? 'ka' : 'en';
}
