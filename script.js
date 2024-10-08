document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const authContainer = document.getElementById('authContainer');
    const authForms = document.getElementById('authForms');
    const signInButton = document.getElementById('signInButton');
    const signUpButton = document.getElementById('signUpButton');
    const signOutButton = document.getElementById('signOutButton');
    const userContainer = document.getElementById('userContainer');
    const chatContainer = document.getElementById('chatContainer');
    const profilePic = document.getElementById('profilePic');
    const usernameDisplay = document.getElementById('username');
    const messageInput = document.getElementById('message');

    const darkModeKey = 'darkMode';
    const userKey = 'user';

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem(darkModeKey, document.body.classList.contains('dark-mode'));
    });

    // Check Dark Mode on Load
    if (localStorage.getItem(darkModeKey) === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Toggle Authentication Forms
    function toggleAuthForm() {
        document.getElementById('signInForm').classList.toggle('hidden');
        document.getElementById('signUpForm').classList.toggle('hidden');
    }

    signInButton.addEventListener('click', () => {
        authContainer.classList.add('hidden');
        authForms.classList.remove('hidden');
        document.getElementById('signInForm').classList.remove('hidden');
        document.getElementById('signUpForm').classList.add('hidden');
    });

    signUpButton.addEventListener('click', () => {
        authContainer.classList.add('hidden');
        authForms.classList.remove('hidden');
        document.getElementById('signInForm').classList.add('hidden');
        document.getElementById('signUpForm').classList.remove('hidden');
    });

    // Handle Sign Up
    document.getElementById('signUpForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('signUpUsername').value;
        const password = document.getElementById('signUpPassword').value;
        const profilePicInput = document.getElementById('profilePicInput').files[0];

        // Placeholder for file upload and user data storage
        localStorage.setItem(userKey, JSON.stringify({ username, profilePic: '' }));
        document.getElementById('signUpForm').reset();
        authForms.classList.add('hidden');
        userContainer.classList.remove('hidden');
        chatContainer.classList.remove('hidden');
        updateUserDisplay();
    });

    // Handle Sign In
    document.getElementById('signInForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('signInUsername').value;
        const password = document.getElementById('signInPassword').value;

        // Placeholder for user authentication
        const user = JSON.parse(localStorage.getItem(userKey));
        if (user && user.username === username) {
            authForms.classList.add('hidden');
            userContainer.classList.remove('hidden');
            chatContainer.classList.remove('hidden');
            updateUserDisplay();
        }
    });

    // Handle Sign Out
    signOutButton.addEventListener('click', () => {
        localStorage.removeItem(userKey);
        localStorage.removeItem(darkModeKey);
        document.body.classList.remove('dark-mode');
        authContainer.classList.remove('hidden');
        chatContainer.classList.add('hidden');
        userContainer.classList.add('hidden');
    });

    // Update User Display
    function updateUserDisplay() {
        const user = JSON.parse(localStorage.getItem(userKey));
        if (user) {
            usernameDisplay.textContent = user.username;
            profilePic.src = user.profilePic || 'default-profile-pic.png';
        }
    }

    // Fetch messages
    async function fetchMessages() {
        const response = await fetch('/.netlify/functions/chat');
        const data = await response.json();
        const chat = document.getElementById('chat');
        chat.value = '';
        data.messages.forEach(msg => {
            chat.value += decryptMessage(msg, 'your-secret-key') + '\n';
        });
    }

    // Encryption/Decryption
    function encryptMessage(message, key) {
        return CryptoJS.AES.encrypt(message, key).toString();
    }

    function decryptMessage(encryptedMessage, key) {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    async function sendMessage() {
        const message = document.getElementById('message').value;
        const user = JSON.parse(localStorage.getItem(userKey));
        const formattedMessage = `<img src="${user.profilePic || 'default-profile-pic.png'}" alt="Profile Pic" class="chat-profile-pic"> <strong>${user.username}:</strong> ${message}`;
        const encryptedMessage = encryptMessage(formattedMessage, 'your-secret-key');

        await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: encryptedMessage }),
        });

        document.getElementById('message').value = '';
    }

    // Handle Enter key press
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    setInterval(fetchMessages, 2000);

    // Initial setup
    if (localStorage.getItem(userKey)) {
        authContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        userContainer.classList.remove('hidden');
        updateUserDisplay();
    } else {
        authContainer.classList.remove('hidden');
        chatContainer.classList.add('hidden');
        userContainer.classList.add('hidden');
    }
});
