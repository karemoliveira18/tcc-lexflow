import { useEffect, useState } from "react";

// Componente simples que demonstra conexão direta com a API usando fetch()
// Mostra a lista de processos em JSON. Útil para validação rápida sem autenticação.
export default function ProcessosFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/processos`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Carregando (fetch)...</div>;
  if (error) return <div>Erro (fetch): {error}</div>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium">Processos (via fetch)</h2>
      <pre className="max-h-80 overflow-auto bg-slate-50 p-4 mt-2 text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
