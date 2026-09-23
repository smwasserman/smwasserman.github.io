let priceMultiplier = 1.0;
let checkoutAttempts = 0;
let timeOnPage = 0;
let upsellsAdded = false;
let viewingCounter = Math.floor(Math.random() * 50) + 20;

function loadCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalDiv = document.getElementById('cartTotal');

    // Auto-add upsells on first load
    if (!upsellsAdded && cart.length > 0) {
        addUpsells(cart);
        upsellsAdded = true;
    }

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="font-size: 18pt; color: red;">Your cart is empty! Go buy something!</p>';
        cartTotalDiv.innerHTML = '';
        document.getElementById('checkoutSection').style.display = 'none';
        return;
    }

    let html = '<div style="display: grid; gap: 15px;">';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const currentPrice = item.price * priceMultiplier;
        const oldPrice = item.price;
        subtotal += currentPrice;

        // Add animation classes randomly
        const animations = ['cart-bounce', 'cart-shake', 'cart-spin'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];

        html += `
            <div class="${randomAnimation}" style="border: 3px solid purple; padding: 15px; background: linear-gradient(45deg, lightpink, lightblue, lightyellow); position: relative;">
                <h3 style="color: red; font-size: 18pt;">${item.name}</h3>
                ${priceMultiplier > 1.0 ? `<p style="text-decoration: line-through; color: gray;">Was: $${oldPrice.toFixed(2)}</p>` : ''}
                <p style="font-size: 20pt; font-weight: bold; color: darkgreen;">
                    Now: $${currentPrice.toFixed(2)}
                    ${priceMultiplier > 1.0 ? '<span style="color: red; font-size: 12pt;"> (Dynamic Pricing!)</span>' : ''}
                </p>
                <p style="color: orange; font-weight: bold;">⚠️ ${Math.floor(Math.random() * 3) + 1} LEFT IN STOCK!</p>
                <p style="color: purple; font-size: 10pt;">${Math.floor(Math.random() * 30) + 10} people have this in their cart right now!</p>
                <button onclick="removeItem(${index})" class="button" style="background-color: red;">Remove Item</button>
                <button onclick="addMoreOfSame('${item.name}', ${item.price})" class="button" style="background-color: lime; color: black;">Remove Item</button>
            </div>
        `;
    });

    html += '</div>';
    cartItemsDiv.innerHTML = html;

    // Calculate totals
    const taxes = subtotal * 0.087; // Random tax rate
    const fees = 12.99; // Processing fee
    const total = subtotal + taxes + fees;

    cartTotalDiv.innerHTML = `
        <div style="background-color: lightyellow; border: 5px dashed orange; padding: 20px; margin: 20px 0;">
            <p style="font-size: 16pt;">Subtotal: $${subtotal.toFixed(2)}</p>
            <p style="font-size: 16pt;">Taxes: $${taxes.toFixed(2)}</p>
            <p style="font-size: 16pt;">Processing Fee: $${fees.toFixed(2)}</p>
            <h2 class="cart-spin" style="color: red; font-size: 28pt;">Total: $${total.toFixed(2)}</h2>
            <p style="color: green; font-size: 14pt;">🎉 You saved: $${(Math.random() * 50 + 10).toFixed(2)}!</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 14pt; color: red; font-weight: bold;">🔴 LIVE: ${viewingCounter} people viewing their carts right now!</p>
        </div>
    `;

    // Check minimum purchase
    updateCheckoutButton(total);
}

function addUpsells(cart) {
    // Add various upsells
    const upsells = [
        { name: '🎁 Premium Gift Wrapping (Added for your convenience!)', price: 19.99 },
        { name: '📦 Mystery Bonus Box - Could be anything!', price: 49.99 },
        { name: '🚀 Priority Shipping (Arrives maybe faster)', price: 29.99 }
    ];

    // Add extended warranty for each actual product
    cart.forEach(item => {
        if (!item.name.includes('Warranty') && !item.name.includes('Gift Wrapping') && !item.name.includes('Mystery')) {
            const warrantyPrice = item.price * 0.20;
            cart.push({
                name: `🛡️ Extended Warranty for ${item.name}`,
                price: warrantyPrice
            });
        }
    });

    // Add other upsells
    upsells.forEach(upsell => {
        cart.push(upsell);
    });

    localStorage.setItem('cart', JSON.stringify(cart));
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemName = cart[index].name;

    // Make it hard to remove upsells
    if (itemName.includes('Warranty') || itemName.includes('Gift Wrapping') || itemName.includes('Mystery') || itemName.includes('Shipping')) {
        if (!confirm('Are you SURE you want to remove this valuable protection? Your items may arrive damaged and unprotected!')) {
            return;
        }
        if (!confirm('REALLY SURE? This is a once-in-a-lifetime offer!')) {
            return;
        }
    }

    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function addMoreOfSame(name, price) {
    // The fake "Remove" button actually adds more!
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name: name, price: price });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added another one to your cart! (Oops, wrong button!)');
    loadCart();
}

