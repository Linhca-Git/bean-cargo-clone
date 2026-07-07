// local-cart-compare.js
// Custom client-side mock implementation for Shopping Cart, Checkout, and Product Comparison

(function() {
    // ----------------------------------------------
    // 1. Storage Helpers
    // ----------------------------------------------
    function getLocalCart() {
        try {
            return JSON.parse(localStorage.getItem('local_cart')) || [];
        } catch(e) {
            return [];
        }
    }

    function saveLocalCart(cart) {
        localStorage.setItem('local_cart', JSON.stringify(cart));
        updateCartBadges();
    }

    function getLocalCompare() {
        try {
            return JSON.parse(localStorage.getItem('local_compare')) || [];
        } catch(e) {
            return [];
        }
    }

    function saveLocalCompare(compare) {
        localStorage.setItem('local_compare', JSON.stringify(compare));
    }

    // Format money (e.g. 150000 -> "150.000đ")
    function formatVND(amount) {
        return amount.toLocaleString('vi-VN') + 'đ';
    }

    // ----------------------------------------------
    // 2. Global Actions (Go to checkout, Add to cart)
    // ----------------------------------------------
    window.goToCheckout = function(event) {
        if (event) event.preventDefault();
        const cart = getLocalCart();
        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }
        window.location.href = './checkout.html';
    };

    // ----------------------------------------------
    // 3. Update Cart Badges
    // ----------------------------------------------
    function updateCartBadges() {
        const cart = getLocalCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Find cart count badges in header
        // Sapo header usually has .count_item_pr or .cart-count or .count-cart
        const badges = document.querySelectorAll('.count_item_pr, .cart-count, .count-cart, .js-cart-count');
        badges.forEach(b => {
            b.textContent = totalItems;
        });

        // Also update subtotal indicators in headers if any
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const subtotalElements = document.querySelectorAll('.cart-subtotal, .total-price, .cart-price');
        subtotalElements.forEach(el => {
            el.textContent = formatVND(totalPrice);
        });
    }

    // ----------------------------------------------
    // 4. Cart Add Interceptor
    // ----------------------------------------------
    function initCartInterceptor() {
        // Intercept forms submitting to /cart/add
        document.addEventListener('submit', function(event) {
            const form = event.target;
            const action = form.getAttribute('action') || '';
            if (action.includes('/cart/add')) {
                event.preventDefault();
                event.stopPropagation();
                
                // Get product information relative to form
                // 1. Name
                let name = '';
                const titleEl = document.querySelector('.title-product, h1.title-product');
                if (titleEl && form.contains(titleEl)) {
                    name = titleEl.textContent.trim();
                } else {
                    const cardNameEl = form.closest('.item_product_main')?.querySelector('.product-name a, .product-name');
                    name = cardNameEl ? cardNameEl.textContent.trim() : 'Sản phẩm mẫu';
                }
                
                // 2. Price
                let priceText = '';
                const priceEl = document.querySelector('.product-price, .special-price, .price');
                if (priceEl && form.contains(priceEl)) {
                    priceText = priceEl.textContent;
                } else {
                    const cardPriceEl = form.closest('.item_product_main')?.querySelector('.special-price, .product-price-cart .price, .price');
                    priceText = cardPriceEl ? cardPriceEl.textContent : '0đ';
                }
                // Parse integer from string like "120.000đ" or "Liên hệ"
                let price = 0;
                const digits = priceText.replace(/\D/g, '');
                if (digits) {
                    price = parseInt(digits, 10);
                } else {
                    price = 150000; // default backup price if "Liên hệ"
                }

                // 3. Image
                let image = '';
                const imgEl = document.querySelector('.product-image-block img, .featured-image img, #zoom_01');
                if (imgEl && document.body.contains(imgEl)) {
                    image = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '';
                } else {
                    const cardImgEl = form.closest('.item_product_main')?.querySelector('.product-thumbnail img, .image_thumb img');
                    image = cardImgEl ? (cardImgEl.getAttribute('src') || cardImgEl.getAttribute('data-src') || '') : './assets/logo.png';
                }

                // 4. Quantity
                let quantity = 1;
                const qtyInput = form.querySelector('input[name="quantity"]');
                if (qtyInput) {
                    quantity = parseInt(qtyInput.value, 10) || 1;
                }

                // 5. Product Link (for redirect/cart links)
                let url = './product-1.html';
                const linkEl = form.closest('.item_product_main')?.querySelector('.product-name a, a.image_thumb');
                if (linkEl) {
                    url = linkEl.getAttribute('href') || './product-1.html';
                } else {
                    url = window.location.pathname.includes('product-') ? window.location.pathname : './product-1.html';
                }

                // Add to cart
                addToLocalCart({
                    name: name,
                    price: price,
                    image: image,
                    quantity: quantity,
                    url: url
                });

                // Check which button was clicked: "Mua ngay" (redirect to cart) or "Thêm vào giỏ" (show success pop-up)
                const submitButton = document.activeElement;
                if (submitButton && (submitButton.classList.contains('btn-buy-now') || submitButton.textContent.toLowerCase().includes('mua ngay'))) {
                    // Redirect to cart
                    window.location.href = './cart.html';
                } else {
                    // Show custom alert
                    alert(`Đã thêm "${name}" vào giỏ hàng thành công!`);
                }
            }
        });

        // Also intercept quick add button clicks directly
        document.addEventListener('click', function(event) {
            const btn = event.target.closest('.btn-buy, .btn-cart, .btn-buy-now, .js-btn-buy');
            if (btn) {
                // If it is inside a form that will submit, let the form submit event handle it.
                // Otherwise, handle manual click addition.
                const form = btn.closest('form');
                if (!form) {
                    event.preventDefault();
                    // Scrape nearest product item
                    const container = btn.closest('.item_product_main');
                    if (container) {
                        const nameEl = container.querySelector('.product-name a, .product-name');
                        const name = nameEl ? nameEl.textContent.trim() : 'Sản phẩm mẫu';
                        const priceEl = container.querySelector('.special-price, .product-price-cart .price, .price');
                        const priceText = priceEl ? priceEl.textContent : '150.000đ';
                        const price = parseInt(priceText.replace(/\D/g, '') || '150000', 10);
                        const imgEl = container.querySelector('.product-thumbnail img, .image_thumb img');
                        const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : './assets/logo.png';
                        const urlEl = container.querySelector('.product-name a, a.image_thumb');
                        const url = urlEl ? (urlEl.getAttribute('href') || './product-1.html') : './product-1.html';

                        addToLocalCart({
                            name: name,
                            price: price,
                            image: image,
                            quantity: 1,
                            url: url
                        });

                        alert(`Đã thêm "${name}" vào giỏ hàng thành công!`);
                    }
                }
            }
        });
    }

    function addToLocalCart(newItem) {
        let cart = getLocalCart();
        const existingItem = cart.find(item => item.name === newItem.name);
        
        if (existingItem) {
            existingItem.quantity += newItem.quantity;
        } else {
            cart.push(newItem);
        }
        
        saveLocalCart(cart);
    }

    // ----------------------------------------------
    // 5. Cart Page Renderer (`cart.html`)
    // ----------------------------------------------
    function renderCartPage() {
        const desktopContainer = document.querySelector('.CartPageContainer');
        const mobileContainer = document.querySelector('.CartMobileContainer');
        const section = document.querySelector('.main-cart-page');
        
        if (!desktopContainer && !mobileContainer) return; // not on cart page

        const cart = getLocalCart();

        if (cart.length === 0) {
            if (section) section.classList.add('is-empty');
            return;
        }

        if (section) section.classList.remove('is-empty');

        // Render Desktop Cart Table
        if (desktopContainer) {
            let html = `
            <table class="table-cart" style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #eee; text-align: left; height: 50px;">
                        <th style="padding: 10px;">Ảnh sản phẩm</th>
                        <th>Thông tin sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                        <th style="text-align: center;">Xóa</th>
                    </tr>
                </thead>
                <tbody>`;

            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                html += `
                <tr style="border-bottom: 1px solid #eee; height: 100px;" data-index="${index}">
                    <td style="padding: 10px; width: 100px;">
                        <a href="${item.url}">
                            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #eee; border-radius: 4px;">
                        </a>
                    </td>
                    <td style="padding-right: 15px;">
                        <a href="${item.url}" style="color: #113465; font-weight: 600; text-decoration: none; font-size: 15px;">${item.name}</a>
                    </td>
                    <td style="font-weight: 600;">${formatVND(item.price)}</td>
                    <td>
                        <div class="quantity-control" style="display: flex; align-items: center; border: 1px solid #ddd; width: 100px; border-radius: 4px; overflow: hidden; height: 32px;">
                            <button onclick="changeQty(${index}, -1)" style="border: none; background: #f8f9fa; width: 30px; height: 100%; font-weight: bold; cursor: pointer;">-</button>
                            <input type="text" value="${item.quantity}" readonly style="border: none; text-align: center; width: 40px; height: 100%; font-weight: 600;">
                            <button onclick="changeQty(${index}, 1)" style="border: none; background: #f8f9fa; width: 30px; height: 100%; font-weight: bold; cursor: pointer;">+</button>
                        </div>
                    </td>
                    <td style="color: #fc0000; font-weight: 600;">${formatVND(itemTotal)}</td>
                    <td style="text-align: center;">
                        <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #666; font-size: 18px; cursor: pointer;" title="Xóa">
                            <i class="fa fa-trash"></i> 🗑️
                        </button>
                    </td>
                </tr>`;
            });

            html += `</tbody></table>`;
            desktopContainer.innerHTML = html;
        }

        // Render Mobile Cart Table
        if (mobileContainer) {
            let html = ``;
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                html += `
                <div class="cart-item-mobile" style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #fff;" data-index="${index}">
                    <div style="display: flex; gap: 15px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: contain; border: 1px solid #eee; border-radius: 4px;">
                        <div style="flex: 1;">
                            <a href="${item.url}" style="color: #113465; font-weight: 600; text-decoration: none; font-size: 14px; display: block; margin-bottom: 5px;">${item.name}</a>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 600; color: #fc0000;">${formatVND(item.price)}</span>
                                <div class="quantity-control" style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; height: 28px;">
                                    <button onclick="changeQty(${index}, -1)" style="border: none; background: #f8f9fa; width: 25px; height: 100%; font-weight: bold;">-</button>
                                    <input type="text" value="${item.quantity}" readonly style="border: none; text-align: center; width: 30px; height: 100%; font-weight: 600; font-size: 13px;">
                                    <button onclick="changeQty(${index}, 1)" style="border: none; background: #f8f9fa; width: 25px; height: 100%; font-weight: bold;">+</button>
                                </div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px dotted #eee; padding-top: 5px;">
                                <span style="font-size: 13px; color: #666;">Thành tiền: <strong style="color: #fc0000;">${formatVND(itemTotal)}</strong></span>
                                <button onclick="removeFromCart(${index})" style="background: none; border: none; color: red; font-size: 13px; cursor: pointer;">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
            mobileContainer.innerHTML = html;
        }

        // Render Totals in Footer Box
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const subtotalBox = document.querySelector('.summary-total');
        if (subtotalBox) {
            subtotalBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 15px; font-weight: 600;">
                <span>Tổng tiền tạm tính:</span>
                <span style="color: #fc0000; font-size: 20px; font-weight: bold;">${formatVND(totalPrice)}</span>
            </div>`;
        }

        // Update progress bar for free shipping (e.g. Free shipping limit: 1.000.000đ)
        const progressEl = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.js-free-shipping-text');
        if (progressEl && progressText) {
            const limit = 1000000;
            const percent = Math.min((totalPrice / limit) * 100, 100);
            progressEl.style.width = `${percent}%`;
            
            if (totalPrice >= limit) {
                progressText.innerHTML = '🎉 Bạn đã được <strong>Miễn phí vận chuyển</strong>!';
            } else {
                const diff = limit - totalPrice;
                progressText.innerHTML = `Mua thêm <strong>${formatVND(diff)}</strong> để được Miễn phí vận chuyển!`;
            }
        }
    }

    window.changeQty = function(index, delta) {
        let cart = getLocalCart();
        if (cart[index]) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            saveLocalCart(cart);
            renderCartPage();
        }
    };

    window.removeFromCart = function(index) {
        let cart = getLocalCart();
        if (cart[index]) {
            const name = cart[index].name;
            cart.splice(index, 1);
            saveLocalCart(cart);
            renderCartPage();
            alert(`Đã xóa "${name}" khỏi giỏ hàng.`);
        }
    };

    // ----------------------------------------------
    // 6. Checkout Page Summary Render (`checkout.html`)
    // ----------------------------------------------
    function renderCheckoutPage() {
        const listContainer = document.getElementById('checkout-items-list');
        if (!listContainer) return; // not on checkout page

        const cart = getLocalCart();
        if (cart.length === 0) {
            listContainer.innerHTML = '<p class="text-muted">Chưa có sản phẩm nào để thanh toán.</p>';
            window.location.href = './index.html';
            return;
        }

        // Render Product Rows in Order Summary
        let html = '';
        cart.forEach(item => {
            html += `
            <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center;">
                <div style="position: relative; border: 1px solid #eee; border-radius: 4px; padding: 2px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain;">
                    <span style="position: absolute; top: -8px; right: -8px; background: #113465; color: #fff; border-radius: 50%; font-size: 11px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-weight: bold;">${item.quantity}</span>
                </div>
                <div style="flex: 1; font-size: 13px;">
                    <strong style="display: block; color: #333; line-height: 1.3;">${item.name}</strong>
                </div>
                <span style="font-size: 14px; font-weight: 600; color: #333;">${formatVND(item.price * item.quantity)}</span>
            </div>`;
        });
        listContainer.innerHTML = html;

        // Calculate and Render totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 0; // Free shipping
        const total = subtotal + shipping;

        document.getElementById('checkout-subtotal').textContent = formatVND(subtotal);
        document.getElementById('checkout-total').textContent = formatVND(total);
    }

    // Submit Checkout form
    window.submitOrder = function(event) {
        event.preventDefault();
        
        const fullname = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
        
        if (!fullname || !phone || !address) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
            return;
        }

        let paymentText = paymentMethod === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản ngân hàng';
        
        // Show successful order alert
        alert(
            `🎉 ĐẶT HÀNG THÀNH CÔNG!\n\n` +
            `Cảm ơn: ${fullname}\n` +
            `SĐT: ${phone}\n` +
            `Địa chỉ giao hàng: ${address}\n` +
            `Phương thức: ${paymentText}\n\n` +
            `Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.`
        );

        // Clear local cart
        saveLocalCart([]);

        // Redirect to homepage
        window.location.href = './index.html';
    };

    // ----------------------------------------------
    // 7. Product Comparison Logic
    // ----------------------------------------------
    function initCompareLogic() {
        document.addEventListener('click', function(event) {
            const btn = event.target.closest('.js-compare-product-add, .setCompare');
            if (btn) {
                event.preventDefault();
                
                // Get product details
                let name = btn.getAttribute('data-compare') || '';
                if (!name) {
                    const cardNameEl = btn.closest('.item_product_main')?.querySelector('.product-name a');
                    name = cardNameEl ? cardNameEl.textContent.trim() : 'Sản phẩm';
                }

                // Clean name/handle
                const handle = name.replace(/\s+/g, '-').toLowerCase();

                let compareList = getLocalCompare();
                
                if (compareList.includes(handle)) {
                    compareList = compareList.filter(item => item !== handle);
                    alert(`Đã xóa "${name}" khỏi danh sách so sánh.`);
                    btn.classList.remove('active');
                } else {
                    if (compareList.length >= 3) {
                        alert('Bạn chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc!');
                        return;
                    }
                    compareList.push(handle);
                    alert(`Đã thêm "${name}" vào danh sách so sánh thành công!`);
                    btn.classList.add('active');
                }
                
                saveLocalCompare(compareList);
                renderComparePopup();
            }
        });

        // Close compare sidebar
        document.addEventListener('click', function(event) {
            const closeBtn = event.target.closest('.closeSidebar, .close_compare');
            if (closeBtn) {
                const sidebar = document.querySelector('.compare-sidebar, .popup_compare');
                if (sidebar) sidebar.classList.remove('open', 'active');
            }
        });
    }

    function renderComparePopup() {
        const compareList = getLocalCompare();
        const sidebar = document.querySelector('.compare-sidebar, .popup_compare');
        
        if (compareList.length > 0) {
            if (sidebar) sidebar.classList.add('open', 'active');
            
            // Build dynamic items to show inside compare sidebar list-compare
            const container = document.querySelector('.list-compare');
            if (container) {
                let html = '';
                compareList.forEach(handle => {
                    const cleanName = handle.replace(/-/g, ' ').toUpperCase();
                    html += `
                    <div class="product-smart" style="display: flex; gap: 10px; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                        <img src="./assets/logo.png" style="width: 40px; height: 40px; object-fit: contain;">
                        <div style="flex: 1;">
                            <span style="font-size: 13px; font-weight: 600; display: block; text-transform: capitalize;">${cleanName}</span>
                            <span style="font-size: 12px; color: #fc0000; font-weight: 500;">Sản phẩm mẫu so sánh</span>
                        </div>
                    </div>`;
                });
                container.innerHTML = html;
            }
        } else {
            if (sidebar) sidebar.classList.remove('open', 'active');
        }
    }

    // ----------------------------------------------
    // 8. Initialization on Page Load
    // ----------------------------------------------
    document.addEventListener('DOMContentLoaded', function() {
        updateCartBadges();
        initCartInterceptor();
        renderCartPage();
        renderCheckoutPage();
        initCompareLogic();
        renderComparePopup();
    });

})();
