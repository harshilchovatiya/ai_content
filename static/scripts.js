let currentChatId = null;
let chats = {}; // Object to store chat data
let isInitialLoad = true; // Flag to prevent duplicate messages on initial load

// Load chats from local storage and create a new chat if none exist
document.addEventListener('DOMContentLoaded', () => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
    }
    
    if (Object.keys(chats).length === 0) {
        createNewChat(); // Create a new chat if none exist
    } else {
        renderChatList();
        // Switch to the first chat if there are any
        switchChat(Object.keys(chats)[0]);
    }
    isInitialLoad = false; // Set the flag to false after initial load
});

document.getElementById('newChatButton').addEventListener('click', createNewChat);

function createNewChat() {
    const chatId = Date.now(); // Unique ID for the chat
    currentChatId = chatId;

    // Create a new chat entry in the sidebar
    const chatList = document.getElementById('chatList');
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.id = `chat-${chatId}`;
    chatItem.innerHTML = `
        <span>Chat ${chatId}</span>
        <button class="delete-button" onclick="confirmDeleteChat(${chatId})">...</button>
    `;
    chatItem.addEventListener('click', () => switchChat(chatId));
    chatList.appendChild(chatItem);

    // Initialize chat container
    const chatContainer = document.getElementById('chat');
    chatContainer.innerHTML = '';
    chats[chatId] = []; // Initialize chat messages

    // Save chat to local storage
    saveChats();
    switchChat(chatId); // Switch to the newly created chat
}

function confirmDeleteChat(chatId) {
    const confirmed = confirm('Are you sure you want to delete this chat?');
    if (confirmed) {
        deleteChat(chatId);
    }
}

function deleteChat(chatId) {
    // Remove chat from sidebar
    const chatItem = document.getElementById(`chat-${chatId}`);
    if (chatItem) chatItem.remove();

    // Clear chat content if it's the current chat
    if (currentChatId === chatId) {
        document.getElementById('chat').innerHTML = '';
        currentChatId = null;
    }

    // Remove chat from chats object
    delete chats[chatId];

    // Save updated chats to local storage
    saveChats();
    if (Object.keys(chats).length > 0) {
        // If there are remaining chats, switch to the first one
        switchChat(Object.keys(chats)[0]);
    } else {
        // Create a new chat if no chats are left
        createNewChat();
    }
}

function renderChatList() {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = ''; // Clear existing chat list
    for (const chatId in chats) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.id = `chat-${chatId}`;
        chatItem.innerHTML = `
            <span>Chat ${chatId}</span>
            <button class="delete-button" onclick="confirmDeleteChat(${chatId})">...</button>
        `;
        chatItem.addEventListener('click', () => switchChat(chatId));
        chatList.appendChild(chatItem);
    }
}

function switchChat(chatId) {
    currentChatId = chatId;
    const chatContainer = document.getElementById('chat');
    chatContainer.innerHTML = ''; // Clear current chat messages

    // Add messages from chats object
    chats[chatId].forEach(message => {
        addMessage(message.sender, message.text, false);
    });
}

// Function to add messages to the chat container
function addMessage(sender, text, shouldSave = true) {
    const chatContainer = document.getElementById('chat');
    const messageHtml = `
        <div class="message ${sender}-message">
            <div class="avatar">${sender === 'user' ? 'U' : 'A'}</div>
            <div class="text">${text}</div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', messageHtml);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
    
    if (shouldSave) {
        chats[currentChatId].push({ sender, text }); // Save message to chat
        saveChats();
    }
}

// Function to display AI response
function displayAIResponse(data) {
    const responseText = data.response;
    addMessage('ai', responseText);
}

// Save chats to local storage
function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

// Handle Enter and Shift+Enter for message input
document.getElementById('userInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            // Shift + Enter for new line
            const cursorPos = this.selectionStart;
            const text = this.value;
            this.value = text.substring(0, cursorPos) + '\n' + text.substring(cursorPos);
            this.selectionStart = this.selectionEnd = cursorPos + 1;
            event.preventDefault();
        } else {
            // Enter for sending the message
            event.preventDefault();
            sendMessage();
        }
    }
});

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (!userInput || !currentChatId) return;

    addMessage('user', userInput);

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: userInput })
        });
        const data = await response.json();
        
        if (data.error) {
            addMessage('ai', `Error: ${data.error}`);
        } else {
            displayAIResponse(data);
        }
    } catch (error) {
        addMessage('ai', `Error: ${error.message}`);
    }

    document.getElementById('userInput').value = '';
}
