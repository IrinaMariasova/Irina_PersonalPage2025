const character = document.getElementById('character');
const speechBubble = document.getElementById('speechBubble');
const speechContent = document.getElementById('speechContent');
const clickHint = document.getElementById('clickHint');
const choiceButtons = document.getElementById('choiceButtons');
const boringBtn = document.getElementById('boringBtn');
const smokyBtn = document.getElementById('smokyBtn');
const greetVideo = document.getElementById('greetVideo');
const characterVideo = document.getElementById('characterVideo');
const characterVideo2 = document.getElementById('characterVideo2');
const quizButtons = document.getElementById('quizButtons');
const quizVideo = document.getElementById('quizVideo');
const wrongVideo = document.getElementById('wrongVideo');
const correctVideo = document.getElementById('correctVideo');
const laughVideo = document.getElementById('laughVideo');
const awayVideo = document.getElementById('awayVideo');
const singVideo = document.getElementById('singVideo');
const hairyVideo = document.getElementById('hairyVideo');

// Dialogue state
let dialogueState = 'idle'; // idle, intro, waiting_choice, quiz

// Correct answers for the quiz
const correctAnswers = ['empathetic', 'creative', 'fast'];

// Descriptions for correct answers
const answerDescriptions = {
    empathetic: "Before I write anything, I always put myself in the shoes of the intended audience and translate their pain or values into suitable words.",
    creative: "My brain doesn't wait politely. Ideas come fast. I connect dots. I like bold formats more than safe ones. I believe creativity should surprise, not decorate.",
    fast: "One thing you should know about me. I hate blah-blah. Thinking is great. Doing is better."
};

// Dialogue content
const dialogues = {
    intro: `Hey, I'm <span class="name-tremble">IRINA</span><br>I build campaigns that developers feel, not just see.<br><br>You want to hear my story?`,
    quiz: `Let's start simple. People usually describe me as…`
};

// Start dialogue on click
character.addEventListener('click', () => {
    if (dialogueState === 'idle') {
        startDialogue();
    }
});

// Click on speech bubble to advance
speechBubble.addEventListener('click', (e) => {
    e.stopPropagation();
    advanceDialogue();
});

// Also allow clicking anywhere to advance (except buttons)
document.addEventListener('click', (e) => {
    if (dialogueState === 'intro') {
        if (!e.target.closest('.choice-btn')) {
            advanceDialogue();
        }
    }
});

function startDialogue() {
    dialogueState = 'intro';
    character.classList.add('in-dialogue');
    character.classList.add('greet-playing');

    // Play greet video
    greetVideo.currentTime = 0;
    greetVideo.play();

    // Show speech bubble with full intro
    speechContent.innerHTML = dialogues.intro;
    speechBubble.classList.add('visible');
    clickHint.style.display = 'block';
}

function advanceDialogue() {
    if (dialogueState === 'intro') {
        // Keep greet video playing as default during choice
        // (greet video continues to loop)

        // Hide click hint and show buttons
        clickHint.style.display = 'none';
        choiceButtons.classList.add('visible');
        dialogueState = 'waiting_choice';
    }
}

// Button handlers
boringBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleChoice('boring');
});

smokyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleChoice('smoky');
});

// "Why not?" button hover - play jump video
boringBtn.addEventListener('mouseenter', () => {
    // Pause greet video and hide it
    character.classList.remove('greet-playing');
    greetVideo.pause();

    // Stop other button video if playing
    character.classList.remove('video-playing-2');
    characterVideo2.pause();

    character.classList.add('video-playing');
    characterVideo.currentTime = 0;
    characterVideo.play();
});

boringBtn.addEventListener('mouseleave', () => {
    character.classList.remove('video-playing');
    characterVideo.pause();

    // Resume greet video
    character.classList.add('greet-playing');
    greetVideo.play();
});

