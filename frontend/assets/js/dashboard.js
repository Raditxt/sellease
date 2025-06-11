async function fetchSummary() {
    try {
        const res = await fetch("http://localhost:5000/api/dashboard/summary");
        const data = await res.json();

        // Ubah angka di card
        document.querySelector('.stat-card:nth-child(1) h3').innerText = `Rp${data.total_sales.toLocaleString()}`;
        document.querySelector('.stat-card:nth-child(2) h3').innerText = data.total_products;
        document.querySelector('.stat-card:nth-child(3) h3').innerText = data.total_customers;

        // Low stock alert (ubah teks)
        document.querySelector('.stat-card:nth-child(2) p.text-red-500').innerHTML =
            `<i class="fas fa-arrow-down mr-1"></i> ${data.low_stock_items} items low stock`;

        // Isi Recent Transactions
        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = "";
        data.recent_transactions.forEach(tx => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-gray-900">#${tx.id}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${tx.created_at.substring(0, 10)}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${tx.customer_name || 'Anonim'}</td>
                <td class="px-6 py-4 text-sm text-gray-500">Rp${tx.total_amount.toLocaleString()}</td>
                <td class="px-6 py-4">
                    <span class="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        alert("Gagal mengambil data dashboard: " + err.message);
    } if (data.low_stock_items > 0) {
        alert(`⚠️ Ada ${data.low_stock_items} produk yang hampir habis stok!`);
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
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => 'Rp' + ctx.raw.toLocaleString()
                    }
                }
            },
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

const user = JSON.parse(localStorage.getItem('user'));

if (!user) {
    window.location.href = 'login.html';
}

// (Opsional) Batasi akses admin-only:
if (window.location.pathname.includes('dashboard') && user.role !== 'admin') {
    alert("Hanya admin yang boleh mengakses dashboard.");
    window.location.href = 'pos.html';
}

// Panggil saat load
window.addEventListener('load', () => {
    fetchSummary();
    loadSalesChart();
});
