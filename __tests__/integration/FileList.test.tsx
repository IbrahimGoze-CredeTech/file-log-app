import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import FileList from "@/app/download/page";

// Integration Test örneği
describe("FileList Integration", () => {
  it("should fetch and display files", async () => {
    // Mock API response
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

  it("should filter files when searching", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          files: [{ filename: "test1.pdf" }, { filename: "test2.pdf" }],
        }),
    });

    await act(async () => {
      render(<FileList />);
    });

    await waitFor(() => {
      expect(screen.getByText("test1.pdf")).toBeInTheDocument();
    });

    await act(async () => {
      const searchInput = screen.getByPlaceholderText("Dosya ara...");
      fireEvent.change(searchInput, { target: { value: "test1" } });
    });

    expect(screen.getByText("test1.pdf")).toBeInTheDocument();
    expect(screen.queryByText("test2.pdf")).not.toBeInTheDocument();
  });
});
