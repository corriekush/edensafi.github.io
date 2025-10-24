document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables ---
    const cartIcon = document.querySelector('.cart-icon a');
    const cartPanel = document.getElementById('cartPanel');
    const closeCartBtn = document.getElementById('closeCart');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutModal = document.getElementById('checkoutModal');
    const cancelCheckoutBtn = document.querySelector('.cancel-checkout');
    const checkoutForm = document.getElementById('checkoutForm');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.querySelector('.cart-count');
    
    // !!! ADJUSTMENT 1: UPDATED WHATSAPP NUMBER
    const whatsappNumber = '254703654000'; 

    let cart = [];

    // --- Utility Functions ---

    /**
     * Formats a number into the KSh currency string.
     * @param {number} price - The price to format.
     * @returns {string} - The formatted currency string.
     */
    function formatCurrency(price) {
        return `KSh ${price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    /**
     * Updates the cart count in the navbar icon and recalculates the total.
     */
    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        cartCountElement.textContent = totalItems;
        cartTotalElement.textContent = formatCurrency(totalPrice);
        
        // Hide/Show cart items message
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #777;">Your cart is empty.</p>';
        } else {
            renderCartItems();
        }
    }

    /**
     * Renders all items currently in the cart array into the cart panel.
     */
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-price">${formatCurrency(item.price)} x ${item.quantity}</p>
                </div>
                <div class="item-controls">
                    <button class="remove-one-btn" data-id="${item.id}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="add-one-btn" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}" title="Remove Item">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    /**
     * Adds a product to the cart or increments its quantity.
     * @param {string} name - Product name.
     * @param {number} price - Product price.
     */
    function addToCart(name, price) {
        // Create a unique ID for the product
        const itemId = name.replace(/\s/g, '-').toLowerCase(); 
        const existingItem = cart.find(item => item.id === itemId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id: itemId, name: name, price: price, quantity: 1 });
        }
        updateCartUI();
        cartPanel.classList.add('open'); // Open the cart when an item is added
    }

    /**
     * Handles incrementing/decrementing/removing items from the cart.
     * @param {string} action - 'add', 'remove-one', or 'remove-all'.
     * @param {string} id - The ID of the item.
     */
    function modifyCartItem(action, id) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        if (action === 'add') {
            cart[itemIndex].quantity++;
        } else if (action === 'remove-one') {
            cart[itemIndex].quantity--;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove item if quantity is zero
            }
        } else if (action === 'remove-all') {
            cart.splice(itemIndex, 1);
        }
        updateCartUI();
    }


    // --- Event Listeners: Cart Panel & Checkout Modal ---

    // Toggle Cart Panel visibility
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cartPanel.classList.toggle('open');
    });

    closeCartBtn.addEventListener('click', () => {
        cartPanel.classList.remove('open');
    });

    // Show Checkout Modal
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
             // Use the second checkout modal element in the HTML
            const modal = document.querySelectorAll('.checkout-modal')[1];
            modal.classList.remove('hidden');
            cartPanel.classList.remove('open'); // Close cart panel
        } else {
            alert('Your cart is empty. Please add products before checking out.');
        }
    });

    // Hide Checkout Modal
    cancelCheckoutBtn.addEventListener('click', () => {
        const modal = document.querySelectorAll('.checkout-modal')[1];
        modal.classList.add('hidden');
    });

    // Handle quantity changes and removals inside the cart panel
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-one-btn')) {
            modifyCartItem('add', e.target.dataset.id);
        } else if (e.target.classList.contains('remove-one-btn')) {
            modifyCartItem('remove-one', e.target.dataset.id);
        } else if (e.target.classList.contains('remove-btn')) {
            modifyCartItem('remove-all', e.target.dataset.id);
        }
    });

    // --- Checkout Form Submission (WhatsApp) ---

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let orderDetails = `*🛍️ EdenSafi Order Inquiry*\n\n`;
        orderDetails += `*Customer:* ${customerName}\n`;
        orderDetails += `*Contact:* ${customerPhone}\n\n`;
        orderDetails += `*Order Items:*\n`;

        cart.forEach((item, index) => {
            const lineTotal = item.price * item.quantity;
            orderDetails += `${index + 1}. ${item.name} (${formatCurrency(item.price)}) x ${item.quantity} = ${formatCurrency(lineTotal)}\n`;
        });

        orderDetails += `\n*Total Order Value:* ${formatCurrency(totalAmount)}`;
        orderDetails += `\n\n_Please confirm availability and delivery details. Thank you!_`;

        const encodedMessage = encodeURIComponent(orderDetails);
        
        // !!! Opens in a new page/tab as requested
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`; 

        window.open(whatsappURL, '_blank');

        // Clear the cart and close the modal after sending the order
        cart = [];
        updateCartUI();
        e.target.closest('.checkout-modal').classList.add('hidden');
        checkoutForm.reset();
    });

    // --- Product Card Click Handlers (Add to Cart) ---

    // Select all product cards in all sections
    const allProductCards = document.querySelectorAll('.product-card, .product');

    // Attach a click listener to all product elements
    allProductCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent adding to cart if the click was on a carousel navigation button
            if (e.target.classList.contains('carousel-btn') || e.target.closest('.carousel-btn') || 
                e.target.classList.contains('prev-btn') || e.target.classList.contains('next-btn') ||
                e.target.closest('.prev-btn') || e.target.closest('.next-btn')) {
                return;
            }

            let name, priceText;

            // Handle Featured Products (.product)
            if (card.classList.contains('product')) {
                // Featured products don't have data attributes, so we extract from text
                // We'll use the image alt text as the name and the price text.
                name = card.querySelector('img').alt || 'Featured Product';
                priceText = card.querySelector('.price').textContent.trim();
                
                // Convert price text (e.g., "$12.99" or "Ksh 1,500") to a number
                let priceMatch = priceText.match(/[\d,.]+/);
                if (priceMatch) {
                    // Remove KSh, $, commas, and convert to integer (assuming whole KSh or dollars)
                    price = parseInt(priceMatch[0].replace(/[^0-9.]/g, '').split('.')[0]); 
                } else {
                    console.error('Could not parse price from featured product:', priceText);
                    return; 
                }

            } 
            // Handle Category Products (.product-card)
            else if (card.classList.contains('product-card')) {
                name = card.dataset.name || card.querySelector('h4')?.textContent || 'Unnamed Product';
                price = parseInt(card.dataset.price);
            }
            
            // Final check and add to cart
            if (name && price) {
                addToCart(name, price);
            } else {
                console.error('Product card missing data-price or name:', card);
            }
        });
    });


    // --- Carousel / Slider Logic ---

    /**
     * Initializes a single product carousel.
     * @param {string} carouselId - The ID of the carousel container (e.g., 'citricCarousel').
     * @param {string} prevBtnId - The ID of the previous button (e.g., 'prevCitric').
     * @param {string} nextBtnId - The ID of the next button (e.g., 'nextCitric').
     * @param {number} scrollAmount - How many pixels to scroll (e.g., 300).
     */
    function initCarousel(carouselId, prevBtnId, nextBtnId, scrollAmount = 300) {
        const carousel = document.getElementById(carouselId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (!carousel || !prevBtn || !nextBtn) return;

        const scroll = (direction) => {
            carousel.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        };

        prevBtn.addEventListener('click', () => scroll(-1));
        nextBtn.addEventListener('click', () => scroll(1));
    }
    
    // !!! ADJUSTMENT 2: Featured Products carousel initialization
    const featuredCarousel = document.querySelector('.featured-products .carousel');
    const featuredPrevBtn = document.querySelector('.featured-products .prev-btn');
    const featuredNextBtn = document.querySelector('.featured-products .next-btn');

    if (featuredCarousel && featuredPrevBtn && featuredNextBtn) {
         const scrollFeatured = (direction) => {
            // Adjust scroll distance dynamically based on a product card width (e.g., 240px including margin)
            featuredCarousel.scrollBy({
                left: direction * 240, 
                behavior: 'smooth'
            });
        };

        featuredPrevBtn.addEventListener('click', () => scrollFeatured(-1));
        featuredNextBtn.addEventListener('click', () => scrollFeatured(1));
    }


    // Initialize category carousels
    initCarousel('citricCarousel', 'prevCitric', 'nextCitric', 300);
    initCarousel('electronicsCarousel', 'prevElectronics', 'nextElectronics', 300);
    // Note: Furniture carousel IDs were corrected in the previous CSS step, ensuring they match here.
    initCarousel('furnitureCarousel', 'prevfurnitures', 'nextFurniture', 300);
    initCarousel('fresh-vegetablesCarousel', 'prevFresh-vegetables', 'nextFresh-vegetables', 300);


    // --- Dropdown Logic (Language and Visit) ---
    
    /**
     * Toggles the visibility of a dropdown menu.
     * @param {HTMLElement} selectedDiv - The div representing the currently selected item.
     */
    function toggleDropdown(selectedDiv) {
        const optionsList = selectedDiv.nextElementSibling;
        selectedDiv.classList.toggle('active');
        if (optionsList) {
            optionsList.classList.toggle('open');
        }
    }

    // Language Dropdown
    const langDropdownSelected = document.querySelector('.language-dropdown .dropdown-selected');
    const langOptions = document.querySelectorAll('.language-dropdown .dropdown-options li');
    
    if (langDropdownSelected) {
        langDropdownSelected.addEventListener('click', () => toggleDropdown(langDropdownSelected));
        langDropdownSelected.addEventListener('blur', () => {
            // Wait a moment to allow click event on option to fire before closing
            setTimeout(() => {
                langDropdownSelected.classList.remove('active');
                if (langDropdownSelected.nextElementSibling) {
                    langDropdownSelected.nextElementSibling.classList.remove('open');
                }
            }, 100);
        });
    }

    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedText = option.textContent;
            const selectedSpan = langDropdownSelected.querySelector('.selected-text');
            
            if (selectedSpan) {
                selectedSpan.textContent = selectedText;
            }
            console.log('Language set to:', option.dataset.lang);
            
            // Manually close the dropdown
            langDropdownSelected.classList.remove('active');
            if (langDropdownSelected.nextElementSibling) {
                langDropdownSelected.nextElementSibling.classList.remove('open');
            }
        });
    });

    // Visit Dropdown (Similar logic for the visit dropdown)
    const visitDropdownSelected = document.querySelector('.visit-dropdown .dropdown-selected');
    
    if (visitDropdownSelected) {
        visitDropdownSelected.addEventListener('click', () => toggleDropdown(visitDropdownSelected));
        visitDropdownSelected.addEventListener('blur', () => {
            setTimeout(() => {
                visitDropdownSelected.classList.remove('active');
                if (visitDropdownSelected.nextElementSibling) {
                    visitDropdownSelected.nextElementSibling.classList.remove('open');
                }
            }, 100);
        });
    }
    // --- Services Hire Button WhatsApp Logic ---

    const hireButtons = document.querySelectorAll('.hire-btn');
    
    hireButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const serviceName = e.target.dataset.service;
            const servicePrice = e.target.dataset.price;
            
            // Define the WhatsApp message for service hire
            let hireMessage = `*💼 Service Inquiry: EdenSafi*\n\n`;
            hireMessage += `I am interested in hiring the following service:\n`;
            hireMessage += `*Service:* ${serviceName}\n`;
            hireMessage += `*Pricing:* ${servicePrice}\n\n`;
            hireMessage += `Please reply to discuss the project details and terms.`;

            const encodedMessage = encodeURIComponent(hireMessage);
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`; 
            
            window.open(whatsappURL, '_blank');
        });
    });
    
    // --- Initial Setup (Keep this at the very end) ---
    updateCartUI(); // Initialize cart state on load
});
    