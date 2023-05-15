const canvas = document.querySelector('canvas')
const canvasWrapper = document.querySelector('.canvasWrapper')
const winScreen = document.querySelector('.winScreen')
let ctx
const points = document.querySelector('.points')


// checks if the user is using a browser that supports canvas
const checkCanvasSupport = () => {
    if (canvas.getContext) ctx = canvas.getContext('2d')
    else alert('Unfortunately your browser doesn\'t support canvas and can\'t load the game. Use a different browser that supports html canvas')
}
checkCanvasSupport()

console.log(canvas.width);
let game = {
    snakeColor: getComputedStyle(document.documentElement)
    .getPropertyValue('--snakeColor'),
    canvasBackgroundColor: getComputedStyle(document.documentElement)
    .getPropertyValue('--canvasBackgroundColor'),
    berryColor: getComputedStyle(document.documentElement)
    .getPropertyValue('--berryColor'),
    
    
    // canvas.width hasnt been set yet
    // canvasSize: canvas.width,
    gridSize: 15,
    // blockSize: canvas.width / game.gridSize,
    direction: 'right',
    body: [
        {
            x: 0,
            y: 0
        }
    ],
    position: {
        x: 0,
        y: 0
    },
    bodyLength: 3,
    controls: {
        up: ['w', 'ArrowUp'],
        left: ['a', 'ArrowLeft'],
        down: ['s', 'ArrowDown'],
        right: ['d', 'ArrowRight']
    },
    berryPosition: {
        // x: Math.floor(Math.random() * 10) * game.blockSize,
        // y: Math.floor(Math.random() * 10) * game.blockSize
    },
    berries: 0,
    timeScale: 1 / 6,
    canChangeDirection: true
}

function roundDownToMultiple(num, mult) {
    console.log(num - (num % mult))
    return num - (num % mult);
} 

// sets the starting canvas position
if (canvasWrapper.clientWidth < canvasWrapper.clientHeight) {
    console.log(canvasWrapper.clientWidth, canvasWrapper.clientHeight)
    console.log('a');

    canvas.width = roundDownToMultiple(canvasWrapper.clientWidth, game.gridSize)
    canvas.height = canvas.width
} else if (canvasWrapper.clientWidth > canvasWrapper.clientHeight) {
    console.log(canvasWrapper.clientWidth, canvasWrapper.clientHeight)
    console.log('b');

    canvas.width = roundDownToMultiple(canvasWrapper.clientHeight, game.gridSize)
    canvas.height = canvas.width
} else {
    console.log('huh')
}

// adds an event listener for when the user resizes the window
window.addEventListener('resize', (e) => {
    if (canvasWrapper.clientWidth < canvasWrapper.clientHeight) {
        canvas.width = roundDownToMultiple(canvasWrapper.clientWidth, game.gridSize)
        canvas.height = canvas.width
    } else if (canvasWrapper.clientWidth > canvasWrapper.clientHeight) {
        canvas.width = roundDownToMultiple(canvasWrapper.clientHeight, game.gridSize)
        canvas.height = canvas.width
    } else {
        console.log('huh')
    }
})

// must be after the canvas sizing so that the canvas.width is correct
game.canvasSize = canvas.width
game.blockSize = canvas.width / game.gridSize
game.berryPosition.x = Math.floor(Math.random() * game.gridSize) * game.blockSize
game.berryPosition.y = Math.floor(Math.random() * game.gridSize) * game.blockSize

function playerDeath() {
    clearInterval(playTime)

    winScreen.animate({top: '10%'}, {duration: 250, fill: 'forwards'})
}

function eatBerry() {
    // increments the length of the snakes body
    game.bodyLength++

    // increments points
    game.berries++

    // sets a new position for the berry
    game.berryPosition.x = Math.floor(Math.random() * game.gridSize) * game.blockSize
    game.berryPosition.y = Math.floor(Math.random() * game.gridSize) * game.blockSize

    function checkBerryPosWithBody() {
        game.body.forEach(block => {
            if (block.x == game.berryPosition.x && block.y == game.berryPosition.y) {
                game.berryPosition.x = Math.floor(Math.random() * game.gridSize) * game.blockSize
                game.berryPosition.y = Math.floor(Math.random() * game.gridSize) * game.blockSize

                checkBerryPosWithBody()
            }
        })
    }
    checkBerryPosWithBody()

    // sets the innerHTML of the points label
    points.innerHTML = `Points: ${game.berries}`
}

