const cpfInput = document.getElementById('cpf');
console.log("CARREGOU porra")

new Cleave('#cpf', {
    delimiters: ['.', '.', '-'],
    blocks: [3, 3, 3, 2],
    numericOnly: true
});
