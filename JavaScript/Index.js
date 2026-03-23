
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

    // Load product detail modal into body (outside sections to avoid transform issues)
    let htmlDettaglio = await htmlBuilder.GetStringView('ViewElements/Dettaglio.html');
    let dettaglioContainer = document.createElement('div');
    dettaglioContainer.innerHTML = htmlDettaglio;
    document.body.appendChild(dettaglioContainer);

    let htmlProduct = await htmlBuilder.GetStringView('ViewElements/Product.html');
    productsManager = new ProductsManager(jsonProducts, htmlProduct, "gridProducts", "searchProductInput", "categoryFilter", "materialFilter", "conditionFilter", jsonDataInfo.whatsApp);
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

    // Navbar scroll effect
    InitNavbarScroll();

    // Scroll to top button
    InitScrollToTop();

    // Animate elements on visibility
    InitFadeInObserver();
});

async function StartUp() {

    jsonDataInfo = await UtilityClass.GetJsonFromRootPage("DataInfo");
    // Add Navbar
    let htmlNavbar = await htmlBuilder.GetStringView('Navbar.html');
    htmlNavbar = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlNavbar, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("navbar", htmlNavbar);
    // Add Footer
    let htmlFooter = await htmlBuilder.GetStringView('Footer.html');
    htmlFooter = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlFooter, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("footer", htmlFooter);
    // Add HomeSection
    let htmlSectionsHome = await htmlBuilder.GetStringView('ViewSections/Home.html');
    htmlSectionsHome = await HtmlBuilder.RepalceKeysDataInfoOnString(htmlSectionsHome, jsonDataInfo);
    IndexManager.ReplaceHtmlContent("sectionHome", htmlSectionsHome);
    // Add bachecaMessages
    let htmlBachecaMessage = await htmlBuilder.GetStringView('ViewElements/BachecaMessage.html');
    for (let jsonBachecaMsg of jsonDataInfo.bachecaMessages) {
        let htmlBachecaMessageTmp = await HtmlBuilder.RepalceKeysDataInfoOfBachecaMessage(htmlBachecaMessage, jsonBachecaMsg);
        IndexManager.InjecHtmlContentToTheEnd("bachecaMessages", htmlBachecaMessageTmp)
    }

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
    tab.tabS.classList.add("active");
    tab.tabI.classList.add("active");
    // Scroll to top on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Re-trigger fade-in animations for newly visible elements
    requestAnimationFrame(() => {
        tab.tabS.querySelectorAll('.fade-in-up').forEach(el => {
            el.classList.remove('visible');
            void el.offsetWidth; // force reflow
            el.classList.add('visible');
        });
    });
}

function DeActivateTab(tab) {
    tab.tabS.classList.remove("active");
    tab.tabI.classList.remove("active");
}

function HandleTabClick(event) {
    let target = event.target;

    if (target.classList.contains("nav-link") && target.classList.contains("active")) {
        return; // già attivo, non fare nulla
    }

    let clickedTab = FindTabByElement(target);

    if (clickedTab != null) {
        ActivateTab(clickedTab);
        DeActivateTab(current);
        current = clickedTab;

        // Collapse mobile nav
        const navCollapse = document.getElementById('navbarNav');
        if (navCollapse && navCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
            if (bsCollapse) bsCollapse.hide();
        }
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

// Navbar scroll effect - adds shadow on scroll
function InitNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });
}

// Scroll to top button
function InitScrollToTop() {
    const btn = document.getElementById('scrollToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Intersection Observer for fade-in animations
function InitFadeInObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });
}

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
