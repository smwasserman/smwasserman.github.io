// Homepage chaos script

let chatbotDismissCount = 0;
let dealCountdown = 300; // 5 minutes in seconds

// Newsletter Popup
function showNewsletterPopup() {
    document.getElementById('newsletterModal').style.display = 'block';
}

function closeNewsletterPopup() {
    document.getElementById('newsletterModal').style.display = 'none';
    // Show it again after 15 seconds because why not
    setTimeout(showNewsletterPopup, 15000);
}

function submitNewsletter() {
    alert('Thank you for subscribing! You will now receive 50 emails per day!');
    closeNewsletterPopup();
}

// Cookie Consent
function acceptAllCookies() {
    document.getElementById('cookieConsent').style.display = 'none';
    alert('You have accepted 670 cookies! Yum! 😋');
}

function showCookieSettings() {
    alert('We haven\'t implemented cookie settings. We\'re just going to track them anyways.');
    document.getElementById('cookieConsent').style.display = 'none';
}

// Limited Time Deal Popup
function showDealPopup() {
    document.getElementById('dealModal').style.display = 'block';
    startDealCountdown();
}

function closeDealPopup() {
    document.getElementById('dealModal').style.display = 'none';
}

function startDealCountdown() {
    const countdownInterval = setInterval(() => {
        dealCountdown--;
        const minutes = Math.floor(dealCountdown / 60);
        const seconds = dealCountdown % 60;
        const countdownElement = document.getElementById('dealCountdown');

        if (countdownElement) {
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        if (dealCountdown <= 0) {
            clearInterval(countdownInterval);
            // Reset and start over
            dealCountdown = 300;
            startDealCountdown();
        }
    }, 1000);
}

// Chatbot Widget
function showChatbot() {
    const chatbot = document.getElementById('chatbotWidget');
    chatbot.style.display = 'block';
    chatbot.classList.add('bounce');

    // Make it bounce annoyingly
    setTimeout(() => {
        chatbot.classList.remove('bounce');
    }, 1000);
}

function minimizeChatbot() {
    document.getElementById('chatbotWidget').style.display = 'none';
    chatbotDismissCount++;

    // Come back even more aggressively
    const delay = Math.max(3000 - (chatbotDismissCount * 500), 1000);
    setTimeout(showChatbot, delay);
}

// Visitor Counter (fake random numbers)
function updateVisitorCounter() {
    const counter = document.getElementById('visitorCount');
    const min = 847;
    const max = 1253;
    const randomCount = Math.floor(Math.random() * (max - min + 1)) + min;
    counter.textContent = randomCount;
}

// "People viewing" counter
function updateViewingCounter() {
    const counter = document.getElementById('viewingCount');
    const min = 23;
    const max = 47;
    const randomCount = Math.floor(Math.random() * (max - min + 1)) + min;
    counter.textContent = randomCount;
}

// Banner carousel
let currentSlide = 0;
function rotateBanner() {
    const banners = document.querySelectorAll('.banner-slide');
    banners.forEach((banner, index) => {
        banner.style.display = index === currentSlide ? 'block' : 'none';
    });

    currentSlide = (currentSlide + 1) % banners.length;
}

// Random popup that appears
function randomAnnoyingPopup() {
    const messages = [
        'Did you know? 99% of our customers love us! (Sample size: 1)',
        '⚠️ WARNING: Your computer may be running slow! Buy our airfryer to fix it!',
        '🎉 CONGRATULATIONS! You are visitor #847! Click here to claim your prize!',
        '💰 SPECIAL OFFER: Buy 2 airfryers, get 1 Stuart Little DVD FREE!',
        '📢 BREAKING NEWS: Scientists recommend watching Norbit daily!',
        '🚨 URGENT: Your cart is feeling lonely! Add items now!'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Create a temporary popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: ${Math.random() * 50}%;
        left: ${Math.random() * 50}%;
        background: linear-gradient(45deg, yellow, magenta, cyan);
        border: 5px solid red;
        padding: 20px;
        z-index: 9999;
        font-size: 16pt;
        box-shadow: 0 0 30px rgba(255,0,255,0.8);
        animation: shake 0.5s infinite;
    `;
    popup.innerHTML = `
        <p style="margin: 10px 0; color: black; font-weight: bold;">${randomMessage}</p>
        <button onclick="this.parentElement.remove()" style="background: red; color: white; padding: 10px; border: none; cursor: pointer; font-family: 'Comic Sans MS';">Close (X)</button>
    `;

    document.body.appendChild(popup);

    // Auto remove after 5 seconds if not closed
    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 5000);
}

// Initialize everything on page load
window.addEventListener('load', function() {
    // Cookie consent appears immediately
    document.getElementById('cookieConsent').style.display = 'block';

    // Newsletter popup after 2 seconds
    setTimeout(showNewsletterPopup, 2000);

    // Deal popup after 5 seconds
    setTimeout(showDealPopup, 5000);

    // Chatbot after 8 seconds
    setTimeout(showChatbot, 8000);

    // Start banner rotation (every 2 seconds)
    setInterval(rotateBanner, 2000);
    rotateBanner(); // Show first one immediately

    // Update visitor counters every 3 seconds
    setInterval(updateVisitorCounter, 3000);
    setInterval(updateViewingCounter, 4000);
    updateVisitorCounter();
    updateViewingCounter();

    // Random annoying popups every 15 seconds
    setInterval(randomAnnoyingPopup, 15000);
});
