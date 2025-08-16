import UtilityClass from './UtilityClass.js';
import HtmlBuilder from "./HtmlBuilder.js";
import IndexManager from "./IndexManager.js";

export default class ProductsManager {
    constructor(jsonProducts, htmlProduct, idProductGrid, idSearchTextProduct, idCategoryFilter, idMaterialFilter, idConditionFilter) {
        this.products = jsonProducts;
        this.htmlProduct = htmlProduct;
        this.idProductGrid = idProductGrid;
        this.idSearchTextProduct = idSearchTextProduct;
        this.idCategoryFilter = idCategoryFilter;
        this.idMaterialFilter = idMaterialFilter;
        this.idConditionFilter = idConditionFilter;
        this.filteredProdotti = [];
        this.dataPrice = null;
        
        this.LoadPrices();
    }

    async ReloadProducts() {
        IndexManager.ReplaceHtmlContent(this.idProductGrid, "");
        this.filteredProdotti = [];

        console.log(this.idSearchTextProduct);
        console.log(this.idCategoryFilter);
        for (let jsonProduct of this.products) {
            let valueSearchTextProduct = document.getElementById(this.idSearchTextProduct).value;
            let searchTerm = valueSearchTextProduct.toLowerCase().trim();
            let valueFilterCategory = document.getElementById(this.idCategoryFilter).value;
            let valueFilterMaterial = document.getElementById(this.idMaterialFilter).value;
            //let valueFilterCondition = document.getElementById("conditionFilter").value;
            
            if (valueFilterCategory.includes("Tutte") || jsonProduct.category === valueFilterCategory ) {
                if (valueFilterMaterial.includes("Tutti") || jsonProduct.material === valueFilterMaterial ) {
                    // if (valueFilterCondition.includes("Tutti") || jsonProduct.material === valueFilterCondition ) {
                        // }

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

    async RepalceKeysProductInfoOnString(string, jsonProduct) {
        string = HtmlBuilder.RepleaceAllKey(string, "id", jsonProduct.id);
        string = HtmlBuilder.RepleaceAllKey(string, "title", jsonProduct.title);
        string = HtmlBuilder.RepleaceAllKey(string, "description", jsonProduct.description);
        string = HtmlBuilder.RepleaceAllKey(string, "category", jsonProduct.category);
        string = HtmlBuilder.RepleaceAllKey(string, "material", jsonProduct.material);
        string = HtmlBuilder.RepleaceAllKey(string, "weight", jsonProduct.weight);
        //string = HtmlBuilder.RepleaceAllKey(string, "price", this.GetLiveProductPrice(jsonProduct));
        string = HtmlBuilder.RepleaceAllKey(string, "featured", jsonProduct.featured ? "Featured" : "");
        string = HtmlBuilder.RepleaceAllKey(string, "condition", jsonProduct.condition);
        string = HtmlBuilder.RepleaceAllKey(string, "imagePath", jsonProduct.imagePath);
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
        let symbols = "XAU,XAG,XPT"; //'XAUUAE24,XAUUAE22,XAUUAE18";
        try {
            //let response = await fetch(`https://metals-api.com/api/latest?access_key=${LA_TUA_API_KEY}&base=${fiat}&symbols=${symbols}`);
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
        // Qui puoi aggiornare l'UI o filtrare prodotti
    }

    GetLiveProductPrice(product) {
        if ((!this.dataPrice || !this.dataPrice.rates) && product.price ) return product.price; // Fallback
        
        switch (product.material) {
            case "Oro":
                return product.weight * this.dataPrice.rates.XAU; // Prezzo in EUR
            case "Argento":
                return product.weight * this.dataPrice.rates.XAG;
            case "Platino":
                return product.weight * this.dataPrice.rates.XPT;
            default:
                return product.price;
        }
    }
}