function createBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board;
}

function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < gLevel.SIZE; j++) {
            strHTML += `<td onclick="checkCell(this)" class="cover" oncontextmenu="markCell(this)" data-i="${i}" data-j="${j}"></td>`
        }
        strHTML += `</tr>`
    }
    document.querySelector('table').innerHTML = strHTML;
}

function getCellHTML(i, j) {
    if (gBoard[i][j].isMine) {
        return `${MINE}`
    } else {
        return checkMinesNegsCount(i, j);
    }
}

function renderCells(elCell, i, j) {
    var elCellContain = getCellHTML(i, j);
    if (elCell === MINE) elCell.innerText = elCellContain;
    elCell.innerText = (!elCellContain) ? '' : elCellContain;
    gBoard[i][j].isShown = true;
    elCell.classList.remove('cover');
    elCell.classList.add('open');
    if (!elCell.innerText) renderNeigCells(i, j);
}

function checkMinesNegsCount(rowIdx, colIdx) {
    var minesAroundCount = 0;
    for (var i = rowIdx - 1; i <= +rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= +colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (gBoard[i][j].isMine) minesAroundCount++
        }
    }
    gBoard[rowIdx][colIdx].minesAroundCount = minesAroundCount;
    return minesAroundCount;
}

function renderNeigCells(rowIdx, colIdx) {
    for (var i = +rowIdx - 1; i <= +rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = +colIdx - 1; j <= +colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (gBoard[i][j].isMine) continue;
            if (i === +rowIdx && j === +colIdx) continue;
            if (gBoard[i][j].isShown) continue;
            currCell = getCellByData(i, j)
            if (!checkMinesNegsCount(i, j)) {
                if (gBoard[i][j].isShown) continue;
                renderCells(currCell, i, j);
            } else {
                renderCell(currCell, i, j);
            }
        }
    }
}

function renderCell(elCell, i, j) {
    var elCellContain = getCellHTML(i, j);
    if (elCell === MINE) elCell.innerText = elCellContain;
    elCell.innerText = (!elCellContain) ? '' : elCellContain;
    elCell.classList.remove('cover');
    elCell.classList.add('open');
    gBoard[i][j].isShown = true;
}

function getCellByData(i, j) {
    var elcell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    return elcell;
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function startStopwatch() {
    if (gTimerRunning) return;
    gTimerRunning = true;
    startTime = Date.now();
    gStopwatchInterval = setInterval(renderTime, 500);
}

function renderTime() {

    var diff = Date.now() - startTime;

    var secs = Math.floor(diff / 1000);
    if (secs < 10) {
        secs = '00' + secs
    } else if (secs < 100) {
        secs = '0' + secs
    }

    var startStopwatch = document.querySelector('.stopwatch')
    startStopwatch.innerText = `${secs}`;
}
