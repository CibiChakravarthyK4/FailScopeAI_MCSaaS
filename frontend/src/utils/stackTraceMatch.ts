/** Best-effort match from an AI citation to the stack-trace line it most
 * likely refers to - citations are the model's prose, not always a verbatim
 * quote, so this is a substring heuristic, not an exact lookup. Returns null
 * (no highlight) rather than guessing wrong when nothing lines up. */
export function findMatchingLine(citation: string, lines: string[]): number | null {
  const needle = citation.trim().toLowerCase();
  if (!needle) return null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    if (!line) continue;
    if (needle.includes(line) || line.includes(needle)) return i;
  }
  return null;
}
