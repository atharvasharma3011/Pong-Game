var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// Ball properties
var ballRadius = Math.min(canvas.width, canvas.height) * 0.03; // Increased ball radius
var ballX = canvas.width / 2; // Initial x position (center of the canvas)
var ballY = canvas.height - canvas.height * 0.02;
// Initial y position (center of the canvas)
var initialBallSpeedRatio = 0.001 // Initial speed ratio relative to canvas size
var initialBallSpeedX = window.innerWidth * initialBallSpeedRatio; // Initial speed along x-axis proportional to canvas size
var initialBallSpeedY = -window.innerHeight * initialBallSpeedRatio; // Initial speed along y-axis proportional to canvas size

var ballSpeedX = initialBallSpeedX;
var ballSpeedY = initialBallSpeedY;

// Paddle properties
var paddleWidth = canvas.width * 0.2; // Paddle width as a fraction of canvas width
var paddleHeight = canvas.height * 0.2; // Paddle height as a fraction of canvas height
var paddleX = (canvas.width - paddleWidth) / 2; // Initial x position of the paddle
var paddleY = canvas.height - paddleHeight * 1.5; // Initial y position of the paddle

// Arrow key states
var rightPressed = false;
var leftPressed = false;

// Game state
var gamePaused = true; // Game starts in paused state
var startTime = null;
var elapsedTime = 0;
var timerInterval;

// Last collision time
var lastCollisionTime = 0;

var hitCount = 0;
var missCount = 0;

var timerInterval;
var seconds = 0;
var minutes = 0;

// Function to handle minus button click
document.getElementById("minusBtn").addEventListener("click", function () {
  initialBallSpeedRatio -= 0.001; // Decrease the initial ball speed ratio
  if (initialBallSpeedRatio < 0) {
    initialBallSpeedRatio = 0; // Ensure the ratio doesn't go below 0
  }
  updateBallSpeed(); // Update the ball speed based on the new ratio
  updatespeedDisplay(); // Update the display to show the new ratio
});

// Function to handle plus button click
document.getElementById("plusBtn").addEventListener("click", function () {
  initialBallSpeedRatio += 0.001; // Increase the initial ball speed ratio
  if (initialBallSpeedRatio > 1) {
    initialBallSpeedRatio = 1; // Ensure the ratio doesn't exceed 1
  }
  updateBallSpeed(); // Update the ball speed based on the new ratio
  updatespeedDisplay(); // Update the display to show the new ratio
});

function updatespeedDisplay() {
  document.getElementById("numberDisplay").textContent = (
    initialBallSpeedRatio * 1000
  ).toFixed(); // Display the ball speed ratio multiplied by 1000 for better readability
}
// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Function to resize canvas based on window size while maintaining 1.618 aspect ratio
function resizeCanvas() {
  // Calculate the desired width based on the height to maintain 1.618 aspect ratio
  var desiredWidth = window.innerHeight * 1.618;

  // Ensure the desired width does not exceed the window width
  if (desiredWidth <= window.innerWidth) {
    canvas.width = desiredWidth;
    canvas.height = window.innerHeight;
  } else {
    // If the desired width exceeds the window width, use the window width and adjust the height
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth / 0.618;
  }

  // Adjust ball and paddle dimensions accordingly
  ballRadius = Math.min(canvas.width, canvas.height) * 0.05;
  paddleWidth = canvas.width * 0.2;
  paddleHeight = canvas.height * 0.05;
  paddleX = (canvas.width - paddleWidth) / 2;
  paddleY = canvas.height - paddleHeight * 1.5;

  draw(); // Redraw the elements after resizing
}

// Call resizeCanvas function when the page loads
window.onload = resizeCanvas;

// Call resizeCanvas function whenever the window is resized
window.onresize = resizeCanvas;

// Function to draw the ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

