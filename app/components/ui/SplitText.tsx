/*
 * Splits a headline into letters so it can reveal letter by letter, line by line (each letter
 * goes from faint and blurred to solid). Screen readers get the plain text once; the letters are
 * hidden from them. Words never break in the middle. The animation itself is CSS (globals.css)
 * and starts when ScrollAnimator marks the headline as arrived.
 */
export default function SplitText({ text }: { text: string }) {
  let i = 0
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w}>
            <span className="split-w">
              {Array.from(word).map((ch, c) => (
                <span key={c} className="ch" style={{ ['--ci' as string]: i++ }}>
                  {ch}
                </span>
              ))}
            </span>
            {w < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </>
  )
}
