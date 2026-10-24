'use client'
// Course progress lives in the visitor's browser (no account needed): completed lesson ids per course.
const key = (courseId: string) => `course-progress:${courseId}`
export function getDone(courseId: string): string[] { try { return JSON.parse(localStorage.getItem(key(courseId)) || '[]') } catch { return [] } }
export function markDone(courseId: string, lessonId: string) { const d = new Set(getDone(courseId)); d.add(lessonId); try { localStorage.setItem(key(courseId), JSON.stringify([...d])) } catch {} }
