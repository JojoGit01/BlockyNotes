<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BlockyNotes Mockup</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #ffffff;
      }
      .phone-scroll { scrollbar-width: none; }
      .phone-scroll::-webkit-scrollbar { display: none; }
      .screen-card {
        padding: 14px;
        border-radius: 32px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.08);
        border: 1px solid rgba(15, 23, 42, 0.06);
      }
      .phone-shell {
        position: relative;
        height: 740px;
        width: 338px;
        overflow: hidden;
        border-radius: 44px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        background: white;
        box-shadow: 0 30px 90px rgba(15, 23, 42, 0.14);
      }
      .notch {
        position: absolute;
        left: 50%;
        top: 12px;
        z-index: 20;
        height: 24px;
        width: 144px;
        transform: translateX(-50%);
        border-radius: 999px;
        background: #111827;
      }
      .screen-body {
        height: 100%;
        overflow-y: auto;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        padding: 56px 20px 112px;
      }
      .tabbar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        border-top: 1px solid rgba(15, 23, 42, 0.04);
        background: rgba(255,255,255,0.95);
        padding: 10px 16px 20px;
        backdrop-filter: blur(10px);
      }
      .fab {
        position: absolute;
        bottom: 96px;
        right: 20px;
        display: flex;
        height: 56px;
        width: 56px;
        align-items: center;
        justify-content: center;
        border-radius: 24px;
        background: linear-gradient(135deg, #6d5dfc 0%, #8b5cf6 100%);
        color: white;
        font-size: 24px;
        box-shadow: 0 14px 30px rgba(109, 93, 252, 0.28);
      }
    </style>
  </head>
  <body>
    <div class="min-h-screen bg-white p-8">
      <div class="mx-auto max-w-[1780px]">
        <div class="mb-10 flex flex-col gap-4">
          <div class="flex w-fit items-center gap-3 rounded-full border border-black/5 bg-white px-4 py-2 shadow-sm">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-400 text-white shadow-lg">
              <span class="text-lg">✦</span>
            </div>
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/35">App perso</p>
              <h2 class="text-lg font-bold tracking-tight text-slate-900">BlockyNotes</h2>
            </div>
          </div>
          <h1 class="text-4xl font-bold tracking-tight text-slate-900">BlockyNotes — full index.html mockup</h1>
          <p class="max-w-5xl text-base leading-7 text-black/55">
            Tous les écrans sont séparés visuellement pour être plus lisibles, avec les flows principaux et secondaires de l’app dans un seul fichier HTML.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-10 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6">

          <!-- 1 Onboarding -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell">
              <div class="notch"></div>
              <div class="phone-scroll screen-body">
                <div class="flex min-h-[620px] flex-col justify-between pt-6">
                  <div>
                    <div class="flex w-fit items-center gap-3 rounded-full border border-black/5 bg-white px-4 py-2 shadow-sm">
                      <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-400 text-white shadow-lg">✦</div>
                      <div>
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/35">App perso</p>
                        <h2 class="text-lg font-bold tracking-tight text-slate-900">BlockyNotes</h2>
                      </div>
                    </div>
                    <div class="mt-6 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#111827_0%,#1f2937_55%,#8b5cf6_100%)] p-6 text-white shadow-[0_18px_40px_rgba(17,24,39,0.18)]">
                      <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/12 text-2xl">📘</div>
                      <p class="text-xs font-medium uppercase tracking-[0.18em] text-white/55">Bienvenue</p>
                      <h2 class="mt-2 text-[2rem] font-bold tracking-tight">Organise tes idées simplement.</h2>
                      <p class="mt-3 text-sm leading-6 text-white/72">Notes, dossiers, tags, favoris et une interface légère pour capturer tout ce qui compte.</p>
                    </div>
                    <div class="mt-6 space-y-3">
                      <div class="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-sm">
                        <p class="text-sm font-semibold text-slate-900">Choisis ton style</p>
                        <p class="text-xs text-black/45">Light premium ou dark plus tard</p>
                      </div>
                      <div class="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-sm">
                        <p class="text-sm font-semibold text-slate-900">Dossier par défaut</p>
                        <p class="text-xs text-black/45">Personnel</p>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <button class="w-full rounded-[1.25rem] bg-slate-900 px-4 py-4 text-sm font-medium text-white">Commencer</button>
                    <button class="w-full rounded-[1.25rem] bg-black/[0.03] px-4 py-4 text-sm font-medium text-slate-900">Choisir un thème</button>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-sm font-medium text-black/45">1. Onboarding</p>
          </section>

          <!-- 2 Dashboard -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell">
              <div class="notch"></div>
              <div class="phone-scroll screen-body">
                <div class="mb-5 flex items-center justify-between">
                  <div>
                    <p class="text-xs font-medium uppercase tracking-[0.18em] text-black/35">Bonjour</p>
                    <h2 class="mt-1 text-[1.9rem] font-bold tracking-tight text-slate-900">Ton espace notes</h2>
                  </div>
                  <button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg">+</button>
                </div>
                <div class="mb-4 overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] p-5 text-white shadow-[0_18px_40px_rgba(17,24,39,0.18)]">
                  <div class="mb-6 flex items-start justify-between">
                    <div class="flex items-center gap-3">
                      <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-400 text-white shadow-lg">✦</div>
                      <div>
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">App perso</p>
                        <h2 class="text-lg font-bold tracking-tight text-white">BlockyNotes</h2>
                      </div>
                    </div>
                    <span class="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/75">Aujourd’hui</span>
                  </div>
                  <h3 class="text-[1.7rem] font-bold tracking-tight">12 notes actives</h3>
                  <p class="mt-2 max-w-[220px] text-sm leading-6 text-white/70">Continue là où tu t’es arrêté avec un espace simple et rangé.</p>
                </div>
                <div class="mb-4 grid grid-cols-4 gap-3 rounded-[1.45rem] border border-black/5 bg-white p-4 shadow-sm">
                  <div><p class="text-[11px] text-black/35">Notes</p><p class="mt-1 text-base font-semibold text-slate-900">12</p></div>
                  <div><p class="text-[11px] text-black/35">Favoris</p><p class="mt-1 text-base font-semibold text-slate-900">4</p></div>
                  <div><p class="text-[11px] text-black/35">Dossiers</p><p class="mt-1 text-base font-semibold text-slate-900">4</p></div>
                  <div><p class="text-[11px] text-black/35">Archives</p><p class="mt-1 text-base font-semibold text-slate-900">17</p></div>
                </div>
                <div class="mb-4 flex items-center gap-3 rounded-[1.35rem] border border-black/5 bg-white px-4 py-3 shadow-sm"><span class="text-black/35">⌕</span><span class="text-sm text-black/35">Rechercher une note, un dossier, un tag...</span></div>
                <div class="mb-3 flex items-center justify-between"><h3 class="text-[15px] font-semibold text-slate-900">Récemment modifiées</h3><button class="text-xs font-medium text-black/35">Voir tout</button></div>
                <div class="space-y-2.5">
                  <div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="flex items-start gap-2.5"><div class="mt-0.5 h-8 w-8 rounded-[0.9rem] bg-gradient-to-br from-violet-100 to-purple-50"></div><div class="min-w-0 flex-1"><div class="mb-0.5 flex items-center justify-between gap-3"><h3 class="truncate text-[14px] font-semibold text-slate-900">Idées produit</h3><span class="text-xs font-medium text-black/35">5 min</span></div><p class="text-[13px] leading-5 text-black/55">Créer une app de notes personnelle, rapide et agréable.</p></div></div></div>
                  <div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="flex items-start gap-2.5"><div class="mt-0.5 h-8 w-8 rounded-[0.9rem] bg-gradient-to-br from-blue-100 to-sky-50"></div><div class="min-w-0 flex-1"><div class="mb-0.5 flex items-center justify-between gap-3"><h3 class="truncate text-[14px] font-semibold text-slate-900">Routine du matin</h3><span class="text-xs font-medium text-black/35">08:24</span></div><p class="text-[13px] leading-5 text-black/55">Coder 45 min, marcher 20 min, relire les tâches.</p></div></div></div>
                  <div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="flex items-start gap-2.5"><div class="mt-0.5 h-8 w-8 rounded-[0.9rem] bg-gradient-to-br from-orange-100 to-amber-50"></div><div class="min-w-0 flex-1"><div class="mb-0.5 flex items-center justify-between gap-3"><h3 class="truncate text-[14px] font-semibold text-slate-900">Liste rapide</h3><span class="text-xs font-medium text-black/35">Hier</span></div><p class="text-[13px] leading-5 text-black/55">Chargeur, écouteurs, carnet, clés.</p></div></div></div>
                </div>
              </div>
              <button class="fab">+</button>
              <div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">⌂</div><span class="text-[10px] font-medium text-slate-900">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">☰</div><span class="text-[10px] font-medium text-black/35">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div>
            </div>
            <p class="text-sm font-medium text-black/45">2. Dashboard</p>
          </section>

          <!-- 3 Toutes les notes -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell">
              <div class="notch"></div>
              <div class="phone-scroll screen-body">
                <div class="mb-5 flex items-center justify-between"><div><p class="text-xs font-medium uppercase tracking-[0.18em] text-black/35">Bibliothèque</p><h2 class="mt-1 text-[1.9rem] font-bold tracking-tight text-slate-900">Toutes les notes</h2></div><div class="flex gap-2"><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">⊞</button><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">✎</button></div></div>
                <div class="mb-4 flex items-center gap-3 rounded-[1.35rem] border border-black/5 bg-white px-4 py-3 shadow-sm"><span class="text-black/35">⌕</span><span class="text-sm text-black/35">Rechercher parmi toutes tes notes...</span></div>
                <div class="mb-4 flex items-center gap-2 overflow-x-auto phone-scroll"><span class="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white">Toutes</span><span class="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1.5 text-[11px] font-medium text-black/55">Récentes</span><span class="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1.5 text-[11px] font-medium text-black/55">Personnel</span><span class="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1.5 text-[11px] font-medium text-black/55">Travail</span><span class="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1.5 text-[11px] font-medium text-black/55">Archives</span></div>
                <div class="mb-4 rounded-[1.35rem] border border-black/5 bg-white p-3 shadow-sm"><div class="flex items-center justify-between"><div class="flex items-center gap-2 text-sm text-black/55"><span>☷</span>Trier par date</div><div class="text-sm text-black/55">Plus récentes</div></div></div>
                <div class="space-y-2.5">
                  <div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="mb-1 flex items-start justify-between gap-3"><div><p class="text-[14px] font-semibold text-slate-900">Idées produit</p><p class="mt-0.5 text-[11px] text-black/40">Personnel</p></div><span class="text-xs text-black/35">Aujourd’hui</span></div><p class="text-[13px] leading-5 text-black/55">Appuie pour ouvrir directement l’éditeur.</p></div>
                  <div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="mb-1 flex items-start justify-between gap-3"><div><p class="text-[14px] font-semibold text-slate-900">Wireframe V2</p><p class="mt-0.5 text-[11px] text-black/40">Travail</p></div><span class="text-xs text-black/35">Aujourd’hui</span></div><p class="text-[13px] leading-5 text-black/55">Tester une bottom tab plus fine.</p></div>
                  <div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="mb-1 flex items-start justify-between gap-3"><div><p class="text-[14px] font-semibold text-slate-900">Courses</p><p class="mt-0.5 text-[11px] text-black/40">Personnel</p></div><span class="text-xs text-black/35">Hier</span></div><p class="text-[13px] leading-5 text-black/55">Café, fruits, pain, chargeur.</p></div>
                  <div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="mb-1 flex items-start justify-between gap-3"><div><p class="text-[14px] font-semibold text-slate-900">Inspiration UX</p><p class="mt-0.5 text-[11px] text-black/40">Idées</p></div><span class="text-xs text-black/35">Lun</span></div><p class="text-[13px] leading-5 text-black/55">Utiliser des états vides doux.</p></div>
                  <div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="mb-1 flex items-start justify-between gap-3"><div><p class="text-[14px] font-semibold text-slate-900">Archive 2025</p><p class="mt-0.5 text-[11px] text-black/40">Archives</p></div><span class="text-xs text-black/35">Mar</span></div><p class="text-[13px] leading-5 text-black/55">Anciennes idées produit et captures d’écran.</p></div>
                </div>
              </div>
              <button class="fab">+</button>
              <div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div>
            </div>
            <p class="text-sm font-medium text-black/45">3. Toutes les notes</p>
          </section>

          <!-- 4 Favoris -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell">
              <div class="notch"></div>
              <div class="phone-scroll screen-body">
                <div class="mb-5 flex items-center justify-between"><div><p class="text-xs font-medium uppercase tracking-[0.18em] text-black/35">Collection</p><h2 class="mt-1 text-[1.9rem] font-bold tracking-tight text-slate-900">Favoris</h2></div><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">★</button></div>
                <div class="mb-4 rounded-[1.5rem] border border-black/5 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] p-5 shadow-sm"><p class="text-xs uppercase tracking-[0.18em] text-black/35">Accès rapide</p><h3 class="mt-2 text-[1.55rem] font-bold tracking-tight text-slate-900">Tes notes importantes</h3><p class="mt-2 text-sm leading-6 text-black/50">Garde sous la main les idées que tu consultes le plus.</p></div>
                <div class="space-y-3">
                  <div class="rounded-[1.3rem] border border-black/5 bg-white p-4 shadow-sm"><div class="mb-2 flex items-center justify-between"><p class="text-[14px] font-semibold text-slate-900">Projet principal</p><span>★</span></div><p class="text-[13px] leading-5 text-black/55">Lancer une v1 simple et fluide.</p><p class="mt-2 text-[11px] text-black/35">Personnel</p></div>
                  <div class="rounded-[1.3rem] border border-black/5 bg-white p-4 shadow-sm"><div class="mb-2 flex items-center justify-between"><p class="text-[14px] font-semibold text-slate-900">Routine utile</p><span>★</span></div><p class="text-[13px] leading-5 text-black/55">Relire les notes chaque soir.</p><p class="mt-2 text-[11px] text-black/35">Personnel</p></div>
                  <div class="rounded-[1.3rem] border border-black/5 bg-white p-4 shadow-sm"><div class="mb-2 flex items-center justify-between"><p class="text-[14px] font-semibold text-slate-900">Plan dashboard</p><span>★</span></div><p class="text-[13px] leading-5 text-black/55">Affiner la hiérarchie des sections.</p><p class="mt-2 text-[11px] text-black/35">Travail</p></div>
                </div>
              </div>
              <div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div>
            </div>
            <p class="text-sm font-medium text-black/45">4. Favoris</p>
          </section>

          <!-- 5 Sélection multiple -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell">
              <div class="notch"></div>
              <div class="phone-scroll screen-body">
                <div class="mb-5 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">✕</button><h2 class="text-lg font-semibold text-slate-900">Sélection multiple</h2><button class="rounded-[1rem] bg-slate-900 px-3 py-2 text-xs font-medium text-white">Terminé</button></div>
                <div class="mb-4 rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-sm"><p class="text-xs uppercase tracking-[0.18em] text-black/35">Actions groupées</p><div class="mt-3 grid grid-cols-3 gap-2"><button class="rounded-[1rem] bg-black/[0.03] px-3 py-3 text-xs font-medium text-slate-900">Déplacer</button><button class="rounded-[1rem] bg-black/[0.03] px-3 py-3 text-xs font-medium text-slate-900">Archiver</button><button class="rounded-[1rem] bg-slate-900 px-3 py-3 text-xs font-medium text-white">Supprimer</button></div></div>
                <div class="space-y-3">
                  <div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-6 w-6 items-center justify-center rounded-full border border-violet-500 bg-violet-500 text-white">✓</div><p class="text-[14px] font-semibold text-slate-900">Idées produit</p></div></div>
                  <div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-6 w-6 items-center justify-center rounded-full border border-violet-500 bg-violet-500 text-white">✓</div><p class="text-[14px] font-semibold text-slate-900">Routine du matin</p></div></div>
                  <div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white"></div><p class="text-[14px] font-semibold text-slate-900">Courses</p></div></div>
                  <div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white"></div><p class="text-[14px] font-semibold text-slate-900">Inspiration UX</p></div></div>
                </div>
              </div>
              <div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div>
            </div>
            <p class="text-sm font-medium text-black/45">5. Sélection multiple</p>
          </section>

          <!-- 6 Editeur -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-4 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white text-slate-900">←</button><div class="flex gap-2"><button class="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white text-slate-900">📌</button><button class="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white text-slate-900">⋯</button></div></div><div class="mb-3 flex items-center justify-between"><p class="text-xs font-medium uppercase tracking-[0.18em] text-black/35">Note</p><p class="text-xs text-emerald-600">Enregistré à l’instant</p></div><input value="Idées produit" class="mb-4 w-full border-none bg-transparent p-0 text-[2rem] font-bold tracking-tight text-slate-900 outline-none" /><textarea class="min-h-[520px] w-full resize-none border-none bg-transparent p-0 text-[15px] leading-8 text-black/70 outline-none">Je veux une application de notes vraiment personnelle, pensée pour un usage solo, avec une interface épurée et agréable.

L’idée est de garder uniquement l’essentiel : créer, lire, modifier, supprimer et retrouver rapidement une note.

Le design doit transmettre quelque chose de calme, propre et premium, sans surcharger l’écran.</textarea></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">6. Note / éditeur</p>
          </section>

          <!-- 7 Nouvelle note -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">✕</button><h2 class="text-lg font-semibold text-slate-900">Nouvelle note</h2><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">✓</button></div><div class="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm"><div class="mb-4 rounded-[1rem] bg-black/[0.02] px-4 py-3 text-[1.8rem] font-bold tracking-tight text-black/30">Titre de la note...</div><div class="mb-4 flex flex-wrap gap-2"><span class="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white">Personnel</span><span class="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1.5 text-[11px] font-medium text-black/55">Ajouter un tag</span></div><div class="min-h-[260px] rounded-[1.2rem] border border-dashed border-black/10 bg-white px-4 py-4 text-[15px] leading-8 text-black/30">Écris ici tes idées, rappels, listes ou pensées importantes...</div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">7. Nouvelle note</p>
          </section>

          <!-- 8 Déplacer une note -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">✕</button><h2 class="text-lg font-semibold text-slate-900">Déplacer la note</h2><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">✓</button></div><div class="mb-4 rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-sm"><p class="text-xs uppercase tracking-[0.18em] text-black/35">Note sélectionnée</p><p class="mt-2 text-[15px] font-semibold text-slate-900">Idées produit</p><p class="mt-1 text-sm text-black/45">Choisis le dossier de destination</p></div><div class="space-y-3"><div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/[0.04]">◫</div><p class="text-[14px] font-semibold text-slate-900">Personnel</p></div><span class="text-violet-500">✓✓</span></div></div><div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/[0.04]">◫</div><p class="text-[14px] font-semibold text-slate-900">Travail</p></div><span class="text-black/25">›</span></div></div><div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/[0.04]">◫</div><p class="text-[14px] font-semibold text-slate-900">Idées</p></div><span class="text-black/25">›</span></div></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">8. Déplacer une note</p>
          </section>

          <!-- 9 Gérer les tags -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">✕</button><h2 class="text-lg font-semibold text-slate-900">Tags</h2><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">✓</button></div><div class="mb-4 rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-sm"><p class="text-xs uppercase tracking-[0.18em] text-black/35">Ajouter un tag</p><div class="mt-3 rounded-[1rem] border border-black/5 bg-black/[0.03] px-4 py-3 text-sm text-black/30">Nouveau tag...</div></div><div class="mb-3 flex items-center justify-between"><h3 class="text-[15px] font-semibold text-slate-900">Tags disponibles</h3></div><div class="flex flex-wrap gap-2"><button class="rounded-full bg-slate-900 px-3 py-2 text-xs font-medium text-white">#perso</button><button class="rounded-full bg-slate-900 px-3 py-2 text-xs font-medium text-white">#travail</button><button class="rounded-full bg-slate-900 px-3 py-2 text-xs font-medium text-white">#idée</button><button class="rounded-full bg-black/[0.04] px-3 py-2 text-xs font-medium text-black/55">#urgent</button><button class="rounded-full bg-black/[0.04] px-3 py-2 text-xs font-medium text-black/55">#inspiration</button></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">9. Gérer les tags</p>
          </section>

          <!-- 10 Détail dossier -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white text-slate-900">←</button><button class="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white text-slate-900">⋯</button></div><div class="mb-4 rounded-[1.6rem] border border-black/5 bg-[linear-gradient(135deg,#ede9fe_0%,#ffffff_100%)] p-5 shadow-sm"><div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">◫</div><p class="text-xs uppercase tracking-[0.18em] text-black/35">Dossier</p><h2 class="mt-1 text-[1.9rem] font-bold tracking-tight text-slate-900">Personnel</h2><p class="mt-2 text-sm text-black/50">8 notes rangées dans ce dossier</p></div><div class="mb-3 flex items-center justify-between"><h3 class="text-[15px] font-semibold text-slate-900">Notes du dossier</h3><button class="text-xs font-medium text-black/35">Trier</button></div><div class="space-y-2.5"><div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="mb-1 flex items-start justify-between gap-3"><p class="text-[14px] font-semibold text-slate-900">Idées produit</p><span class="text-xs text-black/35">Aujourd’hui</span></div><p class="text-[13px] leading-5 text-black/55">Créer une app simple et rapide.</p></div><div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="mb-1 flex items-start justify-between gap-3"><p class="text-[14px] font-semibold text-slate-900">Routine du matin</p><span class="text-xs text-black/35">Hier</span></div><p class="text-[13px] leading-5 text-black/55">Coder, marcher, relire les priorités.</p></div><div class="rounded-[1.2rem] border border-black/5 bg-white p-3 shadow-sm"><div class="mb-1 flex items-start justify-between gap-3"><p class="text-[14px] font-semibold text-slate-900">Note privée</p><span class="text-xs text-black/35">Lun</span></div><p class="text-[13px] leading-5 text-black/55">Quelques rappels perso à garder ici.</p></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">☰</div><span class="text-[10px] font-medium text-black/35">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">◫</div><span class="text-[10px] font-medium text-slate-900">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">10. Détail d’un dossier</p>
          </section>

          <!-- 11 Archives -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><div><p class="text-xs font-medium uppercase tracking-[0.18em] text-black/35">Stockage</p><h2 class="mt-1 text-[1.9rem] font-bold tracking-tight text-slate-900">Archives</h2></div><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">🗄</button></div><div class="mb-4 rounded-[1.5rem] border border-black/5 bg-white p-4 text-center shadow-sm"><p class="text-sm font-medium text-slate-900">Les notes archivées restent accessibles</p><p class="mt-1 text-xs leading-5 text-black/45">Range ce que tu veux conserver sans encombrer tes notes actives.</p></div><div class="space-y-3"><div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><div><p class="text-[14px] font-semibold text-slate-900">Archive 2025</p><p class="mt-1 text-xs text-black/40">Archivée en Mars</p></div><button class="rounded-[1rem] bg-black/[0.03] px-3 py-2 text-xs font-medium text-slate-900">Restaurer</button></div></div><div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><div><p class="text-[14px] font-semibold text-slate-900">Ancien concept UI</p><p class="mt-1 text-xs text-black/40">Archivée en Fév</p></div><button class="rounded-[1rem] bg-black/[0.03] px-3 py-2 text-xs font-medium text-slate-900">Restaurer</button></div></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">☰</div><span class="text-[10px] font-medium text-black/35">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">◫</div><span class="text-[10px] font-medium text-slate-900">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">11. Archives</p>
          </section>

          <!-- 12 Corbeille -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><div><p class="text-xs font-medium uppercase tracking-[0.18em] text-black/35">Système</p><h2 class="mt-1 text-[1.9rem] font-bold tracking-tight text-slate-900">Corbeille</h2></div><button class="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Vider</button></div><div class="mb-4 rounded-[1.5rem] border border-black/5 bg-white p-4 text-center shadow-sm"><p class="text-sm font-medium text-slate-900">Les notes supprimées restent 30 jours</p><p class="mt-1 text-xs leading-5 text-black/45">Tu peux restaurer ou supprimer définitivement chaque note.</p></div><div class="space-y-3"><div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="mb-2 flex items-center justify-between gap-3"><p class="text-[14px] font-semibold text-slate-900">Vieille idée UI</p><span class="text-xs text-black/35">Aujourd’hui</span></div><div class="grid grid-cols-2 gap-2"><button class="rounded-[1rem] bg-black/[0.03] px-3 py-3 text-xs font-medium text-slate-900">Restaurer</button><button class="rounded-[1rem] bg-slate-900 px-3 py-3 text-xs font-medium text-white">Supprimer</button></div></div><div class="rounded-[1.25rem] border border-black/5 bg-white p-4 shadow-sm"><div class="mb-2 flex items-center justify-between gap-3"><p class="text-[14px] font-semibold text-slate-900">Liste temporaire</p><span class="text-xs text-black/35">Hier</span></div><div class="grid grid-cols-2 gap-2"><button class="rounded-[1rem] bg-black/[0.03] px-3 py-3 text-xs font-medium text-slate-900">Restaurer</button><button class="rounded-[1rem] bg-slate-900 px-3 py-3 text-xs font-medium text-white">Supprimer</button></div></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">☰</div><span class="text-[10px] font-medium text-black/35">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">◫</div><span class="text-[10px] font-medium text-slate-900">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">12. Corbeille</p>
          </section>

          <!-- 13 Recherche vide -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><div><p class="text-xs font-medium uppercase tracking-[0.18em] text-black/35">Recherche</p><h2 class="mt-1 text-[1.9rem] font-bold tracking-tight text-slate-900">Aucun résultat</h2></div><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">⚲</button></div><div class="mb-4 flex items-center gap-3 rounded-[1.35rem] border border-black/5 bg-white px-4 py-3 shadow-sm"><span class="text-black/35">⌕</span><span class="text-sm text-black/35">Recherche : “meeting design”</span></div><div class="rounded-[1.6rem] border border-black/5 bg-white p-6 text-center shadow-sm"><p class="text-sm font-medium text-slate-900">Aucune note trouvée</p><p class="mt-2 text-xs leading-5 text-black/45">Essaie un autre mot-clé, un autre dossier ou enlève certains filtres.</p><div class="mt-4 flex justify-center gap-2"><button class="rounded-[1rem] bg-slate-900 px-4 py-3 text-xs font-medium text-white">Créer une note</button><button class="rounded-[1rem] bg-black/[0.03] px-4 py-3 text-xs font-medium text-slate-900">Réinitialiser</button></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">13. Recherche vide</p>
          </section>

          <!-- 14 Confirmation suppression -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">✕</button><h2 class="text-lg font-semibold text-slate-900">Supprimer la note</h2><div class="h-11 w-11"></div></div><div class="rounded-[1.6rem] border border-black/5 bg-white p-6 text-center shadow-sm"><div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100 to-orange-100">🗑</div><p class="text-[16px] font-semibold text-slate-900">Supprimer “Idées produit” ?</p><p class="mt-2 text-sm leading-6 text-black/50">La note sera envoyée dans la corbeille et pourra être restaurée pendant 30 jours.</p><div class="mt-5 grid grid-cols-2 gap-2"><button class="rounded-[1rem] bg-black/[0.03] px-4 py-3 text-sm font-medium text-slate-900">Annuler</button><button class="rounded-[1rem] bg-slate-900 px-4 py-3 text-sm font-medium text-white">Confirmer</button></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">☰</div><span class="text-[10px] font-medium text-slate-900">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⚙</div><span class="text-[10px] font-medium text-black/35">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">14. Confirmation suppression</p>
          </section>

          <!-- 15 Paramètres -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><div><p class="text-xs font-medium uppercase tracking-[0.18em] text-black/35">Personnalisation</p><h2 class="mt-1 text-[1.9rem] font-bold tracking-tight text-slate-900">Paramètres</h2></div><button class="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white text-slate-900">⚙</button></div><div class="mb-4 rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white font-semibold">B</div><div class="flex-1"><p class="font-semibold text-slate-900">BlockyNotes User</p><p class="text-sm text-black/45">Ton espace de notes personnel</p></div><span class="text-purple-500">♥</span></div></div><div class="space-y-3"><div class="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04]">🎨</div><div class="flex-1"><p class="text-[15px] font-semibold text-slate-900">Thème</p><p class="text-sm text-black/45">Light premium</p></div><span class="text-black/30">›</span></div></div><div class="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04]">☁</div><div class="flex-1"><p class="text-[15px] font-semibold text-slate-900">Sauvegarde</p><p class="text-sm text-black/45">Activée</p></div><span class="text-black/30">›</span></div></div><div class="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04]">🔔</div><div class="flex-1"><p class="text-[15px] font-semibold text-slate-900">Notifications</p><p class="text-sm text-black/45">Désactivées</p></div><span class="text-black/30">›</span></div></div><div class="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04]">⬇</div><div class="flex-1"><p class="text-[15px] font-semibold text-slate-900">Exporter mes notes</p><p class="text-sm text-black/45">PDF, texte brut</p></div><span class="text-black/30">›</span></div></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">☰</div><span class="text-[10px] font-medium text-black/35">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">⚙</div><span class="text-[10px] font-medium text-slate-900">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">15. Paramètres</p>
          </section>

          <!-- 16 Choix du thème -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">←</button><h2 class="text-lg font-semibold text-slate-900">Apparence</h2><div class="h-11 w-11"></div></div><div class="mb-3 flex items-center justify-between"><h3 class="text-[15px] font-semibold text-slate-900">Choisis un thème</h3></div><div class="space-y-3"><div class="rounded-[1.45rem] border border-black/5 bg-white p-4 shadow-sm ring-2 ring-violet-200"><div class="mb-3 h-28 rounded-[1.1rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]"></div><div class="flex items-center justify-between"><div><p class="text-sm font-semibold text-slate-900">Light premium</p><p class="text-xs text-black/45">Clair, propre et doux</p></div><span class="text-violet-500">✓✓</span></div></div><div class="rounded-[1.45rem] border border-black/5 bg-white p-4 shadow-sm"><div class="mb-3 h-28 rounded-[1.1rem] bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)]"></div><div><p class="text-sm font-semibold text-slate-900">Dark premium</p><p class="text-xs text-black/45">Disponible en option</p></div></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">☰</div><span class="text-[10px] font-medium text-black/35">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">⚙</div><span class="text-[10px] font-medium text-slate-900">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">16. Choix du thème</p>
          </section>

          <!-- 17 À propos -->
          <section class="flex flex-col items-center gap-4 screen-card">
            <div class="phone-shell"><div class="notch"></div><div class="phone-scroll screen-body"><div class="mb-5 flex items-center justify-between"><button class="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.03] text-slate-900">←</button><h2 class="text-lg font-semibold text-slate-900">À propos</h2><div class="h-11 w-11"></div></div><div class="mb-4 rounded-[1.6rem] border border-black/5 bg-[linear-gradient(135deg,#f5f3ff_0%,#ffffff_100%)] p-5 shadow-sm"><div class="flex items-center gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-400 text-white shadow-lg">✦</div><div><p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/35">App perso</p><h2 class="text-lg font-bold tracking-tight text-slate-900">BlockyNotes</h2></div></div><p class="mt-4 text-[1.8rem] font-bold tracking-tight text-slate-900">BlockyNotes</p><p class="mt-2 text-sm leading-6 text-black/50">Une app personnelle pour écrire, trier et retrouver tes idées rapidement.</p></div><div class="space-y-3"><div class="rounded-[1.3rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><p class="text-sm font-semibold text-slate-900">Version</p><p class="text-sm text-black/45">1.0.0 concept</p></div></div><div class="rounded-[1.3rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><p class="text-sm font-semibold text-slate-900">Sauvegarde</p><p class="text-sm text-black/45">Locale + cloud</p></div></div><div class="rounded-[1.3rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><p class="text-sm font-semibold text-slate-900">Confidentialité</p><p class="text-sm text-black/45">Notes privées</p></div></div><div class="rounded-[1.3rem] border border-black/5 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><p class="text-sm font-semibold text-slate-900">Support</p><p class="text-sm text-black/45">contact@blockynotes.app</p></div></div></div></div><div class="tabbar"><div class="grid grid-cols-4"><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">⌂</div><span class="text-[10px] font-medium text-black/35">Accueil</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">☰</div><span class="text-[10px] font-medium text-black/35">Notes</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full text-black/35">◫</div><span class="text-[10px] font-medium text-black/35">Dossiers</span></div><div class="flex flex-col items-center gap-1 py-1"><div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">⚙</div><span class="text-[10px] font-medium text-slate-900">Réglages</span></div></div></div></div>
            <p class="text-sm font-medium text-black/45">17. À propos</p>
          </section>

        </div>
      </div>
    </div>
  </body>
</html>
