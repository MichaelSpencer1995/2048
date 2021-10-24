let model = []
let prevModel = []
let score = 0
let gameLocked = false
let gameOver

let currentHighScore = localStorage.getItem('highscore') || 0
let highScoreEl = document.querySelector('.best-container')
highScoreEl.innerHTML = (currentHighScore)
document.body.style.zoom = "80%"

function initModel() {
    let id = 0
    for(let i=0; i<4; i++) {
        for(let j=0; j<4; j++) {
            id++
            model.push({
                x: i,
                y: j,
                open: true,
                val: null,
                pairedOnce: false,
                newTile: false,
                id: id,
                toDeleteFromDom: false
            })
        }
    }
}

function addNew() {
    permuteModel('byOpen')
    let random = randomOpenTile()
    if(random == 'no open tiles') {        
        return
    }
    model[random].open = false
    model[random].val = weightedRandom({ 2:0.8, 4:0.2 })
    model[random].newTile = true
    if(randomOpenTile() == 'no open tiles') {
        gameOver = true
        model.forEach(tile => {
            checkForMatch(tile, "ArrowUp", true)
            checkForMatch(tile, "ArrowDown", true)
            checkForMatch(tile, "ArrowLeft", true)
            checkForMatch(tile, "ArrowRight", true)
        })
        if(gameOver) {
            let gameOverScreen = document.querySelector('.game-message')
            let gameOverText = document.querySelector('.game-message p')
            let keepPlaying = document.querySelector('.keep-playing-button')
            keepPlaying.classList.add('display-none')
            gameOverText.innerHTML = 'Game Over!'
            gameOverScreen.classList.add('game-over')
            if(score > currentHighScore) {
                localStorage.setItem('highscore', score)
            }
        }
    }
}

function permuteModel(type) {
    console.log(type)
    switch(type) {
        case 'ArrowUp':
            model.sort((a, b) => a.x - b.x || a.y - b.y)
            break
        case 'ArrowDown':
            model.sort((a, b) => a.x - b.x || b.y - a.y)
            break
        case 'ArrowLeft':
            model.sort((a, b) => a.y - b.y || a.x - b.x)
            break
        case 'ArrowRight':
            model.sort((a, b) => a.y - b.y || b.x - a.x)
            break
        case 'byOpen':
            model.sort((a, b) => b.open - a.open)
            break
    }
}
function main(dir) {
    // shift
    permuteModel(dir)
    prevModel = []
    model.forEach((v, i) => {
        const val = (typeof v === 'object') ? Object.assign({}, v) : v
        prevModel.push(val)
    })
    model.forEach(currentTile => {
        moveTile(currentTile, dir)
    })
    // match, matching leaves an open spot so all the tiles need to be shifted again
    permuteModel(dir)
    model.forEach(currentTile => {
        checkForMatch(currentTile, dir)
    })
    // shift again
    permuteModel(dir)
    console.log(model)
    model.forEach(currentTile => {
        console.log(currentTile)
        moveTile(currentTile, dir)
    })
    // remove all pairedOnce tags
    // (pairedOnce tags only exist so you dont double pair, if a row or column goes 2, 2, 4, combining all 3
    // into an 8 should take 2 moves not 1)
    model.forEach(currentTile => currentTile.pairedOnce = false)
    // add next piece and redraw
    permuteModel(dir)
    if(!moveMoot(prevModel, model)) {
        addNew()
    }
    draw()
    model.forEach(currentTile => currentTile.toDeleteFromDom = false)
}

function moveMoot(state1, state2) {
    let moveMoot = true
    for(let i=0; i<state1.length; i++) {
        if(!(state1[i].x == state2[i].x && state1[i].y == state2[i].y && state1[i].val == state2[i].val)) {
            moveMoot = false
        }
    }
    return moveMoot
}

function draw() {
    model.forEach(tile => {
        if(tile.toDeleteFromDom) {
            let original = prevModel.find(x => x.id === tile.id)
            let domTile = document.querySelector(`.tile-position-${original.x}-${original.y}`)
            domTile.remove()
        }
        if(tile.newTile) {
            let target = document.querySelector('.tile-container')
            let div1 = document.createElement('div')
            let div2 = document.createElement('div')
            let text = document.createTextNode(tile.val)
            div1.className = `tile tile-${tile.val} tile-position-${tile.x}-${tile.y} tile-new tile-${tile.val}`
            div2.className = `tile-inner`
            div2.appendChild(text)
            div1.appendChild(div2)
            target.appendChild(div1)
            tile.newTile = false
        } else if (tile.val) {
                let original = prevModel.find(x => x.id === tile.id)
                let domTile = document.querySelector(`.tile-position-${original.x}-${original.y}`)
                domTile.classList.remove(`tile-position-${original.x}-${original.y}`)
                domTile.classList.remove(`tile-${original.val}`)
                domTile.classList.add(`tile-position-${tile.x}-${tile.y}`)
                domTile.classList.add(`tile-${tile.val}`)
                domTile.firstChild.innerHTML = tile.val
        }
    })
}

