import type { Metadata } from 'next';
import { StubPage } from '../../../components/ui/stub-page';

export const metadata: Metadata = { title: 'AFC Docs' };

export default function AfcDocsPage() {
  return (
    <StubPage eyebrow="Resources" title="AFC Docs" lead="Documentation for Aros Financial Core." />
  );
}
