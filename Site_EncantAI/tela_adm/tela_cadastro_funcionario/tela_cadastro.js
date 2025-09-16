const cpfInput = document.getElementById('cpf');

new Cleave('#cpf', {
    delimiters: ['.', '.', '-'],
    blocks: [3, 3, 3, 2],
    numericOnly: true
});


function voltar(){
    window.history.back();
}