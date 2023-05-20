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
    bodyLength: 2,
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
    canChangeDirection: true,
    backgroundTiles: [
        new Image(),
        new Image(),
        new Image(),
        new Image()
    ],
    berryTile: new Image(),
    snakeTiles: {
        curved: [
            new Image(),
            new Image(),
            new Image(),
            new Image()
        ],
        straight: [
            new Image(),
            new Image()
        ],
        head: [
            new Image(),
            new Image(),
            new Image(),
            new Image()
        ],
        tail: [
            new Image(),
            new Image(),
            new Image(),
            new Image()
        ]
    }
}
game.backgroundTiles.forEach((img, i) => {
    img.src = `../production/tiles/sandTile${i}.png`
})
game.berryTile.src = '../production/tiles/berryTile.png'
game.snakeTiles.head.forEach((img, i) => {
    img.src = `../production/tiles/snakeface${i}.png`
})
game.snakeTiles.tail.forEach((img, i) => {
    img.src = `../production/tiles/snaketail${i}.png`
})
game.snakeTiles.straight.forEach((img, i) => {
    img.src = `../production/tiles/snakebody${i}.png`
})
game.snakeTiles.curved.forEach((img, i) => {
    img.src = `../production/tiles/snakerotate${i}.png`
})

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

function drawSnake() {
    // draws the tail of the snake
    // called from drawBody()
    function drawTail(block, i) {
        if (game.body[i].x > game.body[i - 1].x) {
            ctx.drawImage(game.snakeTiles.tail[3], block.x, block.y, game.blockSize, game.blockSize)
        } else if (game.body[i].x < game.body[i - 1].x) {
            ctx.drawImage(game.snakeTiles.tail[1], block.x, block.y, game.blockSize, game.blockSize)
        } else if (game.body[i].y > game.body[i - 1].y) {
            ctx.drawImage(game.snakeTiles.tail[0], block.x, block.y, game.blockSize, game.blockSize)
        } else if (game.body[i].y < game.body[i - 1].y) {
            ctx.drawImage(game.snakeTiles.tail[2], block.x, block.y, game.blockSize, game.blockSize)
        } 
    }

    // draws the body of each block
    drawBody()
    function drawBody() {
        if (game.body.length >= 2) {
            game.body.forEach((block, i) => {
                if (i < 1) return 
    
                // checks if its the tail
                if (!game.body[i + 1]) {
                    drawTail(block, i)
                    return
                }
                
                // checks if its a corner
                if (game.body[i].x > game.body[i-1].x && game.body[i].y > game.body[i+1].y || game.body[i].y > game.body[i-1].y && game.body[i].x > game.body[i+1].x) {
                    // down left || right up
                    ctx.drawImage(game.snakeTiles.curved[2], block.x, block.y, game.blockSize, game.blockSize)
                    return
                } else if (game.body[i].x < game.body[i-1].x && game.body[i].y > game.body[i+1].y || game.body[i].y > game.body[i-1].y && game.body[i].x < game.body[i+1].x) {
                    // down right || left up
                    ctx.drawImage(game.snakeTiles.curved[3], block.x, block.y, game.blockSize, game.blockSize)
                    return
                } else if (game.body[i].x > game.body[i-1].x && game.body[i].y < game.body[i+1].y || game.body[i].y < game.body[i-1].y && game.body[i].x > game.body[i+1].x) {
                    // up left || right down
                    ctx.drawImage(game.snakeTiles.curved[1], block.x, block.y, game.blockSize, game.blockSize)
                    return
                } else if (game.body[i].x < game.body[i-1].x && game.body[i].y < game.body[i+1].y || game.body[i].y < game.body[i-1].y && game.body[i].x < game.body[i+1].x) {
                    // up right || left down
                    ctx.drawImage(game.snakeTiles.curved[0], block.x, block.y, game.blockSize, game.blockSize)
                    return
                }
    
                if (game.body[i].x > game.body[i - 1].x || game.body[i].x < game.body[i - 1].x) {
                    // draws horizontal snake block
                    ctx.drawImage(game.snakeTiles.straight[1], block.x, block.y, game.blockSize, game.blockSize)
                } else if (game.body[i].y < game.body[i - 1].y || game.body[i].y > game.body[i - 1].y) {
                    // draws horizontal snake block
                    ctx.drawImage(game.snakeTiles.straight[0], block.x, block.y, game.blockSize, game.blockSize)
                }
            })
        }
    }

    // draws the head
    drawHead()
    function drawHead() {
        if (!game.body[1]) {
            if (game.direction == 'up') {
                ctx.drawImage(game.snakeTiles.head[0], game.body[0].x, game.body[0].y, game.blockSize, game.blockSize)
            } else if (game.direction == 'down') {
                ctx.drawImage(game.snakeTiles.head[2], game.body[0].x, game.body[0].y, game.blockSize, game.blockSize)
            } else if (game.direction == 'left') {
                ctx.drawImage(game.snakeTiles.head[3], game.body[0].x, game.body[0].y, game.blockSize, game.blockSize)
            } else if (game.direction == 'right') {
                ctx.drawImage(game.snakeTiles.head[1], game.body[0].x, game.body[0].y, game.blockSize, game.blockSize)
            }
        } else {
            if (game.body[0].y < game.body[1].y) {
                ctx.drawImage(game.snakeTiles.head[0], game.body[0].x, game.body[0].y, game.blockSize, game.blockSize)
            } else if (game.body[0].y > game.body[1].y) {
                ctx.drawImage(game.snakeTiles.head[2], game.body[0].x, game.body[0].y, game.blockSize, game.blockSize)
            } else if (game.body[0].x < game.body[1].x) {
                ctx.drawImage(game.snakeTiles.head[3], game.body[0].x, game.body[0].y, game.blockSize, game.blockSize)
            } else if (game.body[0].x > game.body[1].x) {
                ctx.drawImage(game.snakeTiles.head[1], game.body[0].x, game.body[0].y, game.blockSize, game.blockSize)
            }
        }
    }
}

function moveSnake() {
    // allows the player to change direction
    // prevents the player from changing direction twice in 1 move, allowing them to change direction into themselves
    game.canChangeDirection = true

    checkSnakeCollisions()
    
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

function checkSnakeCollisions() {
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
}

function placeBerry() {
    // exact hitbox
    // ctx.fillStyle = game.berryColor
    // ctx.fillRect(game.berryPosition.x, game.berryPosition.y, game.blockSize, game.blockSize)

    // image sprite
    ctx.drawImage(game.berryTile, game.berryPosition.x, game.berryPosition.y, game.blockSize, game.blockSize)
}

function drawBackground() {
    // draw background
    for (let col = 0; col < game.gridSize; col++) {
        for (let row = 0; row < game.gridSize; row++) {
            // draws in a grid
            ctx.strokeStyle = 'rgb(0,0,0,0.2)'
            ctx.lineWidth = '1'
            ctx.strokeRect(col * game.blockSize, row * game.blockSize, game.blockSize, game.blockSize)

            // converts the specific cell index into base 4
            let cell = col * game.gridSize + row
            cell %= 4
            
            // draws in the tiles image
            ctx.drawImage(game.backgroundTiles[cell], col * game.blockSize, row * game.blockSize, game.blockSize, game.blockSize)
        }
    }
}

let playTime = setInterval(() => {
    // draws background
    drawBackground()

    // draws berry
    placeBerry()

    // draws the snake
    drawSnake()

    // adjusts the snakes position
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

enableMobileControls()
function enableMobileControls() {
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
}