import type { Metadata } from 'next';
import { PackPage } from '../../components/ui/pack-page';
import { loadContentPack } from '../../lib/content-pack';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Aros Studio for institutional briefings, pilots, investment and press.',
};

/** Copy lives in content-packs/contact.en.md — edit the pack, not this file. */
export default function ContactPage() {
  return <PackPage pack={loadContentPack('contact', 'en')} />;
}