function moveTile(tile, dir) {
    if(!tile.val) {
        return
    }
    let openTile = tileNextToIsOpen(tile, dir)
    if(openTile) {
        swapTiles(tile, openTile)
        moveTile(tile, dir)
    }
}

function tileNextToIsOpen(tile, dir) {
    let openTile
    let xshift = 0
    let yshift = 0
    switch(dir) {
        case 'ArrowUp':
            yshift = 1
            break
        case 'ArrowDown':
            yshift = -1
            break
        case 'ArrowLeft':
            xshift = 1
            break
        case 'ArrowRight':
            xshift = -1
            break
    }
    model.forEach(tileToCompareTo => {
        if(tile.x == tileToCompareTo.x + xshift && tile.y == tileToCompareTo.y + yshift && !tileToCompareTo.val) {
            openTile = tileToCompareTo
            return
        }
    })
    return openTile
}

function checkForMatch(tile, dir, gameoverCheck) {
    let tileMatch = tileNextToMatch(tile, dir)
    if(tileMatch) {
        if(!gameoverCheck) {
            swapTiles(tile, tileMatch, true)
        } else {
            gameOver = false
        }
    }
}

function tileNextToMatch(tile, dir) {
    let matchTile
    let xshift = 0
    let yshift = 0
    switch(dir) {
        case 'ArrowUp':
            yshift = 1
            break
        case 'ArrowDown':
            yshift = -1
            break
        case 'ArrowLeft':
            xshift = 1
            break
        case 'ArrowRight':
            xshift = -1
            break
    }
    model.forEach(tileToCompareTo => {
        if(tile.x == tileToCompareTo.x + xshift && tile.y == tileToCompareTo.y + yshift && tile.val == tileToCompareTo.val) {
            matchTile = tileToCompareTo
            return
        }
    })
    return matchTile
}

function swapTiles(cur, open, combine) {
    let cx = cur.x
    let cy = cur.y
    let ox = open.x
    let oy = open.y
    open.x = cx
    open.y = cy
    cur.x = ox
    cur.y = oy
    if(combine && !open.pairedOnce && cur.val) {
        let doubleVal = open.val * 2
        cur.pairedOnce = true
        cur.val = doubleVal
        open.val = null
        open.open = true
        open.toDeleteFromDom = true
        score += doubleVal
        let scoreAdder = document.querySelector('.score-add')
        document.querySelector('.score-container span').innerHTML = score
        if(score > currentHighScore) {
            highScoreEl.innerHTML = score
        }
        scoreAdder.innerHTML = '+' + score
        scoreAdder.classList.remove('score-addition')
        setTimeout(function() {
            scoreAdder.classList.add('score-addition')
        }, 50)

        if(doubleVal == 2048) {
            let winScreen = document.querySelector('.game-message')
            let winText = document.querySelector('.game-message p')
            winText.innerHTML = 'You Win!'
            winScreen.classList.add('game-won')
            gameLocked = true
        }
    }
}

function randomOpenTile() {
    let total = 0
    for(let i=0; i < model.length; i++) {
        if(model[i].open) {
            total++
        }
    }
    if(total == 0) {
        return 'no open tiles'
    }

    let random = Math.floor(Math.random() * total)
    return random
}

function randomValue() {
    return (Math.floor(Math.random() * 2) + 1) * 2
}

function weightedRandom(prob) {
    let i, sum=0, r=Math.random()
    for (i in prob) { 
        sum += prob[i]
        if (r <= sum) return i
    }
}

function restartGame() {
    model = []
    prevModel = []
    score = 0
    gameLocked = false
    gameOver = undefined
    document.querySelector('.score-container span').innerHTML = 0

    let container = document.querySelector('.tile-container')
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }

    let winScreen = document.querySelector('.game-message')
    let winText = document.querySelector('.game-message p')
    let keepPlaying = document.querySelector('.keep-playing-button')
    keepPlaying.classList.remove('display-none')
    winText.innerHTML = ''
    winScreen.classList.remove('game-won')
    winScreen.classList.remove('game-over')

    initModel()
    addNew()
    addNew()
    draw()
}

function continueGame() {
    let winScreen = document.querySelector('.game-message')
    let winText = document.querySelector('.game-message p')
    winText.innerHTML = ''
    winScreen.classList.remove('game-won')
    gameLocked = false 
}

initModel()
addNew()
addNew()
draw()