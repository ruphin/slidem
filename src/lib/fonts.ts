/** Resolves once the document's fonts have loaded, or at once where the Font Loading API is missing. */
export function fontsReady(): Promise<unknown> {
  return (
    (document as { fonts?: FontFaceSet }).fonts?.ready ?? Promise.resolve()
  );
}
