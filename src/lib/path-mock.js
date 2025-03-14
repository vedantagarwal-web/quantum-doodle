// Mock implementation of the path module for browser environments
const pathMock = {
  basename: (path, ext) => {
    const parts = String(path).split('/');
    let filename = parts[parts.length - 1];
    if (ext && filename.endsWith(ext)) {
      filename = filename.slice(0, -ext.length);
    }
    return filename;
  },
  dirname: (path) => {
    const parts = String(path).split('/');
    parts.pop();
    return parts.join('/') || '.';
  },
  extname: (path) => {
    const parts = String(path).split('.');
    if (parts.length <= 1) {
      return '';
    }
    return '.' + parts[parts.length - 1];
  },
  join: (...paths) => {
    return paths.filter(Boolean).join('/');
  },
  resolve: (...paths) => {
    return paths.filter(Boolean).join('/');
  },
  normalize: (path) => {
    return String(path).replace(/\/+/g, '/');
  },
  isAbsolute: (path) => {
    return String(path).startsWith('/');
  },
  relative: (from, to) => {
    // Simple implementation, not handling all edge cases
    return to;
  },
  parse: (path) => {
    const parts = String(path).split('/');
    const filename = parts[parts.length - 1] || '';
    const extParts = filename.split('.');
    const ext = extParts.length > 1 ? '.' + extParts.pop() : '';
    const base = filename;
    const name = ext ? filename.slice(0, -ext.length) : filename;
    const dir = parts.slice(0, -1).join('/') || '.';
    const root = path.startsWith('/') ? '/' : '';
    
    return { root, dir, base, ext, name };
  },
  format: (pathObject) => {
    const { root = '', dir = '', base = '', ext = '', name = '' } = pathObject;
    const path = dir ? dir + '/' : '';
    const filename = base || (name + ext);
    return path + filename;
  },
  sep: '/',
  delimiter: ':',
};

// Make posix reference self
pathMock.posix = pathMock;
// Simplified win32 implementation (same as posix for simplicity)
pathMock.win32 = pathMock;

module.exports = pathMock; 