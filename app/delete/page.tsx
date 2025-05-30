"use client";

import { useState, useEffect } from "react";

interface File {
  _id: string;
  filename: string;
}

export default function FileList() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch files
  useEffect(() => {
    setLoading(true);
    fetch("/api/files")
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch(() => setError("Dosyalar alınamadı."))
      .finally(() => setLoading(false));
  }, []);

  // Delete a single file
  const handleDelete = async (filename: string) => {
    if (!confirm(`${filename} dosyasını silmek istediğinizden emin misiniz?`))
      return;

    try {
      const response = await fetch(`/api/delete?filename=${filename}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles(files.filter((file) => file.filename !== filename));
        alert("Dosya başarıyla silindi.");
      } else {
        const data = await response.json();
        alert(data.message || "Bir hata oluştu.");
      }
    } catch (error) {
      console.error("Dosya silinirken hata:", error);
      alert("Silme işlemi sırasında bir hata oluştu.");
    }
  };

  // Delete all files
  const handleDeleteAll = async () => {
    if (!confirm("Tüm dosyaları silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch("/api/delete-all", {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles([]);
        alert("Tüm dosyalar başarıyla silindi.");
      } else {
        const data = await response.json();
        alert(data.message || "Bir hata oluştu.");
      }
    } catch (error) {
      console.error("Tüm dosyalar silinirken hata:", error);
      alert("Silme işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          Dosya Listesi
        </h1>
        {loading && <p className="text-blue-500">Dosyalar yükleniyor...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {files.length > 0 ? (
          <>
            <button
              onClick={handleDeleteAll}
              className="mb-4 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              Tüm Dosyaları Sil
            </button>
            <ul className="space-y-3">
              {files.map((file) => (
                <li
                  key={file._id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-gray-700 font-medium">
                    {file.filename}
                  </span>
                  <button
                    onClick={() => handleDelete(file.filename)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sil
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          !loading && <p className="text-gray-500">Henüz dosya eklenmemiş.</p>
        )}
      </div>
    </div>
  );
}