// "Of course!" button hover - play ofcourse video
smokyBtn.addEventListener('mouseenter', () => {
    // Pause greet video and hide it
    character.classList.remove('greet-playing');
    greetVideo.pause();

    // Stop other button video if playing
    character.classList.remove('video-playing');
    characterVideo.pause();

    character.classList.add('video-playing-2');
    characterVideo2.currentTime = 0;
    characterVideo2.play();
});

smokyBtn.addEventListener('mouseleave', () => {
    character.classList.remove('video-playing-2');
    characterVideo2.pause();

    // Resume greet video
    character.classList.add('greet-playing');
    greetVideo.play();
});

function handleChoice(choice) {
    // Hide intro buttons and stop intro videos
    choiceButtons.classList.remove('visible');
    character.classList.remove('greet-playing');
    character.classList.remove('video-playing');
    character.classList.remove('video-playing-2');
    greetVideo.pause();
    characterVideo.pause();
    characterVideo2.pause();

    // Start quiz
    startQuiz();
}

function startQuiz() {
    dialogueState = 'quiz';

    // Update speech bubble text
    speechContent.innerHTML = dialogues.quiz;
    clickHint.style.display = 'none';

    // Show quiz buttons
    quizButtons.classList.add('visible');

    // Preload feedback videos for smooth playback
    correctVideo.load();
    wrongVideo.load();

    // Play quiz video
    character.classList.add('quiz-playing');
    quizVideo.currentTime = 0;
    quizVideo.play();
}

// Quiz button handlers
document.querySelectorAll('.quiz-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();

        // Don't process if already answered or disabled
        if (btn.classList.contains('correct') || btn.classList.contains('wrong') || btn.classList.contains('disabled')) {
            return;
        }

        const answer = btn.dataset.answer;
        const isCorrect = correctAnswers.includes(answer);

        if (isCorrect) {
            handleCorrectAnswer(btn);
        } else {
            handleWrongAnswer(btn);
        }
    });
});

// Track current feedback handlers for cleanup
let currentFeedbackCleanup = null;

function stopCurrentFeedback() {
    if (currentFeedbackCleanup) {
        currentFeedbackCleanup();
        currentFeedbackCleanup = null;
    }
    // Stop all feedback videos
    character.classList.remove('correct-playing');
    character.classList.remove('wrong-playing');
    correctVideo.pause();
    wrongVideo.pause();
}

function handleCorrectAnswer(btn) {
    btn.classList.add('correct');

    // Add tooltip with description
    const answer = btn.dataset.answer;
    const description = answerDescriptions[answer];
    btn.dataset.tooltip = description;

    // Stop any current feedback animation
    stopCurrentFeedback();

    // Check if this is the third correct answer - skip animation and go to scene transition
    const correctButtons = document.querySelectorAll('.quiz-btn.correct');
    if (correctButtons.length === 3) {
        checkQuizComplete();
        return;
    }

    // Stop quiz video, play correct video
    character.classList.remove('quiz-playing');
    quizVideo.pause();

    character.classList.add('correct-playing');
    correctVideo.currentTime = 0;

    const onEnded = () => {
        correctVideo.removeEventListener('ended', onEnded);
        currentFeedbackCleanup = null;
        // Return to quiz video
        character.classList.remove('correct-playing');
        character.classList.add('quiz-playing');
        quizVideo.play();
    };

    // Store cleanup function
    currentFeedbackCleanup = () => {
        correctVideo.removeEventListener('ended', onEnded);
    };

    correctVideo.addEventListener('ended', onEnded);
    correctVideo.play();
}

