import "@testing-library/jest-dom";

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ files: [] }),
  }),
);
