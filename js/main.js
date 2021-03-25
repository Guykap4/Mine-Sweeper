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
    SIZE: 4,
    MINES: 2,
    DIFF: 'easy',
}

var gBoard = [];
var gFirstClick = true;
var gTimerRunning = false;
var gStopwatchInterval;

function init() {
    gBoard = createBoard();
    renderBoard(gBoard);
    gGame.isOn = true;
    gFirstClick = true;
    renderHighScores();
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
            break;
        case 'medium':
            gLevel.MINES = 12;
            gGame.lifeCount = 3;
            gLevel.DIFF = elBtn.id;
            gLevel.SIZE = 8
            break;
        case 'hard':
            gLevel.MINES = 30;
            gGame.lifeCount = 3;
            gLevel.DIFF = elBtn.id;
            gLevel.SIZE = 12
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

// hints;