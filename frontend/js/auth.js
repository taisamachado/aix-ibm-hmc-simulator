const API_BASE_URL = 'http://localhost:5001/api';

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('hmc_token');
    const username = localStorage.getItem('hmc_username');
    
    if (!token || !username) {
        window.location.href = '/pages/login.html';
        return null;
    }
    
    return { token, username };
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('hmc_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Logout function
async function logout() {
    const token = localStorage.getItem('hmc_token');
    
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    localStorage.removeItem('hmc_token');
    localStorage.removeItem('hmc_username');
    window.location.href = '/pages/login.html';
}

// Setup logout button
document.addEventListener('DOMContentLoaded', () => {
    const auth = checkAuth();
    if (auth) {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.textContent = `Logged in as: ${auth.username}`;
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    }
});

// Handle API errors
function handleApiError(error, response) {
    if (response && response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('hmc_token');
        localStorage.removeItem('hmc_username');
        window.location.href = '/pages/login.html';
    }
    console.error('API Error:', error);
}

// Made with Bob
