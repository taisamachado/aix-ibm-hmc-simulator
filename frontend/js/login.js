const API_BASE_URL = 'http://localhost:5001/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Clear previous errors
    errorMessage.style.display = 'none';
    
    // Disable button and show spinner
    loginBtn.disabled = true;
    loginText.style.display = 'none';
    loginSpinner.style.display = 'inline-block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store token and username
            localStorage.setItem('hmc_token', data.token);
            localStorage.setItem('hmc_username', data.username);
            
            // Redirect to dashboard
            window.location.href = 'pages/dashboard.html';
        } else {
            // Show error message
            errorMessage.textContent = data.message || 'Login failed. Please try again.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Connection error. Please ensure the server is running.';
        errorMessage.style.display = 'block';
    } finally {
        // Re-enable button and hide spinner
        loginBtn.disabled = false;
        loginText.style.display = 'inline';
        loginSpinner.style.display = 'none';
    }
});

// Auto-focus username field
document.getElementById('username').focus();

// Made with Bob
