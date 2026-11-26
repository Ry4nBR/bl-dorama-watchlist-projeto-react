import { useState } from "react";

export function CardDorama({ dorama, aoAvaliar, aoAlternarLista }) {
  const [erroPoster, setErroPoster] = useState(false);
  const [avaliando, setAvaliando] = useState(false);
  const [estrelas, setEstrelas] = useState(dorama.avaliacao?.estrelas ?? 0);
  const [comentario, setComentario] = useState(dorama.avaliacao?.comentario ?? "");

  function salvar(evento) {
    evento.preventDefault();
    if (!estrelas) return;
    aoAvaliar(dorama.id, { estrelas, comentario: comentario.trim() });
    setAvaliando(false);
  }

  function cancelar() {
    setEstrelas(dorama.avaliacao?.estrelas ?? 0);
    setComentario(dorama.avaliacao?.comentario ?? "");
    setAvaliando(false);
  }

  return (
    <article className={`card ${dorama.assistido ? "card-assistido" : ""}`}>
      {/* Exibe uma alternativa quando o pôster não existe ou falha ao carregar. */}
      {dorama.poster && !erroPoster ? (
        <img className="card-poster" src={dorama.poster} alt={`Pôster de ${dorama.titulo}`} loading="lazy" onError={() => setErroPoster(true)} />
      ) : (
        <div className="card-poster card-poster-ausente" role="img" aria-label="Pôster indisponível">Pôster indisponível</div>
      )}
      <div className="card-topo">
        <span className="badge-genero">{dorama.genero}</span>
        <span className="nota">⭐ {dorama.nota.toFixed(1)}</span>
      </div>

      <h2>{dorama.titulo}</h2>
      <p className="meta-info">
        {dorama.pais} • {dorama.episodios != null ? `${dorama.episodios} episódios` : "Episódios não informados"}
      </p>
      <p className="sinopse">{dorama.sinopse}</p>

      {dorama.avaliacao && (
        <div className="avaliacao-salva">
          <p>Sua avaliação: {"★".repeat(dorama.avaliacao.estrelas)}{"☆".repeat(5 - dorama.avaliacao.estrelas)} ({dorama.avaliacao.estrelas}/5)</p>
          {dorama.avaliacao.comentario && <p>{dorama.avaliacao.comentario}</p>}
        </div>
      )}

      <div className="card-rodape">
        <button type="button" className="btn-status pendente" onClick={() => aoAlternarLista(dorama.id)} aria-pressed={Boolean(dorama.naLista)}>
          {dorama.naLista ? "✓ Na minha lista (remover)" : "+ Adicionar à lista"}
        </button>
        {!avaliando && <button type="button" onClick={() => setAvaliando(true)} className="btn-status assistido">
          {dorama.avaliacao ? "Editar avaliação" : "Avaliar"}
        </button>}
        {avaliando && (
          <form className="form-avaliacao" onSubmit={salvar}>
            <fieldset>
              <legend>Sua nota (1 a 5 estrelas)</legend>
              <div className="estrelas">
                {[1, 2, 3, 4, 5].map((valor) => (
                  <label key={valor}>
                    <input type="radio" name={`estrelas-${dorama.id}`} value={valor} checked={estrelas === valor} onChange={() => setEstrelas(valor)} required />
                    <span aria-hidden="true">{valor <= estrelas ? "★" : "☆"}</span>
                    <span className="texto-acessivel">{valor} {valor === 1 ? "estrela" : "estrelas"}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label htmlFor={`comentario-${dorama.id}`}>Comentário (opcional)</label>
            <textarea id={`comentario-${dorama.id}`} value={comentario} onChange={(evento) => setComentario(evento.target.value)} rows={3} />
            <button className="btn-status assistido" type="submit">Salvar avaliação</button>
            <button className="btn-status pendente" type="button" onClick={cancelar}>Cancelar</button>
          </form>
        )}
      </div>
    </article>
  );
}
