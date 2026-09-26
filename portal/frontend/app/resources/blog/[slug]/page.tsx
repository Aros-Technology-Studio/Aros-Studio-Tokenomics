import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Prose } from '../../../../components/ui/rich-text';
import { formatDate, getPost, listPosts } from '../../../../lib/blog';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return listPosts('en').map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug, 'en');
  if (!post) return { title: 'Blog' };
  return { title: post.title, description: post.summary };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug, 'en');
  if (!post) notFound();
  return (
    <section className="page">
      <div className="pad">
        <p className="page__eyebrow">
          <Link href="/resources/blog">Blog</Link> · {formatDate(post.date)}
        </p>
        <h1 className="page__title" style={{ fontSize: 'clamp(32px, 4.6vw, 56px)' }}>
          {post.title}
        </h1>
        {post.summary ? <p className="page__lead">{post.summary}</p> : null}
        <article className="post glass">
          <Prose source={post.body} />
          <p className="blog-item__meta" style={{ marginTop: 32 }}>
            {post.author}
            {post.tags.length ? ` · ${post.tags.join(' · ')}` : ''}
          </p>
        </article>
        <div className="pack-ctas">
          <Link className="btn-ghost" href="/resources/blog">
            ← All posts
          </Link>
          <Link className="btn-ghost" href="/contact">
            Contact us →
          </Link>
        </div>
      </div>
    </section>
  );
}
