// Mock implementation of the fs module for browser environments
module.exports = {
  readFileSync: () => '',
  readFile: (path, options, callback) => {
    if (typeof options === 'function') {
      options(null, '');
    } else if (typeof callback === 'function') {
      callback(null, '');
    }
    return Promise.resolve('');
  },
  existsSync: () => false,
  statSync: () => ({ size: 0 }),
  readdirSync: () => [],
  writeFileSync: () => {},
  writeFile: (path, data, options, callback) => {
    if (typeof options === 'function') {
      options(null);
    } else if (typeof callback === 'function') {
      callback(null);
    }
    return Promise.resolve();
  },
  mkdirSync: () => {},
  mkdir: (path, options, callback) => {
    if (typeof options === 'function') {
      options(null);
    } else if (typeof callback === 'function') {
      callback(null);
    }
    return Promise.resolve();
  },
  unlinkSync: () => {},
  unlink: (path, callback) => {
    if (typeof callback === 'function') {
      callback(null);
    }
    return Promise.resolve();
  },
  rmdirSync: () => {},
  rmdir: (path, callback) => {
    if (typeof callback === 'function') {
      callback(null);
    }
    return Promise.resolve();
  },
  renameSync: () => {},
  rename: (oldPath, newPath, callback) => {
    if (typeof callback === 'function') {
      callback(null);
    }
    return Promise.resolve();
  },
  chmodSync: () => {},
  chmod: (path, mode, callback) => {
    if (typeof callback === 'function') {
      callback(null);
    }
    return Promise.resolve();
  },
  lstatSync: () => ({ isSymbolicLink: () => false }),
  symlinkSync: () => {},
  symlink: (target, path, type, callback) => {
    if (typeof type === 'function') {
      type(null);
    } else if (typeof callback === 'function') {
      callback(null);
    }
    return Promise.resolve();
  },
  readlinkSync: () => '',
  readlink: (path, options, callback) => {
    if (typeof options === 'function') {
      options(null, '');
    } else if (typeof callback === 'function') {
      callback(null, '');
    }
    return Promise.resolve('');
  },
  realpathSync: () => '',
  realpath: (path, options, callback) => {
    if (typeof options === 'function') {
      options(null, '');
    } else if (typeof callback === 'function') {
      callback(null, '');
    }
    return Promise.resolve('');
  },
  // Add other fs methods as needed
  promises: {
    readFile: () => Promise.resolve(''),
    writeFile: () => Promise.resolve(),
    readdir: () => Promise.resolve([]),
    mkdir: () => Promise.resolve(),
    rmdir: () => Promise.resolve(),
    unlink: () => Promise.resolve(),
    rename: () => Promise.resolve(),
    chmod: () => Promise.resolve(),
    lstat: () => Promise.resolve({ isSymbolicLink: () => false }),
    symlink: () => Promise.resolve(),
    readlink: () => Promise.resolve(''),
    realpath: () => Promise.resolve(''),
  }
}; 