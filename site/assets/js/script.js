document.addEventListener('DOMContentLoaded', () => {
    const genomeSequences = {
        oliver: [
            ['C', 'G', 'C', 'C', 'C', 'T', 'C', 'G', 'G'],
            ['A', 'T', 'C', 'C', 'G', 'A', 'A', 'A', 'C'],
            ['G', 'C', 'A', 'G', 'G', 'C', 'C', 'A', 'A']
        ],
        lorena: [
            ['C', 'T', 'G', 'A', 'A', 'T', 'A', 'A', 'A'],
            ['T', 'A', 'C', 'A', 'A', 'A', 'G', 'C', 'A'],
            ['A', 'A', 'C', 'A', 'A', 'A', 'C', 'T', 'C']
        ],
        joaquim: [
            ['T', 'C', 'A', 'C', 'A', 'A', 'T', 'A', 'T'],
            ['G', 'T', 'A', 'T', 'A', 'A', 'T', 'G', 'A'],
            ['T', 'T', 'C', 'C', 'C', 'A', 'A', 'G', 'G']
        ]
    };

    let genomeParts = genomeSequences['oliver'];
    const maxAttempts = 6;
    const allowedLetters = ['A', 'T', 'C', 'G', 'U'];
    const codonLength = 1;
    let attempts = 0;
    let currentPart = parseInt(localStorage.getItem('currentPart')) || 0;
    let selectedGenomeName = 'oliver';

    const board = document.getElementById('board');
    const submitButton = document.getElementById('submit-button');
    const message = document.getElementById('message');
    const discoveredGenomeList = document.getElementById('discovered-genome');
    const genomeSelect = document.getElementById('genome-select');

    const nucleotidePairs = {
        'A': ['T', 'U'],
        'C': ['G'],
        'G': ['C'],
        'T': ['A'],
        'U': ['A']
    };

    genomeSelect.addEventListener('change', (event) => {
        const selectedGenome = event.target.value;

        // Mostrar popup de confirmação ao tentar trocar de sequenciamento
        const confirmChange = confirm("Você está prestes a trocar de genoma e perderá todo o progresso atual. Tem certeza que deseja continuar?");
        if (!confirmChange) {
            // Se o usuário cancelar, resetar a seleção para o genoma atual
            genomeSelect.value = selectedGenomeName;
            return;
        }

        // Limpar o progresso atual
        localStorage.removeItem('currentPart');
        localStorage.removeItem('discoveredGenome');

        // Trocar para o novo sequenciamento
        selectedGenomeName = selectedGenome;
        genomeParts = genomeSequences[selectedGenome];
        currentPart = 0;
        attempts = 0;
        localStorage.setItem('currentPart', currentPart);

        createBoard();
        updateDiscoveredList();
        message.textContent = `Genoma alterado para ${selectedGenome}.`;
    });

    function createBoard() {
        board.innerHTML = '';
        updateGameStateDisplay();
        for (let i = 0; i < maxAttempts * genomeParts[currentPart].length; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const input = document.createElement('input');
            input.setAttribute('maxlength', codonLength.toString());
            input.classList.add('cell-input');
            cell.appendChild(input);
            board.appendChild(cell);

            if ((i + 1) % 3 === 0 && (i + 1) % genomeParts[currentPart].length !== 0) {
                const spacer = document.createElement('div');
                spacer.style.width = '20px';
                board.appendChild(spacer);
            }
        }

        const inputs = document.querySelectorAll('.cell-input');
        inputs.forEach(input => input.addEventListener('input', moveFocus));
    }

    function moveFocus(event) {
        const target = event.target;
        const value = target.value.toUpperCase();
        target.value = value;

        if (value.length === codonLength && target.parentElement.nextElementSibling) {
            const nextInput = target.parentElement.nextElementSibling.querySelector('.cell-input');
            if (nextInput) nextInput.focus();
        }
    }

    function getGuess() {
        let guess = [];
        const inputs = document.querySelectorAll('.cell-input');
        for (let i = attempts * genomeParts[currentPart].length; i < (attempts + 1) * genomeParts[currentPart].length; i++) {
            guess.push(inputs[i].value.toUpperCase());
        }
        return guess;
    }

    function validateGuess(guess) {
        if (guess.length !== genomeParts[currentPart].length || guess.some(letter => letter.length !== codonLength)) {
            message.textContent = 'Insira uma letra em cada célula.';
            return false;
        }
        return true;
    }

    function handleGuess(guess) {
        const targetCodons = genomeParts[currentPart];
        let tempTargetCodons = [...targetCodons];
        const inputs = document.querySelectorAll('.cell-input');

        for (let i = 0; i < targetCodons.length; i++) {
            const input = inputs[attempts * targetCodons.length + i];
            const cell = input.parentElement;
            const letter = guess[i];

            if (!allowedLetters.includes(letter)) {
                cell.classList.add('invalid');
                continue;
            }

            if (letter === targetCodons[i]) {
                cell.classList.add('correct');
                tempTargetCodons[i] = null;
            }
        }

        for (let i = 0; i < targetCodons.length; i++) {
            const input = inputs[attempts * targetCodons.length + i];
            const cell = input.parentElement;
            const letter = guess[i];

            if (!cell.classList.contains('correct') && !cell.classList.contains('invalid')) {
                if (nucleotidePairs[letter] && nucleotidePairs[letter].includes(targetCodons[i])) {
                    cell.classList.add('correspondent');
                    tempTargetCodons[i] = null;
                }
            }
        }

        for (let i = 0; i < targetCodons.length; i++) {
            const input = inputs[attempts * targetCodons.length + i];
            const cell = input.parentElement;
            const letter = guess[i];

            if (!cell.classList.contains('correct') && !cell.classList.contains('invalid') && !cell.classList.contains('correspondent')) {
                if (tempTargetCodons.includes(letter)) {
                    cell.classList.add('present');
                    tempTargetCodons[tempTargetCodons.indexOf(letter)] = null;
                } else {
                    cell.classList.add('absent');
                }
            }
        }

        attempts++;

        if (JSON.stringify(guess) === JSON.stringify(targetCodons)) {
            message.textContent = 'Parabéns! Você acertou a sequência!';
            saveDiscoveredPart(targetCodons);
            currentPart++;
            attempts = 0;
            localStorage.setItem('currentPart', currentPart);

            if (currentPart < genomeParts.length) {
                message.textContent += ' Avance para a próxima sequência!';
                createBoard();
            } else {
                const discovered = JSON.parse(localStorage.getItem('discoveredGenome')) || [];
                const fullSequence = discovered.join('-');
                message.textContent = `Sequenciamento ${selectedGenomeName}: ${fullSequence}`;
                localStorage.removeItem('currentPart');
                localStorage.removeItem('discoveredGenome');
            }
        } else if (attempts === maxAttempts) {
            message.textContent = 'Fim de jogo! A sequência correta era: ' + targetCodons.join(', ');
            currentPart++;
            attempts = 0;
            localStorage.setItem('currentPart', currentPart);

            if (currentPart < genomeParts.length) {
                createBoard();
            } else {
                message.textContent += ' Jogo finalizado.';
                localStorage.removeItem('currentPart');
            }
        }
    }

    function saveDiscoveredPart(part) {
        let discovered = JSON.parse(localStorage.getItem('discoveredGenome')) || [];
        discovered.push(part.join(''));
        localStorage.setItem('discoveredGenome', JSON.stringify(discovered));
        updateDiscoveredList();
    }

    function updateDiscoveredList() {
        discoveredGenomeList.innerHTML = '';
        const discovered = JSON.parse(localStorage.getItem('discoveredGenome')) || [];
        discovered.forEach((part, index) => {
            const li = document.createElement('li');
            li.textContent = `Genoma ${selectedGenomeName}, Parte ${index + 1}: ${part}`;
            discoveredGenomeList.appendChild(li);
        });
    }

    function updateGameStateDisplay() {
        const existingState = document.getElementById('game-state');
        if (existingState) existingState.remove();

        const gameState = document.createElement('div');
        gameState.id = 'game-state';
        gameState.textContent = `Parte ${currentPart + 1}`;
        gameState.style.textAlign = 'center';
        gameState.style.margin = '20px 0';

        board.parentElement.insertBefore(gameState, board);
    }

    submitButton.addEventListener('click', () => {
        const guess = getGuess();
        if (!validateGuess(guess)) return;
        handleGuess(guess);
    });

    createBoard();
    updateDiscoveredList();
});
