// DOM Elements
const userListEl = document.getElementById('userList');
const userDetailsEl = document.getElementById('userDetails');
const detailsContentEl = document.getElementById('detailsContent');
const loadingStateEl = document.getElementById('loadingState');
const errorStateEl = document.getElementById('errorState');
const searchInputEl = document.getElementById('searchInput');
const refreshBtnEl = document.getElementById('refreshBtn');
const closeDetailsBtn = document.getElementById('closeDetails');
const retryBtnEl = document.getElementById('retryBtn');
const userCountEl = document.getElementById('userCount');

// State
let users = [];
let filteredUsers = [];
let selectedUserId = null;

// API URL
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    setupEventListeners();
});

// Fetch Users from API
function fetchUsers() {
    showLoading();
    hideError();
    
    refreshBtnEl.classList.add('loading');
    
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            users = data;
            filteredUsers = data;
            hideLoading();
            renderUsers();
            updateUserCount();
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            hideLoading();
            showError();
        })
        .finally(() => {
            refreshBtnEl.classList.remove('loading');
        });
}

// Render Users
function renderUsers() {
    userListEl.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No users found matching your search.';
        userListEl.appendChild(noResults);
        return;
    }
    
    filteredUsers.forEach(user => {
        const card = createUserCard(user);
        userListEl.appendChild(card);
    });
}

// Create User Card
function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.dataset.userId = user.id;
    
    if (user.id === selectedUserId) {
        card.classList.add('active');
    }
    
    const initials = getInitials(user.name);
    const company = user.company?.name || 'No Company';
    
    card.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
            <div class="user-name">${escapeHtml(user.name)}</div>
            <div class="user-company">${escapeHtml(company)}</div>
        </div>
        <svg class="user-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6"/>
        </svg>
    `;
    
    card.addEventListener('click', () => {
        showUserDetails(user);
        setActiveCard(card);
    });
    
    return card;
}

// Show User Details
function showUserDetails(user) {
    selectedUserId = user.id;
    const initials = getInitials(user.name);
    
    detailsContentEl.innerHTML = `
        <div class="detail-avatar">${initials}</div>
        <div class="detail-name">${escapeHtml(user.name)}</div>
        
        <div class="detail-item">
            <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <div>
                <div class="detail-label">Email</div>
                <div class="detail-value">
                    <a href="mailto:${escapeHtml(user.email)}">${escapeHtml(user.email)}</a>
                </div>
            </div>
        </div>
        
        <div class="detail-item">
            <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <div>
                <div class="detail-label">Phone</div>
                <div class="detail-value">
                    <a href="tel:${escapeHtml(user.phone)}">${escapeHtml(user.phone)}</a>
                </div>
            </div>
        </div>
        
        <div class="detail-item">
            <svg class="detail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <div>
                <div class="detail-label">Website</div>
                <div class="detail-value">
                    <a href="https://${escapeHtml(user.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(user.website)}</a>
                </div>
            </div>
        </div>
    `;
    
    userDetailsEl.classList.remove('hidden');
}

// Set Active Card
function setActiveCard(activeCard) {
    document.querySelectorAll('.user-card').forEach(card => {
        card.classList.remove('active');
    });
    activeCard.classList.add('active');
}

// Search Users
function searchUsers(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredUsers = users;
    } else {
        filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm)
        );
    }
    
    renderUsers();
    updateUserCount();
}

// Setup Event Listeners
function setupEventListeners() {
    // Search input
    searchInputEl.addEventListener('input', (e) => {
        searchUsers(e.target.value);
    });
    
    // Refresh button
    refreshBtnEl.addEventListener('click', () => {
        searchInputEl.value = '';
        selectedUserId = null;
        userDetailsEl.classList.add('hidden');
        fetchUsers();
    });
    
    // Close details button
    closeDetailsBtn.addEventListener('click', () => {
        userDetailsEl.classList.add('hidden');
        selectedUserId = null;
        document.querySelectorAll('.user-card').forEach(card => {
            card.classList.remove('active');
        });
    });
    
    // Retry button
    retryBtnEl.addEventListener('click', () => {
        fetchUsers();
    });
    
    // Keyboard accessibility for closing details
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !userDetailsEl.classList.contains('hidden')) {
            userDetailsEl.classList.add('hidden');
            selectedUserId = null;
            document.querySelectorAll('.user-card').forEach(card => {
                card.classList.remove('active');
            });
        }
    });
}

// Helper Functions
function showLoading() {
    loadingStateEl.classList.remove('hidden');
}

function hideLoading() {
    loadingStateEl.classList.add('hidden');
}

function showError() {
    errorStateEl.classList.remove('hidden');
}

function hideError() {
    errorStateEl.classList.add('hidden');
}

function updateUserCount() {
    userCountEl.textContent = filteredUsers.length;
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}