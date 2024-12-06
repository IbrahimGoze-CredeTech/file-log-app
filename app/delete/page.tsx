"use client"
import { useState, useEffect } from "react";

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState<string | null>(null);

  // Dosyaları listelemek
  useEffect(() => {
    fetch("/api/files") // Dosyaları al
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch((err) => setError("Dosyalar alınamadı."));
  }, []);

  // Silme işlemi
  const handleDelete = async (filename: string) => {
    try {
      const response = await fetch(`/api/delete?filename=${filename}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles(files.filter((file: any) => file.filename !== filename));
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

  return (
    <div>
      {error && <p>{error}</p>}
      <ul>
        {files.map((file: any) => (
          <li key={file._id}>
            {file.filename}{" "}
            <button onClick={() => handleDelete(file.filename)}>Sil</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
