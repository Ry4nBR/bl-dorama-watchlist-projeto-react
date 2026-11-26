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
  const [apenasMinhaLista, setApenasMinhaLista] = useState(false);

  // Cancela a requisição se o componente for desmontado.
  useEffect(() => {
    const controlador = new AbortController();

    async function carregarDoramas() {
      try {
        const resultado = await buscarDoramas(controlador.signal);
        if (!controlador.signal.aborted) setDoramas(resultado);
      } catch (falha) {
        if (!controlador.signal.aborted) setErro(falha.message || "Não foi possível carregar os títulos.");
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarDoramas();
    return () => controlador.abort();
  }, []);

  // Uma avaliação salva também marca o título como assistido.
  function salvarAvaliacao(id, avaliacao) {
    setDoramas((lista) => lista.map((item) =>
      item.id === id ? { ...item, assistido: true, avaliacao } : item
    ));
  }

  function alternarMinhaLista(id) {
    setDoramas((lista) => lista.map((item) =>
      item.id === id ? { ...item, naLista: !item.naLista } : item
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

    return bateBusca && bateGenero && bateStatus && (!apenasMinhaLista || item.naLista);
  });

  const totalNaLista = doramas.filter((item) => item.naLista).length;
  const totalAssistidos = doramas.filter((item) => item.naLista && item.assistido).length;

  return (
    <div className="container">
      <Cabecalho
        totalTitulos={totalNaLista}
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

        <label className="filtro-lista">
          <input type="checkbox" checked={apenasMinhaLista} onChange={(evento) => setApenasMinhaLista(evento.target.checked)} />
          Mostrar apenas minha lista ({totalNaLista})
        </label>

        {carregando ? (
          <p className="lista-vazia" role="status">Carregando títulos...</p>
        ) : erro ? (
          <p className="lista-vazia" role="alert">{erro}</p>
        ) : (
          <ListaDoramas
            doramas={doramasFiltrados}
            aoAvaliar={salvarAvaliacao}
            aoAlternarLista={alternarMinhaLista}
          />
        )}
      </main>

      <Rodape />
    </div>
  );
}

export default App;
