'use strict';

var MINE = '💣';
var FLAG = '🚩';


var gGame = {
    isOn: false,
    showCount: 0,
    markedCount: 0,
    lifeCount: 2,
}

var gLevel = {
    DIFF: 'easy',
    SIZE: 4,
    MINES: 2,
    HINTS: 1,
    SAFE: 1,
}

var gBoard = [];
var gFirstClick = true;
var gTimerRunning = false;
var gStopwatchInterval;
var gHintMode = false;

function init() {
    gBoard = createBoard();
    renderBoard(gBoard);
    gGame.isOn = true;
    gFirstClick = true;
    renderHighScores();
    renderSafeClick();
    renderHints();
}

function markCell(elCell) {
    if (!gGame.isOn) return;
    var i = elCell.getAttribute("data-i");
    var j = elCell.getAttribute("data-j");
    if (gBoard[i][j].isShown) return;
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        elCell.innerText = FLAG;
        checkVictory();
    } else {
        unMark(elCell, i, j);
    }
}

function checkCell(elCell) {
    var i = elCell.getAttribute("data-i");
    var j = elCell.getAttribute("data-j");
    if (!gGame.isOn) return;
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isShown) return;
    if (gHintMode) {
        hintreavel(elCell, i, j);
        gHintMode = false;
        document.querySelector('.helpers p').style.backgroundColor = "transparent";
        return;
    }
    if (gBoard[i][j].isMine) {
        if (gGame.lifeCount > 1) {
            loseLife();
            return;
        } else {
            loseLife();
        }
    }
    if (gFirstClick) {
        gFirstClick = false;
        putMines(i, j);
        startStopwatch();
    }
    gBoard[i][j].isShown = true;
    renderCells(elCell, i, j);
    checkVictory();
}

function loseLife() {
    gGame.lifeCount--;
    renderLifeCount();
    if (gGame.lifeCount <= 0) loseSequence();
}

function checkVictory() {
    if (checkMarkedMines() === gLevel.MINES && checkShownCount() === (gBoard.length ** 2) - gLevel.MINES) victorySequence();
}

function checkMarkedMines() {
    var markedMinesCount = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMarked && gBoard[i][j].isMine) markedMinesCount++;
        }
    }
    return markedMinesCount;
}

function checkShownCount() {
    var shownCount = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isShown) shownCount++;
        }
    }
    return shownCount;
}

function victorySequence() {
    gGame.isOn = false;
    var elBtn = document.querySelector('button');
    elBtn.innerText = '😅';
    clearInterval(gStopwatchInterval);
    renderHighScore();
}

function renderHighScore() {
    var currScore = +document.querySelector('.stopwatch').innerText;
    if (!localStorage.getItem(gLevel.DIFF)) {
        localStorage.setItem(`${gLevel.DIFF}`, `${currScore}`)
        var scoreSpan = document.querySelector(`[data-diff="${gLevel.DIFF}"]`);
        scoreSpan.innerText = currScore;
    } else if (currScore < localStorage.getItem(gLevel.DIFF)) {
        localStorage.setItem(`${gLevel.DIFF}`, `${currScore}`);
        var scoreSpan = document.querySelector(`[data-diff="${gLevel.DIFF}"]`);
        scoreSpan.innerText = currScore;
    }
}

function renderHighScores() {
    var easyscore = localStorage.getItem('easy');
    var mediumScore = localStorage.getItem('medium');
    var hardScore = localStorage.getItem('hard');

    var easySpan = document.querySelector(`[data-diff="easy"]`);
    var mediumSpan = document.querySelector(`[data-diff="medium"]`);
    var hardSpan = document.querySelector(`[data-diff="hard"]`);

    var scoresModes = [{ score: easyscore, span: easySpan }, { score: mediumScore, span: mediumSpan }, { score: hardScore, span: hardSpan }];

    for (var i = 0; i < scoresModes.length; i++) {
        scoresModes[i].span.innerText = scoresModes[i].score;
    }
}

function loseSequence() {
    gGame.isOn = false;
    var elBtn = document.querySelector('button');
    elBtn.innerText = '☠️';
    showMines();
    clearInterval(gStopwatchInterval);
}

function resetGame() {
    gBoard = createBoard();
    renderBoard(gBoard);
    var elBtn = document.querySelector('button');
    restoreLife();
    renderLifeCount();
    restoreClicks();
    renderSafeClick();
    renderHints();
    elBtn.innerText = '🥵';
    gGame.isOn = true;
    gFirstClick = true;
    clearInterval(gStopwatchInterval);
    gTimerRunning = false;
    var startStopwatch = document.querySelector('.stopwatch')
    startStopwatch.innerText = `000`;
}


