const URL_API = "https://api.themoviedb.org/3";
const URL_POSTER = "https://image.tmdb.org/t/p/w500";
const PAISES = { KR: "Coreia do Sul", TH: "Tailândia", JP: "Japão", TW: "Taiwan" };

// Converte a resposta do TMDB para o contrato usado pelos componentes.
export function adaptarDorama(serie, ehBL = false) {
  const generos = serie.genre_ids ?? [];
  return {
    id: serie.id,
    titulo: serie.name || serie.original_name || "Título indisponível",
    pais: (serie.origin_country ?? []).map((codigo) => PAISES[codigo] || codigo).join(", ") || "País não informado",
    genero: ehBL ? "BL" : generos.includes(10749) ? "Romance" : generos.includes(10765) ? "Fantasia" : "Outros",
    episodios: serie.number_of_episodes ?? null,
    nota: typeof serie.vote_average === "number" ? serie.vote_average : 0,
    sinopse: serie.overview || "Sinopse não disponível.",
    poster: serie.poster_path ? `${URL_POSTER}${serie.poster_path}` : null,
    assistido: false,
  };
}

async function requisitar(caminho, parametros = {}, signal) {
  const chave = import.meta.env.VITE_TMDB_API_KEY;
  if (!chave) throw new Error("Configure VITE_TMDB_API_KEY no arquivo .env.");

  const url = new URL(`${URL_API}${caminho}`);
  url.search = new URLSearchParams({ api_key: chave, language: "pt-BR", ...parametros });
  const resposta = await fetch(url, { signal });
  if (!resposta.ok) throw new Error(`Não foi possível carregar o catálogo (TMDB: ${resposta.status}).`);
  return resposta.json();
}

export async function buscarDoramas(signal, pagina = 1) {
  const parametros = { with_origin_country: "KR|TH|JP|TW", sort_by: "popularity.desc", page: pagina };
  const [populares, bl] = await Promise.all([
    requisitar("/discover/tv", parametros, signal),
    requisitar("/discover/tv", { ...parametros, with_keywords: "289844" }, signal),
  ]);

  // A consulta de BL tem prioridade quando um título aparece nas duas listas.
  const idsBL = new Set(bl.results.map((serie) => serie.id));
  const series = new Map([...populares.results, ...bl.results].map((serie) => [serie.id, serie]));
  return {
    doramas: Array.from(series.values(), (serie) => adaptarDorama(serie, idsBL.has(serie.id))),
    temMais: pagina < Math.min(500, Math.max(populares.total_pages, bl.total_pages)),
  };
}

export async function pesquisarDoramas(busca, pagina, signal) {
  const resultado = await requisitar("/search/tv", { query: busca, page: pagina }, signal);
  const series = resultado.results.filter((serie) => (serie.origin_country ?? []).some((pais) => pais in PAISES));
  // A busca não retorna palavras-chave; os detalhes identificam produções BL.
  const detalhes = await Promise.allSettled(series.map((serie) =>
    requisitar(`/tv/${serie.id}`, { append_to_response: "keywords" }, signal)
  ));
  return {
    doramas: series.map((serie, indice) => {
      const detalhe = detalhes[indice];
      const palavras = detalhe.status === "fulfilled" ? detalhe.value.keywords?.results ?? [] : [];
      return adaptarDorama(serie, palavras.some((palavra) => palavra.id === 289844));
    }),
    temMais: pagina < Math.min(500, resultado.total_pages),
  };
}

// Recupera títulos da lista que não estão mais na página atual do catálogo.
export async function buscarDoramasSalvos(ids, signal) {
  const resultados = await Promise.allSettled(ids.map(async (id) => {
    const serie = await requisitar(`/tv/${id}`, { append_to_response: "keywords" }, signal);
    const generos = (serie.genres ?? []).map((genero) => genero.id);
    const palavras = serie.keywords?.results ?? [];
    return adaptarDorama({ ...serie, genre_ids: generos }, palavras.some((palavra) => palavra.id === 289844));
  }));
  return {
    doramas: resultados.filter((resultado) => resultado.status === "fulfilled").map((resultado) => resultado.value),
    houveFalha: resultados.some((resultado) => resultado.status === "rejected"),
  };
}
