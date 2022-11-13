module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",

  coveragePathIgnorePatterns: ["\\\\node_modules\\\\", "test"],

  coverageProvider: "v8",
};
