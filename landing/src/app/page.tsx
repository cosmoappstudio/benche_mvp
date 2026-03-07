import Image from "next/image";
import {
  FALLBACK_APP_STORE_URL,
  FALLBACK_PLAY_STORE_URL,
  TERMS_URL,
  PRIVACY_URL,
} from "@/lib/constants";
import { getStoreUrls } from "@/lib/appConfig";

export default async function LandingPage() {
  const { appStore, playStore } = await getStoreUrls();
  const APP_STORE_URL = appStore || FALLBACK_APP_STORE_URL;
  const PLAY_STORE_URL = playStore || FALLBACK_PLAY_STORE_URL;
  return (
    <div className="min-h-screen bg-benche-bg text-benche-text">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-benche-purple/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-benche-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-benche-purple/20 rounded-full blur-3xl" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <a href="#" className="flex items-center" aria-label="Benche">
            <Image
              src="/icon.png"
              alt="Benche"
              width={40}
              height={40}
              className="rounded-xl"
            />
          </a>
          <a
            href="#download"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-benche-purple to-benche-cyan text-white font-semibold text-sm shadow-[0_4px_20px_rgba(123,47,255,0.35)] hover:opacity-90 hover:shadow-[0_6px_24px_rgba(123,47,255,0.45)] transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            İndir
          </a>
        </nav>

        <div className="relative z-10 px-6 pt-16 pb-24 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-benche-purple via-benche-cyan to-benche-purple bg-clip-text text-transparent">
              Modunu Yakala
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-benche-muted max-w-2xl mx-auto leading-relaxed">
            Günlük yaşam koçun ve eğlence rehberin. Renk, sembol ve moduna göre
            kişiselleştirilmiş öneriler: playlist, film, dizi, kitap, yemek ve
            aktivite.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-benche-bg font-semibold hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </a>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                />
              </svg>
              Google Play
            </a>
          </div>
        </div>
      </header>

      {/* App Screenshots */}
      <section className="relative px-6 py-20 overflow-hidden">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Uygulamayı Keşfet
        </h2>
        <p className="text-benche-muted text-center mb-16 max-w-xl mx-auto">
          Modunu seç, kişiselleştirilmiş öneriler al, beğendiklerini kaydet.
        </p>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-end gap-4 sm:gap-8">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-[200px] sm:w-[260px] rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white/10 bg-benche-bg p-1.5 sm:p-2 shadow-2xl shadow-black/50">
              <Image
                src="/screenshot-selection.png"
                alt="Modunu Seç — Renk, sembol ve element seçimi"
                width={244}
                height={528}
                className="rounded-[1.5rem] sm:rounded-[2rem] w-full h-auto"
              />
            </div>
            <span className="mt-3 text-sm text-benche-muted">Modunu Seç</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-[200px] sm:w-[260px] rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white/10 bg-benche-bg p-1.5 sm:p-2 shadow-2xl shadow-black/50">
              <Image
                src="/screenshot-results.png"
                alt="İşte sana özel planın — Yemek ve playlist önerileri"
                width={244}
                height={528}
                className="rounded-[1.5rem] sm:rounded-[2rem] w-full h-auto"
              />
            </div>
            <span className="mt-3 text-sm text-benche-muted">Öneriler</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-[200px] sm:w-[260px] rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white/10 bg-benche-bg p-1.5 sm:p-2 shadow-2xl shadow-black/50">
              <Image
                src="/screenshot-results-2.png"
                alt="Kitap ve aktivite önerileri"
                width={244}
                height={528}
                className="rounded-[1.5rem] sm:rounded-[2rem] w-full h-auto"
              />
            </div>
            <span className="mt-3 text-sm text-benche-muted">Planın</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-[200px] sm:w-[260px] rounded-[2rem] sm:rounded-[2.5rem] border-4 border-white/10 bg-benche-bg p-1.5 sm:p-2 shadow-2xl shadow-black/50">
              <Image
                src="/screenshot-favorites.png"
                alt="Zevk Haritası — Beğendiklerin"
                width={244}
                height={528}
                className="rounded-[1.5rem] sm:rounded-[2rem] w-full h-auto"
              />
            </div>
            <span className="mt-3 text-sm text-benche-muted">Zevk Haritası</span>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır */}
      <section className="relative px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-16">
          Nasıl Çalışır?
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-benche-purple to-benche-cyan flex items-center justify-center text-2xl mb-4">
              🎨
            </div>
            <h3 className="text-lg font-semibold mb-2">Modunu Seç</h3>
            <p className="text-benche-muted text-sm leading-relaxed">
              Renk, sembol, element, harf ve rakamla günün enerjini belirle. 5
              sezgisel seçim, sana özel bir profil oluşturur.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-benche-cyan to-benche-purple flex items-center justify-center text-2xl mb-4">
              ✨
            </div>
            <h3 className="text-lg font-semibold mb-2">Kişiselleştirilmiş Öneriler</h3>
            <p className="text-benche-muted text-sm leading-relaxed">
              Konumuna, mevsime ve hava durumuna göre yemek, playlist, film,
              dizi, kitap ve aktivite önerileri al.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl mb-4">
              🌅
            </div>
            <h3 className="text-lg font-semibold mb-2">Her Sabah Yeni Plan</h3>
            <p className="text-benche-muted text-sm leading-relaxed">
              Günlük hatırlatma ile gününü kaçırma. Tek bildirim, doğru zamanda.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="download"
        className="relative px-6 py-24 max-w-4xl mx-auto text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-benche-purple/30 via-transparent to-transparent rounded-3xl" />
        <h2 className="relative text-2xl sm:text-3xl font-bold mb-4">
          Hemen Başla
        </h2>
        <p className="relative text-benche-muted mb-8">
          Ücretsiz indir, modunu yakala.
        </p>
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-benche-purple to-benche-cyan text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            App Store&apos;dan İndir
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
              />
            </svg>
            Google Play&apos;den İndir
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="Benche"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-sm font-medium text-benche-muted">benche</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-benche-muted">
            <a
              href={PRIVACY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Gizlilik Politikası
            </a>
            <a
              href={TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Kullanım Koşulları
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-benche-muted/70">
          © {new Date().getFullYear()} Benche. Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
