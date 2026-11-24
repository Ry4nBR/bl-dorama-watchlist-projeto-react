import { useState } from "react";
import { doramasIniciais } from "./data/doramasData";
import { Cabecalho } from "./components/Cabecalho";
import { BarraFiltros } from "./components/BarraFiltros";
import { ListaDoramas } from "./components/ListaDoramas";
import { Rodape } from "./components/Rodape";
import "./App.css";

export function App() {
  const [doramas, setDoramas] = useState(doramasIniciais);
  const [busca, setBusca] = useState("");
  const [generoSelecionado, setGeneroSelecionado] = useState("Todos");
  const [apenasNaoAssistidos, setApenasNaoAssistidos] = useState(false);

  // Atualiza um item específico; o Virtual DOM reconcilia apenas o card alterado
  function alternarStatusAssistido(id) {
    const listaAtualizada = doramas.map((item) =>
      item.id === id ? { ...item, assistido: !item.assistido } : item
    );
    setDoramas(listaAtualizada);
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

        <ListaDoramas
          doramas={doramasFiltrados}
          aoAlternarStatus={alternarStatusAssistido}
        />
      </main>

      <Rodape />
    </div>
  );
}

export default App;