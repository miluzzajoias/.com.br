import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    firebaseConfig,
    cloudinaryConfig
} from "./firebase-config.js";


/* =========================================================
   FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* =========================================================
   LOGIN
========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const message = document.getElementById("message");

        message.textContent = "Entrando...";

        try {

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href = "index.html";

        } catch (error) {

            console.error("Erro Firebase:", error);

            switch (error.code) {

                case "auth/invalid-credential":
                case "auth/wrong-password":
                case "auth/user-not-found":
                    message.textContent =
                        "E-mail ou senha incorretos.";
                    break;

                case "auth/invalid-email":
                    message.textContent =
                        "Digite um e-mail válido.";
                    break;

                case "auth/too-many-requests":
                    message.textContent =
                        "Muitas tentativas. Tente novamente mais tarde.";
                    break;

                default:
                    message.textContent =
                        "Não foi possível entrar.";
            }
        }

    });

}


/* =========================================================
   PAINEL ADMINISTRATIVO
========================================================= */

const productList =
    document.getElementById("productList");

if (productList) {

    onAuthStateChanged(auth, (user) => {

        if (!user) {

            window.location.href = "login.html";

            return;
        }

        loadProducts();

    });


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            await signOut(auth);

            window.location.href = "login.html";

        });

    }


    /* =====================================================
       MODAL
    ===================================================== */

    const modal =
        document.getElementById("productModal");

    const productForm =
        document.getElementById("productForm");


    function openModal() {

        productForm.reset();

        document.getElementById("productId").value = "";

        document.getElementById("active").checked = true;

        document.getElementById("modalTitle").innerHTML =
            "Novo produto";

        document.getElementById("formMessage").textContent =
            "";

        const preview =
            document.getElementById("imagePreview");

        if (preview) {
            preview.style.display = "none";
        }

        const previewImg =
            document.getElementById("imagePreviewImg");

        if (previewImg) {
            previewImg.src = "";
        }

        const cloudinaryMessage =
            document.getElementById("cloudinaryMessage");

        if (cloudinaryMessage) {
            cloudinaryMessage.textContent = "";
        }

        modal.classList.add("open");

    }


    function closeModal() {

        modal.classList.remove("open");

    }


    const newProductBtn =
        document.getElementById("newProductBtn");

    if (newProductBtn) {
        newProductBtn.addEventListener(
            "click",
            openModal
        );
    }


    const closeModalBtn =
        document.getElementById("closeModal");

    if (closeModalBtn) {
        closeModalBtn.addEventListener(
            "click",
            closeModal
        );
    }


    const cancelBtn =
        document.getElementById("cancelBtn");

    if (cancelBtn) {
        cancelBtn.addEventListener(
            "click",
            closeModal
        );
    }


    /* =====================================================
       SALVAR PRODUTO
    ===================================================== */

    productForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const msg =
            document.getElementById("formMessage");

        msg.textContent = "Salvando produto...";


        const data = {

            nome:
                document.getElementById("name").value.trim(),

            categoria:
                document.getElementById("category").value,

            preco:
                Number(
                    document.getElementById("price").value
                ),

            imagem:
                document.getElementById("image").value.trim(),

            descricao:
                document.getElementById("description").value.trim(),

            destaque:
                document.getElementById("featured").checked,

            novo:
                document.getElementById("newProduct").checked,

            ativo:
                document.getElementById("active").checked,

            atualizadoEm:
                serverTimestamp()

        };


        if (!data.nome) {

            msg.textContent =
                "Digite o nome do produto.";

            return;
        }


        if (!data.categoria) {

            msg.textContent =
                "Escolha uma categoria.";

            return;
        }


        if (!data.imagem) {

            msg.textContent =
                "Envie uma foto do produto.";

            return;
        }


        try {

            const id =
                document.getElementById("productId").value;


            /* EDITAR */

            if (id) {

                await updateDoc(
                    doc(db, "produtos", id),
                    data
                );

            }

            /* NOVO */

            else {

                await addDoc(
                    collection(db, "produtos"),
                    {
                        ...data,
                        criadoEm: serverTimestamp()
                    }
                );

            }


            closeModal();

            await loadProducts();


        } catch (error) {

            console.error(
                "Erro ao salvar produto:",
                error
            );

            msg.textContent =
                "Não foi possível salvar o produto.";

        }

    });


    /* =====================================================
       BUSCA ADMIN
    ===================================================== */

    const adminSearch =
        document.getElementById("adminSearch");

    if (adminSearch) {

        adminSearch.addEventListener(
            "input",
            (e) => {

                const term =
                    e.target.value
                        .toLowerCase()
                        .trim();


                document
                    .querySelectorAll(
                        ".admin-product-row"
                    )
                    .forEach(row => {

                        const search =
                            row.dataset.search || "";


                        row.style.display =
                            search.includes(term)
                                ? "grid"
                                : "none";

                    });

            }
        );

    }


    /* =====================================================
       CLOUDINARY
    ===================================================== */

    const cloudinaryBtn =
        document.getElementById("cloudinaryBtn");

    const cloudinaryFile =
        document.getElementById("cloudinaryFile");

    const cloudinaryMessage =
        document.getElementById(
            "cloudinaryMessage"
        );

    const imageInput =
        document.getElementById("image");

    const imagePreview =
        document.getElementById("imagePreview");

    const imagePreviewImg =
        document.getElementById(
            "imagePreviewImg"
        );


    if (
        cloudinaryBtn &&
        cloudinaryFile
    ) {

        cloudinaryBtn.addEventListener(
            "click",
            () => {

                cloudinaryFile.click();

            }
        );


        cloudinaryFile.addEventListener(
            "change",
            async () => {

                const file =
                    cloudinaryFile.files[0];


                if (!file) return;


                if (
                    !cloudinaryConfig.cloudName ||
                    !cloudinaryConfig.uploadPreset ||
                    cloudinaryConfig.cloudName.startsWith(
                        "COLOQUE_"
                    ) ||
                    cloudinaryConfig.uploadPreset.startsWith(
                        "COLOQUE_"
                    )
                ) {

                    cloudinaryMessage.textContent =
                        "Cloudinary ainda não está configurado.";

                    return;
                }


                if (
                    ![
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                    ].includes(file.type)
                ) {

                    cloudinaryMessage.textContent =
                        "Escolha uma imagem JPG, PNG ou WEBP.";

                    return;
                }


                cloudinaryMessage.textContent =
                    "Enviando imagem...";


                cloudinaryBtn.disabled = true;


                try {

                    const formData =
                        new FormData();


                    formData.append(
                        "file",
                        file
                    );


                    formData.append(
                        "upload_preset",
                        cloudinaryConfig.uploadPreset
                    );


                    const response =
                        await fetch(
                            `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        console.error(
                            "Erro Cloudinary:",
                            result
                        );

                        throw new Error(
                            result.error?.message ||
                            "Erro no upload."
                        );

                    }


                    imageInput.value =
                        result.secure_url;


                    if (imagePreviewImg) {

                        imagePreviewImg.src =
                            result.secure_url;

                    }


                    if (imagePreview) {

                        imagePreview.style.display =
                            "block";

                    }


                    cloudinaryMessage.textContent =
                        "Imagem enviada com sucesso! ✓";


                } catch (error) {

                    console.error(
                        "Erro no upload:",
                        error
                    );

                    cloudinaryMessage.textContent =
                        "Não foi possível enviar a imagem.";

                } finally {

                    cloudinaryBtn.disabled =
                        false;

                }

            }
        );

    }


    /* =====================================================
       CARREGAR PRODUTOS
    ===================================================== */

    async function loadProducts() {

        productList.innerHTML =
            '<div class="empty-state">Carregando produtos...</div>';


        try {

            const snapshot =
                await getDocs(
                    collection(db, "produtos")
                );


            const products =
                snapshot.docs.map(
                    d => ({
                        id: d.id,
                        ...d.data()
                    })
                );


            renderProducts(products);


            const totalProducts =
                document.getElementById(
                    "totalProducts"
                );

            const activeProducts =
                document.getElementById(
                    "activeProducts"
                );

            const featuredProducts =
                document.getElementById(
                    "featuredProducts"
                );


            if (totalProducts) {

                totalProducts.textContent =
                    products.length;

            }


            if (activeProducts) {

                activeProducts.textContent =
                    products.filter(
                        p => p.ativo !== false
                    ).length;

            }


            if (featuredProducts) {

                featuredProducts.textContent =
                    products.filter(
                        p => p.destaque
                    ).length;

            }


        } catch (error) {

            console.error(
                "Erro ao carregar produtos:",
                error
            );


            productList.innerHTML = `
                <div class="empty-state">
                    <strong>Não foi possível carregar os produtos.</strong>
                    <span>Verifique as regras do Firestore.</span>
                </div>
            `;

        }

    }


    /* =====================================================
       RENDERIZAR PRODUTOS
    ===================================================== */

    function renderProducts(products) {

        if (!products.length) {

            productList.innerHTML = `
                <div class="empty-state">
                    <strong>Nenhum produto cadastrado.</strong>
                    <span>Clique em “Novo produto” para começar.</span>
                </div>
            `;

            return;
        }


        productList.innerHTML =
            products.map(p => `

                <article
                    class="admin-product-row"
                    data-search="${escapeHtml(
                        `${p.nome || ""} ${p.categoria || ""}`
                            .toLowerCase()
                    )}"
                >

                    <div class="admin-thumb">

                        ${
                            p.imagem
                                ? `
                                    <img
                                        src="${escapeHtml(p.imagem)}"
                                        alt="${escapeHtml(p.nome || "")}"
                                        loading="lazy"
                                    >
                                  `
                                : ""
                        }

                    </div>


                    <div class="admin-product-name">

                        <strong>
                            ${escapeHtml(
                                p.nome || "Sem nome"
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                p.categoria ||
                                "Sem categoria"
                            )}
                        </span>

                    </div>


                    <div class="admin-price">

                        ${formatPrice(p.preco)}

                    </div>


                    <div
                        class="status ${
                            p.ativo !== false
                                ? "on"
                                : "off"
                        }"
                    >

                        ${
                            p.ativo !== false
                                ? "Ativo"
                                : "Oculto"
                        }

                    </div>


                    <div class="row-actions">

                        <button
                            type="button"
                            data-edit="${p.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="danger"
                            data-delete="${p.id}"
                        >
                            Excluir
                        </button>

                    </div>

                </article>

            `).join("");


        document
            .querySelectorAll("[data-edit]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const product =
                            products.find(
                                p =>
                                    p.id ===
                                    button.dataset.edit
                            );


                        if (product) {

                            editProduct(product);

                        }

                    }
                );

            });


        document
            .querySelectorAll("[data-delete]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        removeProduct(
                            button.dataset.delete
                        );

                    }
                );

            });

    }


    /* =====================================================
       EDITAR PRODUTO
    ===================================================== */

    function editProduct(product) {

        document.getElementById(
            "productId"
        ).value = product.id;


        document.getElementById(
            "name"
        ).value = product.nome || "";


        document.getElementById(
            "category"
        ).value = product.categoria || "";


        document.getElementById(
            "price"
        ).value = product.preco ?? "";


        document.getElementById(
            "image"
        ).value = product.imagem || "";


        document.getElementById(
            "description"
        ).value = product.descricao || "";


        document.getElementById(
            "featured"
        ).checked = !!product.destaque;


        document.getElementById(
            "newProduct"
        ).checked = !!product.novo;


        document.getElementById(
            "active"
        ).checked =
            product.ativo !== false;


        document.getElementById(
            "modalTitle"
        ).innerHTML =
            "Editar produto";


        document.getElementById(
            "formMessage"
        ).textContent = "";


        if (
            product.imagem &&
            imagePreviewImg &&
            imagePreview
        ) {

            imagePreviewImg.src =
                product.imagem;

            imagePreview.style.display =
                "block";

        }


        modal.classList.add("open");

    }


    /* =====================================================
       EXCLUIR PRODUTO
    ===================================================== */

    async function removeProduct(id) {

        const confirmed =
            confirm(
                "Excluir este produto? Essa ação não pode ser desfeita."
            );


        if (!confirmed) return;


        try {

            await deleteDoc(
                doc(db, "produtos", id)
            );


            await loadProducts();


        } catch (error) {

            console.error(
                "Erro ao excluir:",
                error
            );

            alert(
                "Não foi possível excluir o produto."
            );

        }

    }


    /* =====================================================
       FORMATA PREÇO
    ===================================================== */

    function formatPrice(value) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return "Consultar";

        }


        const number =
            Number(value);


        if (Number.isNaN(number)) {

            return escapeHtml(value);

        }


        return number.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(
                /[&<>"']/g,
                character => ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                })[character]
            );

    }

}