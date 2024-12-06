"use client";

import { useState } from "react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<string[]>([]);

  const handleUpload = async () => {
    if (files.length === 0) return;

    const uploadMessages: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      uploadMessages.push(`${file.name}: ${data.message}`);
    }

    setMessages(uploadMessages);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const selectedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl text-center">
        <h1 className="text-3xl font-semibold mb-6 text-black">File Storage</h1>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 cursor-pointer hover:border-blue-500 transition"
        >
          <p className="text-gray-600 text-lg">
            Dosyaları buraya sürükleyip bırakın veya seçin.
          </p>
        </div>

        <input
          type="file"
          id="fileInput"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Dosya Seç
        </label>

        <button
          onClick={handleUpload}
          disabled={files.length === 0}
          className={`mt-6 px-6 py-3 text-white rounded-lg ${
            files.length > 0
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          } transition`}
        >
          Yükle
        </button>

        {files.length > 0 && (
          <div className="mt-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Yükleme Listesi:</h2>
            <ul className="list-disc list-inside text-gray-700">
              {files.map((file, index) => (
                <li key={index} className="text-lg">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.length > 0 && (
          <div className="mt-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Yükleme Durumları:</h2>
            <ul className="list-disc list-inside text-gray-700">
              {messages.map((message, index) => (
                <li key={index} className="text-lg">
                  {message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
