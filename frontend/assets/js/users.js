// assets/js/users.js

const API_USERS = "http://localhost:5000/api/users";

async function fetchUsers() {
  const table = document.getElementById("userTable");
  table.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-gray-400">Memuat...</td></tr>`;
  try {
    const res = await fetch(API_USERS);
    const data = await res.json();
    table.innerHTML = "";
    data.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-2 text-sm">${user.username}</td>
        <td class="px-4 py-2 text-sm capitalize">${user.role}</td>
      `;
      table.appendChild(tr);
    });
  } catch (err) {
    table.innerHTML = `<tr><td colspan="2" class="text-center text-red-500 py-4">Gagal memuat data</td></tr>`;
    console.error(err);
  }
}

async function addUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!username || !password) {
    return Swal.fire("Gagal", "Username dan password wajib diisi", "warning");
  }

  try {
    const res = await fetch(API_USERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });
    const data = await res.json();
    if (!res.ok) return Swal.fire("Gagal", data.error || "Gagal menambahkan user", "error");
    Swal.fire("Sukses", "User berhasil ditambahkan", "success");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("role").value = "kasir";
    fetchUsers();
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan saat menambah user", "error");
    console.error(err);
  }
}

const user = JSON.parse(localStorage.getItem('user'));
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


document.getElementById("addUserBtn").addEventListener("click", addUser);
window.addEventListener("load", fetchUsers);