// Function to draw the paddle
function drawPaddle() {
  ctx.beginPath();
  var curveHeight = paddleHeight / 2; // Adjust curve height as needed

  // Top-left corner
  ctx.moveTo(paddleX, paddleY + curveHeight);
  ctx.quadraticCurveTo(paddleX, paddleY, paddleX + curveHeight, paddleY);

  // Top-right corner
  ctx.lineTo(paddleX + paddleWidth - curveHeight, paddleY);
  ctx.quadraticCurveTo(
    paddleX + paddleWidth,
    paddleY,
    paddleX + paddleWidth,
    paddleY + curveHeight
  );

  // Bottom-right corner
  ctx.lineTo(paddleX + paddleWidth, paddleY + paddleHeight - curveHeight);
  ctx.quadraticCurveTo(
    paddleX + paddleWidth,
    paddleY + paddleHeight,
    paddleX + paddleWidth - curveHeight,
    paddleY + paddleHeight
  );

  // Bottom-left corner
  ctx.lineTo(paddleX + curveHeight, paddleY + paddleHeight);
  ctx.quadraticCurveTo(
    paddleX,
    paddleY + paddleHeight,
    paddleX,
    paddleY + paddleHeight - curveHeight
  );

  // Closing the path
  ctx.closePath();

  ctx.fillStyle = "#ff7223";
  ctx.fill();
}

function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  minutes = 0;
  updateDisplay();
}

function updateTimer() {
  seconds++;
  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }
  updateDisplay();
}

function updateDisplay() {
  let displayMinutes = minutes < 10 ? "0" + minutes : minutes;
  let displaySeconds = seconds < 10 ? "0" + seconds : seconds;
  timerDisplay.textContent = "Time: " + displayMinutes + ":" + displaySeconds;
}

// Function to draw everything on the canvas
function draw() {
  canvas.style.backgroundColor = "#4c356b";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle();
  drawBall();

  // Display hit count
  ctx.font = "16px Arial";
  ctx.fillStyle = "#ffffff";

  //display score
  scoreDisplay.textContent = "Hit: " + hitCount;
  //display miss
  missDisplay.textContent = "Miss: " + missCount;

  // Display hit percentage
  percentageDisplay.textContent =
    "Score: " + calculateHitPercentage().toFixed() + "%";
  // Display elapsed time
}

// Function to update the ball's position and handle collisions with the paddle
function update() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Reverse direction if the ball hits the left or right of the canvas
  // Reverse direction if the ball hits the left or right of the canvas
  if (
    ballX + ballSpeedX > canvas.width - ballRadius ||
    ballX + ballSpeedX < ballRadius
  ) {
    ballSpeedX = -ballSpeedX;
  }
  // Reverse direction if the ball hits the top of the canvas
  if (ballY + ballSpeedY < ballRadius) {
    ballSpeedY = -ballSpeedY;
  }
  // Check if the ball misses the paddle
  if (ballY + ballSpeedY > canvas.height + ballRadius) {
    missCount++;
    resetBall();
  }

  // Check if the ball hits the paddle
  if (
    ballY + ballSpeedY > paddleY - ballRadius && // Check top edge of the ball
    ballY + ballSpeedY < paddleY + paddleHeight + ballRadius && // Check bottom edge of the ball
    ballX + ballSpeedX > paddleX - ballRadius && // Check left edge of the ball
    ballX + ballSpeedX < paddleX + paddleWidth + ballRadius // Check right edge of the ball
  ) {
    // Calculate the time elapsed since the last collision
    let currentTime = new Date().getTime();
    let timeElapsed = currentTime - lastCollisionTime;

    // Check if the time elapsed is at least 1 second
    if (timeElapsed >= 1000) {
      // Check if the ball touches the top edge of the paddle
      if (ballY + ballSpeedY <= paddleY) {
        handleHit();
        ballSpeedY = -ballSpeedY; // Reverse the vertical speed of the ball
        lastCollisionTime = currentTime; // Update the time of the last collision
      }
    }
  }
}

// Function to handle hits
function handleHit() {
  hitCount++;
}

// Function to handle misses
function handleMiss() {
  missCount++;
}