function handleWrongAnswer(btn) {
    btn.classList.add('wrong');

    // Stop any current feedback animation
    stopCurrentFeedback();

    // Stop quiz video, play wrong video
    character.classList.remove('quiz-playing');
    quizVideo.pause();

    character.classList.add('wrong-playing');
    wrongVideo.currentTime = 0;

    const onEnded = () => {
        wrongVideo.removeEventListener('ended', onEnded);
        currentFeedbackCleanup = null;
        // Return to quiz video
        character.classList.remove('wrong-playing');
        character.classList.add('quiz-playing');
        quizVideo.play();

        // Check if all answers chosen
        checkQuizComplete();
    };

    // Store cleanup function
    currentFeedbackCleanup = () => {
        wrongVideo.removeEventListener('ended', onEnded);
    };

    wrongVideo.addEventListener('ended', onEnded);
    wrongVideo.play().catch(e => console.error('Wrong video play error:', e));
}

function checkQuizComplete() {
    const correctButtons = document.querySelectorAll('.quiz-btn.correct');

    // End quiz when 3 correct answers are found
    if (correctButtons.length === 3) {
        // Disable all remaining non-answered buttons
        document.querySelectorAll('.quiz-btn').forEach(btn => {
            if (!btn.classList.contains('correct') && !btn.classList.contains('wrong')) {
                btn.classList.add('disabled');
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            }
        });

        // All correct answers found! Play away animation
        stopCurrentFeedback();
        character.classList.remove('quiz-playing');
        quizVideo.pause();

        character.classList.add('away-playing');
        awayVideo.currentTime = 0;
        awayVideo.play();

        // Update speech bubble
        speechContent.innerHTML = `Yes! 🎉 Now, let's see what's next...`;

        // Clear screen after away animation ends, then start sing scene
        awayVideo.addEventListener('ended', () => {
            character.classList.remove('away-playing');
            awayVideo.pause();

            // Clear quiz content
            quizButtons.classList.remove('visible');

            // Start sing scene
            startSingScene();
        }, { once: true });
    }
}

function startSingScene() {
    dialogueState = 'sing';

    // Show first frame of sing video (paused)
    character.classList.add('sing-playing');
    singVideo.currentTime = 0;
    // Don't play yet - just show first frame

    // Update speech bubble with gothic SING (with play button)
    speechContent.innerHTML = `Now let me <span class="gothic-sing" id="singBtn">▶ SING</span> from the heart about what I do and how I feel about it.`;
    speechBubble.classList.add('visible');

    // Get lyrics expander elements
    const lyricsExpander = document.getElementById('lyricsExpander');
    const lyricsHeader = document.getElementById('lyricsHeader');

    // Toggle lyrics on header click
    lyricsHeader.addEventListener('click', () => {
        lyricsExpander.classList.toggle('expanded');
    });

    // Add click handler for SING to play audio AND animation
    const singBtn = document.getElementById('singBtn');
    const songAudio = new Audio('Marketing girl.wav');
    const nextBtn = document.getElementById('nextBtn');

    singBtn.addEventListener('click', () => {
        songAudio.currentTime = 0;
        songAudio.play();
        singVideo.play();

        // Show lyrics expander only after clicking SING
        lyricsExpander.classList.add('visible');

        // Show Next button after 20 seconds
        setTimeout(() => {
            nextBtn.classList.add('visible');
        }, 20000);
    });

    // Next button click - clear sing scene and start hairy scene
    nextBtn.addEventListener('click', () => {
        // Stop audio and video
        songAudio.pause();
        singVideo.pause();

        // Hide all sing scene elements
        lyricsExpander.classList.remove('visible');
        lyricsExpander.classList.remove('expanded');
        nextBtn.classList.remove('visible');
        character.classList.remove('sing-playing');

        // Start hairy scene
        startHairyScene();
    });
}

function startHairyScene() {
    dialogueState = 'hairy';

    // Play hairy video
    character.classList.add('hairy-playing');
    character.classList.add('in-dialogue');
    hairyVideo.currentTime = 0;
    hairyVideo.play();

    // Update speech bubble with BHAG trigger
    speechContent.innerHTML = `Are you ready to learn about my Big, Hairy, Audacious Goal <span class="bhag-trigger" id="bhagTrigger">(BHAG)</span> for 2026?<br><br>No hair lost at the planning stage.`;
    speechBubble.classList.add('visible');

    // BHAG trigger click - start shapes puzzle
    const bhagTrigger = document.getElementById('bhagTrigger');
    bhagTrigger.addEventListener('click', () => {
        startShapesPuzzle();
    });
}

