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






        const menuIcon = document.getElementById('menu-icon');
const navMenu = document.getElementById('nav-menu');

menuIcon.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});






function createStars() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 200; // Adjust for density

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random Position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random Size
        const size = Math.random() * 3;
        
        // Random Animation Duration
        const duration = Math.random() * 3 + 2;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDuration = `${duration}s`;
        
        starsContainer.appendChild(star);
    }
}
createStars();






function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    
    // Random starting position
    star.style.top = Math.random() * 50 + '%';
    star.style.left = Math.random() * 50 + '%';
    
    document.body.appendChild(star);

    // Remove the element after animation finishes to prevent lag
    setTimeout(() => {
        star.remove();
    }, 2000);
}

// Launch a shooting star every 4-8 seconds
setInterval(createShootingStar, Math.random() * 4000 + 4000);

      