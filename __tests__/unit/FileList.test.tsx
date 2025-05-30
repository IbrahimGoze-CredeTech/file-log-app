import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import FileList from "@/app/download/page";

// Unit Test örneği
describe("FileList Component", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    jest.clearAllMocks();
    // Mock fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ files: [] }),
    });
  });

  it("should render loading state initially", async () => {
    // Mock fetch to delay response
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                json: () => Promise.resolve({ files: [] }),
              }),
            100,
          ),
        ),
    );

    render(<FileList />);

    // Immediately check for loading state
    expect(screen.getByText("Yükleniyor...")).toBeInTheDocument();
  });

  it("should handle search input correctly", async () => {
    await act(async () => {
      render(<FileList />);
    });

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Yükleniyor...")).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Dosya ara...");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "test" } });
    });

    expect(searchInput).toHaveValue("test");
  });

  it("should clear search when clear button is clicked", async () => {
    await act(async () => {
      render(<FileList />);
    });

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Yükleniyor...")).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Dosya ara...");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "test" } });
    });

    const clearButton = screen.getByText("✕");

    await act(async () => {
      fireEvent.click(clearButton);
    });

    expect(searchInput).toHaveValue("");
  });

  it("should display files after loading", async () => {
    // Mock fetch with some test files
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          files: [{ filename: "test1.pdf" }, { filename: "test2.pdf" }],
        }),
    });

    await act(async () => {
      render(<FileList />);
    });

    // Wait for files to load
    await waitFor(() => {
      expect(screen.getByText("test1.pdf")).toBeInTheDocument();
      expect(screen.getByText("test2.pdf")).toBeInTheDocument();
    });
  });

  it("should handle fetch error gracefully", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    await act(async () => {
      render(<FileList />);
    });

    // Wait for loading to complete and check for empty state
    await waitFor(() => {
      expect(screen.getByText("Hiç dosya bulunamadı.")).toBeInTheDocument();
    });

    // Restore console.error
    console.error = originalConsoleError;
  });
});