// Shapes puzzle state
const correctOrder = ['red', 'blue', 'yellow']; // slot 1, 2, 3
let placedShapes = [null, null, null]; // tracks what's in each slot

// Physics state for falling cards
let fallingCards = [];
const GRAVITY = 0.0016; // 5x slower
const MAX_VELOCITY = 0.1; // 5x slower max speed
const GROUND_Y = window.innerHeight - 150; // Bottom of screen with padding

function startShapesPuzzle() {
    const shapesContainer = document.getElementById('shapesContainer');

    // Show container (for drop zones)
    shapesContainer.classList.add('visible');

    // Get cards and shuffle order
    const cards = Array.from(document.querySelectorAll('.shape-card'));
    const shuffledCards = cards.sort(() => Math.random() - 0.5);

    // Reset falling cards array
    fallingCards = [];

    // Fixed positions in left portion of screen - 5 cards need more spacing
    const startPositions = [50, 120, 190, 80, 150]; // Different x positions for variety

    // Initialize physics for each card
    shuffledCards.forEach((card, index) => {
        // Move card to body so it's not hidden by parent
        document.body.appendChild(card);

        // Use fixed start position with slight random offset
        const startX = startPositions[index % 5] + Math.random() * 30;
        card.style.position = 'fixed';
        card.style.left = startX + 'px';
        card.style.top = '-150px';
        card.style.width = '300px';
        card.style.zIndex = 300 + index;
        card.style.display = 'block';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';

        // Add to physics simulation with staggered start
        setTimeout(() => {
            fallingCards.push({
                element: card,
                x: startX,
                y: -150 - (index * 100), // Each card starts higher than the last
                vy: 0,
                width: 300,
                height: 80,
                grounded: false
            });
        }, index * 1000); // 1 second between each card
    });

    // Start continuous physics loop
    runPhysicsLoop();

    // Setup drag and drop after cards land
    setTimeout(() => {
        setupDragAndDrop();
    }, 3000);
}

// Continuous physics loop - runs forever to handle dynamic changes
function runPhysicsLoop() {
    updatePhysics();
    requestAnimationFrame(runPhysicsLoop);
}

function updatePhysics() {
    let allGrounded = true;

    fallingCards.forEach((card, index) => {
        if (card.grounded) return;

        allGrounded = false;

        // Floating effect - very gentle falling with drag
        card.vy += GRAVITY;
        card.vy *= 0.98; // Air resistance/drag
        if (card.vy > MAX_VELOCITY) card.vy = MAX_VELOCITY; // Cap speed

        // Add gentle side-to-side wobble for floating effect
        if (!card.wobbleOffset) card.wobbleOffset = Math.random() * Math.PI * 2;
        const wobble = Math.sin(Date.now() / 500 + card.wobbleOffset) * 0.3;
        card.x += wobble;

        // Keep cards on screen and away from drop zone
        const minX = 20;
        const maxX = Math.max(50, window.innerWidth - card.width - 420); // Stay away from drop zone
        if (card.x < minX) card.x = minX;
        if (card.x > maxX) card.x = maxX;

        card.y += card.vy;

        // Check collision with ground
        let stopY = GROUND_Y;

        // Check collision with ALL other cards (not just grounded)
        fallingCards.forEach((otherCard, otherIndex) => {
            if (otherIndex === index) return;

            // Only check cards that are below this one or grounded
            if (otherCard.y <= card.y) return;

            // Check horizontal overlap
            const horizontalOverlap =
                card.x < otherCard.x + otherCard.width &&
                card.x + card.width > otherCard.x;

            if (horizontalOverlap) {
                // The stop point is top of the other card
                const otherTop = otherCard.y - card.height - 5;
                if (otherTop < stopY && card.y + card.height + card.vy >= otherCard.y) {
                    stopY = otherTop;
                }
            }
        });

        // Hit ground or another card
        if (card.y >= stopY) {
            card.y = stopY;
            card.vy = 0;
            card.grounded = true;
        }

        // Update element position
        card.element.style.top = card.y + 'px';
        card.element.style.left = card.x + 'px';
    });

    // Continue animation if not all grounded
    if (!allGrounded || fallingCards.length < 3) {
        requestAnimationFrame(updatePhysics);
    }
}

