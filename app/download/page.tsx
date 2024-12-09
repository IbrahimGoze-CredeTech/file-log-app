"use client";
import { useEffect, useState } from "react";

const FileList = () => {
  const [files, setFiles] = useState<{ filename: string }[] | undefined>(undefined);

  useEffect(() => {
    // Dosya listesini almak için API isteği
    const fetchFiles = async () => {
      const response = await fetch("/api/update");
      const data = await response.json();
      setFiles(data.files); // API'den gelen dosya listesini state'e kaydet
    };

    fetchFiles();
  }, []);

  const handleDownload = (filename: string) => {
    // İndirme işlemini başlatan fonksiyon
    const downloadLink = `/api/download?filename=${encodeURIComponent(filename)}`;
    window.location.href = downloadLink; // İndirmenin başlatılması
  };

  // Eğer dosyalar henüz yüklenmemişse, yükleniyor mesajını göster
  if (files === undefined) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div>
      <h1>Dosya Listesi</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.length === 0 ? (
          <p>Hiç dosya yok.</p>
        ) : (
          files.map((file) => (
            <div
              key={file.filename}
              className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
            >
              <span>{file.filename}</span>
              <button
                onClick={() => handleDownload(file.filename)}
                className="bg-blue-500 text-white p-2 rounded"
              >
                İndir
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileList;
