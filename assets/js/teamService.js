import { db, auth } from './firebase.js';
import { collection, getDocs, addDoc, query, where, deleteDoc, doc } from "firebase/firestore";

// Random avatars for users who don't have one
const AVATARS = [
    'https://i.pravatar.cc/150?u=1',
    'https://i.pravatar.cc/150?u=2',
    'https://i.pravatar.cc/150?u=3',
    'https://i.pravatar.cc/150?u=4',
    'https://i.pravatar.cc/150?u=5',
    'https://i.pravatar.cc/150?u=8',
    'https://i.pravatar.cc/150?u=12'
];

/**
 * Generates a list of all signed-up users from Firestore.
 */
// Store users globally for filtering
let allUsers = [];
// Store my pending requests: targetUid -> requestId
let requestedUsers = new Map();
// Store accepted connections: Set of UIDs
let connectedUsers = new Set();

/**
 * Generates a list of all signed-up users from Firestore.
 */
export async function loadTeamMembers() {
    const grid = document.getElementById('team-grid');
    const searchInput = document.getElementById('team-search');

    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading community...</div>';



    try {
        await auth.authStateReady();
        const me = auth.currentUser;

        // 1. Reset state
        requestedUsers.clear();
        connectedUsers.clear();

        if (me) {
            // Fetch PENDING requests (outgoing)
            const qPending = query(
                collection(db, "requests"),
                where("from", "==", me.uid),
                where("status", "==", "pending")
            );
            const pendingSnap = await getDocs(qPending);
            pendingSnap.forEach(doc => {
                requestedUsers.set(doc.data().to, doc.id);
            });

            // Fetch ACCEPTED requests (both directions)
            // Case 1: I sent, they accepted
            const qSentAccepted = query(
                collection(db, "requests"),
                where("from", "==", me.uid),
                where("status", "==", "accepted")
            );
            // Case 2: They sent, I accepted
            const qReceivedAccepted = query(
                collection(db, "requests"),
                where("to", "==", me.uid),
                where("status", "==", "accepted")
            );

            const [sentSnap, receivedSnap] = await Promise.all([
                getDocs(qSentAccepted),
                getDocs(qReceivedAccepted)
            ]);

            sentSnap.forEach(doc => connectedUsers.add(doc.data().to));
            receivedSnap.forEach(doc => connectedUsers.add(doc.data().from));
        }

        // 2. Fetch users from Firestore
        const qUsers = query(collection(db, "users"));
        const querySnapshot = await getDocs(qUsers);
        allUsers = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const isMe = me && me.uid === doc.id;

            // Don't show myself in the list
            if (isMe) return;

            // Assign a random avatar if not present (based on UID or name to be consistent)
            const avatarIndex = (doc.id.charCodeAt(0) + (data.name?.length || 0)) % AVATARS.length;

            allUsers.push({
                id: doc.id,
                name: data.name || "Anonymous",
                role: data.role || "Innovator",
                skills: data.skills || [],
                lookingFor: data.lookingFor || null, // Might not be in DB yet
                avatar: data.avatar || AVATARS[avatarIndex],
                isMe: isMe
            });
        });

        // Initial Render
        renderUsers(allUsers);

        // Setup Search Listener
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = allUsers.filter(user =>
                    user.name.toLowerCase().includes(term) ||
                    user.role.toLowerCase().includes(term) ||
                    (user.skills && user.skills.some(skill => skill.toLowerCase().includes(term)))
                );
                renderUsers(filtered);
            });
        }

    } catch (e) {
        console.error("Team load error", e);
        grid.innerHTML = '<div class="error">Failed to load team members. Please try again later.</div>';
    }
}

