let subtotal = 0;
let insuranceTotal = 0;
let tipAmount = 0;

// Generate every 5-digit zip code from 00501 to 99950 (99,000+) and shuffle them
function generateAllZipCodes() {
    const zipCodes = [];

    // Real zip codes have gaps, but we include every number for maximum frustration
    for (let i = 501; i <= 99950; i++) {
        const zip = String(i).padStart(5, '0');
        zipCodes.push(zip);
    }
    
    // Fisher-Yates shuffle to randomize completely
    for (let i = zipCodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [zipCodes[i], zipCodes[j]] = [zipCodes[j], zipCodes[i]];
    }
    
    return zipCodes;
}

// Populate zip code dropdown
function populateZipCodes() {
    const zipCodeSelect = document.getElementById('zipCode');
    const zipCodes = generateAllZipCodes();
    
    zipCodes.forEach(zip => {
        const option = document.createElement('option');
        option.value = zip;
        option.textContent = zip;
        zipCodeSelect.appendChild(option);
    });
}

// Survey validation and progress tracking
function initializeSurvey() {
    const purchaseReasonTextarea = document.getElementById('purchaseReason');
    const charCountSpan = document.getElementById('charCount');
    const experienceRating = document.getElementById('experienceRating');
    const ratingValueSpan = document.getElementById('ratingValue');
    
    // Character counter for essay
    purchaseReasonTextarea.addEventListener('input', function() {
        charCountSpan.textContent = this.value.length;
        updateSurveyProgress();
    });
    
    // Rating slider display
    experienceRating.addEventListener('input', function() {
        ratingValueSpan.textContent = this.value;
        updateSurveyProgress();
    });
    
    // Track all survey fields for progress
    const surveyFields = [
        'hearAboutUs',
        'purchaseReason',
        'favoriteColor',
        'experienceRating'
    ];
    
    surveyFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateSurveyProgress);
            field.addEventListener('input', updateSurveyProgress);
        }
    });
    
    // Track radio buttons
    document.querySelectorAll('input[name="recommend"]').forEach(radio => {
        radio.addEventListener('change', updateSurveyProgress);
    });
    
    // Track checkboxes
    document.querySelectorAll('input[name="applies[]"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateSurveyProgress);
    });
}

// Update fake progress bar (it never reaches 100%)
function updateSurveyProgress() {
    let completed = 0;
    const totalFields = 6;
    
    // Check each survey field
    if (document.getElementById('hearAboutUs').value) completed++;
    if (document.getElementById('purchaseReason').value.length >= 500) completed++;
    if (document.getElementById('favoriteColor').value) completed++;
    if (document.getElementById('experienceRating').value) completed++;
    if (document.querySelector('input[name="recommend"]:checked')) completed++;
    if (document.querySelectorAll('input[name="applies[]"]:checked').length > 0) completed++;
    
    // Calculate progress but cap it at 95% to frustrate users
    let progress = Math.floor((completed / totalFields) * 95);
    
    // Update display
    document.getElementById('surveyProgress').textContent = progress + '%';
    document.getElementById('progressFill').style.width = progress + '%';
}

// Validate survey before allowing checkout
function validateSurvey() {
    const errors = [];
    
    // Check "How did you hear about us?"
    if (!document.getElementById('hearAboutUs').value) {
        errors.push('Please tell us how you heard about us');
    }
    
    // Check essay length
    const essayLength = document.getElementById('purchaseReason').value.length;
    if (essayLength < 500) {
        errors.push(`Essay must be at least 500 characters (currently ${essayLength} characters)`);
    }
    
    // Check favorite color
    if (!document.getElementById('favoriteColor').value) {
        errors.push('Please select your favorite color');
    }
    
    // Check recommendation radio
    if (!document.querySelector('input[name="recommend"]:checked')) {
        errors.push('Please tell us if you would recommend us');
    }
    
    // Check that at least one checkbox is selected
    if (document.querySelectorAll('input[name="applies[]"]:checked').length === 0) {
        errors.push('Please select at least one option that applies to you');
    }
    
    return errors;
}

function loadCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItemsDiv = document.getElementById('checkoutItems');

    if (cart.length === 0) {
        checkoutItemsDiv.innerHTML = '<p>Your cart is empty! <a href="browse.html">Continue shopping</a></p>';
        document.getElementById('checkoutForm').style.display = 'none';
        return;
    }

    let html = '<ul>';
    subtotal = 0;

    cart.forEach(item => {
        html += `<li>${item.name} - $${item.price.toFixed(2)}</li>`;
        subtotal += item.price;
    });

    html += '</ul>';
    checkoutItemsDiv.innerHTML = html;

    // Generate insurance options
    generateInsuranceOptions(cart);

    // Calculate and set tip (20% of subtotal)
    tipAmount = subtotal * 0.20;
    document.getElementById('tip').value = tipAmount.toFixed(2);

    updateTotal();

    // Show Norbit popup after a short delay
    setTimeout(() => {
        document.getElementById('norbitModal').style.display = 'block';
    }, 1000);
}

function generateInsuranceOptions(cart) {
    const insuranceDiv = document.getElementById('insuranceOptions');
    let html = '<p style="color: darkred; font-weight: bold; margin-bottom: 10px;">Protect your investment! Add insurance for each item:</p>';

    cart.forEach((item, index) => {
        const insuranceCost = (item.price * 0.15).toFixed(2); // 15% insurance
        html += `
            <div class="form-group" style="border: 2px dashed orange; padding: 10px; margin: 10px 0; background-color: lightyellow;">
                <label>
                    <input type="checkbox" class="insurance-checkbox" data-cost="${insuranceCost}" data-index="${index}" checked onchange="updateInsurance()">
                    <strong>${item.name}</strong> Protection Plan - Only $${insuranceCost}!
                    <br><span style="font-size: 10pt; color: gray;">Pre-selected for your convenience</span>
                </label>
            </div>
        `;
    });

    insuranceDiv.innerHTML = html;
    updateInsurance();
}

function updateInsurance() {
    insuranceTotal = 0;
    document.querySelectorAll('.insurance-checkbox:checked').forEach(checkbox => {
        insuranceTotal += parseFloat(checkbox.dataset.cost);
    });
    updateTotal();
}

function updateTotal() {
    const total = subtotal + insuranceTotal + tipAmount;
    const checkoutTotalDiv = document.getElementById('checkoutTotal');
    checkoutTotalDiv.innerHTML = `
        <h3>Subtotal: $${subtotal.toFixed(2)}</h3>
        <h3>Insurance: $${insuranceTotal.toFixed(2)}</h3>
        <h3>Tip: $${tipAmount.toFixed(2)}</h3>
        <h3 style="color: red; font-size: 24pt;">Total: $${total.toFixed(2)}</h3>
    `;
}

function showAreYouSureModal() {
    document.getElementById('norbitModal').style.display = 'none';
    document.getElementById('areYouSureModal').style.display = 'block';
}

function closeAllModals() {
    document.getElementById('norbitModal').style.display = 'none';
    document.getElementById('areYouSureModal').style.display = 'none';
}

function addNorbitToCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Always add Norbit, even if it already exists (no duplicate check)
    cart.push({ name: 'Norbit', price: 299.99 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Norbit has been added to your cart! Excellent choice!');
    location.reload(); // Reload to update the checkout
}

document.addEventListener('DOMContentLoaded', function() {
    // Populate zip codes on page load
    populateZipCodes();
    
    // Initialize survey tracking
    initializeSurvey();
    
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate survey first
        const surveyErrors = validateSurvey();
        if (surveyErrors.length > 0) {
            alert('⚠️ Survey Incomplete!\n\n' + surveyErrors.join('\n'));
            
            // Scroll to survey section
            document.getElementById('requiredSurvey').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const confirmationDiv = document.getElementById('confirmationMessage');
        const total = subtotal + insuranceTotal + tipAmount;
        confirmationDiv.innerHTML = `
            <h3 style="color: green;">Order placed successfully!</h3>
            <p>Total charged: $${total.toFixed(2)}</p>
            <p>Thank you for your generous tip and for protecting your purchase with insurance!</p>
            <p>We appreciate you taking the time to complete our survey!</p>
        `;

        // Clear the cart
        localStorage.removeItem('cart');

        // Hide the form
        document.getElementById('checkoutForm').style.display = 'none';

        // Update summary
        document.getElementById('orderSummary').style.display = 'none';

        // Redirect after 5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    });

    // Load checkout summary on page load
    loadCheckoutSummary();
});
