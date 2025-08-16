
import UtilityClass from "./UtilityClass.js";
import HtmlBuilder from "./HtmlBuilder.js";
import IndexManager from "./IndexManager.js";
import ProductsManager from "./ProductsManager.js";

// Variabili di Istanze
var htmlBuilder;
var productsManager;
var tabs = [];
var current = null;
var jsonDataInfo;
var jsonProducts;

// Var Notifications
var toastLiveNotificationContainer;
var toastLiveNotification;
var toastLiveNotificationTitle;
var toastLiveNotificationMSG;

var partPath = window.location.hash
console.log(partPath);

document.addEventListener('DOMContentLoaded', async function() {
    jsonDataInfo = await UtilityClass.GetJsonFromRootPage("DataInfo");
    jsonProducts = await UtilityClass.GetJsonFromRootPage("Products");

    htmlBuilder = new HtmlBuilder("../Views");
    await StartUp();
    InitTabs();
    //kanji = new Kanji(htmlBuilder, ShowToast); // per mostrare la notifica

    let htmlProduct = await htmlBuilder.GetStringView('ViewProducts/Product.html');
    productsManager = new ProductsManager(jsonProducts, htmlProduct, "gridProducts", "searchProductInput", "categoryFilter", "materialFilter", "conditionFilter");
    await productsManager.ReloadProducts();

    // NotificationCenter
    toastLiveNotificationContainer = document.querySelector('#toastLiveNotificationContainer');
    toastLiveNotification = toastLiveNotificationContainer.querySelector('#toastLiveNotification');
    toastLiveNotificationTitle = toastLiveNotification.querySelector('#toastLiveNotificationTitle');
    toastLiveNotificationMSG = toastLiveNotificationContainer.querySelector('#toastLiveNotificationMSG');
    
    // Aggiunta di eventi.
    document.addEventListener("click", HandleTabClick);
    document.getElementById('btnEsploraShop').addEventListener("click", PressedBtnEsploraShop);
    document.getElementById('btnContatti').addEventListener("click", PressedBtnContact);
    document.getElementById('searchProductInput').addEventListener("input", () => productsManager.ReloadProducts());
    document.getElementById('categoryFilter').addEventListener('change', () => productsManager.ReloadProducts());
    document.getElementById('materialFilter').addEventListener('change', () => productsManager.ReloadProducts());

});

async function StartUp() {

    jsonDataInfo = await UtilityClass.GetJsonFromRootPage("DataInfo");

    let htmlNavbar = await htmlBuilder.GetStringView('Navbar.html');
    htmlNavbar = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlNavbar, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("navbar", htmlNavbar);

    let htmlFooter = await htmlBuilder.GetStringView('Footer.html');
    htmlFooter = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlFooter, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("footer", htmlFooter);

    let htmlSectionsHome = await htmlBuilder.GetStringView('ViewSections/Home.html');
    htmlSectionsHome = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsHome, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("sectionHome", htmlSectionsHome);

    let htmlSectionsContact = await htmlBuilder.GetStringView('ViewSections/Contact.html');
    htmlSectionsContact = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsContact, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("sectionContact", htmlSectionsContact);

    let htmlSectionsChiSiamo = await htmlBuilder.GetStringView('ViewSections/ChiSiamo.html');
    htmlSectionsChiSiamo = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsChiSiamo, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("sectionChiSiamo", htmlSectionsChiSiamo);

    let htmlSectionsShop = await htmlBuilder.GetStringView('ViewSections/Shop.html');
    IndexManager.ReplaceHtmlContent("sectionShop", htmlSectionsShop);
}

function InitTabs() {
    tabs = [
        { tabI: document.querySelector("#iHome"), tabS: document.querySelector("#sectionHome") },
        { tabI: document.querySelector("#iChiSiamo"), tabS: document.querySelector("#sectionChiSiamo") },
        { tabI: document.querySelector("#iShop"), tabS: document.querySelector("#sectionShop") },
        { tabI: document.querySelector("#iContact"), tabS: document.querySelector("#sectionContact") },
    ];
    current = tabs[0]; // imposta il primo come attivo
}

function ActivateTab(tab) {
    tab.tabS.style.display = "block";
    tab.tabI.classList.add("active");
}

function DeActivateTab(tab) {
    tab.tabS.style.display = "none";
    tab.tabI.classList.remove("active");
}

function HandleTabClick(event) {
    let target = event.target;

    if (target.getAttribute("class") === "nav-link active") {
        return; // già attivo, non fare nulla
    }

    let clickedTab = FindTabByElement(target);

    if (clickedTab != null) {
        ActivateTab(clickedTab);
        DeActivateTab(current);
        current = clickedTab;
    } else {
        console.log("Tab NON RICONOSCIUTO! - " + target);
    }
}

function FindTabByElement(el) {
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].tabI === el) {
            return tabs[i];
        }
    }
    return null;
}

function PressedBtnEsploraShop() {
    ActivateTab(tabs[2]);
    DeActivateTab(current);
    current = tabs[2];
}
function PressedBtnContact() {
    ActivateTab(tabs[3]);
    DeActivateTab(current);
    current = tabs[3];
}

// Imposta Google Maps
// const address = encodeURIComponent(contattiData.indirizzo);
// const mapIframe = document.getElementById('google-map');
// mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${address}`;

//Funzione per mostrare il toast automaticamente
function ShowToast(title, msg) {
    if(title) {
        toastLiveNotificationTitle.textContent = title;
    }
    if(msg) {
        toastLiveNotificationMSG.textContent = msg;
    }
    toastLiveNotification.classList.add('show'); // Apri il toast
    const toast = new bootstrap.Toast(toastLiveNotification);
    toast.show();
}