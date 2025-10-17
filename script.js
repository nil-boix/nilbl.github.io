// Generate stars
const starsContainer = document.getElementById('stars');
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    starsContainer.appendChild(star);
}

function startGame() {
    playSound('start');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingFill = document.getElementById('loadingFill');
    const loadingPercent = document.getElementById('loadingPercent');
    const titleScreen = document.getElementById('titleScreen');
    const characterMenu = document.getElementById('characterMenu');
    const loadingText = document.querySelector('.loading-text');

    const messages = [
        "WAKING UP...",
        "LOADING CHARACTER EGO...",
        "OPTIMIZING CV...",
        "PRETENDING TO LOAD SOMETHING...",
        "MAKING EVERYTHING LOOK COOL...",
        "READY!"
    ];

    // Show loading screen
    loadingScreen.classList.add('active');
    let progress = 0;
    let nextMessageIndex = 0;
    let nextThreshold = 100 / (messages.length - 1);

    const fakeLoading = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress > 100) progress = 100;

        loadingFill.style.width = progress + '%';
        loadingPercent.textContent = progress + '%';

        if (progress >= nextThreshold * nextMessageIndex && nextMessageIndex < messages.length) {
            loadingText.textContent = messages[nextMessageIndex];
            playSound('menu');
            nextMessageIndex++;
        }

        if (progress >= 100) {
            clearInterval(fakeLoading);
            setTimeout(() => {
                loadingScreen.classList.remove('active');
                titleScreen.style.opacity = '0';
                setTimeout(() => {
                    titleScreen.style.display = 'none';
                    characterMenu.classList.add('active');
                    characterMenu.style.opacity = '0';
                    setTimeout(() => {
                        characterMenu.style.transition = 'opacity 0.4s ease-in';
                        characterMenu.style.opacity = '1';
                    }, 50);
                }, 400);
            }, 500);
        }
    }, 200);
}

function toggleMenu(element) {
    playSound('menu');

    const allMenuItems = document.querySelectorAll('.menu-item');
    allMenuItems.forEach(item => {
        if (item !== element && item.classList.contains('active')) {
            item.classList.remove('active');
        }
    });

    element.classList.toggle('active');
}

function switchSection(section) {
    playSound('menu');

    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    document.querySelectorAll('.taskbar-item').forEach(item => {
        item.classList.remove('active');
    });

    if (section === 'stats') {
        document.getElementById('statsSection').classList.add('active');
        document.querySelectorAll('.taskbar-item')[0].classList.add('active');
    } else if (section === 'missions') {
        document.getElementById('missionsSection').classList.add('active');
        document.querySelectorAll('.taskbar-item')[1].classList.add('active');
    } else if (section === 'contact') {
        document.getElementById('contactSection').classList.add('active');
        document.querySelectorAll('.taskbar-item')[2].classList.add('active');
    }

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function playSound(type) {
    console.log(`Playing ${type} sound effect`);

    try {
        const audioContext = new(window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'menu') {
            oscillator.frequency.value = 600;
        } else {
            oscillator.frequency.value = 800;
        }

        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio not available');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && document.getElementById('titleScreen').style.display !== 'none') {
        startGame();
    }
});

// === HIDDEN MAGE FUNCTIONALITY ===
const mageDialogues = [
    "Psst... looking for a job? 👀",
    "I've been watching your code... not bad!",
    "Need a wizard for your team? 🧙‍♂️",
    "I can cast JavaScript spells!",
    "My debugging magic is legendary! ✨",
    "Hire me and I'll make bugs disappear!",
    "I've mastered the ancient art of Git!",
    "Your project needs more magic! ✨",
    "I bring +10 to code quality!",
    "Coffee in, code out. Simple spell! ☕",
    "Stack Overflow? I AM the overflow!",
    "Trust me, I'm a wizard! 🪄",
    "My code is 99% bug-free... mostly!",
    "Python? Java? I speak all tongues!",
    "I can make your deadlines disappear! ⏰"
];

let lastDialogueIndex = -1;

function showMageDialogue() {
    playSound('menu');

    const dialogue = document.querySelector('.mage-dialogue');

    // Get a random dialogue different from the last one
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * mageDialogues.length);
    } while (randomIndex === lastDialogueIndex && mageDialogues.length > 1);

    lastDialogueIndex = randomIndex;
    dialogue.textContent = mageDialogues[randomIndex];

    // Show dialogue
    dialogue.classList.add('active');

    // Hide after 3 seconds
    setTimeout(() => {
        dialogue.classList.remove('active');
    }, 3000);
}

// Add click event listener to mage when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const mage = document.querySelector('.hidden-mage');
    if (mage) {
        mage.addEventListener('click', showMageDialogue);
    }
});