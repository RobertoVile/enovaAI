document.addEventListener("DOMContentLoaded", () =>{

function createModal() {
            // Estilos CSS em uma string
            const modalStyles = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    font-family: Arial, sans-serif;
                }

                .modal {
                    background-color: #f7f7f7;
                    border-radius: 15px;
                    padding: 40px 30px;
                    text-align: center;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    width: 90%;
                    max-width: 350px;
                    position: relative;
                }

                .modal-icon {
                    font-size: 50px;
                    margin-bottom: 20px;
                }

                .modal-icon .x-circle {
                    stroke: #d9534f;
                    fill: none;
                    stroke-width: 2px;
                }
                
                .modal h2 {
                    font-size: 24px;
                    color: #555;
                    margin: 0 0 10px;
                    font-weight: bold;
                }

                .modal p {
                    font-size: 16px;
                    color: #888;
                    margin: 0 0 20px;
                }

                .modal-ok-button {
                    background-color: #000;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: bold;
                    letter-spacing: 1px;
                    transition: background-color 0.3s;
                }

                .modal-ok-button:hover {
                    background-color: #333;
                }
            `;

            // Adiciona os estilos à página
            const styleSheet = document.createElement("style");
            styleSheet.innerText = modalStyles;
            document.head.appendChild(styleSheet);

            // Cria a estrutura HTML do modal
            const modalHTML = `
                <div id="reusableModal" class="modal-overlay">
                    <div class="modal">
                        <svg class="modal-icon" width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle class="x-circle" cx="12" cy="12" r="10"/>
                            <path class="x-path" d="M15 9L9 15M9 9L15 15" stroke="#d9534f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h2 id="modalTitle"></h2>
                        <p id="modalDescription"></p>
                        <button class="modal-ok-button" onclick="hideModal()">OK</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Função para mostrar o modal
        function showErrorModal(titleText, descriptionText) {
            const modal = document.getElementById('reusableModal');
            const titleElement = document.getElementById('modalTitle');
            const descriptionElement = document.getElementById('modalDescription');

            if (modal && titleElement && descriptionElement) {
                titleElement.textContent = titleText;
                descriptionElement.textContent = descriptionText;
                modal.style.display = 'flex';
            }
        }

        // Função para esconder o modal
        function hideModal() {
            const modal = document.getElementById('reusableModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }

        // Cria o modal quando a página é carregada
        window.onload = function() {
            createModal();
        };
})