function moveSnake() {
    // allows the player to change direction
    // prevents the player from changing direction twice in 1 move, allowing them to change direction into themselves
    game.canChangeDirection = true

    // draw background
    ctx.fillStyle = game.canvasBackgroundColor
    ctx.fillRect(0, 0, game.canvasSize, game.canvasSize)

    // draw berry
    placeBerry()

    // sets the color for the snake
    ctx.fillStyle = game.snakeColor

    // draws each block of the body
    game.body.forEach(block => {
        ctx.fillRect(block.x, block.y, game.blockSize, game.blockSize)
    })

    // draws the head
    ctx.fillRect(game.position.x, game.position.y, game.blockSize, game.blockSize)

    // check for collisions with self
    game.body.forEach(block => {
        if (game.direction == 'up') {
            if (game.position.y + -game.blockSize == block.y && game.position.x == block.x) {
                // collision with self
                playerDeath()
            }
        } else if (game.direction == 'right') {
            if (game.position.x + game.blockSize == block.x && game.position.y == block.y) {
                // collision with self
                playerDeath()
            }
        } else if (game.direction == 'down') {
            if (game.position.y + game.blockSize == block.y && game.position.x == block.x) {
                // collision with self
                playerDeath()
            }
        } else if (game.direction == 'left') {
            if (game.position.x + -game.blockSize == block.x && game.position.y == block.y) {
                // collision with self
                playerDeath()
            }
        }
    }); 

    // check for collisions with wall and berries
    if (game.direction == 'up') {
        if (game.position.y + -game.blockSize < 0) {
            // collision with wall
            playerDeath()
            return
        }

        if (game.position.y + -game.blockSize == game.berryPosition.y && game.position.x == game.berryPosition.x) {
            // collision with berry
            eatBerry()
        }
    } else if (game.direction == 'right') {
        if (game.position.x + game.blockSize > game.canvasSize - game.blockSize) {
            // collision with wall
            playerDeath()
            return
        }

        if (game.position.x + game.blockSize == game.berryPosition.x && game.position.y == game.berryPosition.y) {
            // collision with berry
            eatBerry()
        }
    } else if (game.direction == 'down') {
        if (game.position.y + game.blockSize > game.canvasSize - game.blockSize) {
            // collision with wall
            playerDeath()
            return
        }

        if (game.position.y + game.blockSize == game.berryPosition.y && game.position.x == game.berryPosition.x) {
            // collision with berry
            eatBerry()
        }
    } else if (game.direction == 'left') {
        if (game.position.x + -game.blockSize < 0) {
            // collision with wall
            playerDeath()
            return
        }

        if (game.position.x + -game.blockSize == game.berryPosition.x && game.position.y == game.berryPosition.y) {
            // collision with berry
            eatBerry()
        }
    }
    
    // increments the position
    if (game.direction == 'up') {
        game.position.y += -game.blockSize
    } else if (game.direction == 'right') {
        game.position.x += game.blockSize
    } else if (game.direction == 'down') {
        game.position.y += game.blockSize
    } else if (game.direction == 'left') {
        game.position.x += -game.blockSize
    }

    // adds the position of the snake to the body array
    game.body.unshift({x: game.position.x, y: game.position.y})

    // removes last block of the body whenever the body length is lower than the 
    if (game.body.length > game.bodyLength) game.body.pop()
}

function placeBerry() {
    ctx.fillStyle = game.berryColor
    ctx.fillRect(game.berryPosition.x, game.berryPosition.y, game.blockSize, game.blockSize)
}

let playTime = setInterval(() => {
    moveSnake()
}, 1000 * game.timeScale);

// change direction
window.addEventListener('keydown', (e) => {
    // prevents the player from changing direction twice in 1 move, allowing them to change direction into themselves
    if (!game.canChangeDirection) return

    if (e.key == game.controls.up[0] || e.key == game.controls.up[1]) {
        if (game.direction == 'down') return
        game.direction = 'up'
    } else if (e.key == game.controls.left[0] || e.key == game.controls.left[1]) {
        if (game.direction == 'right') return
        game.direction = 'left'
    } else if (e.key == game.controls.down[0] || e.key == game.controls.down[1]) {
        if (game.direction == 'up') return
        game.direction = 'down'
    } else if (e.key == game.controls.right[0] || e.key == game.controls.right[1]) {
        if (game.direction == 'left') return
        game.direction = 'right'
    }

    // stops user from changing direction again until canChangeDirection is set to true after the next move
    game.canChangeDirection = false
})



// start and end variables to determine change
let touchstartX = 0
let touchendX = 0

let touchstartY = 0
let touchendY = 0
    
// determines which axis changed more 
// then what direction the user swiped on that axis
function checkDirection() {
    let xDif = Math.abs(touchstartX - touchendX)
    let yDif = Math.abs(touchstartY - touchendY)

    if (xDif > yDif) {
        if (touchendX < touchstartX) {
            // left
            if (game.direction == 'right') return
            game.direction = 'left'
        }
        if (touchendX > touchstartX) {
            // right
            if (game.direction == 'left') return
            game.direction = 'right'
        }
    } else if (yDif > xDif) {
        if (touchendY < touchstartY) {
            // up
            if (game.direction == 'down') return
            game.direction = 'up'
        }
        if (touchendY > touchstartY) {
            // down
            if (game.direction == 'up') return
            game.direction = 'down'
        }
    }
}

// sets the start variables
document.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX
    touchstartY = e.changedTouches[0].screenY
})

// sets the end variables
// and runs the function to determine the direction of the swipe
document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX
    touchendY = e.changedTouches[0].screenY
    checkDirection()
})