// Firebase Setup
const db = firebase.firestore();
const storage = firebase.storage();

// Moderation System
let isModerator = false;
const MODERATION_PASSWORD = "birthday123"; // Change this password

// Media Recorders
let audioRecorder, videoRecorder;
let audioChunks = [], videoChunks = [];
let audioBlob, videoBlob;

// DOM Elements
const startAudioBtn = document.getElementById('startAudio');
const stopAudioBtn = document.getElementById('stopAudio');
const playAudioBtn = document.getElementById('playAudio');
const audioPreview = document.getElementById('audioPreview');
const audioStatus = document.getElementById('audioStatus');
const audioUpload = document.getElementById('audioUpload');

const startVideoBtn = document.getElementById('startVideo');
const stopVideoBtn = document.getElementById('stopVideo');
const videoPreview = document.getElementById('videoPreview');
const videoStatus = document.getElementById('videoStatus');
const videoUpload = document.getElementById('videoUpload');

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

// Audio Recording
// startAudioBtn.addEventListener('click', async () => {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         audioRecorder = new MediaRecorder(stream);
//         audioChunks = [];
        
//         audioRecorder.ondataavailable = e => {
//             audioChunks.push(e.data);
//         };
        
//         audioRecorder.onstop = () => {
//             audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
//             const audioURL = URL.createObjectURL(audioBlob);
//             audioPreview.src = audioURL;
//             audioPreview.style.display = 'block';
//             audioStatus.textContent = "Audio recorded! Click play to review.";
//             playAudioBtn.disabled = false;
//             audioUpload.style.display = 'none';
//         };
        
//         audioRecorder.start();
//         startAudioBtn.disabled = true;
//         stopAudioBtn.disabled = false;
//         startAudioBtn.classList.add('recording', 'recording-audio');
//         audioStatus.textContent = "Recording audio... Click stop when done.";
//     } catch (err) {
//         console.error("Error accessing microphone:", err);
//         audioStatus.textContent = "Error accessing microphone. Please allow permissions.";
//     }
// });

// stopAudioBtn.addEventListener('click', () => {
//     if (audioRecorder && audioRecorder.state !== 'inactive') {
//         audioRecorder.stop();
//         audioRecorder.stream.getTracks().forEach(track => track.stop());
//         startAudioBtn.disabled = false;
//         stopAudioBtn.disabled = true;
//         startAudioBtn.classList.remove('recording', 'recording-audio');
//     }
// });

// playAudioBtn.addEventListener('click', () => {
//     if (audioPreview.src) {
//         audioPreview.play();
//     }
// });

// // Video Recording
// startVideoBtn.addEventListener('click', async () => {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         videoRecorder = new MediaRecorder(stream);
//         videoChunks = [];
        
//         videoRecorder.ondataavailable = e => {
//             videoChunks.push(e.data);
//         };
        
//         videoRecorder.onstop = () => {
//             videoBlob = new Blob(videoChunks, { type: 'video/mp4' });
//             const videoURL = URL.createObjectURL(videoBlob);
//             videoPreview.src = videoURL;
//             videoPreview.style.display = 'block';
//             videoStatus.textContent = "Video recorded!";
//             videoUpload.style.display = 'none';
//         };
        
//         // Show camera preview
//         videoPreview.srcObject = stream;
//         videoPreview.style.display = 'block';
//         videoPreview.muted = true;
//         videoPreview.play();
        
//         videoRecorder.start();
//         startVideoBtn.disabled = true;
//         stopVideoBtn.disabled = false;
//         startVideoBtn.classList.add('recording', 'recording-video');
//         videoStatus.textContent = "Recording video... Click stop when done.";
//     } catch (err) {
//         console.error("Error accessing camera:", err);
//         videoStatus.textContent = "Error accessing camera. Please allow permissions.";
//     }
// });

// stopVideoBtn.addEventListener('click', () => {
//     if (videoRecorder && videoRecorder.state !== 'inactive') {
//         videoRecorder.stop();
//         videoRecorder.stream.getTracks().forEach(track => track.stop());
//         startVideoBtn.disabled = false;
//         stopVideoBtn.disabled = true;
//         startVideoBtn.classList.remove('recording', 'recording-video');
//         videoPreview.srcObject = null;
//     }
// });