function setupDragAndDrop() {
    const shapes = document.querySelectorAll('.shape-card');
    const dropSlots = document.querySelectorAll('.drop-slot');

    shapes.forEach(shape => {
        shape.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', shape.dataset.shape);
            shape.classList.add('dragging');
        });

        shape.addEventListener('dragend', () => {
            shape.classList.remove('dragging');
        });
    });

    dropSlots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('highlight');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('highlight');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('highlight');

            const shapeType = e.dataTransfer.getData('text/plain');
            const position = parseInt(slot.dataset.position);

            handleShapeDrop(shapeType, position, slot);
        });
    });
}

function handleShapeDrop(shapeType, position, slot) {
    const shapeId = 'shape' + shapeType.charAt(0).toUpperCase() + shapeType.slice(1);
    const shape = document.getElementById(shapeId);

    // Check if this card is correct (red, blue, yellow) or incorrect (white, green)
    const isCorrect = shape.dataset.correct === 'true';

    // Check if slot already filled
    if (placedShapes[position] !== null) {
        return;
    }

    if (isCorrect) {
        // Correct card (red/blue/yellow) - place it!
        placedShapes[position] = shapeType;
        slot.classList.add('filled');

        // Move shape to slot - keep its original size
        slot.appendChild(shape);
        shape.style.position = 'relative';
        shape.style.left = '0';
        shape.style.top = '0';
        shape.style.margin = '0';
        shape.classList.add('placed');

        // Remove from physics simulation
        const cardIndex = fallingCards.findIndex(c => c.element === shape);
        if (cardIndex > -1) {
            fallingCards.splice(cardIndex, 1);
        }

        // Check if puzzle complete (all 3 slots filled)
        if (placedShapes.every(s => s !== null)) {
            puzzleComplete();
        }
    } else {
        // Incorrect card (white/green) - shake slot and return card
        slot.classList.add('shake');
        shape.classList.add('falling-back');

        setTimeout(() => {
            slot.classList.remove('shake');
            shape.classList.remove('falling-back');
        }, 500);
    }
}

function puzzleComplete() {
    console.log('Puzzle complete!');

    const character = document.getElementById('character');

    // Stop hairy video
    const hairyVideo = document.getElementById('hairyVideo');
    if (hairyVideo) hairyVideo.pause();
    character.classList.remove('hairy-playing');

    // Hide puzzle elements
    const shapesContainer = document.getElementById('shapesContainer');
    if (shapesContainer) shapesContainer.style.display = 'none';

    // Hide any remaining falling cards
    fallingCards.forEach(card => {
        if (card.element) card.element.style.display = 'none';
    });

    // Play calm video
    const calmVideo = document.getElementById('calmVideo');
    if (calmVideo) {
        calmVideo.currentTime = 0;
        calmVideo.play();
        character.classList.add('calm-playing');

        // Stop at last frame when video ends
        calmVideo.onended = () => {
            calmVideo.pause();
        };
    }

    // Show speech with Next button inline
    speechContent.innerHTML = `Thank you for helping me with my hairy goals. Now, what's <button class="inline-next-btn" id="nextLink">Next</button>?`;

    // Make Next clickable
    setTimeout(() => {
        const nextLink = document.getElementById('nextLink');
        if (nextLink) {
            nextLink.addEventListener('click', () => {
                startNextScene();
            });
        }
    }, 100);
}

