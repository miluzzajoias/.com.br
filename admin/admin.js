import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig, cloudinaryConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const isLogin = location.pathname.endsWith("login.html") || location.pathname.endsWith("/admin/");
const loginForm = document.getElementById("loginForm");

if (loginForm) {

onAuthStateChanged(auth, user => {
    if (!user) return;
});

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const message = document.getElementById("message");
    message.textContent = "Entrando...";

    try {

      await signInWithEmailAndPassword(
        auth,
        document.getElementById("email").value.trim(),
        document.getElementById("password").value
      );

      location.href = "index.html";

    } catch (error) {

      console.error("Erro Firebase:", error);
      message.textContent = error.code || "Erro ao entrar";

    }

  });

}

const productList = document.getElementById("productList");

if (productList) {
  onAuthStateChanged(auth, user => {
    if (!user) {
      location.href = "login.html";
    } else {
      loadProducts();
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));

  const modal = document.getElementById("productModal");
  const openModal = () => {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("active").checked = true;
    document.getElementById("modalTitle").innerHTML = 'Novo <em>produto</em>';
    document.getElementById("formMessage").textContent = "";
    modal.classList.add("open");
  };
  const closeModal = () => modal.classList.remove("open");

  document.getElementById("newProductBtn").addEventListener("click", openModal);
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);

  document.getElementById("productForm").addEventListener("submit", async e => {
    e.preventDefault();
    const msg = document.getElementById("formMessage");
    msg.textContent = "Salvando...";
    const data = {
      nome: document.getElementById("name").value.trim(),
      categoria: document.getElementById("category").value,
      preco: Number(document.getElementById("price").value),
      imagem: document.getElementById("image").value.trim(),
      descricao: document.getElementById("description").value.trim(),
      destaque: document.getElementById("featured").checked,
      novo: document.getElementById("newProduct").checked,
      ativo: document.getElementById("active").checked,
      atualizadoEm: serverTimestamp()
    };

    try {
      const id = document.getElementById("productId").value;
      if (id) await updateDoc(doc(db, "produtos", id), data);
      else await addDoc(collection(db, "produtos"), {...data, criadoEm: serverTimestamp()});
      closeModal();
      await loadProducts();
    } catch (error) {
      console.error(error);
      msg.textContent = "Não foi possível salvar. Verifique o Firestore.";
    }
  });

  document.getElementById("adminSearch").addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll(".admin-product-row").forEach(row => {
      row.style.display = row.dataset.search.includes(term) ? "" : "grid";
      if (!row.dataset.search.includes(term)) row.style.display = "none";
    });
  });

 const cloudinaryBtn = document.getElementById("cloudinaryBtn");
const cloudinaryFile = document.getElementById("cloudinaryFile");
const cloudinaryMessage = document.getElementById("cloudinaryMessage");
const imageInput = document.getElementById("image");

const imagePreview = document.getElementById("imagePreview");
const imagePreviewImg = document.getElementById("imagePreviewImg");

cloudinaryBtn.addEventListener("click", () => {
  cloudinaryFile.click();
});

cloudinaryFile.addEventListener("change", async () => {
  const file = cloudinaryFile.files[0];

  if (!file) return;

  if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
    cloudinaryMessage.textContent =
      "Cloudinary ainda não está configurado.";
    return;
  }

  cloudinaryMessage.textContent = "Enviando imagem...";

  cloudinaryBtn.disabled = true;

  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      cloudinaryConfig.uploadPreset
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Cloudinary:", data);
      throw new Error(
        data.error?.message || "Erro ao enviar imagem."
      );
    }

    imageInput.value = data.secure_url;

    imagePreviewImg.src = data.secure_url;
    imagePreview.style.display = "block";

    cloudinaryMessage.textContent =
      "Imagem enviada com sucesso! ✓";

  } catch (error) {

    console.error("Erro no upload:", error);

    cloudinaryMessage.textContent =
      "Não foi possível enviar a imagem.";

  } finally {

    cloudinaryBtn.disabled = false;
  }
});

  async function loadProducts() {
    productList.innerHTML = '<div class="empty-state">Carregando produtos...</div>';
    try {
      const snapshot = await getDocs(collection(db, "produtos"));
      const products = snapshot.docs.map(d => ({id:d.id, ...d.data()}));
      renderProducts(products);
      document.getElementById("totalProducts").textContent = products.length;
      document.getElementById("activeProducts").textContent = products.filter(p => p.ativo !== false).length;
      document.getElementById("featuredProducts").textContent = products.filter(p => p.destaque).length;
    } catch (error) {
      console.error(error);
      productList.innerHTML = '<div class="empty-state">Não foi possível carregar o Firestore. Verifique as regras e o projeto Firebase.</div>';
    }
  }

  function renderProducts(products) {
    if (!products.length) {
      productList.innerHTML = '<div class="empty-state"><strong>Nenhum produto cadastrado.</strong><span>Clique em “Novo produto” para começar.</span></div>';
      return;
    }
    productList.innerHTML = products.map(p => `
      <article class="admin-product-row" data-search="${(p.nome || "").toLowerCase()} ${(p.categoria || "").toLowerCase()}">
        <div class="admin-thumb">${p.imagem ? `<img src="${p.imagem}" alt="">` : ""}</div>
        <div class="admin-product-name"><strong>${escapeHtml(p.nome || "Sem nome")}</strong><span>${escapeHtml(p.categoria || "Sem categoria")}</span></div>
        <div class="admin-price">${escapeHtml(p.preco || "")}</div>
        <div class="status ${p.ativo !== false ? "on" : "off"}">${p.ativo !== false ? "Ativo" : "Oculto"}</div>
        <div class="row-actions"><button data-edit="${p.id}">Editar</button><button class="danger" data-delete="${p.id}">Excluir</button></div>
      </article>
    `).join("");

    document.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => editProduct(products.find(p => p.id === b.dataset.edit))));
    document.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => removeProduct(b.dataset.delete)));
  }

  function editProduct(p) {
    document.getElementById("productId").value = p.id;
    document.getElementById("name").value = p.nome || "";
    document.getElementById("category").value = p.categoria || "";
    document.getElementById("price").value = p.preco || "";
    document.getElementById("image").value = p.imagem || "";
    document.getElementById("description").value = p.descricao || "";
    document.getElementById("featured").checked = !!p.destaque;
    document.getElementById("newProduct").checked = !!p.novo;
    document.getElementById("active").checked = p.ativo !== false;
    document.getElementById("modalTitle").innerHTML = 'Editar <em>produto</em>';
    document.getElementById("formMessage").textContent = "";
    modal.classList.add("open");
  }

  async function removeProduct(id) {
    if (!confirm("Excluir este produto? Essa ação não pode ser desfeita.")) return;
    try {
      await deleteDoc(doc(db, "produtos", id));
      await loadProducts();
    } catch (error) {
      alert("Não foi possível excluir o produto.");
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
}
