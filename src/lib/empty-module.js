// Mock implementations for Node.js modules in the browser
const mockCharStreams = {
  fromString: (str) => ({
    toString: () => str,
    getText: () => str,
    getTextInterval: () => str,
    getTextLength: () => str.length,
    getSourceName: () => '',
    getIndex: () => 0,
    consume: () => {},
    LA: () => 0,
    mark: () => 0,
    release: () => {},
    seek: () => {},
    getTextFromInterval: () => '',
    getTextFromContext: () => '',
  }),
  fromBuffer: (buffer) => mockCharStreams.fromString(buffer.toString()),
  fromBlob: (blob) => mockCharStreams.fromString(''),
  fromStream: (stream) => mockCharStreams.fromString(''),
};

const mockFileStream = {
  ...mockCharStreams,
  fileName: '',
  getSourceName: () => '',
};

const mockInputStream = {
  ...mockCharStreams,
  getSourceName: () => '',
};

module.exports = {
  CharStreams: mockCharStreams,
  FileStream: mockFileStream,
  InputStream: mockInputStream,
}; 