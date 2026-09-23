// Difficulty variables
let attemptCount = 0;
let buttonMoveCount = 0;
let captchaRequired = false;
let currentCaptcha = null;
let fieldsShuffled = false;
let buttonClickCount = 0;
let needsSevenClicks = false;

// Misleading error messages
const errorMessages = [
    "Password is incorrect. Try making it more secure.",
    "Username not found. Please use your existing username.",
    "Too many login attempts. This is your first attempt.",
    "Success! Just kidding, try again.",
    "Error 404: Login not found.",
    "Your password must contain at least one emoji.",
    "Account locked. Please try logging in to unlock.",
    "Invalid credentials. Have you tried using the correct ones?",
    "Login failed successfully.",
    "Please enter a valid invalid password."
];

// CAPTCHA challenges
const captchas = [
    { question: "What is 5 + 3? (Answer in Roman numerals)", answer: "VIII" },
    { question: "What is 5 + 3? (Answer in Roman numerals)", answer: "viii" },
    { question: "What is 9 + 10? (Hint: It's not 19)", answer: "21" },
    { question: "Type the word 'LOGIN' backwards in lowercase", answer: "nigol" },
    { question: "What is the name of the cat in Stuart Little", answer: "Snowbell" },
    { question: "What year did Stuart Little 2 come out?", answer: "2002" },
    { question: "Complete: Silly Samuel's Silly ____", answer: "Store" },
    { question: "Complete: Silly Samuel's Silly ____", answer: "store" }
];

// Moving button logic
const loginButton = document.getElementById('loginButton');
let isButtonMoving = true;

loginButton.addEventListener('mouseenter', function() {
    if (isButtonMoving && buttonMoveCount < 7) {
        const container = document.getElementById('buttonContainer');
        const maxX = container.offsetWidth - loginButton.offsetWidth;
        const maxY = container.offsetHeight - loginButton.offsetHeight;

        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;

        loginButton.classList.add('moving');
        loginButton.style.left = randomX + 'px';
        loginButton.style.top = randomY + 'px';

        buttonMoveCount++;

        // After 7 moves, let button stay still for 2 seconds
        if (buttonMoveCount >= 7) {
            isButtonMoving = false;
            setTimeout(() => {
                // Reset position back to grid
                loginButton.classList.remove('moving');
                loginButton.style.left = '';
                loginButton.style.top = '';
                buttonMoveCount = 0;
                isButtonMoving = true;
            }, 2000);
        }
    }
});

// Click counter for "click exactly 7 times" challenge
loginButton.addEventListener('click', function() {
    if (needsSevenClicks) {
        buttonClickCount++;
        document.getElementById('attemptCounter').textContent =
            `Mystery counter: ${buttonClickCount}`;
    }
});

// Shuffle fields randomly
function shuffleFields() {
    if (Math.random() > 0.5 && !fieldsShuffled) {
        const field1 = document.getElementById('field1');
        const field2 = document.getElementById('field2');
        const parent = field1.parentNode;

        field1.classList.add('shuffled');
        field2.classList.add('shuffled');

        parent.insertBefore(field2, field1);
        fieldsShuffled = true;

        setTimeout(() => {
            field1.classList.remove('shuffled');
            field2.classList.remove('shuffled');
        }, 500);
    }
}

// Randomly switch password field visibility
setInterval(() => {
    const passwordField = document.getElementById('password');
    if (passwordField.value && Math.random() > 0.95) {
        const currentType = passwordField.type;
        passwordField.type = currentType === 'password' ? 'text' : 'password';
        setTimeout(() => {
            passwordField.type = 'password';
        }, 500);
    }
}, 2000);

// Show CAPTCHA after first attempt
function showCaptcha() {
    const captchaDiv = document.getElementById('captchaChallenge');
    captchaDiv.classList.add('show');

    // Randomly decide if we need 7 clicks
    needsSevenClicks = Math.random() > 0.9;

    if (needsSevenClicks) {
        currentCaptcha = { question: "Click the Login button exactly 7 times", answer: "7" };
    } else {
        currentCaptcha = captchas[Math.floor(Math.random() * captchas.length)];
    }

    document.getElementById('captchaQuestion').textContent = currentCaptcha.question;
    captchaRequired = true;
}

// Fake button error
function showFakeError() {
    const message = document.getElementById('loginMessage');
    message.textContent = "Nice try! That's not the real login button.";
    message.style.color = 'red';
    message.classList.add('shake');
    setTimeout(() => message.classList.remove('shake'), 500);

    // Randomly show fake success modal
    if (Math.random() > 0.7) {
        setTimeout(() => {
            document.getElementById('fakeSuccessModal').style.display = 'block';
        }, 500);
    }

    // Randomly show fake loading
    if (Math.random() > 0.8) {
        showFakeLoading();
    }
}

// Close fake success modal
function closeFakeSuccess() {
    document.getElementById('fakeSuccessModal').style.display = 'none';
}

// Show fake loading spinner
function showFakeLoading() {
    const loading = document.getElementById('fakeLoading');
    loading.style.display = 'block';
    setTimeout(() => {
        loading.style.display = 'none';
        alert('❌ Authentication failed! (Just kidding, try logging in for real)');
    }, 3000);
}

// Random popup messages
const annoyingPopups = [
    "💡 Did you know? Your password is probably too weak!",
    "🔒 Security Tip: Change your password every 6 to 7 days!",
    "🎉 Congratulations! You're our 1,000,000th login attempt!",
    "🚨 Alert: Your account has been compromised!",
];

// Show random popups occasionally
setInterval(() => {
    if (Math.random() > 0.97 && attemptCount > 0) {
        alert(annoyingPopups[Math.floor(Math.random() * annoyingPopups.length)]);
    }
}, 5000);

// Main login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    attemptCount++;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('loginMessage');

    // Show CAPTCHA after first attempt
    if (attemptCount === 1) {
        showCaptcha();
        message.textContent = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        message.style.color = 'red';
        message.classList.add('shake');
        setTimeout(() => message.classList.remove('shake'), 500);

        // Clear fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        shuffleFields();
        return;
    }

    // Check CAPTCHA if required
    if (captchaRequired) {
        const captchaAnswer = document.getElementById('captchaAnswer').value.trim();

        // Special handling for "7 clicks" challenge
        if (needsSevenClicks && buttonClickCount !== 7) {
            message.textContent = `You clicked ${buttonClickCount} times. The challenge said "exactly 7 times"!`;
            message.style.color = 'red';
            buttonClickCount = 0;
            document.getElementById('attemptCounter').textContent = '';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('captchaAnswer').value = '';
            return;
        }

        if (captchaAnswer !== currentCaptcha.answer) {
            message.textContent = "CAPTCHA incorrect! " + errorMessages[Math.floor(Math.random() * errorMessages.length)];
            message.style.color = 'red';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('captchaAnswer').value = '';
            shuffleFields();
            return;
        }
    }

    // Check actual credentials
    if (username === 'name' && password === '12345') {
        message.textContent = 'Login successful! Redirecting...';
        message.style.color = 'green';
        sessionStorage.setItem('loggedIn', 'true');
        setTimeout(() => {
            window.location.href = 'browse.html';
        }, 1000);
    } else {
        message.textContent = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        message.style.color = 'red';
        message.classList.add('shake');
        setTimeout(() => message.classList.remove('shake'), 500);

        // Clear fields on error
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        if (captchaRequired) {
            document.getElementById('captchaAnswer').value = '';
        }
        shuffleFields();
    }
});
