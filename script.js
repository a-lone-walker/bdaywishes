// Firebase Setup
const db = firebase.firestore();
const storage = firebase.storage();

// Countdown Timer with Particles
const bday = new Date("April 11, 2025 00:00:00").getTime();
const countdown = document.getElementById("countdown");
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = document.querySelector(".hero-section").offsetHeight;

const particles = [];
function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };
}

for (let i = 0; i < 50; i++) particles.push(createParticle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

function updateTimer() {
    const now = new Date().getTime();
    const distance = bday - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    countdown.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (distance < 0) countdown.innerHTML = "Happy Birthday, Ashok!";
}
setInterval(updateTimer, 1000);

// Form Submission with Progress
document.getElementById("wishForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;
    const audioFile = document.getElementById("audio").files[0];
    const videoFile = document.getElementById("video").files[0];
    const feedback = document.getElementById("formFeedback");

    if (!message) {
        feedback.innerHTML = "<div class='alert alert-danger'>Please enter a birthday wish!</div>";
        return;
    }

    let audioURL = "", videoURL = "";
    const audioProgress = document.getElementById("audioProgress");
    const videoProgress = document.getElementById("videoProgress");

    if (audioFile) {
        audioProgress.style.display = "block";
        const audioRef = storage.ref().child(`audio/${audioFile.name}`);
        const uploadTask = audioRef.put(audioFile);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            audioProgress.querySelector(".progress-bar").style.width = `${progress}%`;
        });
        await uploadTask;
        audioURL = await audioRef.getDownloadURL();
        audioProgress.style.display = "none";
    }

    if (videoFile) {
        videoProgress.style.display = "block";
        const videoRef = storage.ref().child(`video/${videoFile.name}`);
        const uploadTask = videoRef.put(videoFile);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            videoProgress.querySelector(".progress-bar").style.width = `${progress}%`;
        });
        await uploadTask;
        videoURL = await videoRef.getDownloadURL();
        videoProgress.style.display = "none";
    }

    await db.collection("wishes").add({
        name: name || "Anonymous",
        message,
        audioURL,
        videoURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    feedback.innerHTML = "<div class='alert alert-success'>Your wish has been sent!</div>";
    document.getElementById("wishForm").reset();
});

// Display Wishes
const wishesDiv = document.getElementById("wishes");
db.collection("wishes").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    wishesDiv.innerHTML = "";
    snapshot.forEach((doc) => {
        const data = doc.data();
        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";
        col.innerHTML = `
            <div class="wish-card">
                <p><strong>${data.name}</strong>: ${data.message}</p>
                ${data.audioURL ? `<audio controls src="${data.audioURL}"></audio>` : ""}
                ${data.videoURL ? `<video controls width="100%" src="${data.videoURL}"></video>` : ""}
            </div>
        `;
        wishesDiv.appendChild(col);
    });
});

// Dark Mode Toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// Load Dark Mode Preference
if (localStorage.getItem("darkMode") === "true") document.body.classList.add("dark-mode");

// Scroll Animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("animate__fadeInUp");
    });
}, { threshold: 0.1 });

document.querySelectorAll("section").forEach(section => observer.observe(section));