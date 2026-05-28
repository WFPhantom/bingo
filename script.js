let inputs = [];
const letters = 'abcdefghijklmnopqrstuvwx'.split('');

fetch('input.txt')
    .then(response => response.text())
    .then(text => {
        inputs = text.trim().split('\n');
        loadBingoGrid();
    });

function shuffleArray(array, seed) {
    let random = seedRandom(seed);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function seedRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return function () {
        x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
}

function saveBingoGrid() {
    const gridState = [];
    document.querySelectorAll('.bingo-square').forEach((square) => {
        gridState.push({
            text: square.textContent,
            clicked: square.classList.contains('clicked')
        });
    });
    localStorage.setItem('bingoGridTGA', JSON.stringify(gridState));
    localStorage.setItem('bingoSeedTGA', document.getElementById('current-seed').textContent);
}

function loadBingoGrid() {
    const savedGrid = localStorage.getItem('bingoGridTGA');
    const savedSeed = localStorage.getItem('bingoSeedTGA');
    if (savedGrid && savedSeed) {
        document.getElementById('current-seed').textContent = savedSeed;
        const gridState = JSON.parse(savedGrid);
        renderGrid(gridState.map(s => s.text), gridState.map(s => s.clicked));
    } else generateBingoGrid();
}

function generateBingoGrid() {
    let seedInput = document.getElementById('seed-input').value;
    let preselectedLetters = '';
    if (seedInput.includes('.')) [seedInput, preselectedLetters] = seedInput.split('.');
    if (!seedInput) seedInput = Math.random().toString();
    else if (!seedInput.startsWith('0.')) seedInput = '0.' + seedInput;
    document.getElementById('current-seed').textContent = `Seed: ${seedInput.substring(2)}.${preselectedLetters}`;
    const shuffledInputs = shuffleArray(inputs.slice(), seedInput).slice(0, 24);
    const clickedStates = shuffledInputs.map((_, i) => preselectedLetters.includes(letters[i]));
    renderGrid(shuffledInputs, clickedStates);
    saveBingoGrid();
}

function updateSeed(square, index) {
    const currentSeedElement = document.getElementById('current-seed');
    let currentSeedText = currentSeedElement.textContent.replace('Seed: ', '');
    let [seed, preselectedLetters] = currentSeedText.split('.');
    preselectedLetters = preselectedLetters || '';
    const letter = letters[index];
    if (square.classList.contains('clicked')) {
        if (!preselectedLetters.includes(letter)) preselectedLetters += letter;
    } else preselectedLetters = preselectedLetters.replace(letter, '');
    currentSeedElement.textContent = `Seed: ${seed}.${preselectedLetters}`;
}

function adjustFontSize(element) {
    const maxFontSize = 16;
    const minFontSize = 8;
    let fontSize = maxFontSize;
    element.style.fontSize = fontSize + 'px';
    while (element.scrollHeight > element.clientHeight && fontSize > minFontSize) {
        fontSize--;
        element.style.fontSize = fontSize + 'px';
    }
}

function renderGrid(squareTexts, clickedStates) {
    const grid = document.querySelector('.bingo-grid');
    grid.innerHTML = '';

    const columns = ['B', 'I', 'N', 'G', 'O'];
    columns.forEach(column => {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('bingo-column');
        columnDiv.textContent = column;
        grid.appendChild(columnDiv);
    });

    for (let i = 0; i < 25; i++) {
        const square = document.createElement('div');
        square.classList.add('bingo-square');

        if (i === 12) {
            const img = document.createElement('img');
            img.src = 'tgalogo.svg';
            img.alt = 'tgalogo';
            square.appendChild(img);
            square.style.cursor = 'default';
            square.innerHTML += '<span class="free-text">WORLD PREMIERE</span>';
        } else {
            const dataIndex = i > 12 ? i - 1 : i;
            square.textContent = squareTexts[dataIndex];
            if (clickedStates[dataIndex]) square.classList.add('clicked');
            (function(dataIndex) {
                square.addEventListener('click', () => {
                    square.classList.toggle('clicked');
                    updateSeed(square, dataIndex);
                    saveBingoGrid();
                });
            })(dataIndex);
        }
        grid.appendChild(square);
        adjustFontSize(square);
    }
}

document.querySelector('.generate-button').addEventListener('click', generateBingoGrid);