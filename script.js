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
          let nextThreshold = 100 / (messages.length - 1); // divide progress into message steps
        
          const fakeLoading = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5; 
            if (progress > 100) progress = 100;
        
            loadingFill.style.width = progress + '%';
            loadingPercent.textContent = progress + '%';
        
            // Check if it's time to show the next message
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

        // Toggle menu function
        function toggleMenu(element) {
            playSound('menu');
            
            // Close all other menus
            const allMenuItems = document.querySelectorAll('.menu-item');
            allMenuItems.forEach(item => {
                if (item !== element && item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });

            // Toggle current menu
            element.classList.toggle('active');
        }

        // Switch between sections
        function switchSection(section) {
            playSound('menu');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });
            
            // Remove active from all taskbar items
            document.querySelectorAll('.taskbar-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Show selected section
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
            
            // Scroll to top when switching sections
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Simple sound effect placeholder
        function playSound(type) {
            console.log(`Playing ${type} sound effect`);
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

        // Add keyboard navigation
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && document.getElementById('titleScreen').style.display !== 'none') {
                startGame();
            }
        });