// Form Submission with Progress
document.getElementById("wishForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;
    const feedback = document.getElementById("formFeedback");
    const audioFile = audioUpload.files[0];
    const videoFile = videoUpload.files[0];

    if (!message) {
        feedback.innerHTML = "<div class='alert alert-danger'>Please enter a birthday wish!</div>";
        return;
    }

    let audioURL = "", videoURL = "";
    const audioProgress = document.getElementById("audioProgress");
    const videoProgress = document.getElementById("videoProgress");

    // Upload recorded audio if exists
    if (audioBlob) {
        audioProgress.style.display = "block";
        const audioName = `audio_${Date.now()}.wav`;
        const audioRef = storage.ref().child(`audio/${audioName}`);
        const uploadTask = audioRef.put(audioBlob);
        
        await new Promise((resolve, reject) => {
            uploadTask.on("state_changed", 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    audioProgress.querySelector(".progress-bar").style.width = `${progress}%`;
                },
                (error) => {
                    feedback.innerHTML = "<div class='alert alert-danger'>Audio upload failed!</div>";
                    console.error("Audio upload error:", error);
                    audioProgress.style.display = "none";
                    reject(error);
                },
                async () => {
                    audioURL = await audioRef.getDownloadURL();
                    console.log("Audio URL:", audioURL);
                    audioProgress.style.display = "none";
                    resolve();
                }
            );
        });
    }

    // Upload recorded video if exists
    if (videoBlob) {
        videoProgress.style.display = "block";
        const videoName = `video_${Date.now()}.mp4`;
        const videoRef = storage.ref().child(`video/${videoName}`);
        const uploadTask = videoRef.put(videoBlob);
        
        await new Promise((resolve, reject) => {
            uploadTask.on("state_changed", 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    videoProgress.querySelector(".progress-bar").style.width = `${progress}%`;
                },
                (error) => {
                    feedback.innerHTML = "<div class='alert alert-danger'>Video upload failed!</div>";
                    console.error("Video upload error:", error);
                    videoProgress.style.display = "none";
                    reject(error);
                },
                async () => {
                    videoURL = await videoRef.getDownloadURL();
                    console.log("Video URL:", videoURL);
                    videoProgress.style.display = "none";
                    resolve();
                }
            );
        });
    }

    try {
        await db.collection("wishes").add({
            name: name || "Anonymous",
            message,
            audioURL,
            videoURL,
            approved: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Wish added to Firestore");
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        feedback.innerHTML = "<div class='alert alert-success'>Your wish has been sent for approval!</div>";
        document.getElementById("wishForm").reset();
        audioPreview.style.display = "none";
        videoPreview.style.display = "none";
        audioBlob = null;
        videoBlob = null;
    } catch (error) {
        console.error("Error adding wish to Firestore:", error);
        feedback.innerHTML = "<div class='alert alert-danger'>Failed to send your wish!</div>";
    }
});

// Display Wishes
const wishesDiv = document.getElementById("wishes");
db.collection("wishes").where("approved", "==", true)
  .orderBy("timestamp", "desc")
  .onSnapshot((snapshot) => {
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

// Moderation Functions
function toggleModerationView() {
    isModerator = !isModerator;
    document.getElementById('moderation').style.display = isModerator ? 'block' : 'none';
    document.getElementById('wishes-wall').style.display = isModerator ? 'none' : 'block';
    if(isModerator) loadModerationQueue();
}

function verifyPassword() {
    const input = document.getElementById('adminPassword').value;
    if(input === MODERATION_PASSWORD) {
        $('#passwordPrompt').modal('hide');
        toggleModerationView();
    } else {
        alert("Incorrect password!");
    }
}

function loadModerationQueue() {
    db.collection("wishes").where("approved", "==", false)
      .onSnapshot((snapshot) => {
        const queue = document.getElementById("moderationQueue");
        queue.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            queue.innerHTML += `
                <div class="col-12 mb-3">
                    <div class="wish-card p-3">
                        <p>${data.name || "Anonymous"}: ${data.message}</p>
                        ${data.audioURL ? `<audio controls src="${data.audioURL}"></audio>` : ''}
                        ${data.videoURL ? `<video controls src="${data.videoURL}"></video>` : ''}
                        <button onclick="approveWish('${doc.id}')" class="btn btn-success mt-2">Approve</button>
                        <button onclick="deleteWish('${doc.id}')" class="btn btn-danger mt-2">Delete</button>
                    </div>
                </div>
            `;
        });
    });
}

async function approveWish(id) {
    if(!isModerator) return;
    await db.collection("wishes").doc(id).update({ approved: true });
}

async function deleteWish(id) {
    if(!isModerator) return;
    await db.collection("wishes").doc(id).delete();
}

// Dark Mode Toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// Load Dark Mode Preference
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

// File Upload Toggle
audioUpload.addEventListener('change', () => {
    if (audioUpload.files.length > 0) {
        audioBlob = null;
        audioPreview.style.display = 'none';
    }
});

videoUpload.addEventListener('change', () => {
    if (videoUpload.files.length > 0) {
        videoBlob = null;
        videoPreview.style.display = 'none';
    }
});
