export interface PlaylistRec {
  ad: string;
  aciklama: string;
  spotify_query: string;
  youtube_query: string;
}

export interface KitapRec {
  ad: string;
  aciklama: string;
}

export interface YemekRec {
  ad: string;
  aciklama: string;
  search_query: string;
}

export interface Recommendations {
  playlist: PlaylistRec;
  kitap: KitapRec;
  yemek: YemekRec;
}

export const generateLinks = (rec: Recommendations) => ({
  playlist: {
    spotify: `https://open.spotify.com/search/${encodeURIComponent(rec.playlist.spotify_query)}`,
    youtube: `https://music.youtube.com/search?q=${encodeURIComponent(rec.playlist.youtube_query)}`,
  },
  kitap: {
    amazon: `https://www.amazon.com.tr/s?k=${encodeURIComponent(rec.kitap.ad)}`,
  },
  yemek: {
    tarif: `https://www.google.com/search?q=${encodeURIComponent(rec.yemek.search_query + " tarifi")}`,
  },
});
