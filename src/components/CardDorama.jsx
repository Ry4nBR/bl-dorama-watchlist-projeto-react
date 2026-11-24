export function CardDorama({ dorama, aoAlternarStatus }) {
  return (
    <article className={`card ${dorama.assistido ? "card-assistido" : ""}`}>
      <div className="card-topo">
        <span className="badge-genero">{dorama.genero}</span>
        <span className="nota">⭐ {dorama.nota.toFixed(1)}</span>
      </div>

      <h2>{dorama.titulo}</h2>
      <p className="meta-info">
        {dorama.pais} • {dorama.episodios} episódios
      </p>
      <p className="sinopse">{dorama.sinopse}</p>

      <div className="card-rodape">
        <button
          onClick={() => aoAlternarStatus(dorama.id)}
          className={dorama.assistido ? "btn-status assistido" : "btn-status pendente"}
        >
          {dorama.assistido ? "✓ Já assisti" : "+ Quero assistir"}
        </button>
      </div>
    </article>
  );
}