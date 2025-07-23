document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem("username");

    // ✅ Fetch and Display High Score
    if (username) {
        try {
            const response = await fetch(`/get_score?username=${username}`);
            const data = await response.json();
            document.getElementById("high-score").innerText = data.high_score;
        } catch (error) {
            console.error('Error fetching score:', error);
        }
    }

    // ✅ Start the Game Logic
    const words = ["legal", "chaos", "dress", "pizza", "daily", "country", "concile", "accept"];
    const colors = ['pink', 'lightblue', 'lightgreen', 'yellow', 'coral', 'violet', 'lightcoral', 'lightgoldenrodyellow', 'lightseagreen', 'lightsalmon'];

    const gameContainer = document.getElementById('game-container');
    const boundary = document.getElementById('boundary');
    let gameOver = false;
    let currentScore = 0;
    let currentGameLevel = 1; // Track the current game level

    const currentScoreElement = document.getElementById("current-score");

    function updateScore() {
        currentScore++;
        currentScoreElement.innerText = `${currentScore}`;
    }

    // Continue with your game logic here...
    function showLevelStartMessage(level) {
        return new Promise((resolve) => { // ✅ Promise starts
            const messageContainer = document.createElement('div');
            messageContainer.classList.add('level-start-message');

            // GIF element
            const gif = document.createElement('img');
            gif.src = '/static/images/hurray.gif'; // Update this path with your actual GIF location
            gif.alt = 'Get Ready!';

            // Message element
            const message = document.createElement('p');
            message.innerHTML = `<p> Quick! The stars are slipping from the sky - type fast to save the night! </p>`;

            messageContainer.appendChild(gif);
            messageContainer.appendChild(message);
            document.body.appendChild(messageContainer);

            // Hide message after 3 seconds and start the game
            setTimeout(() => {
                messageContainer.remove(); // Remove the message
                resolve(); // ✅ This tells JavaScript that the message has disappeared
            }, 3000);
        });
    }

    // ✅ Function to start the level AFTER the message disappears
    function startLevel() {
        createCountdown(); // Start countdown
        let spawnRate = 3000; // Medium level: Balloon appears every 2.5s
        let minSpeed = 7; // Medium level: Balloons fall between 5s to 7s
        let maxSpeed = 9;

        balloonCreationInterval = setInterval(() => createBalloon(minSpeed, maxSpeed), spawnRate);
        boundaryCheckInterval = setInterval(checkBoundaryCollision, 50);
        document.addEventListener('keypress', checkWord);
    }

    // ✅ Call the function and start the game ONLY after the message disappears
    showLevelStartMessage(currentGameLevel).then(() => {
        startLevel(); // Game starts only after the message disappears
    });


    function createBalloon(minSpeed = 7, maxSpeed = 9) {
        if (gameOver || words.length === 0) return;

        const randomIndex = Math.floor(Math.random() * words.length);
        const word = words.splice(randomIndex, 1)[0];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        balloon.style.backgroundColor = color;
        balloon.style.left = `${Math.random() * (gameContainer.clientWidth - 80)}px`;

        // Set balloon fall speed dynamically
        balloon.style.animationDuration = `${Math.random() * (maxSpeed - minSpeed) + minSpeed}s`;

        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word');
        wordDiv.textContent = word;
        balloon.appendChild(wordDiv);

        gameContainer.appendChild(balloon);
    }

    function updateScore() {
        currentScore++;
        currentScoreElement.innerText = `Score: ${currentScore}`;
    }


    function checkWord(event) {
        if (gameOver) return; // Do nothing if the game is over

        const pressedKey = event.key.toLowerCase();
        let matchFound = false;

        const balloons = document.querySelectorAll('.balloon');
        balloons.forEach(balloon => {
            if (matchFound) return;

            const wordDiv = balloon.querySelector('.word');
            const word = wordDiv.textContent.toLowerCase(); // Ensure case-insensitive matching

            if (word.startsWith(pressedKey)) {
                wordDiv.textContent = word.slice(1); // Remove first letter

                if (wordDiv.textContent === '') {
                    balloon.remove(); // Remove balloon after the word is completely typed
                    updateScore(); // Update the score when a balloon is popped
                }

                matchFound = true;
            }
        });

        // **Check if all words (balloons) are removed before proceeding to the next level**
        setTimeout(() => {
            if (document.querySelectorAll('.balloon').length === 0) {
                goToNextLevel();
            }
        }, 500); // Small delay before transitioning
    }

    function goToNextLevel() {
        let currentLevel = window.location.pathname;

        if (currentLevel.includes("game.html")) {
            window.location.href = "/templates/game2.html"; // Move from Easy → Medium
        } else if (currentLevel.includes("game2.html")) {
            window.location.href = "/templates/game3.html"; // Move from Medium → Hard
        } else if (currentLevel.includes("game3.html")) {
            alert("🎉 Congratulations! You've completed all levels! 🎉");
        }
    }

    function checkBoundaryCollision() {
        if (gameOver) return; // Do nothing if the game is over

        const balloons = document.querySelectorAll('.balloon');
        balloons.forEach(balloon => {
            if (balloon.getBoundingClientRect().bottom >= boundary.getBoundingClientRect().top) {
                endGame(); // End the game if the balloon touches the boundary
            }
        });
    }

    function endGame() {
        if (gameOver) return; // Prevent multiple end triggers
        gameOver = true;
        clearInterval(balloonCreationInterval);
        clearInterval(boundaryCheckInterval);
        clearInterval(countdownInterval); // Stop the countdown

        const balloons = document.querySelectorAll('.balloon');
        balloons.forEach(balloon => balloon.remove()); // Remove all balloons on game over

        const username = localStorage.getItem("username"); // Get logged-in user
        const finalScore = currentScore + (localStorage.getItem("score") ? parseInt(localStorage.getItem("score")) : 0);
        localStorage.setItem("score", finalScore); // Store score to carry over
        if (username) {
            fetch('/save_score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, score: finalScore })
            })
                .then(response => response.json())
                .then(data => console.log(data.message))
                .catch(error => console.error('Error saving score:', error));
        }


        // Create a game over message container
        const nextGameLevel = currentGameLevel + 1; // Determine the next game level

        const gameOverContainer = document.createElement('div');
        gameOverContainer.className = 'game-over-container';
        gameOverContainer.innerHTML = `
          <h1>Game Over!</h1>
          <p>Your final score is: ${currentScore}</p>
          <p>Your time is up or a balloon has reached the line.</p>
          <div class="button-container">
            <button id="restart-button">RESTART</button>
            <button id="next-game-button">NEXT GAME</button> 

            <button id="quit-button">QUIT</button>
          </div>
        `;
        document.body.appendChild(gameOverContainer);

        // Add event listeners to the buttons
        document.getElementById('restart-button').addEventListener('click', function () {
            localStorage.setItem("score", 0); // Reset stored score
            location.reload(); // Refresh the page
        });
        
        document.getElementById('quit-button').addEventListener('click', quitGame);
        document.getElementById('next-game-button').addEventListener('click', function () {
            if (currentGameLevel === 1) {
                window.location.href = '/templates/game2.html'; // Redirect to game2
            } else if (currentGameLevel === 2) {
                window.location.href = '/templates/game3.html'; // Redirect to game3
            } else {
                quitGame(); // If no more games, quit
            }
        });

    }

    function quitGame() {
        window.location.href = '/templates/index.html'; // Example: go back to the main menu
    }

    let countdownTime = 120; // 2 minutes in seconds
    let countdownInterval;

    function createCountdown() {
        const countdownElement = document.getElementById('countdown');

        // Set initial styles
        countdownElement.style.position = 'absolute';
        countdownElement.style.top = '10px';
        countdownElement.style.left = '10px';
        countdownElement.style.fontSize = '24px';
        countdownElement.style.fontWeight = 'bold';
        countdownElement.style.color = 'white';

        countdownInterval = setInterval(() => {
            if (gameOver) return; // Stop updating if the game is over

            countdownTime--;
            const minutes = Math.floor(countdownTime / 60);
            const seconds = countdownTime % 60;
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // ⚠️ Add Flashing & Shaking Effect when time is 10 seconds or less
            if (countdownTime <= 10) {
                countdownElement.style.color = 'red'; // Change color to red
                countdownElement.style.transform = 'scale(1.3)'; // Slight size increase
                countdownElement.style.animation = 'flash 0.5s infinite alternate, shake 0.3s infinite';
            } else {
                // Reset styles when time is above 10 seconds
                countdownElement.style.color = 'white';
                countdownElement.style.transform = 'scale(1)';
                countdownElement.style.animation = ''; // Remove animations
            }

            if (countdownTime === 0) {
                endGame(); // End the game when the countdown reaches 0
                clearInterval(countdownInterval);
            }
        }, 1000); // Update every 1 second
    }


    createCountdown(); // Start the countdown when the game starts

    const balloonCreationInterval = setInterval(createBalloon, 2000);
    const boundaryCheckInterval = setInterval(checkBoundaryCollision, 50);
    document.addEventListener('keypress', checkWord);
});
