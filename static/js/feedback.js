function addClass() {
    document.body.classList.add("sent");
  }
  
  sendLetter.addEventListener("click", addClass);

// Generate stars for the galaxy effect
function createStars() {
  const numberOfStars = 200; // Number of stars to create
  const container = document.body;
  
  for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      // Randomize the size and position of stars
      const size = Math.random() * 3 + 1; // Random size between 1px and 3px
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${y}px`;
      star.style.left = `${x}px`;

      container.appendChild(star);
  }
}

// Call the function to generate stars on page load
window.onload = function() {
  createStars();
};
