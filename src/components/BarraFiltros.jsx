export function BarraFiltros({
  busca,
  aoMudarBusca,
  generoSelecionado,
  aoMudarGenero,
  apenasNaoAssistidos,
  aoAlternarNaoAssistidos
}) {
  const generos = ["Todos", "BL", "Romance", "Fantasia"];

  return (
    <section className="filtros">
      <input
        type="text"
        placeholder="Buscar por título ou país..."
        value={busca}
        onChange={(e) => aoMudarBusca(e.target.value)}
        className="input-busca"
      />

      <div className="botoes-genero">
        {generos.map((genero) => (
          <button
            key={genero}
            className={generoSelecionado === genero ? "btn-filtro ativo" : "btn-filtro"}
            onClick={() => aoMudarGenero(genero)}
          >
            {genero}
          </button>
        ))}
      </div>

      <label className="checkbox-filtro">
        <input
          type="checkbox"
          checked={apenasNaoAssistidos}
          onChange={(e) => aoAlternarNaoAssistidos(e.target.checked)}
        />
        Mostrar apenas "Quero assistir"
      </label>
    </section>
  );
}