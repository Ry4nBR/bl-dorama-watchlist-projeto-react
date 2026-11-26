import { useState } from "react";

export function CardDorama({ dorama, aoAlternarStatus }) {
  const [erroPoster, setErroPoster] = useState(false);

  return (
    <article className={`card ${dorama.assistido ? "card-assistido" : ""}`}>
      {/* Exibe uma alternativa quando o p?ster n?o existe ou falha ao carregar. */}
      {dorama.poster && !erroPoster ? (
        <img className="card-poster" src={dorama.poster} alt={`P?ster de ${dorama.titulo}`} loading="lazy" onError={() => setErroPoster(true)} />
      ) : (
        <div className="card-poster card-poster-ausente" role="img" aria-label="P?ster indispon?vel">P?ster indispon?vel</div>
      )}
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