function changeDiff(elBtn) {
    switch (elBtn.id) {
        case 'easy':
            gLevel.MINES = 2;
            gGame.lifeCount = 2;
            gLevel.DIFF = elBtn.id;
            gLevel.SIZE = 4
            gLevel.SAFE = 1;
            gLevel.HINTS = 1;
            break;
        case 'medium':
            gLevel.MINES = 12;
            gGame.lifeCount = 3;
            gLevel.DIFF = elBtn.id;
            gLevel.SIZE = 8
            gLevel.SAFE = 2;
            gLevel.HINTS = 2;
            break;
        case 'hard':
            gLevel.MINES = 30;
            gGame.lifeCount = 3;
            gLevel.DIFF = elBtn.id;
            gLevel.SIZE = 12
            gLevel.SAFE = 3;
            gLevel.HINTS = 3;
            break;
    }
    gBoard = createBoard();
    renderBoard(gBoard);
    renderLifeCount();
    gGame.isOn = true;
    gFirstClick = true;
    clearInterval(gStopwatchInterval);
    var startStopwatch = document.querySelector('.stopwatch')
    startStopwatch.innerText = `000`;
    renderSafeClick();
    renderHints();
}

function putMines(rowIdx, colIdx) {
    var cells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (i === +rowIdx && j === +colIdx) continue;
            cells.push({ i: i, j: j })
        }
    }
    for (var k = 0; k < gLevel.MINES; k++) {
        var randomIdx = getRandomInteger(0, cells.length);

        var currPos = cells.splice(randomIdx, 1);
        gBoard[currPos[0].i][currPos[0].j].isMine = true;
    }
}

function unMark(elCell, i, j) {
    gBoard[i][j].isMarked = false;
    elCell.innerText = '';
}

function renderLifeCount() {
    var elLives = document.querySelector('.livesCount');
    elLives.innerText = `LIVES LEFT: ${gGame.lifeCount}`;
    switch (gGame.lifeCount) {
        case 1:
            elLives.style.color = 'yellow';
            break;
        case 0:
            elLives.style.color = 'red';
            break;
        default:
            elLives.style.color = 'white';
            break;
    }
}

function restoreLife() {
    gGame.lifeCount = (gLevel.DIFF === 'easy') ? 2 : 3;
}

function showMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var elCell = getCellByData(i, j);
            if (gBoard[i][j].isMine) renderCell(elCell, i, j);
        }
    }
}

function hintClick(elPar) {
    if (!gGame.isOn) return;
    if (gFirstClick) return;
    if (gHintMode) {
        gLevel.HINTS++;
        gHintMode = false;
        renderHints();
        elPar.style.backgroundColor = "transparent";
        return;
    }
    if (!gLevel.HINTS) return;
    console.log('hint');
    gHintMode = true;
    gLevel.HINTS--;
    elPar.style.backgroundColor = "rgba(255, 255, 0, 0.5)";
    renderHints();
}

function hintreavel(elCell, rowIdx, colIdx) {
    for (var i = +rowIdx - 1; i <= +rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = +colIdx - 1; j <= +colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (gBoard[i][j].isShown) continue;
            if (gBoard[i][j].isMarked) continue;
            var currElCell = getCellByData(i, j);
            if (gBoard[i][j].isMine) {
                currElCell.innerText = MINE;
            } else {
                var currCellMineCount = getMineCount(i, j);
                currElCell.innerText = currCellMineCount;
            }
        }
    }
    setTimeout(makeBlank, 1000, rowIdx, colIdx)
}

function getMineCount(rowIdx, colIdx) {
    var mineCount = 0;
    for (var i = +rowIdx - 1; i <= +rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = +colIdx - 1; j <= +colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (gBoard[i][j].isMine) mineCount++
        }
    }
    return mineCount;
}

function safeClick() {
    if (!gGame.isOn) return;
    if (gFirstClick) return;
    if (!gLevel.SAFE) return;
    gLevel.SAFE--;
    var cells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isShown) continue;
            cells.push({ i: i, j: j });
        }
    }
    var cellPos = cells.splice(getRandomInteger(0, cells.length), 1);
    var elCurrCell = getCellByData(cellPos[0].i, cellPos[0].j);
    elCurrCell.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
    setTimeout(makePurple, 1000, elCurrCell);
    renderSafeClick();
}

function makePurple(elCurrCell) {
    elCurrCell.style.backgroundColor = '#42396d';
}

function restoreClicks() {
    switch (gLevel.DIFF) {
        case 'easy':
            gLevel.SAFE = 1;
            gLevel.HINTS = 1;
            break;
        case 'medium':
            gLevel.SAFE = 2;
            gLevel.HINTS = 2;
            break;
        case 'hard':
            gLevel.SAFE = 3;
            gLevel.HINTS = 3;
            break;
    }
}

function renderSafeClick() {
    var safeSpan = document.querySelector('#safe')
    safeSpan.innerText = '0' + gLevel.SAFE;
}

function renderHints() {
    var safeSpan = document.querySelector('#hint')
    safeSpan.innerText = '0' + gLevel.HINTS;
}

function makeBlank(rowIdx, colIdx) {
    for (var i = +rowIdx - 1; i <= +rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = +colIdx - 1; j <= +colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (gBoard[i][j].isShown) continue;
            if (gBoard[i][j].isMarked) continue;
            var currElCell = getCellByData(i, j);
            currElCell.innerText = '';
        }
    }
}