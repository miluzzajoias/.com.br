import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ===============================
// FIREBASE
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyAwgumX1YaWrz31PQwneSAXsoxYXtmKr00",
  authDomain: "miluzza-joias-ca518.firebaseapp.com",
  projectId: "miluzza-joias-ca518",
  storageBucket: "miluzza-joias-ca518.firebasestorage.app",
  messagingSenderId: "695140285519",
  appId: "1:695140285519:web:718d322ccb9883580b7e3a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// PRODUTOS DEMONSTRATIVOS
// ===============================

const demoProducts = [
  {
    id: 1,
    name: "Colar Luz",
    category: "Colares",
    price: "R$ 129,90",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
    badge: "Destaque"
  },
  {
    id: 2,
    name: "Brinco Aurora",
    category: "Brincos",
    price: "R$ 89,90",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
    badge: "Novo"
  },
  {
    id: 3,
    name: "Anel Essência",
    category: "Anéis",
    price: "R$ 99,90",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 4,
    name: "Pulseira Serena",
    category: "Pulseiras",
    price: "R$ 119,90",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 5,
    name: "Colar Amour",
    category: "Colares",
    price: "R$ 149,90",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 6,
    name: "Brinco Lumière",
    category: "Brincos",
    price: "R$ 109,90",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 7,
    name: "Anel Dourado",
    category: "Anéis",
    price: "R$ 94,90",
    image: "https://images.unsplash.com/photo-1627293509201-cd2d1c8d7a03?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: 8,
    name: "Pulseira Bella",
    category: "Pulseiras",
    price: "R$ 139,90",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85"
  }
];

let products = [...demoProducts];
let activeFilter = "Todos";

// ===============================
// CARREGAR PRODUTOS DO FIRESTORE
// ===============================

async function loadProducts() {
  try {
    const snapshot = await getDocs(collection(db, "produtos"));

    const firestoreProducts = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(p => p.ativo !== false && p.nome && p.imagem);

    if (firestoreProducts.length) {
      products = firestoreProducts.map(p => ({
        id: p.id,
        name: p.nome,
        category: p.categoria || "Outros",
        price: formatPrice(p.preco),
        image: p.imagem,
        badge: p.destaque
          ? "Destaque"
          : (p.novo ? "Novo" : "")
      }));
    }

  } catch (error) {
    console.error("Erro ao carregar produtos do Firestore:", error);
    console.warn("Firestore indisponível. Exibindo produtos demonstrativos.");
  }

  renderProducts(activeFilter);
}

// ===============================
// FORMATAÇÃO DO PREÇO
// ===============================

function formatPrice(value) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  const text = String(value).trim();

  if (text.startsWith("R$")) {
    return text;
  }

  const number = Number(text.replace(",", "."));

  if (!Number.isNaN(number)) {
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  return text;
}

// ===============================
// RENDERIZAR PRODUTOS
// ===============================

const productsEl = document.getElementById("products");

function renderProducts(filter = "Todos") {
  activeFilter = filter;

  const list =
    filter === "Todos"
      ? products
      : products.filter(p => p.category === filter);

  productsEl.innerHTML = list.map(p => `
<article class="product-card" data-id="${p.id}">
      <button
        class="heart"
        aria-label="Favoritar ${p.name}"
        data-like="${p.id}">
        ♡
      </button>

      ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}

      <div class="product-image">
        <img
          src="${p.image}"
          alt="${p.name}"
          loading="lazy">
      </div>

      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price">${p.price}</div>
      </div>

    </article>
  `).join("");

document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = `produto.html?id=${card.dataset.id}`;
    });
});

  document.querySelectorAll("[data-like]").forEach(btn => {

    const saved = JSON.parse(
      localStorage.getItem("miluzza-favorites") || "[]"
    );

    if (saved.includes(String(btn.dataset.like))) {
      btn.classList.add("liked");
      btn.textContent = "♥";
    }

    btn.addEventListener("click", e => {

      e.stopPropagation();

      const id = String(btn.dataset.like);

      let favs = JSON.parse(
        localStorage.getItem("miluzza-favorites") || "[]"
      );

      if (favs.includes(id)) {

        favs = favs.filter(x => x !== id);

        btn.classList.remove("liked");
        btn.textContent = "♡";

      } else {

        favs.push(id);

        btn.classList.add("liked");
        btn.textContent = "♥";
      }

      localStorage.setItem(
        "miluzza-favorites",
        JSON.stringify(favs)
      );
    });
  });
}

// ===============================
// FILTROS
// ===============================

function setFilter(value) {

  document
    .querySelectorAll(".filter")
    .forEach(b =>
      b.classList.toggle(
        "active",
        b.dataset.filter === value
      )
    );

  document
    .querySelectorAll(".category-card")
    .forEach(b =>
      b.classList.toggle(
        "selected",
        b.dataset.filter === value
      )
    );

  renderProducts(value);

  document
    .getElementById("destaques")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

document
  .querySelectorAll(".filter")
  .forEach(btn =>
    btn.addEventListener(
      "click",
      () => setFilter(btn.dataset.filter)
    )
  );

document
  .querySelectorAll(".category-card")
  .forEach(btn =>
    btn.addEventListener(
      "click",
      () => setFilter(btn.dataset.filter)
    )
  );

// ===============================
// MENU MOBILE
// ===============================

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

if (menuBtn && nav) {

  menuBtn.addEventListener(
    "click",
    () => nav.classList.toggle("open")
  );

  nav
    .querySelectorAll("a")
    .forEach(a =>
      a.addEventListener(
        "click",
        () => nav.classList.remove("open")
      )
    );
}

// ===============================
// BUSCA
// ===============================

const searchOverlay = document.getElementById("searchOverlay");
const searchBtn = document.getElementById("searchBtn");
const closeSearch = document.getElementById("closeSearch");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

if (
  searchOverlay &&
  searchBtn &&
  closeSearch &&
  searchInput &&
  searchResults
) {

  searchBtn.addEventListener("click", () => {

    searchOverlay.classList.add("open");

    setTimeout(
      () => searchInput.focus(),
      100
    );
  });

  closeSearch.addEventListener(
    "click",
    () => searchOverlay.classList.remove("open")
  );

  searchOverlay.addEventListener(
    "click",
    e => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove("open");
      }
    }
  );

  document.addEventListener(
    "keydown",
    e => {
      if (e.key === "Escape") {
        searchOverlay.classList.remove("open");
      }
    }
  );

  searchInput.addEventListener("input", () => {

    const q = searchInput.value
      .toLowerCase()
      .trim();

    if (!q) {
      searchResults.innerHTML = "";
      return;
    }

    const results = products.filter(p =>
      `${p.name} ${p.category}`
        .toLowerCase()
        .includes(q)
    );

    searchResults.innerHTML = results.length
      ? results.map(p => `
          <div class="search-result">
            <span>${p.name}</span>
            <small>
              ${p.category} · ${p.price}
            </small>
          </div>
        `).join("")
      : `
          <p style="padding-top:20px;color:#cbbdc3">
            Nenhuma peça encontrada.
          </p>
        `;
  });
}

// ===============================
// INICIAR
// ===============================

loadProducts();

// Acesso secreto ao painel administrativo
let logoClicks = 0;
let logoTimer;

document.querySelector(".brand img")?.addEventListener("click", () => {

    logoClicks++;

    clearTimeout(logoTimer);

    logoTimer = setTimeout(() => {
        logoClicks = 0;
    }, 1500);


    if (logoClicks === 5) {
        window.location.href = "admin/login.html";
    }

});
