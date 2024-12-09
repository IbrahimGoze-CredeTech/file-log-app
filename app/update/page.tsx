"use client";

import { useState, useEffect } from "react";

export default function FileUpdateForm() {
  const [files, setFiles] = useState<{ filename: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch("/api/update");
      const data = await response.json();
      setFiles(data.files);
    };

    fetchFiles();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setNewFile(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(event.target.value);
  };

  const handleUpdate = async () => {
    if (!selectedFile || !newFile) {
      setMessage("Lütfen bir dosya seçin ve yeni dosyayı yükleyin.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", newFile);

      const response = await fetch(`/api/update?filename=${selectedFile}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Dosya başarıyla güncellendi.");
      } else {
        setMessage(`Güncelleme hatası: ${data.message}`);
      }
    } catch (error) {
      setMessage(`Hata oluştu: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-azure-radiance-500">
        Dosya Güncelleme
      </h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.includes("başarıyla")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="files"
          className="block text-white-700 font-medium mb-2"
        >
          Mevcut Dosyayı Seçin
        </label>
        <select
          id="filename"
          onChange={handleFileSelect}
          className="block w-full border text-black border-gray-300 rounded-md p-2 focus:ring-azure-radiance-500 focus:border-azure-radiance-500"
        >
          <option value="">Dosya Seçin</option>
          {files.map((file) => (
            <option
              className="text-black"
              key={file.filename}
              value={file.filename}
            >
              {file.filename}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="newFile"
          className="block text-white-700 font-medium mb-2"
        >
          Yeni Dosyayı Seçin
        </label>
        <input
          type="file"
          id="newFile"
          onChange={handleFileChange}
          className="block w-full border border-gray-300 rounded-md p-2 focus:ring-azure-radiance-500 focus:border-azure-radiance-500"
        />
      </div>

      <button
        onClick={handleUpdate}
        className="w-full bg-azure-radiance-500 text-white py-2 px-4 rounded-md hover:bg-azure-radiance-600 transition"
      >
        Dosyayı Güncelle
      </button>
    </div>
  );
}