function clearCart() {
    if (!confirm('Are you sure? This will remove ALL items!')) return;
    if (!confirm('Including the amazing Mystery Bonus Box?')) return;
    if (!confirm('You will regret this decision. Last chance!')) return;

    localStorage.removeItem('cart');
    upsellsAdded = false;
    loadCart();
}

function updateCheckoutButton(total) {
    const checkoutBtn = document.getElementById('realCheckoutBtn');
    const fakeError = document.getElementById('fakeError');
    const countdownDisplay = document.getElementById('countdownDisplay');

    if (total < 100) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.backgroundColor = 'gray';
        fakeError.innerHTML = `<p class="error-minimum">⚠️ Minimum purchase of $100 required! Add more items!</p>`;
        // Hide countdown if minimum not met
        if (countdownDisplay) {
            countdownDisplay.style.display = 'none';
        }
    } else if (timeOnPage < 30) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.backgroundColor = 'gray';
        fakeError.innerHTML = `<p class="error-countdown">⏳ Please wait ${30 - timeOnPage} seconds before proceeding to checkout...</p>`;
        
        // Show and update countdown display
        if (countdownDisplay) {
            countdownDisplay.style.display = 'block';
            updateCountdownDisplay(30 - timeOnPage);
        }
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.backgroundColor = 'lime';
        fakeError.innerHTML = '';
        
        // Hide countdown when time is up
        if (countdownDisplay) {
            countdownDisplay.style.display = 'none';
        }
    }
}

// Update the countdown timer display
function updateCountdownDisplay(secondsRemaining) {
    const countdownTimeElement = document.getElementById('countdownTime');
    const progressFillElement = document.getElementById('countdownProgressFill');
    
    if (countdownTimeElement) {
        // Format as MM:SS
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        countdownTimeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Add extra annoying messages at certain intervals
        const countdownMessage = document.querySelector('.countdown-message');
        if (countdownMessage) {
            if (secondsRemaining === 25) {
                countdownMessage.textContent = 'For security purposes, you must wait before proceeding to checkout.';
            } else if (secondsRemaining === 20) {
                countdownMessage.textContent = 'Please be patient! This is for your own protection.';
            } else if (secondsRemaining === 15) {
                countdownMessage.textContent = 'Almost halfway there! Keep waiting...';
            } else if (secondsRemaining === 10) {
                countdownMessage.textContent = 'Just 10 more seconds! You can do it!';
            } else if (secondsRemaining === 5) {
                countdownMessage.textContent = '5... 4... 3... 2... 1...';
            }
        }
    }
    
    // Update progress bar (fills from 0% to 100%)
    if (progressFillElement) {
        const progressPercent = ((30 - secondsRemaining) / 30) * 100;
        progressFillElement.style.width = progressPercent + '%';
    }
}

function attemptCheckout() {
    checkoutAttempts++;

    // Random fake errors
    if (checkoutAttempts === 1) {
        alert('❌ Server Error: Please try again in a moment...');
        return;
    } else if (checkoutAttempts === 2) {
        alert('❌ Connection timeout. Please verify your cart and try again...');
        return;
    } else if (checkoutAttempts === 3) {
        // Show upsell modal before allowing checkout
        document.getElementById('lastChanceModal').style.display = 'block';
        return;
    } else {
        // Actually go to checkout
        window.location.href = 'checkout.html';
    }
}

function fakeCheckout() {
    const messages = [
        'This button does nothing! Try another one!',
        'Oops! That was the wrong button!',
        'Nice try! Keep looking!',
        'So close! But not quite!',
        'Maybe the next button will work?'
    ];
    alert(messages[Math.floor(Math.random() * messages.length)]);
}

function closeUpsellModal(addItem) {
    if (addItem) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push({ name: '💎 PREMIUM Norbit Collection (DVD + Blu-ray + Digital)', price: 499.99 });
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Norbit Collection added! Excellent choice!');
        loadCart();
    }
    document.getElementById('lastChanceModal').style.display = 'none';
    // Actually go to checkout now
    window.location.href = 'checkout.html';
}

function showRecommendations() {
    document.getElementById('recommendationsModal').style.display = 'block';
}

function closeRecommendations() {
    document.getElementById('recommendationsModal').style.display = 'none';
}

function addRecommendation(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name: name, price: price });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} has been added to your cart!`);
    loadCart();
}

// Price increase every 10 seconds
setInterval(() => {
    priceMultiplier += 0.05 + (Math.random() * 0.10); // Increase by 5-15%
    loadCart();
}, 10000);

// Timer for checkout button
setInterval(() => {
    timeOnPage++;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0) {
        let total = cart.reduce((sum, item) => sum + (item.price * priceMultiplier), 0);
        total = total * 1.087 + 12.99; // Add taxes and fees
        updateCheckoutButton(total);
    }
}, 1000);

// Update viewing counter
setInterval(() => {
    viewingCounter = Math.floor(Math.random() * 50) + 20;
    loadCart();
}, 5000);

// Show recommendations popup after 3 seconds
setTimeout(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0) {
        showRecommendations();
    }
}, 3000);

// Load cart on page load
window.onload = loadCart;
