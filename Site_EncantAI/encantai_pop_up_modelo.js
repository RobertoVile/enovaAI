// Esse script injeta o pop up da IA nas paginas que carregam esse script

(function () {
  if (document.getElementById('encantai-widget-root')) return;

  const css = `
  #encantai-widget-root {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 9999;
    width: 260px;
    max-width: calc(100% - 32px);
    font-family: 'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
  }

  .enc-card {
    position: relative;
    background: #fff;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 12px 28px rgba(0,0,0,0.12);
    overflow: visible;
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    transform-origin: bottom right;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .enc-card.hidden {
    transform: scale(0.1);
    opacity: 0;
    pointer-events: none;
    height: 0;
    padding: 0;
    visibility: hidden;
  }

  .enc-top-decor {
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: linear-gradient(180deg, #e7bfc4 0%, #efe7dc 45%, #e9f0e7 75%);
    z-index: 0;
  }

  /* Remove o bloco .enc-donut do CSS, já que o elemento não existirá mais no HTML */

  .enc-toggle-btn {
    position: absolute;
    top: -45px;
    right: -45px;
    background: none;
    border: none;
    border-radius: 0;
    width: 90px;
    height: 90px;
    cursor: pointer;
    z-index: 10;
    box-shadow: none;
    transition: all 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .enc-toggle-btn .icon {
    width: 100%; 
    height: 100%;
    object-fit: contain; 
    transition: all 0.3s ease-in-out;
  }

  .enc-toggle-btn .icon.hidden {
    display: none;
  }

  .enc-toggle-btn.fixed-position {
    right: 20px;
    bottom: 20px;
    top: auto;
    position: fixed;
    transform: none;
  }
  
  .enc-main-image-container {
      text-align: center;
      margin: 0;
      width: 100%;
  }

  .enc-main-image {
      max-width: 100%;
      height: 200px;
      border-radius: 8px;
      display: block;
      margin: 0 auto;
  }

  @media (max-width: 300px) {
      #encantai-widget-root {
          width: 100%;
          max-width: 100%;
      }
  }
  `;

  const s_model_viewer = document.createElement('script');
  s_model_viewer.setAttribute('type', 'module');
  s_model_viewer.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js');
  document.head.appendChild(s_model_viewer);

  const html = `
  <div class="enc-card" id="enc-card">
    <div class="enc-top-decor"></div>
    <div class="enc-main-image-container">
      <model-viewer 
        class="enc-main-image"
        src="./caminho/para/seu/modelo.glb"
        alt="Modelo 3D"
        camera-controls
        auto-rotate
        ar>
      </model-viewer>
    </div>
  </div>
  <button class="enc-toggle-btn" id="enc-toggle-btn">
    <img id="open-icon" class="icon" src="./imagens/botao_popup.png" alt="Abrir popup">
    <img id="close-icon" class="icon hidden" src="./imagens/botao_popup2.png" alt="Fechar popup">
  </button>
  `;
  
  const s = document.createElement('style');
  s.id = 'encantai-widget-style';
  s.textContent = css;
  document.head.appendChild(s);
  
  const root = document.createElement('div');
  root.id = 'encantai-widget-root';
  root.innerHTML = html;
  document.body.appendChild(root);

  const card = document.getElementById('enc-card');
  const btn = document.getElementById('enc-toggle-btn');
  const openIcon = document.getElementById('open-icon');
  const closeIcon = document.getElementById('close-icon');
  const storageKey = 'encantai-widget-state';

  const storedState = localStorage.getItem(storageKey);
  const isHidden = storedState === 'hidden';

  if (isHidden) {
    card.classList.add('hidden');
    btn.classList.add('fixed-position');
    openIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
  } else {
    openIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
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
})();