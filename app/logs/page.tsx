"use client";

import { useEffect, useState } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      const response = await fetch("/api/logs");
      const data = await response.json();
      setLogs(data);
    }
    fetchLogs();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Loglar</h1>
      <ul>
        {logs.map((log: any, index) => (
          <li key={index} className="mb-4 p-4 border rounded">
            <p>
              <strong>İşlem:</strong>{" "}
              {log.serviceId === "delete" ? "Silme" : "Yükleme"}
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
