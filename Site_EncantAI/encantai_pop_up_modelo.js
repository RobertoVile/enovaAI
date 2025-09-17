(function () {
  if (document.getElementById('encantai-widget-root')) return;

  // ---------------- CSS ----------------
  const css = `
  #encantai-widget-root { position: fixed; right: 20px; bottom: 20px; z-index: 9999; width: 300px; max-width: calc(100% - 32px); font-family: 'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, Arial; }
  .enc-card { position: relative; background: #fff; border-radius: 16px; padding: 18px; box-shadow: 0 12px 28px rgba(0,0,0,0.12); overflow: visible; transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out; transform-origin: bottom right; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .enc-card.hidden { transform: scale(0.1); opacity: 0; pointer-events: none; height: 0; padding: 0; visibility: hidden; }
  .enc-top-decor { position: absolute; inset: 0; border-radius: 16px; background: linear-gradient(180deg, #e7bfc4 0%, #efe7dc 45%, #e9f0e7 75%); z-index: 0; }
  .enc-toggle-btn { position: absolute; top: -45px; right: -45px; background: none; border: none; border-radius: 0; width: 90px; height: 90px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; }
  .enc-toggle-btn .icon { width: 100%; height: 100%; object-fit: contain; transition: all 0.3s ease-in-out; }
  .enc-toggle-btn .icon.hidden { display: none; }
  .enc-toggle-btn.fixed-position { right: 20px; bottom: 20px; top: auto; position: fixed; transform: none; }
  .enc-main-image-container { text-align: center; margin: 0; width: 100%; height: 300px; }
  .enc-main-image { width: 100%; height: 100%; border-radius: 8px; display: block; margin: 0 auto; }
  .enc-menu { display: flex; justify-content: center; gap: 10px; margin-top: 10px; position: relative; z-index: 5; }
  .enc-menu button { padding: 5px 8px; border: none; border-radius: 5px; background: #007bff; color: white; cursor: pointer; font-size: 12px; }
  .enc-menu button:hover { background: #0056b3; }
  @media (max-width: 300px) { #encantai-widget-root { width: 100%; max-width: 100%; } }
  `;

  const style = document.createElement('style');
  style.id = 'encantai-widget-style';
  style.textContent = css;
  document.head.appendChild(style);

  // ---------------- HTML ----------------
  const html = `
  <div class="enc-card" id="enc-card">
    <div class="enc-top-decor"></div>
    <div class="enc-main-image-container" id="manequim">
      <p>Carregando manequim...</p>
    </div>
    <div class="enc-menu" id="menu-roupas"></div>
  </div>

  <button class="enc-toggle-btn" id="enc-toggle-btn">
    <img id="open-icon" class="icon" src="./imagens/botao_popup.png" alt="Abrir popup">
    <img id="close-icon" class="icon hidden" src="./imagens/botao_popup2.png" alt="Fechar popup">
  </button>
  `;

  const root = document.createElement('div');
  root.id = 'encantai-widget-root';
  root.innerHTML = html;
  document.body.appendChild(root);

  // ---------------- Toggle ----------------
  const card = document.getElementById('enc-card');
  const btn = document.getElementById('enc-toggle-btn');
  const openIcon = document.getElementById('open-icon');
  const closeIcon = document.getElementById('close-icon');
  const storageKey = 'encantai-widget-state';
  const menuRoupas = document.getElementById('menu-roupas');
  const divManequim = document.getElementById('manequim');

  const storedState = localStorage.getItem(storageKey);
  const isHidden = storedState === 'hidden';

  if (isHidden) {
    card.classList.add('hidden');
    btn.classList.add('fixed-position');
    openIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
  } else {
    openIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
  }

  btn.addEventListener('click', () => {
    if (card.classList.contains('hidden')) {
      card.classList.remove('hidden');
      btn.classList.remove('fixed-position');
      openIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      localStorage.setItem(storageKey, 'visible');
    } else {
      card.classList.add('hidden');
      btn.classList.add('fixed-position');
      openIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
      localStorage.setItem(storageKey, 'hidden');
    }
  });

  // ---------------- Manequim ----------------
  async function carregarManequim() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      divManequim.innerHTML = `<p>Nenhum usuário logado</p>`;
      return;
    }

    const manequim = localStorage.getItem(`manequim_${userId}`);
    if (!manequim) {
      // **REDIRECIONAMENTO AUTOMÁTICO**
      window.location.href = "criar_manequim.html";
      return;
    }

    divManequim.innerHTML = `
      <model-viewer src="${manequim}" camera-controls auto-rotate shadow-intensity="1" background-color="#FFFFFF" class="enc-main-image"></model-viewer>
    `;
  }

  window.trocarRoupas = function(modelo) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    localStorage.setItem(`manequim_${userId}`, modelo);
    carregarManequim();
  };

  // ---------------- Menu de roupas ----------------
  function carregarMenu() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    menuRoupas.innerHTML = '';

    // Exemplo: liberar roupas apenas para usuário 1
    if (userId === "18") {
      const roupas = [
        { nome: "Roupa 1", src: "https://models.readyplayer.me/68c47170c23b0ee959bb05ad.glb" },
        { nome: "Roupa 2", src: "https://models.readyplayer.me/68c46e66f879ae3aba0d2ca2.glb" },
        { nome: "Roupa 3", src: "https://models.readyplayer.me/68c479b9d830ce77ae0ad04a.glb" },
      ];
      roupas.forEach(r => {
        const btn = document.createElement("button");
        btn.textContent = r.nome;
        btn.onclick = () => window.trocarRoupas(r.src);
        menuRoupas.appendChild(btn);
      });
    }
  }

  // ---------------- Inicializa ----------------
  carregarManequim();
  carregarMenu();

  // ---------------- Carrega model-viewer ----------------
  const s_model_viewer = document.createElement('script');
  s_model_viewer.setAttribute('type', 'module');
  s_model_viewer.setAttribute('src', 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js');
  document.head.appendChild(s_model_viewer);

})();
