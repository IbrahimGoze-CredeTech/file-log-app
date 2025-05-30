"use client";
import { useEffect, useState } from "react";

const FileList = () => {
  const [files, setFiles] = useState<{ filename: string }[] | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 24;
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/update");
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Dosyalar yüklenirken hata oluştu:", error);
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Arama yapıldığında sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDownload = (filename: string) => {
    const downloadLink = `/api/download?filename=${encodeURIComponent(
      filename,
    )}`;
    window.location.href = downloadLink;
  };

  const handlePreview = (filename: string) => {
    const previewLink = `/api/download?filename=${encodeURIComponent(
      filename,
    )}&preview=true`;
    window.open(previewLink, "_blank");
  };

  // Eğer dosyalar henüz yüklenmemişse, yükleniyor mesajını göster
  if (files === undefined) {
    return <p>Yükleniyor...</p>;
  }

  // Arama filtrelemesi
  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sayfalandırma hesaplamaları
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Dosya Listesi</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Dosya ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredFiles.length === 0 ? (
          <p>Hiç dosya bulunamadı.</p>
        ) : (
          currentFiles.map((file, index) => (
            <div
              key={`${file.filename}-${index}`}
              className="bg-white text-black shadow-md rounded-lg p-4 flex justify-between items-center"
            >
              <span>{file.filename}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(file.filename)}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  İndir
                </button>
                <button
                  onClick={() => handlePreview(file.filename)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Önizle
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sayfalandırma kontrolleri */}
      {filteredFiles.length > 0 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
          >
            Önceki
          </button>

          <div className="flex items-center px-4">
            Sayfa {currentPage} / {totalPages}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
};

export default FileList;
