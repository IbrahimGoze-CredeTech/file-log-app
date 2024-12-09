"use client";

import { useEffect, useState } from "react";

const FileList = () => {
  const [files, setFiles] = useState<{ filename: string }[]>([]);

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

  if (files.length === 0) {
    return <p>Yükleniyor...</p>; // Dosya listesi yüklenene kadar bir mesaj göster
  }

  return (
    <div>
      <h1>Dosya Listesi</h1>
      <ul>
        {files.map((file) => (
          <li key={file.filename}>
            {file.filename}
            <button onClick={() => handleDownload(file.filename)}>İndir</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
