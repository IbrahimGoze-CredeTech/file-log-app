"use client";
import { useState, useEffect } from "react";

export default function FileUpdateForm() {
  const [files, setFiles] = useState<{ filename: string }[]>([]); // Dosya listesini tutuyor
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  // Dosya listesini almak için API isteği
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
      console.error("Lütfen bir dosya seçin ve yeni dosyayı yükleyin.");
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
        console.log("Dosya başarıyla güncellendi:", data.message);
      } else {
        console.error("Güncelleme hatası:", data.message);
      }
    } catch (error) {
      console.error("Hata oluştu:", error);
    }
  };

  return (
    <div>
      <h2>Dosya Güncelleme</h2>

      <div>
        <label htmlFor="files">Mevcut Dosyayı Seçin: </label>
        <select id="filename" onChange={handleFileSelect}>
          <option value="">Dosya Seçin</option>
          {files.map((file) => (
            <option key={file.filename} value={file.filename}>
              {file.filename}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="newFile">Yeni Dosyayı Seçin: </label>
        <input type="file" id="newFile" onChange={handleFileChange} />
      </div>

      <button onClick={handleUpdate}>Dosyayı Güncelle</button>
    </div>
  );
}
