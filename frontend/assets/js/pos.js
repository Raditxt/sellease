// pos.js
const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'login.html';

let cart = [];
let allProducts = [];

async function fetchProducts() {
    try {
        const res = await fetch("http://localhost:5000/api/products");
        allProducts = await res.json();
    } catch (err) {
        console.error("Gagal load produk:", err);
    }

    const input = document.getElementById("search");
    input.addEventListener("input", () => {
        const query = input.value.toLowerCase();
        const matches = allProducts.filter(p => p.name.toLowerCase().includes(query));
        showSearchResults(matches);
    });
}

function showSearchResults(products) {
    let list = document.getElementById("searchResults");
    if (!list) {
        list = document.createElement("ul");
        list.id = "searchResults";
        list.className = "mt-2 border border-gray-300 rounded-lg bg-white max-h-64 overflow-y-auto absolute z-10 w-full";
        document.querySelector("#search").parentElement.appendChild(list);
    }
    list.innerHTML = "";

    if (products.length === 0) {
        list.innerHTML = "<li class='p-3 text-gray-500'>Tidak ada produk</li>";
        return;
    }

    products.forEach(p => {
        const li = document.createElement("li");
        li.className = "p-3 hover:bg-blue-100 cursor-pointer text-sm";
        li.textContent = `${p.name} - Rp${p.price.toLocaleString()}`;
        li.addEventListener("click", () => {
            addToCart(p);
            document.getElementById("search").value = "";
            list.innerHTML = "";
        });
        list.appendChild(li);
    });
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

async function loadCustomers() {
    try {
        const res = await fetch("http://localhost:5000/api/customers");
        const customers = await res.json();

        const select = document.getElementById("customerSelect");
        customers.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.text = c.name || `Pelanggan #${c.id}`;
            select.appendChild(option);
        });

        // Tambah opsi untuk pelanggan baru
        const newOption = document.createElement("option");
        newOption.value = "new";
        newOption.text = "+ Tambah Pelanggan Baru";
        select.appendChild(newOption);

        select.addEventListener("change", (e) => {
            const form = document.getElementById("manualCustomerForm");
            if (e.target.value === "new") {
                form.classList.remove("hidden");
            } else {
                form.classList.add("hidden");
            }
        });

    } catch (err) {
        console.error("Failed to load customers:", err);
    }
}

function updateCart() {
    const tbody = document.getElementById("cartItems");
    tbody.innerHTML = "";

    if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-sm text-gray-400 py-4">Cart is empty</td></tr>`;
        document.getElementById("totalAmount").innerText = "Rp0";
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-800">${item.name}</td>
            <td class="px-6 py-4 text-sm">Rp${item.price.toLocaleString()}</td>
            <td class="px-6 py-4 text-sm">${item.quantity}</td>
            <td class="px-6 py-4 text-sm">Rp${subtotal.toLocaleString()}</td>
            <td class="px-6 py-4 text-sm">
                <button onclick="removeItem(${index})" class="text-red-500 hover:underline">Remove</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById("totalAmount").innerText = `Rp${total.toLocaleString()}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

function generateReceipt(transaction, items) {
    const r = document.getElementById('receipt');
    const date = new Date().toLocaleString();
    let html = `<h2 class="text-center font-bold text-lg mb-2">SellEase POS</h2>`;
    html += `<p>${date}</p>`;
    html += `<p>Kasir: ${user.username}</p>`;
    html += `<hr class="my-2" />`;

    items.forEach(i => {
        html += `<p>${i.quantity} x ${i.name} @Rp${i.price} = Rp${(i.quantity * i.price).toLocaleString()}</p>`;
    });

    html += `<hr class="my-2" />`;
    html += `<p>Total: <strong>Rp${transaction.total_amount.toLocaleString()}</strong></p>`;
    html += `<p>Metode: ${transaction.payment_method}</p>`;
    html += `<hr class="my-2" />`;
    html += `<p class="text-center">Terima kasih!</p>`;

    r.innerHTML = html;
}

function printReceipt() {
    window.print();
}

document.getElementById('checkoutBtn').addEventListener('click', async function () {
    if (cart.length === 0) return alert("Keranjang kosong!");

    let customer_id = document.getElementById("customerSelect").value;

    if (customer_id === "new") {
        const name = document.getElementById("newCustomerName").value.trim();
        const phone = document.getElementById("newCustomerPhone").value.trim();
        const email = document.getElementById("newCustomerEmail").value.trim();

        if (!name) return alert("Nama pelanggan wajib diisi.");

        const resCust = await fetch("http://localhost:5000/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, email })
        });

        const newCust = await resCust.json();
        if (!resCust.ok) return alert("Gagal tambah pelanggan: " + newCust.error);

        customer_id = newCust.id;
    } else {
        customer_id = parseInt(customer_id);
    }

    const payload = {
        customer_id: customer_id,
        user_id: user.id,
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
        generateReceipt(payload, cart);
        printReceipt();
        cart.length = 0;
        updateCart();
        document.getElementById("customerSelect").value = "1";
        document.getElementById("manualCustomerForm").classList.add("hidden");
    } else {
        alert("Gagal: " + result.error);
    }
});

// Proteksi per halaman
const isAdmin = user.role === 'admin';

if (location.pathname.includes("dashboard") && !isAdmin) {
    alert("Hanya admin yang boleh mengakses dashboard.");
    location.href = "pos.html";
}

if (location.pathname.includes("reports") && !isAdmin) {
    alert("Hanya admin yang boleh mengakses laporan.");
    location.href = "pos.html";
}

// Ubah navbar secara dinamis
document.addEventListener("DOMContentLoaded", () => {
    if (!isAdmin) {
        document.querySelector('a[href="dashboard.html"]')?.remove();
        document.querySelector('a[href="reports.html"]')?.remove();
    }
});

window.addEventListener('load', () => {
    fetchProducts();
    loadCustomers();
});
