document.addEventListener('DOMContentLoaded', function () {
    // Handle Registration
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const firstName = document.getElementById('first_name').value;
            const lastName = document.getElementById('last_name').value;
            const phone = document.getElementById('phone').value;

            try {
                const res = await fetch('/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, first_name: firstName, last_name: lastName, phone })
                });

                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'messages.html';
                } else {
                    document.getElementById('register-error').innerText = data.message || 'Registration failed';
                }
            } catch (err) {
                console.error('Error:', err);
                document.getElementById('register-error').innerText = 'Registration failed';
            }
        });
    }

    // Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const errorText = await res.text(); // Read the response as text
                document.getElementById('login-error').innerText = errorText || 'Login failed';
                return;
            }

            const data = await res.json();
            localStorage.setItem('token', data.token); // Store the JWT token in local storage
            window.location.href = 'messages.html'; // Redirect to messages page after successful login
        } catch (err) {
            console.error('Error:', err);
            document.getElementById('login-error').innerText = 'Login failed';
        }
    });
}


    // Fetch Messages
const messagesContainer = document.getElementById('messages-container');
if (messagesContainer) {
    async function fetchMessages() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/messages', {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
                }
            });

            const data = await res.json();
            if (res.ok) {
                data.messages.forEach(message => {
                    const messageDiv = document.createElement('div');
                    messageDiv.innerHTML = `
                        <strong>${message.from_username}</strong> to <strong>${message.to_username}</strong>: ${message.body}
                    `;
                    messagesContainer.appendChild(messageDiv);
                });
            } else {
                messagesContainer.innerText = 'Failed to load messages';
            }
        } catch (err) {
            console.error('Error:', err);
            messagesContainer.innerText = 'Failed to load messages';
        }
    }
    fetchMessages();
}


    // Fetch and Display Message Details
    const messageDetailContainer = document.getElementById('message-detail-container');
    if (messageDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const messageId = urlParams.get('id');
        async function fetchMessageDetail() {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`/messages/${messageId}`, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
                    }
                });

                const data = await res.json();
                if (res.ok) {
                    messageDetailContainer.innerHTML = `<h2>From: ${data.message.from_username}</h2><p>${data.message.body}</p>`;
                } else {
                    messageDetailContainer.innerText = 'Failed to load message details';
                }
            } catch (err) {
                console.error('Error:', err);
                messageDetailContainer.innerText = 'Failed to load message details';
            }
        }
        fetchMessageDetail();
    }

     // Handle New Message
    const newMessageForm = document.getElementById('new-message-form');
    if (newMessageForm) {
        async function fetchUsers() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/users', {
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
            }
        });
        const data = await res.json();
        if (res.ok) {
            const recipientSelect = document.getElementById('recipient');
            // Clear any existing options
            recipientSelect.innerHTML = '';
            // Populate the <select> with user options
            data.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.username;
                option.innerText = `${user.first_name} ${user.last_name} (${user.username})`;
                recipientSelect.appendChild(option);
            });
        } else {
            document.getElementById('new-message-error').innerText = 'Failed to load users';
        }
    } catch (err) {
        console.error('Error:', err);
        document.getElementById('new-message-error').innerText = 'Failed to load users';
    }
}
        fetchUsers();

        // Handle the submission of the new message
newMessageForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const to_username = document.getElementById('recipient').value; // Get the selected recipient
    const body = document.getElementById('body').value; // Get the message body
    const token = localStorage.getItem('token'); // Get the token from localStorage

    try {
        const res = await fetch('/messages', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
            },
            body: JSON.stringify({ to_username, body }) // Include both to_username and body in the request body
        });

        const data = await res.json();
        if (res.ok) {
            window.location.href = 'messages.html'; // Redirect to messages page after successful submission
        } else {
            document.getElementById('new-message-error').innerText = 'Failed to send message';
        }
    } catch (err) {
        console.error('Error:', err);
        document.getElementById('new-message-error').innerText = 'Failed to send message';
    }
});

    }
});

