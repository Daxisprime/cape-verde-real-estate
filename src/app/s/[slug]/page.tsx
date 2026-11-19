import StorefrontClient from './StorefrontClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: `${slug.replace(/-/g, ' ')} | ZapPro Store` };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  return <StorefrontClient slug={slug} />;
}
