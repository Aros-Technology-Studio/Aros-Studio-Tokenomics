import type { Metadata } from 'next';
import { StubPage } from '../../components/ui/stub-page';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <StubPage
      eyebrow="Get in touch"
      title="Contact"
      lead="Reach the Aros Studio team — institutional onboarding, partnerships, and press."
    />
  );
}
