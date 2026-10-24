'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/app/admin/AdminNav'
import RichTextEditor from '@/components/RichTextEditor'
import { adminApi } from '@/lib/adminApi'
import { adminStorage } from '@/lib/adminStorage'

type Course = { id?: string; slug: string; title: string; description: string | null; cover_image: string | null; level: string | null; published: boolean; order_index: number }
type Lesson = { id?: string; course_id?: string; slug: string; title: string; content: string; quiz: string; minutes: number | ''; order_index: number }
const field = 'w-full border border-ink-300 bg-paper-raised px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-600'
const label = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500'
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80)

// Admin -> Courses: free mini-courses made of lessons (content + optional quiz).
export default function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([])
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [msg, setMsg] = useState('')
  const loadCourses = async () => { try { setCourses(((await adminApi.list('courses', { orderBy: 'order_index', ascending: true })) as Course[]) || []) } catch { setMsg('Could not load. Has the latest SQL update been run?') } }
  const loadLessons = async (courseId: string) => setLessons((((await adminApi.list('course_lessons', { orderBy: 'order_index', ascending: true })) as Lesson[]) || []).filter((l) => l.course_id === courseId))
  useEffect(() => { loadCourses() }, [])
  const open = async (c: Course) => { setCourse(c); setLesson(null); setMsg(''); if (c.id) await loadLessons(c.id); else setLessons([]) }

  async function saveCourse() {
    if (!course?.title.trim()) return setMsg('Add a title.')
    const row = { slug: course.slug.trim() || slugify(course.title), title: course.title.trim(), description: course.description?.trim() || null, cover_image: course.cover_image, level: course.level?.trim() || null, published: course.published, order_index: course.order_index }
    try {
      if (course.id) await adminApi.update('courses', course.id, row)
      else { const created: any = await adminApi.insert('courses', row); const id = Array.isArray(created) ? created[0]?.id : created?.id; setCourse({ ...course, ...row, id }) }
      setMsg('Course saved.'); loadCourses()
    } catch (e: any) { setMsg(/duplicate|unique/i.test(e?.message || '') ? 'That address (slug) is already used.' : 'Could not save the course.') }
  }
  async function saveLesson() {
    if (!course?.id || !lesson?.title.trim()) return setMsg(course?.id ? 'Add a lesson title.' : 'Save the course first.')
    const row = { course_id: course.id, slug: lesson.slug.trim() || slugify(lesson.title), title: lesson.title.trim(), content: lesson.content || null, quiz: lesson.quiz.trim() || null, minutes: lesson.minutes === '' ? null : Number(lesson.minutes), order_index: lesson.order_index }
    try { if (lesson.id) await adminApi.update('course_lessons', lesson.id, row); else await adminApi.insert('course_lessons', row); setLesson(null); setMsg('Lesson saved.'); loadLessons(course.id) }
    catch (e: any) { setMsg(/duplicate|unique/i.test(e?.message || '') ? 'Another lesson in this course already uses that address.' : 'Could not save the lesson.') }
  }
  async function move(i: number, dir: -1 | 1) {
    const j = i + dir; if (!course?.id || j < 0 || j >= lessons.length) return
    await adminApi.update('course_lessons', lessons[i].id!, { order_index: j }); await adminApi.update('course_lessons', lessons[j].id!, { order_index: i })
    await Promise.all(lessons.map((l, k) => (k !== i && k !== j && l.order_index !== k ? adminApi.update('course_lessons', l.id!, { order_index: k }) : null)))
    loadLessons(course.id)
  }
  async function uploadCover(file: File) {
    if (!course) return
    const name = `courses/${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()}`
    const { error } = await adminStorage.from('blog-images').upload(name, file)
    if (error) setMsg('Upload failed: ' + error.message); else setCourse({ ...course, cover_image: adminStorage.from('blog-images').getPublicUrl(name).data.publicUrl })
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-4xl text-ink-900">Courses</h1><p className="mt-2 text-sm text-ink-500">Free mini-courses at /courses. Visitors&rsquo; progress is saved in their browser.</p></div>
          <button onClick={() => open({ slug: '', title: '', description: '', cover_image: null, level: 'Beginner', published: false, order_index: courses.length })} className="bg-ink-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">+ New course</button>
        </div>
        {msg && <p role="status" className="mt-4 text-sm text-ink-700">{msg}</p>}
        <ul className="mt-8 divide-y divide-ink-100 border-y border-ink-100">
          {courses.map((c) => <li key={c.id} className="flex items-center justify-between py-3"><span className="text-ink-900">{c.title} <span className="ms-2 text-xs text-ink-500">{c.published ? 'Published' : 'Draft'}</span></span><button onClick={() => open(c)} className="text-xs font-medium uppercase tracking-[0.08em] text-ink-700">Edit</button></li>)}
          {courses.length === 0 && <li className="py-4 text-sm text-ink-500">No courses yet.</li>}
        </ul>
        {course && (
          <section className="mt-8 space-y-5 border border-ink-100 bg-paper-raised p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2"><label htmlFor="co-title" className={label}>Course title</label><input id="co-title" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value, slug: course.id ? course.slug : slugify(e.target.value) })} className={field} /></div>
              <div><label htmlFor="co-level" className={label}>Level</label><input id="co-level" value={course.level || ''} onChange={(e) => setCourse({ ...course, level: e.target.value })} className={field} /></div>
              <div><label htmlFor="co-slug" className={label}>Address: /courses/...</label><input id="co-slug" value={course.slug} onChange={(e) => setCourse({ ...course, slug: slugify(e.target.value) })} className={`${field} font-mono`} /></div>
              <div className="md:col-span-2"><label htmlFor="co-desc" className={label}>Description</label><input id="co-desc" value={course.description || ''} onChange={(e) => setCourse({ ...course, description: e.target.value })} className={field} /></div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <label className="cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-ink-900">{course.cover_image ? 'Replace cover image' : 'Add cover image'}<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = '' }} /></label>
              {course.cover_image && <img src={course.cover_image} alt="" className="h-12 w-20 object-cover" />}
              <label className="flex items-center gap-2 text-sm text-ink-900"><input type="checkbox" checked={course.published} onChange={(e) => setCourse({ ...course, published: e.target.checked })} className="h-4 w-4" /> Published (visible at /courses)</label>
              <button onClick={saveCourse} className="bg-ink-900 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">Save course</button>
            </div>
            {course.id && (
              <div className="border-t border-ink-100 pt-5">
                <div className="flex items-center justify-between"><p className={label}>Lessons</p><button onClick={() => setLesson({ slug: '', title: '', content: '', quiz: '', minutes: '', order_index: lessons.length })} className="text-xs font-medium uppercase tracking-[0.08em] text-ink-900">+ Add lesson</button></div>
                <ol className="mt-2 divide-y divide-ink-100 border-y border-ink-100">{lessons.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-3 py-2.5 text-sm"><span className="font-mono text-ink-500">{String(i + 1).padStart(2, '0')}</span><span className="flex-1 text-ink-900">{l.title}</span>
                    <button aria-label={`Move ${l.title} up`} onClick={() => move(i, -1)} disabled={i === 0} className="px-1 text-ink-500 disabled:opacity-30">↑</button>
                    <button aria-label={`Move ${l.title} down`} onClick={() => move(i, 1)} disabled={i === lessons.length - 1} className="px-1 text-ink-500 disabled:opacity-30">↓</button>
                    <button onClick={() => setLesson({ ...l, content: l.content || '', quiz: l.quiz || '', minutes: l.minutes ?? '' })} className="text-xs uppercase tracking-[0.08em] text-ink-700">Edit</button>
                    <button onClick={async () => { if (confirm(`Delete "${l.title}"?`)) { await adminApi.remove('course_lessons', l.id!); loadLessons(course.id!) } }} className="text-xs uppercase tracking-[0.08em] text-ink-500 hover:text-error">Delete</button></li>))}</ol>
                {lesson && (
                  <div className="mt-5 space-y-4 border border-ink-100 p-4">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="md:col-span-3"><label htmlFor="le-title" className={label}>Lesson title</label><input id="le-title" value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value, slug: lesson.id ? lesson.slug : slugify(e.target.value) })} className={field} /></div>
                      <div><label htmlFor="le-min" className={label}>Minutes</label><input id="le-min" type="number" min="1" value={lesson.minutes} onChange={(e) => setLesson({ ...lesson, minutes: e.target.value ? Number(e.target.value) : '' })} className={field} /></div>
                    </div>
                    <div><p className={label}>Content</p><RichTextEditor key={lesson.id || 'new'} content={lesson.content} onChange={(v: string) => setLesson({ ...lesson, content: v })} /></div>
                    <div><label htmlFor="le-quiz" className={label}>Quiz (optional; same format as blog quizzes)</label><textarea id="le-quiz" rows={4} value={lesson.quiz} onChange={(e) => setLesson({ ...lesson, quiz: e.target.value })} placeholder={'Q: Question?\n- Right answer *\n- Wrong answer'} className={`${field} font-mono`} /></div>
                    <div className="flex gap-4"><button onClick={saveLesson} className="bg-ink-900 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:bg-accent-600">Save lesson</button><button onClick={() => setLesson(null)} className="text-xs uppercase tracking-[0.08em] text-ink-500">Cancel</button></div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
