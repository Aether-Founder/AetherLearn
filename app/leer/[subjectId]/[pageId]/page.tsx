import JsonLessonPage from '@/app/[page]/page';

export default async function LocalContentPage({ params }: { params: { subjectId: string; pageId: string } }) {
  const { pageId } = params;

  // Use the existing JsonLessonPage component to render the content
  return <JsonLessonPage params={{ page: pageId }} />;
}
