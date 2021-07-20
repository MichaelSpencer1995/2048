document.onkeydown = function(e) {
    e = e || window.event
    if(e.code == 'ArrowUp' || e.code == 'ArrowDown' || e.code == 'ArrowLeft' || e.code == 'ArrowRight') {
        if(!gameLocked) {
            main(e.code)
        }
    }
}

const restartButtons = document.getElementsByClassName('restart-button')
const continueGameButton = document.querySelector('.keep-playing-button')

restartButtons[0].onclick = function() { restartGame() }
restartButtons[1].onclick = function() { restartGame() }
continueGameButton.onclick = function() { continueGame() }
