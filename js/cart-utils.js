// ========== Cart Utility Functions ==========
// Shared cart functions used across multiple pages

// Get cart from localStorage
function getCart() {
    try {
        const savedCart = localStorage.getItem('b2bCart');
        if (savedCart) {
            return JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
    
    // Return empty cart if none exists
    return {
        sellerId: null,
        sellerName: '',
        sellerPhone: '',
        items: []
    };
}

// Save cart to localStorage
function saveCart(cart) {
    try {
        localStorage.setItem('b2bCart', JSON.stringify(cart));
        
        // Dispatch a storage event for other tabs/windows to update
        window.dispatchEvent(new Event('storage'));
        
        return true;
    } catch (error) {
        console.error('Error saving cart:', error);
        return false;
    }
}

// Clear entire cart
function clearCart() {
    const emptyCart = {
        sellerId: null,
        sellerName: '',
        sellerPhone: '',
        items: []
    };
    saveCart(emptyCart);
    return emptyCart;
}

// Add item to cart
function addToCart(item, sellerId, sellerName, sellerPhone) {
    const cart = getCart();
    
    // Check if cart belongs to this seller or is empty
    if (cart.sellerId && cart.sellerId !== sellerId) {
        if (!confirm('Starting a new cart will clear items from other sellers. Continue?')) {
            return false;
        }
        cart.items = [];
    }

    // Set seller info if cart is empty
    if (!cart.sellerId) {
        cart.sellerId = sellerId;
        cart.sellerName = sellerName;
        cart.sellerPhone = sellerPhone || '';
    }

    // Check if item already exists
    const existingItem = cart.items.find(i => i.id === item.id);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.items.push({
            ...item,
            quantity: 1
        });
    }

    saveCart(cart);
    return true;
}

// Remove item from cart
function removeFromCart(itemId) {
    const cart = getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    
    if (cart.items.length === 0) {
        cart.sellerId = null;
        cart.sellerName = '';
        cart.sellerPhone = '';
    }
    
    saveCart(cart);
    return cart;
}

// Update item quantity
function updateCartItemQuantity(itemId, quantity) {
    const cart = getCart();
    const item = cart.items.find(i => i.id === itemId);
    
    if (item) {
        if (quantity < 1) {
            return removeFromCart(itemId);
        }
        item.quantity = quantity;
        saveCart(cart);
    }
    
    return cart;
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
}

// Get cart item count
function getCartItemCount() {
    const cart = getCart();
    return cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

// Check if cart belongs to a specific seller
function cartBelongsToSeller(sellerId) {
    const cart = getCart();
    return cart.sellerId === sellerId;
}

// Format cart for sharing
function formatCartForSharing() {
    const cart = getCart();
    if (cart.items.length === 0) return null;
    
    let message = `Hello *${cart.sellerName}*, I'm interested in the following items:\n\n`;
    
    cart.items.forEach((item, index) => {
        message += `${index + 1}. *${item.title}* - ${item.currency || 'UGX'} ${(item.price || 0).toLocaleString()} x ${item.quantity || 1}\n`;
    });
    
    const total = getCartTotal();
    message += `\n*Total: UGX ${total.toLocaleString()}*`;
    
    return message;
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCart,
        saveCart,
        clearCart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        getCartTotal,
        getCartItemCount,
        cartBelongsToSeller,
        formatCartForSharing
    };
}
