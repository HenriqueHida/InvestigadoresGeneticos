document.addEventListener('DOMContentLoaded', () => {
    const targetCodons = ['CGC', 'CCT', 'CGG', 'ATC', 'CGA', 'AAC', 'GCA', 'GGC', 'CAA'];
    const maxAttempts = 6;
    const codonLength = 3;
    let attempts = 0;

    const board = document.getElementById('board');
    const submitButton = document.getElementById('submit-button');
    const message = document.getElementById('message');

    // Create the game board
    for (let i = 0; i < maxAttempts * targetCodons.length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        
        const input = document.createElement('input');
        input.setAttribute('maxlength', codonLength.toString());
        input.classList.add('cell-input');
        cell.appendChild(input);
        
        board.appendChild(cell);
    }

    const inputs = document.querySelectorAll('.cell-input');

    // Function to move focus to the next input
    function moveFocus(event) {
        const target = event.target;
        const value = target.value.toUpperCase();
        target.value = value;

        if (value.length === codonLength && target.parentElement.nextElementSibling) {
            const nextInput = target.parentElement.nextElementSibling.querySelector('.cell-input');
            if (nextInput) nextInput.focus();
        }
    }

    inputs.forEach(input => {
        input.addEventListener('input', moveFocus);
    });

    // Function to get the current guess from the board
    function getGuess() {
        let guess = [];
        for (let i = attempts * targetCodons.length; i < (attempts + 1) * targetCodons.length; i++) {
            guess.push(inputs[i].value.toUpperCase());
        }
        return guess;
    }

    // Function to validate the guess
    function validateGuess(guess) {
        if (guess.length !== targetCodons.length || guess.some(codon => codon.length !== codonLength)) {
            message.textContent = 'Please enter valid 3-letter codons in all boxes.';
            return false;
        }
        return true;
    }

    // Handle guess submission
    submitButton.addEventListener('click', () => {
        const guess = getGuess();
        if (!validateGuess(guess)) return;

        if (attempts >= maxAttempts) {
            message.textContent = 'Game over! The correct codons were: ' + targetCodons.join(', ');
            return;
        }

        let tempTargetCodons = [...targetCodons];

        // First pass: check for correct codons
        for (let i = 0; i < targetCodons.length; i++) {
            const input = inputs[attempts * targetCodons.length + i];
            const cell = input.parentElement;
            const codon = guess[i];

            if (codon === targetCodons[i]) {
                cell.classList.add('correct');
                tempTargetCodons[i] = null; // Mark this codon as used
            }
        }

        // Second pass: check for present codons
        for (let i = 0; i < targetCodons.length; i++) {
            const input = inputs[attempts * targetCodons.length + i];
            const cell = input.parentElement;
            const codon = guess[i];

            if (!cell.classList.contains('correct')) {
                if (tempTargetCodons.includes(codon)) {
                    cell.classList.add('present');
                    tempTargetCodons[tempTargetCodons.indexOf(codon)] = null; // Mark this codon as used
                } else {
                    cell.classList.add('absent');
                }
            }
        }

        attempts++;

        if (JSON.stringify(guess) === JSON.stringify(targetCodons)) {
            message.textContent = 'Parabéns! Você acertou a sequência!';
        } else if (attempts === maxAttempts) {
            message.textContent = 'Fim de jogo! Os codos corretos são: ' + targetCodons.join(', ');
        }
    });
});
