# Redesign, studio style

This replaces redesign-complete.zip and every earlier redesign/fix zip. Copy everything in this
folder over your project (same paths), then:

    npm install
    (delete the .next folder)
    npm run dev

npm install adds two packages: `geist` (body font)
and `@phosphor-icons/react` (icons). The headline font (Anton) is a file in app/fonts, no install needed. No database changes are needed.

## Delete these two files by hand (a zip cannot delete)

- app/components/CustomCursor.tsx
- app/components/SplashScreen.tsx

## The style (from your reference video)

- Warm paper background, near-black ink, condensed uppercase headlines (Anton), small uppercase labels.
- Hairline rails framing every page; the navbar is a row of boxed cells with a black Contact cell.
- All colours and type live in app/globals.css. Your crimson is kept as a rare accent;
  change it there AND in site.config.ts -> brand.accent.

## The motion

- Headlines sharpen in from blurred, left to right, as they scroll into view (app/globals.css,
  app/components/ScrollAnimator.tsx).
- Everything else eases up into place; pages and loaded content animate in.
- A giant scrolling banner of your tools under the hero.
- A "View" / "Read" / "Open" circle follows the cursor over cards (app/components/CursorBadge.tsx).
  Add data-cursor="View" to any link to use it.
- All motion switches off for visitors who prefer reduced motion. Nothing is hidden without JavaScript.

## Added from the second reference video

- Headlines now reveal letter by letter, line by line (app/components/ui/SplitText.tsx).
- A blur lens follows the cursor over the hero headline (app/components/BlurLens.tsx).
- A numbers section that counts up, using real counts from the site (app/components/HomeStats.tsx,
  app/components/ui/CountUp.tsx). Project case-study stats count up too.
- Featured work: heading and filters pinned on the left, project images stacking on the right.
- Testimonials: bordered cards that stack as you scroll.
- Client logos scroll continuously.
- Small notes beside section headings, e.g. "(Selected pieces)".
- Your name, huge, across the footer (sized to fit any name).
