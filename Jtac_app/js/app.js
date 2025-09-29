// js/app.js
console.log("JTAC App loaded");

// Inicjalizacja localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];
if (!users.length) {
    localStorage.setItem("users", JSON.stringify([]));
    console.log("Utworzono pustą bazę użytkowników w localStorage.");
}

// Obsługa rejestracji
document.addEventListener("DOMContentLoaded", () => {
    const signinForm = document.getElementById("signin-form");
    if (signinForm && window.location.pathname.includes("/signin.html")) {
        signinForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const role = document.getElementById("role").value;

            if (!username || !password || !role) {
                alert("Wypełnij wszystkie pola!");
                return;
            }

            const userExists = users.some(u => u.username === username);
            if (userExists) {
                alert("Użytkownik o tej nazwie już istnieje!");
                return;
            }

            users.push({ username, password, role });
            localStorage.setItem("users", JSON.stringify(users));
            alert("Zarejestrowano pomyślnie!");
            window.location.href = "/login.html";
        });
    }

    // Obsługa przycisków na index.html
    const signinBtn = document.getElementById("signin-btn");
    const loginBtn = document.getElementById("login-btn");

    if (signinBtn) {
        signinBtn.addEventListener("click", (e) => {
            console.log("Przejście do rejestracji...");
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", (e) => {
            console.log("Przejście do logowania...");
        });
    }
});

// Debugowanie
function debugUsers() {
    const currentUsers = JSON.parse(localStorage.getItem("users")) || [];
    console.log("Aktualni użytkownicy:", currentUsers);
}

debugUsers();