const URL_API = "https://api.themoviedb.org/3";
const URL_POSTER = "https://image.tmdb.org/t/p/w500";
const PAISES = { KR: "Coreia do Sul", TH: "Tail?ndia", JP: "Jap?o", TW: "Taiwan" };

// Converte a resposta do TMDB para o contrato usado pelos componentes.
export function adaptarDorama(serie, ehBL = false) {
  const generos = serie.genre_ids ?? [];
  return {
    id: serie.id,
    titulo: serie.name || serie.original_name || "T?tulo indispon?vel",
    pais: (serie.origin_country ?? []).map((codigo) => PAISES[codigo] || codigo).join(", ") || "Pa?s n?o informado",
    genero: ehBL ? "BL" : generos.includes(10749) ? "Romance" : generos.includes(10765) ? "Fantasia" : "Outros",
    episodios: serie.number_of_episodes ?? null,
    nota: typeof serie.vote_average === "number" ? serie.vote_average : 0,
    sinopse: serie.overview || "Sinopse n?o dispon?vel.",
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
  if (!resposta.ok) throw new Error(`N?o foi poss?vel carregar o cat?logo (TMDB: ${resposta.status}).`);
  return resposta.json();
}

export async function buscarDoramas(signal) {
  const parametros = { with_origin_country: "KR|TH|JP|TW", sort_by: "popularity.desc" };
  const [populares, bl] = await Promise.all([
    requisitar("/discover/tv", parametros, signal),
    requisitar("/discover/tv", { ...parametros, with_keywords: "289844" }, signal),
  ]);

  // A consulta de BL tem prioridade quando um t?tulo aparece nas duas listas.
  const idsBL = new Set(bl.results.map((serie) => serie.id));
  const series = new Map([...populares.results, ...bl.results].map((serie) => [serie.id, serie]));
  return Array.from(series.values(), (serie) => adaptarDorama(serie, idsBL.has(serie.id)));
}
