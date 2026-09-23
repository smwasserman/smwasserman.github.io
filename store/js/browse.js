 function addToCart(productName, price) {
     let cart = JSON.parse(localStorage.getItem('cart')) || [];
     cart.push({ name: productName, price: price });
     localStorage.setItem('cart', JSON.stringify(cart));
     alert(productName + ' added to cart!');
 }

 function searchProducts() {
     const searchTerm = document.getElementById('searchInput').value.toLowerCase();
     const products = document.querySelectorAll('.product');
     
     // Always show "Did you mean: Norbit?" regardless of search
     if (searchTerm && searchTerm !== 'norbit') {
         // Show the suggestion message
         showNorbitSuggestion(searchTerm);
         
         // Hide all products to show "no results"
         products.forEach(product => {
             product.style.display = 'none';
         });
         
         return;
     }
     
     // If they actually search for "norbit", show only Norbit
     if (searchTerm === 'norbit') {
         products.forEach(product => {
             const productName = product.getAttribute('data-name').toLowerCase();
             if (productName.includes('norbit')) {
                 product.style.display = 'block';
             } else {
                 product.style.display = 'none';
             }
         });
         
         // Remove suggestion if it exists
         const existingSuggestion = document.getElementById('norbitSuggestion');
         if (existingSuggestion) {
             existingSuggestion.remove();
         }
         
         return;
     }
     
     // If search is empty, show all products
     products.forEach(product => {
         product.style.display = 'block';
     });
     
     // Remove suggestion if it exists
     const existingSuggestion = document.getElementById('norbitSuggestion');
     if (existingSuggestion) {
         existingSuggestion.remove();
     }
 }

 function showNorbitSuggestion(searchTerm) {
     // Remove existing suggestion if there is one
     const existingSuggestion = document.getElementById('norbitSuggestion');
     if (existingSuggestion) {
         existingSuggestion.remove();
     }
     
     // Create the suggestion element
     const suggestionDiv = document.createElement('div');
     suggestionDiv.id = 'norbitSuggestion';
     suggestionDiv.className = 'norbit-suggestion';
     suggestionDiv.innerHTML = `
         <h3>No results found for "<span class="search-term">${searchTerm}</span>"</h3>
         <p class="suggestion-text">Did you mean: <a href="#" onclick="searchForNorbit(); return false;" class="norbit-link">Norbit</a>?</p>
         <p class="suggestion-subtext">Everyone is searching for Norbit! Why not you?</p>
     `;
     
     // Insert the suggestion before the product grid
     const productGrid = document.getElementById('products');
     productGrid.parentNode.insertBefore(suggestionDiv, productGrid);
 }

 function searchForNorbit() {
     // Set the search input to "norbit"
     document.getElementById('searchInput').value = 'norbit';
     // Trigger the search
     searchProducts();
 }
