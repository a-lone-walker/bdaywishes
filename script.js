// Firebase Setup
const db = firebase.firestore();
const storage = firebase.storage();

// Moderation System
let isModerator = false;
const MODERATION_PASSWORD = "birthday123"; // Change this password

// Countdown Timer for Today
const bday = new Date();
bday.setHours(23, 59, 59, 999); // Set to end of today
const countdown = document.getElementById("countdown");

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

// Form Submission with Text Message Only
document.getElementById("wishForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;
    const feedback = document.getElementById("formFeedback");

    if (!message) {
        feedback.innerHTML = "<div class='alert alert-danger'>Please enter a birthday wish!</div>";
        return;
    }

    try {
        await db.collection("wishes").add({
            name: name || "Anonymous",
            message,
            approved: false, // Keep this as false for moderation
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        feedback.innerHTML = "<div class='alert alert-success'>Your wish has been sent for approval!</div>";
        document.getElementById("wishForm").reset();
    } catch (error) {
        console.error("Error adding wish to Firestore:", error);
        feedback.innerHTML = "<div class='alert alert-danger'>Failed to send your wish!</div>";
    }
});

// Display Wishes
const wishesDiv = document.getElementById("wishes");
db.collection("wishes").where("approved", "==", true) // Only fetch approved wishes
  .orderBy("timestamp", "desc")
  .onSnapshot((snapshot) => {
    wishesDiv.innerHTML = ""; // Clear existing wishes
    snapshot.forEach((doc) => {
        const data = doc.data();
        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";
        col.innerHTML = `
            <div class="wish-card">
                <p><strong>${data.name}</strong>: ${data.message}</p>
            </div>
        `;
        wishesDiv.appendChild(col); // Append the approved wish to the display
    });
});

// Moderation Functions
function toggleModerationView() {
    isModerator = !isModerator; // Toggle the moderator state
    document.getElementById('moderation').style.display = isModerator ? 'block' : 'none'; // Show/hide moderation panel
    document.getElementById('wishes-wall').style.display = isModerator ? 'none' : 'block'; // Show/hide wishes wall
    if(isModerator) loadModerationQueue(); // Load the moderation queue if in moderator mode
}

function loadModerationQueue() {
    db.collection("wishes").where("approved", "==", false)
      .onSnapshot((snapshot) => {
        const queue = document.getElementById("moderationQueue");
        queue.innerHTML = ''; // Clear the queue
        snapshot.forEach(doc => {
            const data = doc.data();
            queue.innerHTML += `
                <div class="col-12 mb-3">
                    <div class="wish-card p-3">
                        <p>${data.name || "Anonymous"}: ${data.message}</p>
                        <button onclick="approveWish('${doc.id}')" class="btn btn-success mt-2">Approve</button>
                        <button onclick="deleteWish('${doc.id}')" class="btn btn-danger mt-2">Delete</button>
                    </div>
                </div>
            `;
        });
    });
}

async function approveWish(id) {
    if(!isModerator) return; // Ensure only moderators can approve
    await db.collection("wishes").doc(id).update({ approved: true }); // Update the wish to approved
}

async function deleteWish(id) {
    if(!isModerator) return; // Ensure only moderators can delete
    await db.collection("wishes").doc(id).delete(); // Delete the wish
}

// Password Verification
function verifyPassword() {
    const input = document.getElementById('adminPassword').value;
    if(input === MODERATION_PASSWORD) {
        $('#passwordPrompt').modal('hide');
        toggleModerationView(); // Show/hide moderation panel
    } else {
        alert("Incorrect password!");
    }
}

// Dark Mode Toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// Load Dark Mode Preference
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}s
