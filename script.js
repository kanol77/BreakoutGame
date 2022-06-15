const canvas = document.getElementById("playfield");
const modal = document.getElementById("lost-modal");
const ctx = canvas.getContext('2d');
const scoreField = document.querySelector('.score');
const livesField = document.querySelector('.lives');
const lostPrompt = document.getElementById('lost-modal');

lostPrompt.addEventListener('click', () => {
    window.location.reload();
})

alert("You're about to start the game!");

canvas.width = 1900;
canvas.height = 1000;

let LIVES = 3;
let SCORE = 1;

let sfx = {
    paddleHit: new Howl({
        src: "./paddle-hit.mp3"
    }),
    tileBreak: new Howl({
        src: "./tile-hit.mp3"
    }),
    lose: new Howl({
        src: "./lose.mp3"
    }),
    win: new Howl({
        src: "./win.mp3"
    }),
    wallHitSfx: new Howl({
        src: "./wall-hit.mp3"
    }),
    lifeLost: new Howl({
        src: "./life-lost.mp3"
    })
}

//Controls

let leftArrowDown = false;
let rightArrowDown = false;

let randomStart = Math.random();

document.addEventListener('keydown', (e) => {
    if(e.key == "ArrowLeft"){
        leftArrowDown = true;
    }
    else if(e.key == "ArrowRight"){
        rightArrowDown = true;
    }
})

document.addEventListener('keyup', (e) => {
    if(e.key == "ArrowLeft"){
        leftArrowDown = false;
    }
    else if(e.key == "ArrowRight"){
        rightArrowDown = false;
    }
})

const paddle = {
    x:900,
    y:900,
    width: 200,
    height: 30,
    dx: 5,
    color: "#811331",
    stroke: "black"
}

const ball = {
    x:950,
    y:paddle.y-20,
    radius: 15,
    speed: 4,
    dx: 3,
    dy: -3,
    color: "cyan",
    stroke: "black"
}

const tile = {
    row:7,
    column:7,
    width:215,
    height:35,
    offset:50,
    margin: 50,
    color: "#AA4A44", //brickred :P
    stroke: "black"
}

let tiles = [];

function createTiles(){
    for(let i=0; i<tile.row; i++){
        tiles[i] = []
        for(let j=0; j<tile.column; j++){
            tiles[i][j] = {
                x: j*(tile.offset + tile.width) + tile.offset,
                y: i * (tile.offset + tile.height) + tile.offset + tile.margin,
                status: true
            }
        }
    }
}

function drawTiles(){
    for(let i=0; i<tile.row; i++){
        for(let j=0; j<tile.column; j++){
            if(tiles[i][j].status){
                ctx.fillStyle = tile.color;
                ctx.fillRect(tiles[i][j].x, tiles[i][j].y, tile.width, tile.height);
                ctx.strokeStyle = tile.stroke;
                ctx.strokeRect(tiles[i][j].x, tiles[i][j].y, tile.width, tile.height);
            }
        }
    }
}

function drawPaddle(){
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.lineWidth = 3;
    ctx.strokeStyle = paddle.stroke;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function movePaddle(){
    if(leftArrowDown && paddle.x >= 0){
        paddle.x -= paddle.dx;
    }
    if(rightArrowDown && paddle.x <= canvas.width-paddle.width){
        paddle.x += paddle.dx;
    }
}

function drawBall(){
    ctx.beginPath();

    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = ball.stroke;
    ctx.stroke();

    ctx.closePath();
}

function moveBall(){
    if(randomStart<0.5){
        ball.x += ball.dx;
    }
    else{
        ball.x += ball.dx * (-1);
    }
    ball.y += ball.dy;
}

function wallHit(){
    if(ball.x + ball.radius > canvas.width){
        sfx.wallHitSfx.play();
        ball.dx = ball.dx * (-1);
    }
    if(ball.x - ball.radius <= 0){
        sfx.wallHitSfx.play();
        ball.dx = ball.dx * (-1);
    }
    if(ball.y - ball.radius <= 0){
        sfx.wallHitSfx.play();
        ball.dy = ball.dy * (-1);
    }
    if(ball.y + ball.radius >= canvas.height){
        ball.dy = ball.dy * (-1);
        LIVES = LIVES - 1;
        if(LIVES!==0) sfx.lifeLost.play();
        scoreField.innerText = "Score: " + SCORE;
        livesField.innerText = LIVES + " Lives"
        if(LIVES > 0) resetBall();
        else{
            modal.innerText = "You Lost 😓 \n Your Score: " + SCORE + "\n \n Click here (or F5) to reset!";
            modal.show();
            sfx.lose.play();
            cancelAnimationFrame(req);
        }
        
    }   
}

function paddleHit(){
    if(ball.x + ball.radius <= paddle.x + paddle.width + 0.5 * ball.radius && ball.x + ball.radius >= paddle.x - ball.radius * 0.5 && ball.y + ball.radius < paddle.y + paddle.height && ball.y + ball.radius > paddle.y){
        ball.dy = -ball.dy;
        sfx.paddleHit.play();
    }
}

function tileHit(){
    for(let i=0; i<tile.row; i++){
        for(let j=0; j<tile.column; j++){
            let t = tiles[i][j];
            if(t.status){
                if(ball.x + ball.radius > t.x && ball.x + ball.radius < t.x + tile.width && ball.y + ball.radius > t.y && ball.y + ball.radius < t.y + tile.height){
                    sfx.tileBreak.play();
                    t.status = false;
                    ball.dy = ball.dy * (-1);
                    SCORE += 1;
                    scoreField.innerText = "Score: " + SCORE;
                }
            }
        }
    }
}

function resetBall(){
    let randomSide = Math.random();
    ball.x= 950;
    ball.y = paddle.y-20;
    ball.speed = 4;
    if(randomSide<=0.5) ball.dx = 3;
    else ball.dx = -3;
    ball.dy = -3;
}

const winningScore = tile.row * tile.column + 1;

function checkScore(){
    if(SCORE == winningScore){
        sfx.win.play();
        SCORE = SCORE + LIVES * 10;
        modal.innerText = "You Won! 😄 \n Your Score: " + SCORE + "\n \n Click here (or F5) to play again!";
        modal.show();
        cancelAnimationFrame(req);
    }
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBall();
    drawTiles();
}

function update(){
    movePaddle();  
    moveBall();
    wallHit();
    paddleHit();
    tileHit();
    checkScore();
}


function gameLoop(){

    draw();
    update();

    let req = window.requestAnimationFrame(gameLoop);
}

createTiles();
gameLoop();




