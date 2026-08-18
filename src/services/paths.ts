/** Parent comic folder from a `.../pages/` directory URI. */
export function comicRootFromPagesDir(pagesDir: string): string {
  return pagesDir.replace(/pages\/?$/, '');
}
