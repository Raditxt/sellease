// assets/js/history.js

const user = JSON.parse(localStorage.getItem('user'));
if (!user) location.href = 'login.html';

const tableBody = document.getElementById("historyTable");

async function fetchHistory() {
  tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-400">Memuat data...</td></tr>`;

  let url = "http://localhost:5000/api/transactions";
  if (user.role === 'kasir') {
    url += `?user_id=${user.id}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Data tidak valid");

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-400 py-4">Belum ada transaksi</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";
    data.forEach(tx => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-4 py-2 text-sm">${new Date(tx.created_at).toLocaleString()}</td>
        <td class="px-4 py-2 text-sm">${tx.customer_name || '-'}</td>
        <td class="px-4 py-2 text-sm font-mono">Rp${parseFloat(tx.total_amount).toLocaleString()}</td>
        <td class="px-4 py-2 text-sm">${tx.payment_method}</td>
        <td class="px-4 py-2 text-sm">${tx.kasir}</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 py-4">Gagal memuat riwayat</td></tr>`;
    console.error(err);
  }
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


window.addEventListener("load", fetchHistory);
