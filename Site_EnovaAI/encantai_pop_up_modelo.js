// encantai_icon_injector.js
// Injeta: fundo degradê + donut + botão toggle
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

  .enc-donut {
    position: absolute;
    right: -36px;
    top: 40px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    /* Removido o degradê de fundo para usar a imagem */
    box-shadow: 0 8px 22px rgba(0,0,0,0.12);
    z-index: 1;
    overflow: hidden; /* Garante que a imagem fique dentro do círculo */
    
  }

  .enc-donut img {
    width: 100%;
    height: 100%;
    /* Garante que a imagem preencha o círculo sem distorção */
    border-radius: 50%; /* Garante que a imagem também seja circular */
  }

  .enc-toggle-btn {
    position: absolute;
    top: -45px; /* Ajustado para acomodar o novo tamanho */
    right: -45px; /* Ajustado para acomodar o novo tamanho */
    background: none; /* Fundo removido */
    border: none; /* Borda removida */
    border-radius: 0; /* Borda arredondada removida */
    width: 90px; /* Aumentado o tamanho do botão */
    height: 90px; /* Aumentado o tamanho do botão */
    cursor: pointer;
    z-index: 10;
    box-shadow: none; /* Sombra removida */
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
  `;

  const html = `
  <div class="enc-card" id="enc-card">
    <div class="enc-top-decor"></div>
  </div>
  <button class="enc-toggle-btn" id="enc-toggle-btn">
    <!-- Ícone para o estado 'abrir' -->
    <img id="open-icon" class="icon" src="./imagens/botao_popup.png" alt="Abrir popup">
    <img id="close-icon" class="icon hidden" src="./imagens/botao_popup2.png" alt="Fechar popup">
  </button>
  `;

  // injeta css
  const s = document.createElement('style');
  s.id = 'encantai-widget-style';
  s.textContent = css;
  document.head.appendChild(s);

  // injeta root
  const root = document.createElement('div');
  root.id = 'encantai-widget-root';
  root.innerHTML = html;
  document.body.appendChild(root);

  // lógica de toggle
  const card = document.getElementById('enc-card');
  const btn = document.getElementById('enc-toggle-btn');
  const openIcon = document.getElementById('open-icon');
  const closeIcon = document.getElementById('close-icon');
  const storageKey = 'encantai-widget-state';

  // Verifica o estado no localStorage e aplica
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

  // Adiciona o listener
  btn.addEventListener('click', () => {
    const currentStateIsHidden = card.classList.toggle('hidden');
    btn.classList.toggle('fixed-position', currentStateIsHidden);
    
    // Alterna a visibilidade das imagens
    openIcon.classList.toggle('hidden', !currentStateIsHidden);
    closeIcon.classList.toggle('hidden', currentStateIsHidden);

    // Salva o novo estado no localStorage
    localStorage.setItem(storageKey, currentStateIsHidden ? 'hidden' : 'visible');
  });
})();
