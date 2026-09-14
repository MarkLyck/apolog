import { scriptureNotes } from "../lib/scripture-notes";
import { fullChapterLinks, scriptureEdition } from "../lib/scripture-reference";

export function QuoteContext({
  reference,
  edition,
}: {
  reference: string;
  edition: string;
}) {
  const translation = scriptureEdition(edition);
  const chapters = fullChapterLinks(reference, edition);
  const notes = scriptureNotes(reference, edition);
  return (
    <figcaption className="mt-4 space-y-3 border-t border-[var(--line)] pt-4 font-sans text-sm leading-6">
      <div>
        <div className="font-semibold">{reference}</div>
        <div className="text-[var(--muted)]">
          Translation / edition: {translation.label}
        </div>
      </div>
      {chapters.length > 0 ? (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="text-[var(--muted)]">
            Read the full {chapters.length === 1 ? "chapter" : "chapters"}:
          </span>
          {chapters.map((chapter) => (
            <a
              className="underline underline-offset-4"
              href={chapter.href}
              key={chapter.href}
              rel="noreferrer"
            >
              {chapter.label}
            </a>
          ))}
        </div>
      ) : (
        <p className="m-0 text-[var(--muted)]">
          No verified chapter link available.
        </p>
      )}
      {translation.note && (
        <p className="m-0 text-[var(--muted)]">{translation.note}</p>
      )}
      {notes.map((note) => (
        <details
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
          key={note.text}
        >
          <summary className="cursor-pointer font-semibold text-[var(--accent-strong)]">
            {note.kind === "wording"
              ? "Wording affects the comparison"
              : "Context affects the comparison"}
          </summary>
          <p className="mb-0 mt-3">{note.text}</p>
          <ul className="mb-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
            {note.sources.map((source) => (
              <li key={source.href}>
                <a
                  className="underline underline-offset-4"
                  href={source.href}
                  rel="noreferrer"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </figcaption>
  );
}
