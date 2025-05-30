"use client";

import { useEffect, useState } from "react";

interface Log {
  serviceId: string;
  detail: string;
  datesTemp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<
    "dateAsc" | "dateDesc" | "alphaAsc" | "alphaDesc"
  >("dateAsc");

  useEffect(() => {
    async function fetchLogs() {
      const response = await fetch("/api/logs");
      const data = await response.json();
      setLogs(data);
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs
    .filter(
      (log) =>
        log.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.serviceId.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOption === "dateAsc") {
        return (
          new Date(a.datesTemp).getTime() - new Date(b.datesTemp).getTime()
        );
      } else if (sortOption === "dateDesc") {
        return (
          new Date(b.datesTemp).getTime() - new Date(a.datesTemp).getTime()
        );
      } else if (sortOption === "alphaAsc") {
        return a.detail.localeCompare(b.detail);
      } else if (sortOption === "alphaDesc") {
        return b.detail.localeCompare(a.detail);
      }
      return 0;
    });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Loglar</h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Arama yap..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full sm:w-1/2 text-black"
        />

        <select
          value={sortOption}
          onChange={(e) =>
            setSortOption(
              e.target.value as
                | "dateAsc"
                | "dateDesc"
                | "alphaAsc"
                | "alphaDesc",
            )
          }
          className="p-2 border rounded w-full sm:w-1/4 text-black"
        >
          <option value="dateAsc">Tarih (Eskiden Yeniye)</option>
          <option value="dateDesc">Tarih (Yeniden Eskiye)</option>
          <option value="alphaAsc">Alfabetik (A-Z)</option>
          <option value="alphaDesc">Alfabetik (Z-A)</option>
        </select>
      </div>

      <ul>
        {filteredLogs.map((log, index) => (
          <li key={index} className="mb-4 p-4 border rounded">
            <p>
              <strong>Service ID:</strong> {log.serviceId}
            </p>
            <p>
              <strong>Detay:</strong> {log.detail}
            </p>
            <p>
              <strong>Tarih:</strong> {new Date(log.datesTemp).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