function renderUsers(users) {
    const grid = document.getElementById('team-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (users.length === 0) {
        grid.innerHTML = '<div class="empty-state">No matching users found.</div>';
        return;
    }

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = `team-card magic-bento-card magic-bento-card--border-glow ${user.isMe ? 'current-user-card' : ''}`;
        card.style.setProperty('--glow-color', user.isMe ? '#8400ff' : '#00ffd0');

        const skillsHtml = Array.isArray(user.skills) && user.skills.length > 0
            ? user.skills.slice(0, 3).map(s => `<span class="tag-sm">${s}</span>`).join('')
            : '<span class="tag-sm" style="opacity:0.5">No skills listed</span>';

        // Check status
        const requestId = requestedUsers.get(user.id);
        const isConnected = connectedUsers.has(user.id);
        let actionButton;

        if (user.isMe) {
            actionButton = `<button class="btn-glass-sm" style="margin-top: auto;" onclick="window.location.href='profile.html'">Edit Profile</button>`;
        } else if (isConnected) {
            actionButton = `<button class="btn-glass-sm" style="margin-top: auto; background: rgba(132, 0, 255, 0.2); border-color: #8400ff;" onclick="window.location.href='messages.html'">Message</button>`;
        } else if (requestId) {
            actionButton = `<button class="btn-glass-sm" style="margin-top: auto; background: rgba(0, 255, 136, 0.2); border-color: #00ff88;" onclick="window.cancelConnectRequest(this, '${requestId}', '${user.id}')">Requested</button>`;
        } else {
            actionButton = `<button class="btn-glass-sm" style="margin-top: auto;" onclick="window.sendConnectRequest(this, '${user.id}')">Connect</button>`;
        }

        card.innerHTML = `
                <div class="card-content-center" style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%;">
                    <img src="${user.avatar}" class="user-avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--border-color); margin-bottom: 15px;">
                    
                    <h3 style="font-size: 1.2rem; margin-bottom: 5px;">${user.name}</h3>
                    <span style="color: var(--color-blue); font-size: 0.9rem; margin-bottom: 10px;">${user.role}</span>
                    
                    ${user.lookingFor ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 15px;">Looking for: <strong style="color: var(--text-main);">${user.lookingFor}</strong></p>` : ''}
                    
                    <div class="skills-row" style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                        ${skillsHtml}
                    </div>

                    ${actionButton}
                </div>
            `;

        grid.appendChild(card);

        if (window.attachBentoEffect) {
            window.attachBentoEffect(card, {
                glowColor: user.isMe ? '132, 0, 255' : '0, 255, 208',
                enableStars: true,
                enableTilt: true
            });
        }
    });
}

// Global function to handle connection requests


window.sendConnectRequest = async (btn, targetUid) => {
    if (!auth.currentUser) {
        alert("Please login first");
        return;
    }

    try {
        // const originalText = btn.textContent;
        btn.textContent = "Sending...";
        btn.disabled = true;

        const docRef = await addDoc(collection(db, "requests"), {
            from: auth.currentUser.uid,
            to: targetUid,
            status: "pending",
            timestamp: new Date().toISOString()
        });

        // Update local state
        requestedUsers.set(targetUid, docRef.id);

        btn.textContent = "Requested";
        btn.style.background = "rgba(0, 255, 136, 0.2)";
        btn.style.borderColor = "#00ff88";
        btn.disabled = false;
        // Update onclick to allow cancel
        btn.onclick = () => window.cancelConnectRequest(btn, docRef.id, targetUid);

    } catch (e) {
        console.error("Error sending request:", e);
        alert("Failed to send request");
        btn.textContent = "Connect";
        btn.disabled = false;
    }
};

// Global function to cancel requests
window.cancelConnectRequest = async (btn, requestId, targetUid) => {
    if (!confirm("Withdraw connection request?")) return;

    try {
        btn.textContent = "Withdrawing...";
        btn.disabled = true;

        await deleteDoc(doc(db, "requests", requestId));

        // Update local state
        requestedUsers.delete(targetUid);

        btn.textContent = "Connect";
        btn.style.background = "";
        btn.style.borderColor = "";
        btn.disabled = false;
        // Update onclick to allow send again
        btn.onclick = () => window.sendConnectRequest(btn, targetUid);

    } catch (e) {
        console.error("Error cancelling request:", e);
        alert("Failed to withdraw request");
        btn.textContent = "Requested";
        btn.disabled = false;
    }
};