function startNextScene() {
    console.log('Starting heart scene...');
    const character = document.getElementById('character');

    // Stop calm video
    const calmVideo = document.getElementById('calmVideo');
    if (calmVideo) calmVideo.pause();
    character.classList.remove('calm-playing');

    // Play heart video
    const heartVideo = document.getElementById('heartVideo');
    if (heartVideo) {
        heartVideo.currentTime = 0;
        heartVideo.play();
        character.classList.add('heart-playing');
    }

    // Show scene title
    const sceneTitle = document.getElementById('sceneTitle');
    sceneTitle.textContent = 'MY STORY';
    sceneTitle.classList.add('visible');

    // Show speech with Next button
    speechContent.innerHTML = `I've been doing writing for more than 15 years now, and here's how I got to the point where I am today. <button class="inline-next-btn" id="heartNextLink">Next</button>`;
    speechBubble.classList.add('visible');

    // Make Next clickable
    setTimeout(() => {
        const nextLink = document.getElementById('heartNextLink');
        if (nextLink) {
            nextLink.addEventListener('click', () => {
                startTimelineScene();
            });
        }
    }, 100);
}

function startTimelineScene() {
    startBooksScene();
}

// Helper to switch scenes
function switchToScene(character, fromClass, toVideoId, toClass) {
    // Stop previous video
    character.className = 'character-wrapper';

    // Play new video
    const video = document.getElementById(toVideoId);
    if (video) {
        video.currentTime = 0;
        video.play();
        character.classList.add(toClass);
    }
}

// Scene 1: Books
function startBooksScene() {
    console.log('Starting books scene...');
    const character = document.getElementById('character');

    // Stop heart video
    const heartVideo = document.getElementById('heartVideo');
    if (heartVideo) heartVideo.pause();

    switchToScene(character, 'heart-playing', 'booksVideo', 'books-playing');

    speechContent.innerHTML = `It started in the land of rules. Technical writing taught me to think in clean lines, strip words down to their bones, and show no mercy to fluff. <button class="inline-next-btn" id="booksNextLink">Next</button>`;

    setTimeout(() => {
        const nextLink = document.getElementById('booksNextLink');
        if (nextLink) {
            nextLink.addEventListener('click', () => startBookingScene());
        }
    }, 100);
}

// Scene 2: Booking
function startBookingScene() {
    console.log('Starting booking scene...');
    const character = document.getElementById('character');

    const booksVideo = document.getElementById('booksVideo');
    if (booksVideo) booksVideo.pause();

    switchToScene(character, 'books-playing', 'bookingVideo', 'booking-playing');

    speechContent.innerHTML = `Then I wandered into travel. At Booking.com, I learned something unexpected: people don't just book hotels. They stress, they dream, they panic about breakfast options. Turns out even logistics are emotional. <button class="inline-next-btn" id="bookingNextLink">Next</button>`;

    setTimeout(() => {
        const nextLink = document.getElementById('bookingNextLink');
        if (nextLink) {
            nextLink.addEventListener('click', () => startMotherScene());
        }
    }, 100);
}

// Scene 3: Mother
function startMotherScene() {
    console.log('Starting mother scene...');
    const character = document.getElementById('character');

    const bookingVideo = document.getElementById('bookingVideo');
    if (bookingVideo) bookingVideo.pause();

    switchToScene(character, 'booking-playing', 'motherVideo', 'mother-playing');

    speechContent.innerHTML = `Then came motherhood and with it, beautiful chaos. I picked up a camera. Started a blog. Let life get a little louder. <button class="inline-next-btn" id="motherNextLink">Next</button>`;

    setTimeout(() => {
        const nextLink = document.getElementById('motherNextLink');
        if (nextLink) {
            nextLink.addEventListener('click', () => startTechScene());
        }
    }, 100);
}

