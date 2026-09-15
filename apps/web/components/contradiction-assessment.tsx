import { contradictionImportance, contradictionKinds } from "@apolog/shared";
import type { ContradictionAssessment } from "@apolog/shared";

export function ContradictionAssessmentLabels({
  assessment,
}: {
  assessment: ContradictionAssessment | undefined;
}) {
  if (assessment?.status !== "reviewed") {
    return (
      <span className="text-xs font-medium text-[var(--muted)]">
        {assessment?.status === "changed"
          ? "Assessment needs review"
          : "Awaiting assessment"}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
      <span className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5">
        {contradictionKinds[assessment.kind].label}
      </span>
      <span className="text-[var(--muted)]">
        Importance: {contradictionImportance[assessment.importance].label}
      </span>
    </div>
  );
}

export function ContradictionAssessmentPanel({
  assessment,
}: {
  assessment: ContradictionAssessment | undefined;
}) {
  if (assessment?.status !== "reviewed") {
    return (
      <section
        aria-label="Comparison assessment"
        className="mt-6 rounded-xl border border-[var(--line)] p-5"
      >
        <p className="m-0 text-sm font-semibold">
          {assessment?.status === "changed"
            ? "Assessment needs review"
            : "Awaiting assessment"}
        </p>
        <p className="mb-0 mt-2 text-sm text-[var(--muted)]">
          {assessment?.status === "changed"
            ? "This article has changed since its assessment. Its previous classification and importance are withheld until the updated argument is reviewed."
            : "This comparison has not yet been assessed for the inference it requires or its importance."}
        </p>
      </section>
    );
  }
  const classification = contradictionKinds[assessment.kind];
  const importance = contradictionImportance[assessment.importance];
  return (
    <section
      aria-label="Comparison assessment"
      className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <dl className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <dt className="text-xs font-medium text-[var(--muted)]">
            Textual conflict
          </dt>
          <dd className="m-0 mt-1 font-semibold">{classification.label}</dd>
          <dd className="m-0 mt-2 text-sm leading-6 text-[var(--muted)]">
            {classification.description}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[var(--muted)]">
            Importance
          </dt>
          <dd className="m-0 mt-1 font-semibold">{importance.label}</dd>
          <dd className="m-0 mt-2 text-sm leading-6 text-[var(--muted)]">
            {importance.description}
          </dd>
        </div>
      </dl>
      <p className="mb-0 mt-5 border-t border-[var(--line)] pt-4 text-sm leading-6">
        {assessment.reason}
      </p>
      <p className="mb-0 mt-3 text-xs leading-5 text-[var(--muted)]">
        An editorial assessment of the quoted passages. Importance describes the
        stakes; it does not increase certainty. Reading order weighs both.
      </p>
    </section>
  );
}

export function ContradictionAssessmentGuide() {
  return (
    <details className="my-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 text-sm">
      <summary className="cursor-pointer font-semibold">
        How to read the labels
      </summary>
      <p className="mt-4 leading-6 text-[var(--muted)]">
        Textual conflict describes how much inference an argument requires.
        Importance describes its stakes. A minor numerical disagreement can be
        direct; a foundational claim can still depend on interpretation.
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {Object.entries(contradictionKinds).map(([kind, value]) => (
          <div key={kind}>
            <dt className="font-semibold">{value.label}</dt>
            <dd className="m-0 mt-1 leading-6 text-[var(--muted)]">
              {value.description}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mb-0 mt-4 leading-6 text-[var(--muted)]">
        Reading order weighs conflict and importance together. It is not a
        certainty score. Unreviewed or changed articles carry no assessment
        until reviewed.
      </p>
    </details>
  );
}
