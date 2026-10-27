"use client";

import { useState } from "react";

export default function CsvUploader({ onSuccess }: { onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://orderdesk-backend-9gu2.onrender.com/products/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setStatusMsg(data.message);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-lg">
      <h3 className="text-lg font-bold text-slate-900 mb-2">Bulk Upload Catalog (CSV)</h3>
      <p className="text-xs text-slate-500 mb-4">
        Header required: <code className="bg-slate-100 px-1 py-0.5 rounded">sku, title, wholesale_price, stock_quantity, weight_kg</code>
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={!