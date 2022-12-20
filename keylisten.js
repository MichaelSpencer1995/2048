document.onkeydown = function(e) {
    e = e || window.event
    if(e.code == 'ArrowUp' || e.code == 'ArrowDown' || e.code == 'ArrowLeft' || e.code == 'ArrowRight') {
        if(!gameLocked) {
            main(e.code)
        }
    }
}

document.addEventListener('touchstart', handleTouchStart, false)
document.addEventListener('touchmove', handleTouchMove, false)

let xDown = null
let yDown = null

function getTouches(evt) {
    return evt.touches
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0]
    xDown = firstTouch.clientX
    yDown = firstTouch.clientY
}

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return
    }

    let xUp = evt.touches[0].clientX
    let yUp = evt.touches[0].clientY

    let xDiff = xDown - xUp
    let yDiff = yDown - yUp

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
        if ( xDiff > 0 ) {
            main('ArrowRight')
        } else {
            main('ArrowLeft')
        }
    } else {
        if ( yDiff > 0 ) {
            main('ArrowDowm')
        } else { 
            main('ArrowUp')
        }
    }

    xDown = null
    yDown = null
}

const restartButtons = document.getElementsByClassName('restart-button')
const continueGameButton = document.querySelector('.keep-playing-button')

restartButtons[0].onclick = function() { restartGame() }
restartButtons[1].onclick = function() { restartGame() }
continueGameButton.onclick = function() { continueGame() }
