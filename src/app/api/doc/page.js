import { getApiDocs } from '@/lib/swagger';
import SwaggerUIView from '@/components/SwaggerUIView';

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <section className="container">
      <SwaggerUIView spec={spec} />
    </section>
  );
}
