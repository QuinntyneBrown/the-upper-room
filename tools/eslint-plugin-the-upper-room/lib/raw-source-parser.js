function parseForESLint(code) {
  const lineCount = code.split(/\r\n|\r|\n/).length;
  return {
    ast: {
      type: 'Program',
      body: [],
      sourceType: 'module',
      range: [0, code.length],
      loc: {
        start: { line: 1, column: 0 },
        end: { line: lineCount, column: 0 },
      },
      tokens: [],
      comments: [],
    },
    visitorKeys: { Program: ['body'] },
    services: {},
  };
}

module.exports = { parseForESLint };
