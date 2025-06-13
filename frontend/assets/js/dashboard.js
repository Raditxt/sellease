// dashboard.js
const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'login.html';

document.getElementById("userDisplay").innerText = `${user.username} (${user.role})`;

async function fetchSummary() {
    try {
        const res = await fetch("http://localhost:5000/api/dashboard/summary");
        const data = await res.json();

        // Total Sales
        document.querySelector(".card-sales h3").innerText = `Rp${data.total_sales.toLocaleString()}`;

        // Stock Items
        document.querySelector(".card-stock h3").innerText = data.total_products;
        document.querySelector(".card-stock .low-stock").innerHTML = 
            `<i class="fas fa-arrow-down mr-1"></i> ${data.low_stock_items} items low stock`;

        // Customers
        document.querySelector(".card-customers h3").innerText = data.total_customers;

        // Recent Transactions
        const tbody = document.getElementById("recentTransactions");
        tbody.innerHTML = "";
        data.recent_transactions.forEach(tx => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-gray-900">#${tx.id}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${tx.created_at.slice(0,10)}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${tx.customer_name || 'Anonim'}</td>
                <td class="px-6 py-4 text-sm text-gray-500">Rp${tx.total_amount.toLocaleString()}</td>
                <td class="px-6 py-4">
                    <span class="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Dashboard summary error:", err);
    }
}

async function loadSalesChart() {
    const today = new Date();
    const past30 = new Date();
    past30.setDate(today.getDate() - 30);
    const start = past30.toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];

    const res = await fetch(`http://localhost:5000/api/reports/sales?start_date=${start}&end_date=${end}`);
    const data = await res.json();

    const ctx = document.getElementById('salesChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.monthly_sales.map(x => x.month),
            datasets: [{
                label: 'Penjualan (Rp)',
                data: data.monthly_sales.map(x => x.monthly_sales),
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => 'Rp' + value.toLocaleString()
                    }
                }
            }
        }
    });
}


if (!user) location.href = "login.html";

const isAdmin = user.role === 'admin';

if (location.pathname.includes("dashboard") && !isAdmin) {
    alert("Hanya admin yang boleh mengakses dashboard.");
    location.href = "pos.html";
}

if (location.pathname.includes("reports") && !isAdmin) {
    alert("Hanya admin yang boleh mengakses laporan.");
    location.href = "pos.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector("nav ul");

    // Sembunyikan menu admin jika kasir
    if (!isAdmin) {
        document.querySelector('a[href="dashboard.html"]')?.remove();
        document.querySelector('a[href="reports.html"]')?.remove();
        document.querySelector('a[href="products.html"]')?.remove();
    }

    // Tambahkan Riwayat untuk semua user
    const riwayatExist = document.querySelector('a[href="history.html"]');
    if (!riwayatExist) {
        nav.insertAdjacentHTML("beforeend", `
            <li><a href="history.html" class="hover:text-blue-200 transition"><i class="fas fa-clock mr-1"></i> Riwayat</a></li>
        `);
    }

    // Tambahkan menu User hanya untuk admin
    if (isAdmin && !document.querySelector('a[href="users.html"]')) {
        nav.insertAdjacentHTML("beforeend", `
            <li><a href="users.html" class="hover:text-blue-200 transition"><i class="fas fa-user-cog mr-1"></i> User</a></li>
        `);
    }

    // Tampilkan siapa yang login
    document.getElementById("userDisplay").innerText = `Login sebagai: ${user.username} (${user.role})`;
});

window.addEventListener('load', () => {
    fetchSummary();
    loadSalesChart();
});
