export function HeaderFuncoes() {
  document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.querySelector('.menu-container');
    const barraLateral = document.querySelector('.barra-lateral');
    const contentWrapper = document.querySelector('.content-wrapper');
    const lupa = document.querySelector('.lupa');
    const areaPesquisa = document.querySelector('.barra-acima');
    const header = document.querySelector('header');
    const fecharPesquisa = document.querySelector('.simples-x-fechar');
    const inputPesquisa = document.querySelector('.pesquisa');
    const xInput = document.querySelector('.simples-x');




    if (menuContainer && barraLateral && contentWrapper) {
         
    
      menuContainer.addEventListener('click', () => {
      
        
        menuContainer.classList.toggle('open');
        barraLateral.classList.toggle('open');

        contentWrapper.style.transition = 'filter 1s ease';
        contentWrapper.style.filter = menuContainer.classList.contains('open')
          ? 'brightness(0.5)'
          : 'none';
       
      });


    }

    if (lupa && areaPesquisa && header) {
      lupa.addEventListener('click', () => {
        areaPesquisa.classList.add('active');
        header.classList.add('search-open');
      });
    }

    if (fecharPesquisa && areaPesquisa && header) {
      fecharPesquisa.addEventListener('click', () => {
        areaPesquisa.classList.remove('active');
        header.classList.remove('search-open');
      });
    }

    if (xInput && inputPesquisa) {
      xInput.addEventListener('click', () => {
        inputPesquisa.value = '';
      });
    }
  });
}