// Scene 4: Tech
function startTechScene() {
    console.log('Starting tech scene...');
    const character = document.getElementById('character');

    const motherVideo = document.getElementById('motherVideo');
    if (motherVideo) motherVideo.pause();

    switchToScene(character, 'mother-playing', 'techVideo', 'tech-playing');

    speechContent.innerHTML = `When I came back to tech, I brought all of it with me. The precision and the mess. The structure and the feeling. Now I build campaigns that make sense to developers and sound like they were written by someone with a pulse. <button class="inline-next-btn" id="techNextLink">Next</button>`;

    setTimeout(() => {
        const nextLink = document.getElementById('techNextLink');
        if (nextLink) {
            nextLink.addEventListener('click', () => startAmazingScene());
        }
    }, 100);
}

// Scene 5: Amazing
function startAmazingScene() {
    console.log('Starting amazing scene...');
    const character = document.getElementById('character');

    const techVideo = document.getElementById('techVideo');
    if (techVideo) techVideo.pause();

    switchToScene(character, 'tech-playing', 'amazingVideo', 'amazing-playing');

    speechContent.innerHTML = `A couple of plot twists no one asked about: Once, I translated for the executive producer of The Amazing Race. It's exactly as random as it sounds. I also won a JetBrains hackathon. I bring it up at least twice a year. <button class="inline-next-btn" id="amazingNextLink">Next</button>`;

    setTimeout(() => {
        const nextLink = document.getElementById('amazingNextLink');
        if (nextLink) {
            nextLink.addEventListener('click', () => startFinalScene());
        }
    }, 100);
}

// Final scene - Dance videos loop
let danceVideos = [];
let currentDanceIndex = 0;

function startFinalScene() {
    console.log('Starting final dance scene...');
    const character = document.getElementById('character');

    // Stop amazing video
    const amazingVideo = document.getElementById('amazingVideo');
    if (amazingVideo) amazingVideo.pause();
    character.className = 'character-wrapper dance-playing';

    // Setup dance video loop
    danceVideos = [
        document.getElementById('dance01Video'),
        document.getElementById('dance02Video'),
        document.getElementById('dance03Video')
    ];

    // Start the dance loop
    currentDanceIndex = 0;
    playNextDance();

    // Show speech with arrow pointing to expander
    speechContent.innerHTML = `If you like bold ideas, empathy, and less noise, we'll probably work well together.<br><br>Read the full story <span class="arrow-right">→</span>`;

    // Show story expander
    const storyExpander = document.getElementById('storyExpander');
    storyExpander.classList.add('visible');

    // Setup audio
    const marketingGirlAudio = new Audio('marketing-girl.wav');
    marketingGirlAudio.loop = true;

    // Setup expander toggle with audio
    const storyHeader = document.getElementById('storyHeader');
    storyHeader.addEventListener('click', () => {
        storyExpander.classList.toggle('expanded');

        if (storyExpander.classList.contains('expanded')) {
            marketingGirlAudio.play();
        } else {
            marketingGirlAudio.pause();
            marketingGirlAudio.currentTime = 0;
        }
    });

    // Show start over button
    const startOverBtn = document.getElementById('startOverBtn');
    startOverBtn.classList.add('visible');
    startOverBtn.addEventListener('click', () => {
        location.reload();
    });
}

function playNextDance() {
    // Hide all dance videos
    danceVideos.forEach(v => {
        if (v) {
            v.classList.remove('active');
            v.pause();
        }
    });

    // Play current one
    const video = danceVideos[currentDanceIndex];
    if (video) {
        video.classList.add('active');
        video.currentTime = 0;
        video.play();

        // When it ends, play next
        video.onended = () => {
            currentDanceIndex = (currentDanceIndex + 1) % danceVideos.length;
            playNextDance();
        };
    }
}
