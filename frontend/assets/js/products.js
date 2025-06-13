// assets/js/products.js
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
  alert("Hanya admin yang boleh mengakses halaman ini.");
  location.href = "pos.html";
}
document.getElementById("userDisplay").innerText = `${user.username} (${user.role})`;

const API = "http://localhost:5000/api/products";
let allProducts = [];

async function fetchProducts() {
  const tbody = document.getElementById("productTable");
  tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-400 py-4">Memuat...</td></tr>`;

  try {
    const res = await fetch(API);
    const data = await res.json();
    allProducts = data;
    renderTable(allProducts);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-red-500 py-4">Gagal memuat produk</td></tr>`;
    console.error(err);
  }
}

function renderTable(products) {
  const tbody = document.getElementById("productTable");
  tbody.innerHTML = "";

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-400 py-4">Tidak ditemukan</td></tr>`;
    return;
  }

  products.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-2 text-sm">${p.name}</td>
      <td class="px-4 py-2 text-sm">${p.sku || '-'}</td>
      <td class="px-4 py-2 text-sm">${p.category || '-'}</td>
      <td class="px-4 py-2 text-sm font-mono">Rp${p.price.toLocaleString()}</td>
      <td class="px-4 py-2 text-sm font-mono">${p.stock}</td>
      <td class="px-4 py-2 text-sm font-mono">${p.low_stock_threshold}</td>
      <td class="px-4 py-2 text-sm space-x-2">
        <button onclick="editProduct(${p.id})" class="text-yellow-600 hover:underline">Edit</button>
        <button onclick="deleteProduct(${p.id})" class="text-red-600 hover:underline">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function applySearchFilter() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    (p.category || '').toLowerCase().includes(query) ||
    (p.sku || '').toLowerCase().includes(query)
  );
  renderTable(filtered);
}

document.getElementById("searchInput")?.addEventListener("input", applySearchFilter);

async function addProduct() {
  const payload = {
    name: document.getElementById("name").value,
    sku: document.getElementById("sku").value,
    category: document.getElementById("category").value,
    price: parseFloat(document.getElementById("price").value),
    stock: parseInt(document.getElementById("stock").value),
    low_stock_threshold: parseInt(document.getElementById("threshold").value)
  };

  if (!payload.name || isNaN(payload.price) || isNaN(payload.stock)) {
    return Swal.fire("Gagal", "Nama, harga, dan stok wajib diisi", "warning");
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) return Swal.fire("Gagal", data.error || "Gagal menambah produk", "error");
    Swal.fire("Sukses", "Produk ditambahkan", "success");
    fetchProducts();
    clearForm();
  } catch (err) {
    Swal.fire("Error", "Terjadi kesalahan server", "error");
    console.error(err);
  }
}

function clearForm() {
  ["name", "sku", "category", "price", "stock", "threshold"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

async function deleteProduct(id) {
  const confirm = await Swal.fire({
    title: "Yakin hapus?",
    text: "Tindakan ini tidak bisa dibatalkan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa",
    confirmButtonText: "Ya, hapus"
  });
  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return Swal.fire("Gagal", data.error, "error");
    Swal.fire("Terhapus", "Produk berhasil dihapus", "success");
    fetchProducts();
  } catch (err) {
    Swal.fire("Error", "Gagal menghapus produk", "error");
  }
}

function editProduct(id) {
  Swal.fire({
    title: "Edit Produk",
    html: `
      <input id="editName" class="swal2-input" placeholder="Nama">
      <input id="editSku" class="swal2-input" placeholder="SKU">
      <input id="editCategory" class="swal2-input" placeholder="Kategori">
      <input id="editPrice" class="swal2-input" placeholder="Harga" type="number">
      <input id="editStock" class="swal2-input" placeholder="Stok" type="number">
      <input id="editThreshold" class="swal2-input" placeholder="Minimum Stok" type="number">
    `,
    confirmButtonText: "Simpan",
    focusConfirm: false,
    preConfirm: async () => {
      const payload = {
        name: document.getElementById("editName").value,
        sku: document.getElementById("editSku").value,
        category: document.getElementById("editCategory").value,
        price: parseFloat(document.getElementById("editPrice").value),
        stock: parseInt(document.getElementById("editStock").value),
        low_stock_threshold: parseInt(document.getElementById("editThreshold").value)
      };
      try {
        const res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        Swal.fire("Berhasil", "Produk diperbarui", "success");
        fetchProducts();
      } catch (e) {
        Swal.showValidationMessage(`Gagal update: ${e.message}`);
      }
    },
    didOpen: async () => {
      const res = await fetch(`${API}`);
      const products = await res.json();
      const product = products.find(p => p.id === id);
      document.getElementById("editName").value = product.name;
      document.getElementById("editSku").value = product.sku || "";
      document.getElementById("editCategory").value = product.category || "";
      document.getElementById("editPrice").value = product.price;
      document.getElementById("editStock").value = product.stock;
      document.getElementById("editThreshold").value = product.low_stock_threshold;
    }
  });
}


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

document.getElementById("addProductBtn").addEventListener("click", addProduct);
window.addEventListener("load", fetchProducts);
