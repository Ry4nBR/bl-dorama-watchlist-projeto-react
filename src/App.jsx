import { useEffect, useState } from "react";
import { buscarDoramas } from "./services/tmdbApi";
import { Cabecalho } from "./components/Cabecalho";
import { BarraFiltros } from "./components/BarraFiltros";
import { ListaDoramas } from "./components/ListaDoramas";
import { Rodape } from "./components/Rodape";
import "./App.css";

export function App() {
  const [doramas, setDoramas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [generoSelecionado, setGeneroSelecionado] = useState("Todos");
  const [apenasNaoAssistidos, setApenasNaoAssistidos] = useState(false);

  // Cancela a requisi??o se o componente for desmontado.
  useEffect(() => {
    const controlador = new AbortController();

    async function carregarDoramas() {
      try {
        const resultado = await buscarDoramas(controlador.signal);
        if (!controlador.signal.aborted) setDoramas(resultado);
      } catch (falha) {
        if (!controlador.signal.aborted) setErro(falha.message || "N?o foi poss?vel carregar os t?tulos.");
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarDoramas();
    return () => controlador.abort();
  }, []);

  // Atualiza um item específico; o Virtual DOM reconcilia apenas o card alterado
  function alternarStatusAssistido(id) {
    setDoramas((lista) => lista.map((item) =>
      item.id === id ? { ...item, assistido: !item.assistido } : item
    ));
  }

  // Filtragem encadeada antes de renderizar
  const doramasFiltrados = doramas.filter((item) => {
    const bateBusca =
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.pais.toLowerCase().includes(busca.toLowerCase());
    const bateGenero =
      generoSelecionado === "Todos" || item.genero === generoSelecionado;
    const bateStatus = !apenasNaoAssistidos || !item.assistido;

    return bateBusca && bateGenero && bateStatus;
  });

  const totalAssistidos = doramas.filter((item) => item.assistido).length;

  return (
    <div className="container">
      <Cabecalho
        totalTitulos={doramas.length}
        totalAssistidos={totalAssistidos}
      />

      <main>
        <BarraFiltros
          busca={busca}
          aoMudarBusca={setBusca}
          generoSelecionado={generoSelecionado}
          aoMudarGenero={setGeneroSelecionado}
          apenasNaoAssistidos={apenasNaoAssistidos}
          aoAlternarNaoAssistidos={setApenasNaoAssistidos}
        />

        {carregando ? (
          <p className="lista-vazia" role="status">Carregando t?tulos...</p>
        ) : erro ? (
          <p className="lista-vazia" role="alert">{erro}</p>
        ) : (
          <ListaDoramas
            doramas={doramasFiltrados}
            aoAlternarStatus={alternarStatusAssistido}
          />
        )}
      </main>

      <Rodape />
    </div>
  );
}

export default App;