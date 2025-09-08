
import { HeaderFuncoes } from "../../../header.js";
HeaderFuncoes()


// 2. Execução após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {

  // 3. Seleção dos títulos de filtros
  const headersCategoria = document.querySelectorAll('.filter-title');
  const headersTamanho = document.querySelectorAll('.filter-title-opcao');

  // 4. Evento de clique para filtros de categoria
  headersCategoria.forEach(header => {
    header.addEventListener('click', function() {
      const section = this.parentElement;
      section.classList.toggle('show-options');

      const arrow = this.querySelector('.arrow');
      if (arrow) {
        arrow.classList.toggle('rotated');
      }
    });
  });

  // 5. Evento de clique para filtros de tamanho
  headersTamanho.forEach(header => {
    header.addEventListener('click', function() {
      const section = this.parentElement;
      section.classList.toggle('show-sizes');

      const arrow = this.querySelector('.arrow-opcao');
      if (arrow) {
        arrow.classList.toggle('rotated');
      }
    });
  });

});
