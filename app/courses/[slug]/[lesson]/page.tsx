import { getCourseLesson } from '@/lib/courseLesson'
import LessonView from './LessonView'

export default async function LessonPage({ params }: {params: Promise<{slug: string; lesson: string}>}) {
  const {slug, lesson} = await params
  const {course, lessons, index, details, content} = await getCourseLesson(slug, lesson)
  return <LessonView slug={slug} course={{id:course.id,title:course.title}} lesson={details} index={index} total={lessons.length}
    previous={lessons[index - 1]?.slug} next={lessons[index + 1]?.slug}>
    {content && <div className="prose prose-lg mt-10 max-w-3xl" dir="auto"
      dangerouslySetInnerHTML={{__html:content}} />}
  </LessonView>
}
