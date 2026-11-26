import { useEffect, useRef, useState } from "react";
import { buscarDoramas, buscarDoramasSalvos, pesquisarDoramas } from "./services/tmdbApi";
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
  const [erroTitulosSalvos, setErroTitulosSalvos] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(false);
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [paginaBusca, setPaginaBusca] = useState(1);
  const [temMaisBusca, setTemMaisBusca] = useState(false);
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [erroBusca, setErroBusca] = useState("");
  const [carregandoMais, setCarregandoMais] = useState(false);
  const buscaAtual = useRef("");
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
        const idsCarregados = new Set(resultado.doramas.map((item) => String(item.id)));
        const idsSalvos = Object.entries(armazenamentoInicial.preferencias)
          .filter(([id, item]) => item.naLista && !idsCarregados.has(id))
          .map(([id]) => id);
        const adicionais = await buscarDoramasSalvos(idsSalvos, controlador.signal);
        if (!controlador.signal.aborted) {
          setDoramas([...resultado.doramas, ...adicionais.doramas]);
          setTemMais(resultado.temMais);
          setErroTitulosSalvos(adicionais.houveFalha);
        }
      } catch (falha) {
        if (!controlador.signal.aborted) setErro(falha.message || "Não foi possível carregar os títulos.");
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarDoramas();
    return () => controlador.abort();
  }, [armazenamentoInicial]);

  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const buscaPorPais = termo.length > 0 && ["coreia do sul", "tailândia", "japão", "taiwan"].some((pais) => pais.includes(termo));
  const buscaRemota = termo.length > 0 && !buscaPorPais;

  useEffect(() => {
    buscaAtual.current = buscaRemota ? termo : "";
    setResultadosBusca([]);
    setPaginaBusca(1);
    setTemMaisBusca(false);
    setErroBusca("");
    if (!buscaRemota) { setCarregandoBusca(false); return; }
    const controlador = new AbortController();
    setCarregandoBusca(true);
    const espera = setTimeout(async () => {
      try {
        const resultado = await pesquisarDoramas(termo, 1, controlador.signal);
        if (!controlador.signal.aborted) {
          setResultadosBusca(resultado.doramas);
          setTemMaisBusca(resultado.temMais);
        }
      } catch (falha) {
        if (!controlador.signal.aborted) setErroBusca(falha.message || "Não foi possível pesquisar títulos.");
      } finally {
        if (!controlador.signal.aborted) setCarregandoBusca(false);
      }
    }, 400);
    return () => { clearTimeout(espera); controlador.abort(); };
  }, [termo, buscaRemota]);

  async function carregarMais() {
    if (carregandoMais) return;
    setCarregandoMais(true);
    setErroBusca("");
    const termoSolicitado = buscaRemota ? termo : "";
    try {
      const proximaPagina = (buscaRemota ? paginaBusca : pagina) + 1;
      const resultado = buscaRemota
        ? await pesquisarDoramas(termoSolicitado, proximaPagina)
        : await buscarDoramas(undefined, proximaPagina);
      if (buscaAtual.current !== termoSolicitado) return;
      const combinar = (anteriores) => {
        const itens = new Map(anteriores.map((item) => [item.id, item]));
        for (const item of resultado.doramas) {
          const anterior = itens.get(item.id);
          itens.set(item.id, anterior?.genero === "BL" ? { ...item, genero: "BL" } : item);
        }
        return Array.from(itens.values());
      };
      if (buscaRemota) {
        setResultadosBusca(combinar);
        setPaginaBusca(proximaPagina);
        setTemMaisBusca(resultado.temMais);
      } else {
        setDoramas(combinar);
        setPagina(proximaPagina);
        setTemMais(resultado.temMais);
      }
    } catch (falha) {
      if (buscaAtual.current === termoSolicitado) setErroBusca(falha.message || "Não foi possível carregar mais títulos.");
    } finally {
      setCarregandoMais(false);
    }
  }

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

  const catalogoExibido = buscaRemota
    ? Array.from(new Map([...doramas.filter((item) => item.titulo.toLowerCase().includes(termo)), ...resultadosBusca].map((item) => [item.id, item])).values())
    : doramas;
  const doramasComPreferencias = catalogoExibido.map((item) => ({ ...item, ...preferencias[item.id] }));

  // Filtragem encadeada antes de renderizar
  const doramasFiltrados = doramasComPreferencias.filter((item) => {
    const bateBusca = buscaRemota ||
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.pais.toLowerCase().includes(busca.toLowerCase());
    const bateGenero =
      generoSelecionado === "Todos" || item.genero === generoSelecionado;
    const bateStatus = !apenasNaoAssistidos || (item.naLista && !item.assistido);

    return bateBusca && bateGenero && bateStatus && (!apenasMinhaLista || item.naLista);
  });

  const totalNaLista = Object.values(preferencias).filter((item) => item.naLista).length;
  const totalAssistidos = Object.values(preferencias).filter((item) => item.naLista && item.assistido).length;

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
        {erroTitulosSalvos && (
          <p className="aviso-armazenamento" role="alert">
            Alguns títulos salvos não puderam ser carregados do TMDB. Suas preferências continuam no navegador.
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

        {carregando || carregandoBusca ? (
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
        {erroBusca && <p className="aviso-armazenamento" role="alert">{erroBusca}</p>}
        {!carregando && !carregandoBusca && !erro && !apenasMinhaLista && !apenasNaoAssistidos && (buscaRemota ? temMaisBusca : temMais) && (
          <button type="button" className="btn-carregar-mais" onClick={carregarMais} disabled={carregandoMais}>
            {carregandoMais ? "Carregando..." : "Carregar mais títulos"}
          </button>
        )}
      </main>

      <Rodape />
    </div>
  );
}

export default App;
