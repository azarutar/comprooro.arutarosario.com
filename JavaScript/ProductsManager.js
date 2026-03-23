import UtilityClass from './UtilityClass.js';
import HtmlBuilder from "./HtmlBuilder.js";
import IndexManager from "./IndexManager.js";

export default class ProductsManager {
    constructor(jsonProducts, htmlProduct, idProductGrid, idSearchTextProduct, idCategoryFilter, idMaterialFilter, idConditionFilter, whatsAppLink) {
        this.products = jsonProducts;
        this.htmlProduct = htmlProduct;
        this.idProductGrid = idProductGrid;
        this.idSearchTextProduct = idSearchTextProduct;
        this.idCategoryFilter = idCategoryFilter;
        this.idMaterialFilter = idMaterialFilter;
        this.idConditionFilter = idConditionFilter;
        this.filteredProdotti = [];
        this.dataPrice = null;
        this.whatsAppLink = whatsAppLink || '';

        // Detail modal state
        this.currentDetailProduct = null;
        this.currentImageIndex = 0;

        this.LoadPrices();
        this.InitDetailModal();
    }

    InitDetailModal() {
        // Delegate click on product cards
        const grid = document.getElementById(this.idProductGrid);
        if (!grid) {
            console.error('ProductsManager: gridProducts not found in DOM');
            return;
        }
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const productId = parseInt(card.dataset.productId);
            const product = this.products.find(p => p.id === productId);
            if (product) {
                console.log('Opening detail for:', product.title);
                this.OpenDetail(product);
            }
        });

        // Close modal
        document.getElementById('btnCloseDetail')?.addEventListener('click', () => this.CloseDetail());
        document.getElementById('productDetailModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'productDetailModal') this.CloseDetail();
        });

        // Navigation arrows
        document.getElementById('btnPrevImg')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.NavigateImage(-1);
        });
        document.getElementById('btnNextImg')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.NavigateImage(1);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.currentDetailProduct) return;
            if (e.key === 'Escape') this.CloseDetail();
            if (e.key === 'ArrowLeft') this.NavigateImage(-1);
            if (e.key === 'ArrowRight') this.NavigateImage(1);
        });
    }

    OpenDetail(product) {
        this.currentDetailProduct = product;
        this.currentImageIndex = 0;
        const images = product.images || [];

        // Fill info
        document.getElementById('detailTitle').textContent = product.title;
        document.getElementById('detailCategory').textContent = product.category;
        document.getElementById('detailMaterial').textContent = product.material;
        document.getElementById('detailWeight').textContent = product.weight + 'gr';
        document.getElementById('detailCondition').textContent = product.condition;
        document.getElementById('detailId').textContent = product.id;
        document.getElementById('detailDescription').textContent = product.description;

        // WhatsApp link
        const waBtn = document.getElementById('detailWhatsApp');
        if (waBtn && this.whatsAppLink) {
            const msg = encodeURIComponent(`Salve, vorrei informazioni sull'articolo: ${product.title} (ID: ${product.id})`);
            waBtn.href = `${this.whatsAppLink}?text=${msg}`;
        }

        // Main image
        this.UpdateMainImage(images);

        // Thumbnails
        this.BuildThumbnails(images);

        // Show/hide nav arrows
        const showNav = images.length > 1;
        document.getElementById('btnPrevImg').style.display = showNav ? '' : 'none';
        document.getElementById('btnNextImg').style.display = showNav ? '' : 'none';

        // Show modal
        const modal = document.getElementById('productDetailModal');
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('active'));
        document.body.style.overflow = 'hidden';
    }

    CloseDetail() {
        const modal = document.getElementById('productDetailModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            this.currentDetailProduct = null;
        }, 300);
        document.body.style.overflow = '';
    }

    UpdateMainImage(images) {
        const mainImg = document.getElementById('detailMainImg');
        mainImg.src = images[this.currentImageIndex];
        mainImg.alt = this.currentDetailProduct.title;

        // Update active thumbnail
        document.querySelectorAll('.product-detail-thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === this.currentImageIndex);
        });

        // Update image counter
        const counter = document.getElementById('detailImgCounter');
        if (counter) {
            if (images.length > 1) {
                counter.textContent = `${this.currentImageIndex + 1} / ${images.length}`;
                counter.style.display = '';
            } else {
                counter.style.display = 'none';
            }
        }
    }

    BuildThumbnails(images) {
        const container = document.getElementById('detailThumbnails');
        container.innerHTML = '';
        if (images.length <= 1) return;

        images.forEach((src, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'product-detail-thumb' + (i === 0 ? ' active' : '');
            thumb.innerHTML = `<img src="${src}" alt="Foto ${i + 1}">`;
            thumb.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentImageIndex = i;
                this.UpdateMainImage(images);
            });
            container.appendChild(thumb);
        });
    }

    NavigateImage(direction) {
        if (!this.currentDetailProduct) return;
        const images = this.currentDetailProduct.images || [];
        if (images.length <= 1) return;

        this.currentImageIndex = (this.currentImageIndex + direction + images.length) % images.length;
        this.UpdateMainImage(images);
    }

    async ReloadProducts() {
        IndexManager.ReplaceHtmlContent(this.idProductGrid, "");
        this.filteredProdotti = [];

        if (this.products.length > 0)  {
            let valueSearchTextProduct = document.getElementById(this.idSearchTextProduct).value;
            let searchTerm = valueSearchTextProduct.toLowerCase().trim();
            let valueFilterCategory = document.getElementById(this.idCategoryFilter).value;
            let valueFilterMaterial = document.getElementById(this.idMaterialFilter).value;

            for (let jsonProduct of this.products) {
                if (valueFilterCategory.includes("Tutte") || jsonProduct.category === valueFilterCategory ) {
                    if (valueFilterMaterial.includes("Tutti") || jsonProduct.material === valueFilterMaterial ) {
                        if (!valueSearchTextProduct || valueSearchTextProduct.trim() === "" ||
                            (jsonProduct.title && jsonProduct.title.toLowerCase().includes(searchTerm)) ||
                            (jsonProduct.description && jsonProduct.description.toLowerCase().includes(searchTerm)) ) {

                            this.filteredProdotti.push(jsonProduct);
                            await this.InsertProduct(jsonProduct);
                        }
                    }
                }
            }
        }

        // Update product count
        const countEl = document.getElementById('productCount');
        if (countEl) {
            countEl.textContent = `${this.filteredProdotti.length} articol${this.filteredProdotti.length === 1 ? 'o' : 'i'} trovati`;
        }

        // Trigger fade-in animations for new products
        requestAnimationFrame(() => {
            document.querySelectorAll('#gridProducts .fade-in-up').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 50);
            });
        });
    }

    async RepalceKeysProductInfoOnString(string, jsonProduct) {
        string = HtmlBuilder.RepleaceAllKey(string, "id", jsonProduct.id);
        string = HtmlBuilder.RepleaceAllKey(string, "title", jsonProduct.title);
        string = HtmlBuilder.RepleaceAllKey(string, "description", jsonProduct.description);
        string = HtmlBuilder.RepleaceAllKey(string, "category", jsonProduct.category);
        string = HtmlBuilder.RepleaceAllKey(string, "material", jsonProduct.material);
        string = HtmlBuilder.RepleaceAllKey(string, "weight", jsonProduct.weight);
        string = HtmlBuilder.RepleaceAllKey(string, "featured", jsonProduct.featured ? "Featured" : "");
        string = HtmlBuilder.RepleaceAllKey(string, "condition", jsonProduct.condition);
        string = HtmlBuilder.RepleaceAllKey(string, "imagePath", jsonProduct.images?.[0] || '');

        // Image count badge
        const images = jsonProduct.images || [];
        const countHtml = images.length > 1 ? `<i class="bi bi-images me-1"></i>${images.length}` : '';
        string = HtmlBuilder.RepleaceAllKey(string, "imageCount", countHtml);

        return string;
    }

    async InsertProducts(prodcutsToPut) {
        for (var jsonProduct of prodcutsToPut) {
            await this.InsertProduct(jsonProduct);
        }
    }

    async InsertProduct(jsonProduct) {
        const tmpHtmlProduct = await this.RepalceKeysProductInfoOnString(this.htmlProduct.slice(), jsonProduct);
        IndexManager.InjecHtmlContentToTheEnd("gridProducts", tmpHtmlProduct);
    }

    async GetLivePrice() {
        let LA_TUA_API_KEY = "e8c5189e937efdd2ee4958a07cbc9c3a";
        let fiat = "EUR";
        let symbols = "XAU,XAG,XPT";
        try {
            let response = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${LA_TUA_API_KEY}&base=${fiat}&currencies=${symbols}`);
            let data = await response.json();
            return data;
        } catch (error) {
            console.error("Errore nel caricamento dei dati:", error);
        return null;
        }
    }

    async LoadPrices() {
        this.dataPrice = await this.GetLivePrice();
        console.log("Prezzi caricati:", this.dataPrice);
    }

    GetLiveProductPrice(product) {
        if ((!this.dataPrice || !this.dataPrice.rates) && product.price ) return product.price;

        switch (product.material) {
            case "Oro":
                return product.weight * this.dataPrice.rates.XAU;
            case "Argento":
                return product.weight * this.dataPrice.rates.XAG;
            case "Platino":
                return product.weight * this.dataPrice.rates.XPT;
            default:
                return product.price;
        }
    }
}
