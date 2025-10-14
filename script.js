// --- Footer year ---
document.getElementById("year").textContent = new Date().getFullYear();

// --- Dropdown control ---
function openDropdown(id) {
  const el = document.getElementById(`dropdown-${id}`);
  el.style.opacity = "1";
  el.style.transform = "translateY(0)";
  el.style.pointerEvents = "auto";
}

function closeDropdown(id) {
  const el = document.getElementById(`dropdown-${id}`);
  el.style.opacity = "0";
  el.style.transform = "translateY(-10px)";
  el.style.pointerEvents = "none";
}

// --- Floating skill bubbles ---
const bubbleContainer = document.getElementById("bubble-container");
const skills = [
  "Python", "C++", "Java", "Angular", "React", "Spring", 
  "LabVIEW", "PostgreSQL", "Linux", "Automation", "AI", "NLP"
];

for (let i = 0; i < 15; i++) {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = skills[Math.floor(Math.random() * skills.length)];
  bubble.style.left = `${Math.random() * 100}%`;
  bubble.style.animationDuration = `${10 + Math.random() * 10}s`;
  bubble.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
  bubbleContainer.appendChild(bubble);
}
