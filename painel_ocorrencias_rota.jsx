// paineldeocorrencias/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Ocorrencias from "./pages/Ocorrencias";
import Rotas from "./pages/Rotas";

export default function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4 space-x-4">
          <Link to="/" className="text-blue-600 underline">Ocorrências</Link>
          <Link to="/rotas" className="text-blue-600 underline">Rotas</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Ocorrencias />} />
          <Route path="/rotas" element={<Rotas />} />
        </Routes>
      </div>
    </Router>
  );
}

// paineldeocorrencias/src/pages/Ocorrencias.jsx
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Ocorrencias() {
  const [rotas, setRotas] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [rotaId, setRotaId] = useState("");
  const [tipo, setTipo] = useState("Ocorrência");
  const [status, setStatus] = useState("Pendente");
  const [ocorrencias, setOcorrencias] = useState([]);
  const [filtro, setFiltro] = useState("");

  const registrarOcorrencia = async () => {
    if (!rotaId || !descricao) return alert("Preencha todos os campos.");

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      await supabase.from("ocorrencias").insert({
        rota_id: rotaId,
        descricao,
        tipo,
        status,
        latitude,
        longitude,
        data_hora: new Date().toISOString(),
      });

      setDescricao("");
      carregarOcorrencias();
    });
  };

  const carregarRotas = async () => {
    const { data } = await supabase.from("rotas").select();
    setRotas(data);
  };

  const carregarOcorrencias = async () => {
    const { data } = await supabase
      .from("ocorrencias")
      .select()
      .order("data_hora", { ascending: false });
    setOcorrencias(data);
  };

  useEffect(() => {
    carregarRotas();
    carregarOcorrencias();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registro de Ocorrência</h1>
      <div className="grid gap-4 mb-6">
        <select
          value={rotaId}
          onChange={(e) => setRotaId(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Selecione a rota</option>
          {rotas.map((r) => (
            <option key={r.id} value={r.id}>{r.nome}</option>
          ))}
        </select>
        <textarea
          className="p-2 border rounded"
          placeholder="Descrição da ocorrência"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="p-2 border rounded"
        >
          <option>Ocorrência</option>
          <option>Infração</option>
        </select>
        <button
          onClick={registrarOcorrencia}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Registrar
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Todas as Ocorrências</h2>

      <input
        type="text"
        placeholder="Pesquisar por rota ou status..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value.toLowerCase())}
        className="p-2 border rounded mb-4 w-full"
      />

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Data</th>
            <th className="p-2 border">Rota</th>
            <th className="p-2 border">Descrição</th>
            <th className="p-2 border">Tipo</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Localização</th>
          </tr>
        </thead>
        <tbody>
          {ocorrencias
            .filter((o) => {
              const rotaNome = rotas.find(r => r.id === o.rota_id)?.nome.toLowerCase() || "";
              return (
                rotaNome.includes(filtro) ||
                o.status.toLowerCase().includes(filtro)
              );
            })
            .map((o) => (
              <tr key={o.id}>
                <td className="p-2 border">{new Date(o.data_hora).toLocaleString()}</td>
                <td className="p-2 border">{rotas.find(r => r.id === o.rota_id)?.nome}</td>
                <td className="p-2 border">{o.descricao}</td>
                <td className="p-2 border">{o.tipo}</td>
                <td className="p-2 border">{o.status}</td>
                <td className="p-2 border">
                  <a
                    href={`https://www.google.com/maps?q=${o.latitude},${o.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Ver mapa
                  </a>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// paineldeocorrencias/src/pages/Rotas.jsx
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Rotas() {
  const [nome, setNome] = useState("");
  const [rotas, setRotas] = useState([]);

  const cadastrarRota = async () => {
    if (!nome) return;
    await supabase.from("rotas").insert({ nome });
    setNome("");
    carregarRotas();
  };

  const carregarRotas = async () => {
    const { data } = await supabase.from("rotas").select();
    setRotas(data);
  };

  useEffect(() => {
    carregarRotas();
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Rotas</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome da rota"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <button
          onClick={cadastrarRota}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Cadastrar
        </button>
      </div>

      <ul className="list-disc pl-4">
        {rotas.map((r) => (
          <li key={r.id}>{r.nome}</li>
        ))}
      </ul>
    </div>
  );
}
