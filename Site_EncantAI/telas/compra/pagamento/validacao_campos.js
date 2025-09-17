// ================================================
// 1. CARREGAMENTO INICIAL
// Aguarda o DOM estar totalmente carregado antes de executar
// ================================================
document.addEventListener("DOMContentLoaded", () => {

  // ================================================
  // 2. CONFIGURAÇÃO DE MÁSCARAS com Cleave.js 
  // (Biblioteca que  faz formatação automática aos inputs)
  // ================================================
  new Cleave('#numero-cartao', { creditCard: true });
  new Cleave('#validade-cartao', { date: true, datePattern: ['m', 'y'] });
  new Cleave('#cpf', {
    delimiters: ['.', '.', '-'],
    blocks: [3, 3, 3, 2],
    numericOnly: true
  });

  new Cleave('#cpf-boleto', {
    delimiters: ['.', '.', '-'],
    blocks: [3, 3, 3, 2],
    numericOnly: true
  });


   new Cleave('#cep', {
    delimiters: ['.'],
    blocks: [4,4],
    numericOnly: true
  });


  // ================================================
  // 3. SELEÇÃO DE ELEMENTOS DO DOM
  // Obtém referências aos inputs e botões necessários
  // ================================================
  const numeroInput         = document.getElementById('numero-cartao');
  const cpfInput            = document.getElementById('cpf');
  const cpfInputBoleto           = document.getElementById('cpf-boleto');
  const parcelamentoEl      = document.getElementById('parcelamento');
  const confirmarCompraBtn  = document.querySelector('.botao-confirmar-parcelamento');
  const cepInputBoleto                 = document.getElementById('cep')
  // ================================================
  // 4. RESET DE VALIDAÇÕES
  // Limpa mensagens customizadas quando o usuário digita
  // ================================================
  numeroInput.addEventListener('input', () => numeroInput.setCustomValidity(''));
  cpfInput.addEventListener('input',    () => cpfInput.setCustomValidity(''));
  cpfInputBoleto.addEventListener('input',    () => cpfInputBoleto.setCustomValidity(''));
  cepInputBoleto.addEventListener('input',    () => cepInputBoleto.setCustomValidity(''));

  // ================================================
  // 5 FLUXO DE SUBMISSÃO DO FORMULÁRIO
  // Intercepta o evento submit para validações customizadas (como o erro vai aparecer no html)
  // ================================================
  document.getElementById('form-cartao').addEventListener('submit', function (e) {
    e.preventDefault();

    const numeroCartao    = numeroInput.value;
    const cpf             = cpfInput.value;
    let valido            = true;

    // 5.2 Validação básica de CPF (11 dígitos não repetidos)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) {
      cpfInput.setCustomValidity('CPF inválido.');
      cpfInput.reportValidity();
      valido = false;
    } else {
      cpfInput.setCustomValidity('');
    }

  

    // 5.3 Exibição da próxima etapa (parcelamento)
    if (valido) {
      // Esconde o form de cartão e exibe o bloco de parcelamento
      document.querySelector('.detalhes-cartao').style.display = 'none';
      confirmarCompraBtn.style.display  = 'block';
      parcelamentoEl.style.display      = 'block';
    }
  });

   // ================================================
  // 6 FLUXO DE SUBMISSÃO DO FORMULÁRIO (só que pro boleto)
  // Intercepta o evento submit para validações customizadas (como o erro vai aparecer no html)
  // ================================================

    document.querySelector('.boleto').addEventListener('submit', function (e) {
    e.preventDefault();

    const  cep   = cepInputBoleto.value;
    const cpf            = cpfInputBoleto.value;
    let valido            = true;

   // 6.1 Validação de CEP (8 dígitos)
    const cepLimpo = cep.replace(/\D/g, '');  // remove tudo que não for número
    if (cepLimpo.length !== 8) {
      cepInputBoleto.setCustomValidity('CEP inválido. Deve conter 8 dígitos.');
      cepInputBoleto.reportValidity();
      valido = false;
    } else {
      cepInputBoleto.setCustomValidity('');
    }


    // 6.2 Validação básica de CPF (11 dígitos não repetidos)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) {
      cpfInputBoleto.setCustomValidity('CPF inválido.');
      cpfInputBoleto.reportValidity();
      valido = false;
    } else {
      cpfInputBoleto.setCustomValidity('');
    }

 

    // 6.3 Exibição da próxima etapa (boleto)
    if (valido) {
      // Esconde o form de boleto e exibe o QR-CODE e o código
      document.querySelector('.detalhes-boleto').style.display = 'none';
      document.querySelector(".boleto-section").style.display = 'block'
    }
  });
});