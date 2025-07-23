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

    // ✅ Ensure words.js is loaded
    if (typeof words === 'undefined') {
        console.error("Error: words.js is not loaded. Make sure it's included in index.html.");
        return;
    }
    console.log("Loaded words:", words); // Debugging

    // ✅ Game Setup
    const colors = [
        'pink', 'lightblue', 'lightgreen', 'yellow', 'coral', 'violet',
        'lightcoral', 'lightgoldenrodyellow', 'lightseagreen', 'lightsalmon'
    ];

    const gameContainer = document.getElementById('game-container');
    const boundary = document.getElementById('boundary');
    let gameOver = false;
    let currentScore = 0;

    const currentScoreElement = document.getElementById("current-score");
    currentScoreElement.innerText = `Score: ${currentScore}`; // Initialize score display

    let wordIndex = 0; // To track the sequence

    function showLevelStartMessage(levelName, duration) {
        return new Promise((resolve) => {
            const gif = document.createElement('img');
            gif.src = '/static/images/whoa.gif'; // Update this path with your actual GIF location
            gif.alt = 'Get Ready!';

            const messageContainer = document.createElement('div');
            messageContainer.className = 'level-start-message';

            const msg_on_completion = document.createElement('p')
            msg_on_completion.innerHTML = `You're on fire! Ready for the final test?`
            
            const message = document.createElement('p');
            message.innerHTML = `The moonlight is fading, type to restore its glow!`;
    
            // Append GIF first, then message
            messageContainer.appendChild(msg_on_completion)
            messageContainer.appendChild(gif);
            messageContainer.appendChild(message);
    
            document.body.appendChild(messageContainer);

            setTimeout(() => {
                messageContainer.remove();
                resolve(); // Proceed to game start
            }, duration);
        });
    }


    function startHardLevel() {
        console.log("Hard level starting...");

        createCountdown(); // Start the countdown when the game starts

        const moonCreationInterval = setInterval(createmoon, 2500);
        const boundaryCheckInterval = setInterval(checkBoundaryCollision, 50);
        document.addEventListener('keypress', checkWord);
    }

    // Show the level start message before beginning the game
    showLevelStartMessage("Hard", 3000).then(() => {
        console.log("Level start message displayed, now starting the game.");
        startHardLevel();
    });

    function createmoon() {
        if (gameOver || words.length === 0) return; // Stop if game over or no words left

        const word = words[wordIndex]; // Fetch word in sequence
        wordIndex = (wordIndex + 1) % words.length; // Move to the next word, loop if needed

        const color = colors[wordIndex % colors.length]; // Assign colors sequentially

        const moon = document.createElement('div');
        moon.classList.add('moon');
        moon.style.backgroundColor = color;
        moon.style.left = `${Math.random() * (gameContainer.clientWidth - 80)}px`;
        moon.style.animationDuration = `${Math.random() * 5 + 5}s`;

        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word');
        wordDiv.textContent = word;
        moon.appendChild(wordDiv);

        gameContainer.appendChild(moon);
    }


    function updateScore() {
        currentScore++;
        currentScoreElement.innerText = `Score: ${currentScore}`;
    }


    function checkWord(event) {
        if (gameOver) return; // Do nothing if the game is over

        const pressedKey = event.key.toLowerCase();
        let matchFound = false;

        const moons = document.querySelectorAll('.moon');
        moons.forEach(moon => {
            if (matchFound) return;

            const wordDiv = moon.querySelector('.word');
            const word = wordDiv.textContent.toLowerCase(); // Ensure case-insensitive matching

            if (word.startsWith(pressedKey)) {
                wordDiv.textContent = word.slice(1); // Remove first letter

                if (wordDiv.textContent === '') {
                    moon.remove(); // Remove moon after the word is completely typed
                    updateScore(); // Update the score when a moon is popped
                }

                matchFound = true;

            }
        });
    }

    function checkBoundaryCollision() {
        if (gameOver) return; // Do nothing if the game is over

        const moons = document.querySelectorAll('.moon');
        moons.forEach(moon => {
            if (moon.getBoundingClientRect().bottom >= boundary.getBoundingClientRect().top) {
                endGame(); // End the game if the moon touches the boundary
            }
        });
    }

    function endGame() {
        if (gameOver) return; // Prevent multiple end triggers
        gameOver = true;
        clearInterval(moonCreationInterval);
        clearInterval(boundaryCheckInterval);
        clearInterval(countdownInterval); // Stop the countdown

        document.removeEventListener('keypress', checkWord); // ✅ Remove keypress listener

        const moons = document.querySelectorAll('.moon');
        moons.forEach(moon => moon.remove()); // Remove all moons on game over

        const username = localStorage.getItem("username");
        const finalScore = currentScore + (localStorage.getItem("score") ? parseInt(localStorage.getItem("score")) : 0);

        if (username) {
            fetch('/save_score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, score: finalScore })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);
                    // alert("Game Over! Your final score is " + finalScore);
                    localStorage.removeItem("score"); // Reset stored score
                    window.location.href = "/templates/index.html"; // Go back to main menu
                })
                .catch(error => console.error('Error saving score:', error));
        }
        // Create a game over message container
        const gameOverContainer = document.createElement('div');
        gameOverContainer.className = 'game-over-container';
        gameOverContainer.innerHTML = `
          <h1>Game Over!</h1>
          <p>Your final score is: ${currentScore}</p>
          <p>Your time is up or a moon has reached the line.</p>
          <div class="button-container">
            <button id="restart-button">RESTART</button>
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
    }

    function quitGame() {
        window.location.href = '/templates/index.html'; // Example: go back to the main menu
    }

    let countdownTime = 420; // 7 minutes in seconds
    let countdownInterval;

    function createCountdown() { 
        const countdownElement = document.getElementById('countdown');
    
        // Clear any existing countdown to prevent multiple intervals
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    
        // Set initial styles
        countdownElement.style.position = 'absolute';
        countdownElement.style.top = '10px';
        countdownElement.style.left = '10px';
        countdownElement.style.fontSize = '24px';
        countdownElement.style.fontWeight = 'bold';
        countdownElement.style.color = 'white';
    
        // ✅ Display the correct initial time BEFORE starting interval
        updateCountdownDisplay();
    
        countdownInterval = setInterval(() => {
            if (gameOver) {
                clearInterval(countdownInterval); // Stop countdown if game is over
                return;
            }
    
            if (countdownTime > 0) {
                countdownTime--; // ✅ Decrement AFTER displaying initial time
                updateCountdownDisplay();
            } 
    
            if (countdownTime === 0) {
                clearInterval(countdownInterval);
                endGame();
            }
        }, 1000); // Update every second
    }
    
    // ✅ Function to update the countdown display
    function updateCountdownDisplay() {
        const countdownElement = document.getElementById('countdown');
        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;
        countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
        // ⚠️ Add Flashing & Shaking Effect when time is 10 seconds or less
        if (countdownTime <= 10) {
            countdownElement.style.color = 'red';
            countdownElement.style.transform = 'scale(1.3)';
            countdownElement.style.animation = 'flash 0.5s infinite alternate, shake 0.3s infinite';
        } else {
            countdownElement.style.color = 'white';
            countdownElement.style.transform = 'scale(1)';
            countdownElement.style.animation = ''; 
        }
    }

    createCountdown(); // Start the countdown when the game starts

    const moonCreationInterval = setInterval(createmoon, 2000);
    const boundaryCheckInterval = setInterval(checkBoundaryCollision, 50);
    document.addEventListener('keypress', checkWord);
});
