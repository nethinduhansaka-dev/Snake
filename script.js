
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Constants
        const UNIT = 20;
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        const CELLS = WIDTH / UNIT;

        // Game state
        let snake, direction, newDirection, food, score, gameOver, isPaused;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let level = 1;
        let gameSpeed = 100;
        let baseSpeed = 100; // Base speed for calculations

        // Initialize game
        function initGame() {
            snake = [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 }
            ];
            direction = { x: 1, y: 0 };
            newDirection = { x: 1, y: 0 };
            score = 0;
            level = 1;
            gameSpeed = 100;
            gameOver = false;
            isPaused = false;
            
            updateScores();
            generateFood();
        }

        function updateScores() {
            document.getElementById('score').textContent = score;
            document.getElementById('highScore').textContent = highScore;
            document.getElementById('level').textContent = level;
        }

        function draw() {
            // Clear canvas with gradient background
            const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            // Draw grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            for(let i = 0; i < CELLS; i++) {
                ctx.beginPath();
                ctx.moveTo(i * UNIT, 0);
                ctx.lineTo(i * UNIT, HEIGHT);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * UNIT);
                ctx.lineTo(WIDTH, i * UNIT);
                ctx.stroke();
            }

            // Draw snake with gradient
            snake.forEach((part, index) => {
                const gradient = ctx.createLinearGradient(
                    part.x * UNIT, part.y * UNIT,
                    part.x * UNIT + UNIT, part.y * UNIT + UNIT
                );
                
                if (index === 0) {
                    // Head
                    gradient.addColorStop(0, '#4CAF50');
                    gradient.addColorStop(1, '#45a049');
                } else {
                    // Body
                    gradient.addColorStop(0, '#66bb6a');
                    gradient.addColorStop(1, '#4CAF50');
                }
                
                ctx.fillStyle = gradient;
                ctx.fillRect(part.x * UNIT, part.y * UNIT, UNIT, UNIT);
                
                // Add eyes to head
                if (index === 0) {
                    ctx.fillStyle = 'white';
                    const eyeSize = UNIT / 5;
                    const eyeOffset = UNIT / 4;
                    
                    // Left eye
                    ctx.beginPath();
                    ctx.arc(part.x * UNIT + eyeOffset, part.y * UNIT + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Right eye
                    ctx.beginPath();
                    ctx.arc(part.x * UNIT + UNIT - eyeOffset, part.y * UNIT + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Draw food with glow effect
            ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(food.x * UNIT + UNIT/2, food.y * UNIT + UNIT/2, UNIT/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        function update() {
            if (gameOver || isPaused) return;

            direction = newDirection;
            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score += 10;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('snakeHighScore', highScore);
                }
                
                // Level up every 50 points
                if (score % 50 === 0) {
                    level++;
                    gameSpeed = Math.max(50, baseSpeed - (level - 1) * 5);
                    clearInterval(gameLoop);
                    gameLoop = setInterval(() => {
                        update();
                        draw();
                    }, gameSpeed);
                }
                
                updateScores();
                generateFood();
            } else {
                snake.pop();
            }

            // Check collisions
            if (head.x < 0 || head.x >= CELLS || head.y < 0 || head.y >= CELLS ||
                snake.slice(1).some(part => part.x === head.x && part.y === head.y)) {
                gameOver = true;
                document.getElementById('gameOverOverlay').style.display = 'block';
                document.getElementById('finalScore').textContent = score;
            }
        }

        function generateFood() {
            do {
                food = {
                    x: Math.floor(Math.random() * CELLS),
                    y: Math.floor(Math.random() * CELLS)
                };
            } while (snake.some(part => part.x === food.x && part.y === food.y));
        }

        function togglePause() {
            isPaused = !isPaused;
            document.getElementById('pauseButton').textContent = isPaused ? 'Resume' : 'Pause';
        }

        function restartGame() {
            document.getElementById('gameOverOverlay').style.display = 'none';
            initGame();
        }

        // Event listeners
        document.addEventListener('keydown', function(e) {
            const key = e.key.toLowerCase();
            
            if ((key === 'arrowup' || key === 'w') && direction.y !== 1) {
                newDirection = { x: 0, y: -1 };
            } else if ((key === 'arrowdown' || key === 's') && direction.y !== -1) {
                newDirection = { x: 0, y: 1 };
            } else if ((key === 'arrowleft' || key === 'a') && direction.x !== 1) {
                newDirection = { x: -1, y: 0 };
            } else if ((key === 'arrowright' || key === 'd') && direction.x !== -1) {
                newDirection = { x: 1, y: 0 };
            } else if (key === ' ' || key === 'p') {
                togglePause();
            }
        });

        // Speed control functionality
        function updateSpeed(value) {
            const speedLabels = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
            const speedMultipliers = [1.5, 1.25, 1, 0.75, 0.5];
            
            document.getElementById('speedValue').textContent = speedLabels[value - 1];
            baseSpeed = 100 * speedMultipliers[value - 1];
            gameSpeed = Math.max(50, baseSpeed - (level - 1) * 5);
            
            // Reset the game interval with new speed
            clearInterval(gameLoop);
            gameLoop = setInterval(() => {
                update();
                draw();
            }, gameSpeed);
        }

        // Add speed slider event listener
        document.getElementById('speedSlider').addEventListener('input', function(e) {
            updateSpeed(parseInt(e.target.value));
        });

        // Initialize and start game
        initGame();
        let gameLoop = setInterval(() => {
            update();
            draw();
        }, gameSpeed);
    