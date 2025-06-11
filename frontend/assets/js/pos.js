
let products = [];
const cart = [];

async function fetchProducts() {
    const res = await fetch('http://localhost:5000/api/products');
    products = await res.json();
    console.log("Fetched Products:", products);
}

function displayFilteredProducts(filtered) {
    // Untuk keperluan pengembangan (nanti bisa tampil di UI)
    console.log("Filtered Results:", filtered);
}

// Fungsi: cari produk berdasarkan kata kunci
document.getElementById('search').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
    displayFilteredProducts(filtered);
    if (filtered.length === 1) {
        addToCart(filtered[0]);  // auto-add jika match satu
        this.value = ''; // kosongkan pencarian
    }
});

// Tambahkan ke cart
function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

function removeFromCart(productId) {
    const index = cart.findIndex(i => i.id === productId);
    if (index > -1) {
        cart.splice(index, 1);
    }
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 text-sm">${item.name}</td>
            <td class="px-6 py-4 text-sm">Rp${item.price}</td>
            <td class="px-6 py-4 text-sm">${item.quantity}</td>
            <td class="px-6 py-4 text-sm">Rp${(item.quantity * item.price).toFixed(2)}</td>
            <td class="px-6 py-4"><button onclick="removeFromCart(${item.id})" class="text-red-600">Remove</button></td>
        `;
        cartItems.appendChild(row);
        total += item.price * item.quantity;
    });
    document.getElementById('totalAmount').innerText = `Rp${total.toFixed(2)}`;
}

// Fungsi Checkout
document.getElementById('checkoutBtn').addEventListener('click', async function () {
    if (cart.length === 0) return alert("Keranjang kosong!");

    const payload = {
        customer_id: 1, // default: pelanggan anonim
        user_id: 2,     // misalnya: kasir_anna (bisa disimpan di localStorage)
        total_amount: cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
        discount: 0,
        tax: 0,
        payment_method: 'Tunai',
        items: cart.map(i => ({
            product_id: i.id,
            quantity: i.quantity,
            price: i.price
        }))
    };

    const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok) {
        alert("Transaksi berhasil!");
        cart.length = 0;
        updateCart();
    } else {
        alert("Gagal: " + result.error);
    }
});

// Fetch produk saat pertama load
window.addEventListener('load', fetchProducts);

