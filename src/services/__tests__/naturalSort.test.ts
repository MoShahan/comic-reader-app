import {
  guessSeries,
  isImageEntry,
  naturalCompare,
  titleFromFilename,
} from '@/services/naturalSort';

describe('isImageEntry', () => {
  it('accepts common image extensions', () => {
    expect(isImageEntry('page_01.jpg')).toBe(true);
    expect(isImageEntry('folder/PAGE.PNG')).toBe(true);
    expect(isImageEntry('x.webp')).toBe(true);
    expect(isImageEntry('x.gif')).toBe(true);
  });

  it('rejects directories, hidden files, and non-images', () => {
    expect(isImageEntry('pages/')).toBe(false);
    expect(isImageEntry('.DS_Store')).toBe(false);
    expect(isImageEntry('folder/.hidden.jpg')).toBe(false);
    expect(isImageEntry('readme.txt')).toBe(false);
    expect(isImageEntry('archive.cbz')).toBe(false);
  });
});

describe('naturalCompare', () => {
  it('orders page_2 before page_10', () => {
    const pages = ['page_10.jpg', 'page_2.jpg', 'page_1.jpg'];
    expect([...pages].sort(naturalCompare)).toEqual(['page_1.jpg', 'page_2.jpg', 'page_10.jpg']);
  });

  it('handles zero-padded and mixed names', () => {
    const pages = ['img_002.png', 'img_010.png', 'img_001.png'];
    expect([...pages].sort(naturalCompare)).toEqual(['img_001.png', 'img_002.png', 'img_010.png']);
  });
});

describe('titleFromFilename', () => {
  it('strips comic extensions and separators', () => {
    expect(titleFromFilename('Batman_Issue-12.cbz')).toBe('Batman Issue 12');
    expect(titleFromFilename('My Comic.CBR')).toBe('My Comic');
    expect(titleFromFilename('story.zip')).toBe('story');
  });

  it('falls back when name is empty after strip', () => {
    expect(titleFromFilename('.cbz')).toBe('Untitled Comic');
  });
});

describe('guessSeries', () => {
  it('extracts series from numbered titles', () => {
    expect(guessSeries('Batman #12')).toBe('Batman');
    expect(guessSeries('Spider-Man 03')).toBe('Spider-Man');
  });

  it('returns null when no series pattern fits', () => {
    expect(guessSeries('OneShot')).toBe(null);
    expect(guessSeries('AB')).toBe(null);
  });
});
