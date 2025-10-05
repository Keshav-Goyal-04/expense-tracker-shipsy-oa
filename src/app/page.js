'use client';

import { useState } from 'react';

export default function Home() {
  const [version, setVersion] = useState(null);
  const [error, setError] = useState(null);

  const getDbVersion = async () => {
    try {
      const response = await fetch('/api/db-version');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setVersion(null);
      } else {
        setVersion(data.version);
        setError(null);
      }
    } catch (error) {
      setError(error.message);
      setVersion(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Expense Tracker</h1>
      <button
        onClick={getDbVersion}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Connect to Database
      </button>
      {version && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Database Version:</h2>
          <p className="mt-2">{version}</p>
        </div>
      )}
      {error && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-red-500">Error:</h2>
          <p className="mt-2 text-red-500">{error}</p>
        </div>
      )}
    </main>
  );
}