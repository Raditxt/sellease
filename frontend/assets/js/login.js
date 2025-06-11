document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
        // Simpan info user di localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect berdasarkan role
        if (data.user.role === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'pos.html';
        }
    } else {
        alert(data.error || 'Login gagal');
    }
    
});

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

