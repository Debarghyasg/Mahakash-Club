        function createStars() {
            const starfield = document.getElementById('starfield');
            const numberOfStars = 200;

            for (let i = 0; i < numberOfStars; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                
                const size = Math.random() * 3 + 1;
                star.style.width = size + 'px';
                star.style.height = size + 'px';
                
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                
                const duration = Math.random() * 3 + 2;
                star.style.animationDuration = duration + 's';
                
                const delay = Math.random() * 3;
                star.style.animationDelay = delay + 's';
                
                starfield.appendChild(star);
            }
        }

        function createShootingStar() {
            const shootingStar = document.createElement('div');
            shootingStar.className = 'shooting-star';
            
            // Random starting position on the left side
            const startY = Math.random() * 50; // Top 50% of screen
            shootingStar.style.top = startY + '%';
            shootingStar.style.left = '0';
            
            document.body.appendChild(shootingStar);
            
            // Remove the shooting star after animation completes
            setTimeout(() => {
                shootingStar.remove();
            }, 2000);
        }

        // Create initial stars
        createStars();

        // Create shooting star every 10 seconds
        setInterval(createShootingStar, 10000);
        
        // Create first shooting star after 2 seconds
        setTimeout(createShootingStar, 2000);

        // Hide welcome screen after animation
        setTimeout(() => {
            const welcomeScreen = document.getElementById('welcomeScreen');
            welcomeScreen.classList.add('hidden');
        }, 4000);