// Function to calculate hit percentage
function calculateHitPercentage() {
  if (hitCount + missCount === 0) {
    return 0; // Return 0 if no attempts have been made to avoid division by zero
  }
  return (hitCount / (hitCount + missCount)) * 100;
}

// Function to handle key down event
function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

// Function to handle key up event
function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// Event listeners for key events
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Function to update the paddle's position based on arrow key states
function updatePaddlePosition() {
  if (rightPressed && paddleX < canvas.width - paddleWidth * 1.1) {
    paddleX += canvas.width * 0.015; // Increase paddle speed
  } else if (leftPressed && paddleX > paddleHeight * 0.6) {
    paddleX -= canvas.width * 0.015; // Increase paddle speed
  }
}

// Function to display ball speed
function displayBallSpeed() {
  console.log("Ball SpeedX: " + ballSpeedX + ", Ball SpeedY: " + ballSpeedY);
}

// Function to animate the game
function animate() {
  if (!gamePaused) {
    updatePaddlePosition(); // Update the paddle's position
    update(); // Update the ball's position
    if (startTime === null) {
      startTime = Date.now(); // Start the timer
    }
    displayBallSpeed(); // Display the ball's speed
  }
  draw(); // Draw everything
  requestAnimationFrame(animate); // Loop the animation
}

// Start the animation
animate();

// Function to reset the ball position and speed
function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;

  // const randomDirection = [-1, 1][Math.floor(Math.random() * 2)];

  // // Set ball speed to initial values
  // ballSpeedX = initialBallSpeedX * randomDirection;
  // ballSpeedY = initialBallSpeedY;
  ballSpeedX = -initialBallSpeedX;
  ballSpeedY = initialBallSpeedY;
}

// Function to toggle game state between paused and running
function toggleGame() {
  gamePaused = !gamePaused;
  if (!gamePaused) {
    let pausedTime = Date.now() - startTime;
    startTime = Date.now() - pausedTime;
  }
}

// Event listener for start button click
document.getElementById("startButton").addEventListener("click", function () {
  startGame();
  startTimer();
});

// Function to start the game
function startGame() {
  if (gamePaused) {
    toggleGame(); // Start or resume the game
    document.getElementById("startButton").classList.add("d-none"); // Hide start button
    document.getElementById("stopButton").classList.remove("d-none"); // Show stop button
  }
}

// Event listener for stop button click
document.getElementById("stopButton").addEventListener("click", function () {
  stopGame();
  stopTimer();
});

// Function to stop the game
function stopGame() {
  if (!gamePaused) {
    toggleGame(); // Pause the game
    document.getElementById("startButton").classList.remove("d-none"); // Show start button
    document.getElementById("stopButton").classList.add("d-none"); // Hide stop button
  }
}

// Event listener for reset button click
document.getElementById("resetButton").addEventListener("click", function () {
  resetGame();
  resetTimer();
});

// Function to reset the game
function resetGame() {
  document.getElementById("startButton").classList.remove("d-none"); // Show start button
  document.getElementById("stopButton").classList.add("d-none"); // Hide stop button

  gamePaused = true; // Pause the game
  hitCount = 0; // Reset hit count
  missCount = 0; // Reset miss count
  elapsedTime = 0; // Reset elapsed time
  startTime = null; // Reset start time
  resetBall(); // Reset ball position and speed
  draw(); // Redraw the canvas
}

// Function to update ball speed based on canvas dimensions
function updateBallSpeed() {
  initialBallSpeedX = window.innerWidth * initialBallSpeedRatio; // Update initial speed along x-axis proportional to new canvas size
  initialBallSpeedY = -window.innerHeight * initialBallSpeedRatio; // Update initial speed along y-axis proportional to new canvas size
  ballSpeedX = initialBallSpeedX; // Reset ball speed along x-axis
  ballSpeedY = initialBallSpeedY; // Reset ball speed along y-axis
}

// Call updateBallSpeed function whenever the window is resized
window.addEventListener("resize", function () {
  updateBallSpeed(); // Update ball speed based on new canvas dimensions
});