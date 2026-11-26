import { useEffect, useRef, useState } from "react";
import { buscarDoramas } from "./services/tmdbApi";
import { carregarPreferencias, salvarPreferencias } from "./services/preferenciasStorage";
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
  const [armazenamentoInicial] = useState(carregarPreferencias);
  const [preferencias, setPreferencias] = useState(armazenamentoInicial.preferencias);
  const [erroArmazenamento, setErroArmazenamento] = useState(armazenamentoInicial.erro);
  const preferenciasSalvas = useRef(armazenamentoInicial.preferencias);

  // Não grava na montagem: uma falha de leitura não deve apagar dados existentes.
  useEffect(() => {
    if (preferencias === preferenciasSalvas.current) return;
    if (salvarPreferencias(preferencias)) {
      preferenciasSalvas.current = preferencias;
      setErroArmazenamento(false);
    } else {
      setErroArmazenamento(true);
    }
  }, [preferencias]);

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

  // Avaliações são liberadas após marcar o título como assistido.
  function salvarAvaliacao(id, avaliacao) {
    setPreferencias((atuais) => {
      const item = atuais[id];
      return item?.naLista && item.assistido ? { ...atuais, [id]: { ...item, avaliacao } } : atuais;
    });
  }

  function alternarAssistido(id) {
    setPreferencias((atuais) => {
      const item = atuais[id];
      return item?.naLista ? { ...atuais, [id]: { ...item, assistido: !item.assistido } } : atuais;
    });
  }

  function alternarMinhaLista(id) {
    setPreferencias((atuais) => {
      const item = atuais[id] || {};
      return { ...atuais, [id]: { ...item, naLista: !item.naLista } };
    });
  }

  function alternarFavorito(id) {
    setPreferencias((atuais) => {
      const item = atuais[id];
      return item?.naLista ? { ...atuais, [id]: { ...item, favorito: !item.favorito } } : atuais;
    });
  }

  const doramasComPreferencias = doramas.map((item) => ({ ...item, ...preferencias[item.id] }));

  // Filtragem encadeada antes de renderizar
  const doramasFiltrados = doramasComPreferencias.filter((item) => {
    const bateBusca =
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.pais.toLowerCase().includes(busca.toLowerCase());
    const bateGenero =
      generoSelecionado === "Todos" || item.genero === generoSelecionado;
    const bateStatus = !apenasNaoAssistidos || (item.naLista && !item.assistido);

    return bateBusca && bateGenero && bateStatus && (!apenasMinhaLista || item.naLista);
  });

  const totalNaLista = doramasComPreferencias.filter((item) => item.naLista).length;
  const totalAssistidos = doramasComPreferencias.filter((item) => item.naLista && item.assistido).length;

  return (
    <div className="container">
      <Cabecalho
        totalTitulos={totalNaLista}
        totalAssistidos={totalAssistidos}
      />

      <main>
        {erroArmazenamento && (
          <p className="aviso-armazenamento" role="alert">
            Não foi possível acessar os dados salvos no navegador. Suas alterações podem não ser mantidas após recarregar a página.
          </p>
        )}
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
            aoAlternarAssistido={alternarAssistido}
            aoAlternarFavorito={alternarFavorito}
          />
        )}
      </main>

      <Rodape />
    </div>
  );
}

export default App;
