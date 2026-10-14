import Link from 'next/link';
import type { Metadata } from 'next';
import { PackPage } from '../../../components/ui/pack-page';
import { loadContentPack } from '../../../lib/content-pack';
import { formatDate, listPosts } from '../../../lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes from Aros Studio on institutional settlement, Proof of Transaction, and the boundaries we build in on purpose.',
};

/** Index copy lives in content-packs/blog.en.md; posts in content-packs/blog/<slug>.en.md. */
export default function BlogPage() {
  const posts = listPosts('en');
  return (
    <PackPage pack={loadContentPack('blog', 'en')}>
      <div className="blog-list">
        {posts.map((p) => (
          <Link key={p.slug} href={`/resources/blog/${p.slug}`} className="blog-item glass">
            <span className="blog-item__meta">
              {formatDate(p.date)}
              {p.tags.length ? ` · ${p.tags.join(' · ')}` : ''}
            </span>
            <h2>{p.title}</h2>
            <p>{p.summary}</p>
          </Link>
        ))}
      </div>
    </PackPage>
  );
}
