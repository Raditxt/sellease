document.getElementById('generateReport').addEventListener('click', generateReport);

async function generateReport() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const list = document.getElementById('paymentList');

    if (!start || !end || new Date(start) > new Date(end)) {
        alert("Pilih rentang tanggal yang valid!");
        return;
    }

    const res = await fetch(`http://localhost:5000/api/reports/sales?start_date=${start}&end_date=${end}`);
    const data = await res.json();

    if (!res.ok) {
        alert("Gagal ambil data laporan: " + data.error);
        return;
    }

    // Ringkasan
    document.querySelector('.grid-cols-1 .text-blue-600').innerText = `Rp${data.summary.total_sales.toLocaleString()}`;
    document.querySelector('.grid-cols-1 .text-green-600').innerText = data.summary.total_transactions;
    document.querySelector('.grid-cols-1 .text-purple-600').innerText = `Rp${parseFloat(data.summary.average_order).toLocaleString()}`;

    // Grafik
    updateSalesChart(data.monthly_sales);

    // Produk Terlaris
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = '';
    data.top_products.forEach(p => {
        const row = document.createElement('tr');
        const totalUnits = data.top_products.reduce((sum, item) => sum + item.units_sold, 0);
        const percent = ((p.units_sold / totalUnits) * 100).toFixed(0);
        row.innerHTML = `
            <td class="px-6 py-4 text-sm">${p.product}</td>
            <td class="px-6 py-4 text-sm">${p.units_sold}</td>
            <td class="px-6 py-4 text-sm">Rp${p.revenue.toLocaleString()}</td>
            <td class="px-6 py-4 text-sm">${percent}%</td>
        `;
        tableBody.appendChild(row);
    });

    list.innerHTML = "";
    data.payment_breakdown.forEach(p => {
        const li = document.createElement('li');
        li.innerText = `${p.payment_method}: Rp${p.total_sales.toLocaleString()} (${p.total_transactions} transaksi)`;
        list.appendChild(li);
    });    
}


document.getElementById("exportExcel").addEventListener("click", () => {
    const table = document.querySelector("table");
    const wb = XLSX.utils.table_to_book(table, {sheet: "Report"});
    XLSX.writeFile(wb, "SellEase_Report.xlsx");
});

document.getElementById("exportPdf").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("SellEase Sales Report", 14, 20);

    const summary = document.querySelectorAll(".grid-cols-1 .text-3xl");
    doc.setFontSize(12);
    doc.text(`Total Sales: ${summary[0].innerText}`, 14, 30);
    doc.text(`Transactions: ${summary[1].innerText}`, 14, 38);
    doc.text(`Avg Order: ${summary[2].innerText}`, 14, 46);

    doc.text("Top Products:", 14, 56);
    const table = document.querySelector("table");
    let y = 64;
    table.querySelectorAll("tbody tr").forEach(row => {
        const cols = row.querySelectorAll("td");
        const line = Array.from(cols).map(c => c.innerText).join(" | ");
        doc.text(line, 14, y);
        y += 8;
    });

    doc.save("SellEase_Report.pdf");
});



let salesChart;

function updateSalesChart(data) {
    const labels = data.map(x => x.month);
    const values = data.map(x => x.monthly_sales);

    if (salesChart) salesChart.destroy();

    const ctx = document.getElementById('monthlySalesChart').getContext('2d');
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Penjualan (Rp)',
                data: values,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
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
                        callback: val => 'Rp' + val.toLocaleString()
                    }
                }
            }
        }
    });
}

const user = JSON.parse(localStorage.getItem("user"));
if (!user) location.href = "login.html";

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

// Load default saat buka halaman
window.addEventListener('load', generateReport);

