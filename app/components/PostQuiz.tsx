'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { useLocale } from '@/app/components/LocaleProvider'
import { parseQuiz } from '@/lib/quiz'

// "Test yourself" quiz at the end of a blog post (written in the post editor).
export default function PostQuiz({ text }: { text: string | null | undefined }) {
  const { tx } = useLocale()
  const questions = parseQuiz(text)
  const [picked, setPicked] = useState<Record<number, number>>({})
  if (!questions.length) return null
  const answered = Object.keys(picked).length
  const correct = questions.filter((q, i) => picked[i] === q.answer).length

  return (
    <section aria-labelledby="quiz-heading" className="mx-auto mt-16 max-w-3xl border border-ink-100 bg-paper-raised p-6 md:p-10">
      <p className="type-meta">{tx('Quiz')}</p>
      <h2 id="quiz-heading" className="mt-2 text-2xl font-medium tracking-tight text-ink-900">{tx('Test yourself')}</h2>
      <ol className="mt-8 space-y-10">
        {questions.map((q, i) => {
          const choice = picked[i]
          const done = choice !== undefined
          return (
            <li key={i}>
              <p className="font-medium text-ink-900">{i + 1}. {q.question}</p>
              <div role="radiogroup" aria-label={q.question} className="mt-4 grid gap-2">
                {q.options.map((opt, k) => {
                  const isRight = k === q.answer, isPicked = k === choice
                  const style = !done ? 'border-ink-100 hover:border-ink-500' : isRight ? 'border-success bg-success/10' : isPicked ? 'border-error bg-error/10' : 'border-ink-100 opacity-60'
                  return (
                    <button key={k} type="button" role="radio" aria-checked={isPicked} disabled={done} onClick={() => setPicked({ ...picked, [i]: k })}
                      className={`flex items-center justify-between gap-3 border px-4 py-3 text-left text-[15px] text-ink-900 transition-colors ${style}`}>
                      <span>{opt}</span>
                      {done && isRight && <CheckCircle size={20} weight="fill" aria-label={tx('Correct')} className="shrink-0 text-success" />}
                      {done && isPicked && !isRight && <XCircle size={20} weight="fill" aria-label={tx('Not quite')} className="shrink-0 text-error" />}
                    </button>
                  )
                })}
              </div>
              {done && q.why && <p className="mt-3 text-sm text-ink-700" aria-live="polite">{q.why}</p>}
            </li>
          )
        })}
      </ol>
      {answered === questions.length && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-6" aria-live="polite">
          <p className="text-lg font-medium text-ink-900">{tx('You got {n} of {total} right.').replace('{n}', String(correct)).replace('{total}', String(questions.length))}</p>
          <button type="button" onClick={() => setPicked({})} className="text-sm font-medium text-ink-900 underline underline-offset-4 hover:text-accent-600">{tx('Try again')}</button>
        </div>
      )}
    </section>
  )
}
