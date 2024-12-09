"use client";

import { useState, useEffect } from "react";

const FileList = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch("/api/download");
      const data = await response.json();
      setFiles(data.files);
    };

    fetchFiles();
  }, []);

  const handleDownload = async (filename: string) => {
    try {
      const response = await fetch(`/api/download?filename=${filename}`);
      if (!response.ok) {
        throw new Error("Dosya indirilemedi.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // Dosya adıyla indirilmesi sağlanır
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Dosya indirme hatası:", error);
    }
  };

  return (
    <div>
      <h1>Dosya Listesi</h1>
      <ul>
        {files.map((file: { filename: string }) => (
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
