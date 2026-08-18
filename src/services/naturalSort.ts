const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i;

export function isImageEntry(name: string): boolean {
  if (name.endsWith('/')) return false;
  const base = name.split('/').pop() ?? name;
  if (base.startsWith('.')) return false;
  return IMAGE_EXT.test(base);
}

/** Natural sort so page_2 comes before page_10 */
export function naturalCompare(a: string, b: string): number {
  const ax: (string | number)[] = [];
  const bx: (string | number)[] = [];
  a.replace(/(\d+)|(\D+)/g, (_, num: string, str: string) => {
    ax.push(num ? Number(num) : str.toLowerCase());
    return '';
  });
  b.replace(/(\d+)|(\D+)/g, (_, num: string, str: string) => {
    bx.push(num ? Number(num) : str.toLowerCase());
    return '';
  });
  while (ax.length && bx.length) {
    const an = ax.shift()!;
    const bn = bx.shift()!;
    if (an !== bn) {
      if (typeof an === typeof bn) {
        return an < bn ? -1 : 1;
      }
      return typeof an === 'number' ? -1 : 1;
    }
  }
  return ax.length - bx.length;
}

export function titleFromFilename(name: string): string {
  const base = name.replace(/\.(cbz|cbr|zip)$/i, '');
  return base.replace(/[_-]+/g, ' ').trim() || 'Untitled Comic';
}

export function guessSeries(title: string): string | null {
  const match = title.match(/^(.*?)(?:\s+#?\d+.*)?$/);
  const series = match?.[1]?.trim();
  if (!series || series === title) return null;
  return series.length > 2 ? series : null;
}
