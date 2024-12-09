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
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Dosya indirme hatası:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-azure-radiance-500">
        Dosya Listesi
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file: { filename: string }) => (
          <div
            key={file.filename}
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
          >
            <span className="text-gray-800">{file.filename}</span>
            <button
              onClick={() => handleDownload(file.filename)}
              className="bg-azure-radiance-500 text-white px-4 py-2 rounded-md hover:bg-azure-radiance-600 transition"
            >
              İndir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
