// Quiz format for blog posts (typed in the editor). Leave a blank line between questions:
//   Q: What does CNN stand for?
//   - Convolutional neural network *     <- a * at the end marks the right answer
//   - Central neural node
//   Why: Convolution layers scan the image for patterns.   <- optional explanation
export type QuizQuestion = { question: string; options: string[]; answer: number; why?: string }

export function parseQuiz(text: string | null | undefined): QuizQuestion[] {
  if (!text?.trim()) return []
  return text.trim().split(/\n\s*\n/).map((block) => {
    let question = '', why: string | undefined, answer = -1
    const options: string[] = []
    for (const raw of block.split('\n')) {
      const line = raw.trim()
      if (/^q\s*:/i.test(line)) question = line.replace(/^q\s*:\s*/i, '')
      else if (/^why\s*:/i.test(line)) why = line.replace(/^why\s*:\s*/i, '')
      else if (/^[-*]\s+/.test(line)) {
        let opt = line.replace(/^[-*]\s+/, '')
        if (/\s\*$/.test(opt)) { answer = options.length; opt = opt.replace(/\s\*$/, '') }
        options.push(opt)
      }
    }
    return { question, options, answer, why }
  }).filter((q) => q.question && q.options.length >= 2 && q.answer >= 0)
}
