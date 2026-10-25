/* ==========================================================
   North Star Bakery - main.js
   One shared script for all four pages. Each page only runs the
   setup function for the elements it actually contains.

   1. Product filter + favorites          (products.html)
   2. Inquiry/pre-order form validation   (contact.html)
   3. localStorage: favorites, last filter, name and email
   ========================================================== */

/* ---------- Data: arrays and objects ---------- */

// Every key this site uses in localStorage, kept in one place.
const STORAGE_KEYS = {
    favorites: "northStar.favorites",
    filter: "northStar.productFilter",
    customer: "northStar.customer"
};

// Filter buttons shown above the product list.
const categories = [
    { id: "all", label: "All Items" },
    { id: "bread", label: "Breads" },
    { id: "pastry", label: "Pastries" },
    { id: "cake", label: "Cakes" }
];

// Each product is an object. The product cards on products.html
// are built from this array. Prices follow the price ranges on
// the page: breads $5-$12, pastries $3-$8, cakes $25-$65.
const products = [
    { id: "signature-loaf", name: "Signature Loaf", category: "bread", price: 9, description: "Our handcrafted house favorite with a golden, crackly crust." },
    { id: "sourdough", name: "Country Sourdough", category: "bread", price: 8, description: "Naturally leavened and slow-fermented for a tangy, chewy crumb." },
    { id: "multigrain", name: "Multigrain Sandwich Bread", category: "bread", price: 6, description: "A soft everyday loaf with oats, flax, and sunflower seeds." },
    { id: "cinnamon-raisin", name: "Cinnamon Raisin Swirl", category: "bread", price: 7, description: "Sweet cinnamon swirl, perfect for weekend toast." },
    { id: "croissant", name: "Butter Croissant", category: "pastry", price: 4, description: "Flaky, buttery layers baked fresh every morning." },
    { id: "chocolate-croissant", name: "Chocolate Croissant", category: "pastry", price: 5, description: "Our butter croissant wrapped around dark chocolate." },
    { id: "fruit-danish", name: "Seasonal Fruit Danish", category: "pastry", price: 5, description: "Topped with whatever fruit is in season." },
    { id: "morning-bun", name: "Orange Morning Bun", category: "pastry", price: 4, description: "Rolled in orange-scented sugar for commuters on the go." },
    { id: "chocolate-cake", name: "Chocolate Celebration Cake", category: "cake", price: 45, description: "Rich chocolate layers with fudge frosting. Serves 10 to 12." },
    { id: "vanilla-cake", name: "Vanilla Bean Layer Cake", category: "cake", price: 40, description: "A classic birthday cake with vanilla buttercream." },
    { id: "lemon-cake", name: "Lemon Berry Cake", category: "cake", price: 50, description: "Lemon sponge with fresh berries and whipped cream." }
];

/* ---------- localStorage helpers ---------- */

// Reads and parses a stored value. Returns the fallback when nothing
// is saved or storage is blocked (for example, some private windows).
function loadFromStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
    } catch (error) {
        return fallback;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Storage unavailable: the site still works, it just won't remember.
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        // ignore
    }
}

function findProduct(productId) {
    return products.find(function (product) {
        return product.id === productId;
    });
}

function findCategory(categoryId) {
    return categories.find(function (category) {
        return category.id === categoryId;
    });
}

function formatPrice(amount) {
    return "$" + amount.toFixed(2);
}

/* ==========================================================
   FEATURE: product filter and favorites (products.html)
   ========================================================== */

let favorites = loadFromStorage(STORAGE_KEYS.favorites, []);
let activeFilter = loadFromStorage(STORAGE_KEYS.filter, "all");

// Drop any saved IDs for items that are no longer on the menu.
favorites = favorites.filter(function (id) {
    return findProduct(id) !== undefined;
});

function isFavorite(productId) {
    return favorites.includes(productId);
}

function toggleFavorite(productId) {
    if (isFavorite(productId)) {
        favorites = favorites.filter(function (id) {
            return id !== productId;
        });
    } else {
        favorites.push(productId);
    }
    saveToStorage(STORAGE_KEYS.favorites, favorites);
}

function renderFilterButtons() {
    const filterBar = document.getElementById("filter-bar");
    filterBar.innerHTML = "";

    categories.forEach(function (category) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "filter-btn";
        button.textContent = category.label;
        button.dataset.category = category.id;
        button.setAttribute("aria-pressed", String(category.id === activeFilter));
        button.addEventListener("click", function () {
            setFilter(category.id);
        });
        filterBar.appendChild(button);
    });
}

function setFilter(categoryId) {
    activeFilter = categoryId;
    saveToStorage(STORAGE_KEYS.filter, activeFilter);

    document.querySelectorAll(".filter-btn").forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.dataset.category === categoryId));
    });

    renderProducts();
}

function getVisibleProducts() {
    if (activeFilter === "all") {
        return products;
    }
    return products.filter(function (product) {
        return product.category === activeFilter;
    });
}

function updateFavoriteButton(button, product) {
    const saved = isFavorite(product.id);
    button.setAttribute("aria-pressed", String(saved));
    button.textContent = saved ? "★ Saved" : "☆ Save to favorites";
    button.setAttribute("aria-label",
        saved ? "Remove " + product.name + " from favorites"
              : "Save " + product.name + " to favorites");
}

function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "menu-card";
    card.classList.toggle("is-favorite", isFavorite(product.id));

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = findCategory(product.category).label;

    const top = document.createElement("div");
    top.className = "menu-card-top";
    const name = document.createElement("h3");
    name.textContent = product.name;
    const price = document.createElement("span");
    price.className = "price";
    price.textContent = formatPrice(product.price);
    top.append(name, price);

    const description = document.createElement("p");
    description.textContent = product.description;

    const favButton = document.createElement("button");
    favButton.type = "button";
    favButton.className = "fav-btn";
    updateFavoriteButton(favButton, product);
    favButton.addEventListener("click", function () {
        toggleFavorite(product.id);
        updateFavoriteButton(favButton, product);
        card.classList.toggle("is-favorite", isFavorite(product.id));
        renderFavoritesList("favorites-list");
    });

    card.append(tag, top, description, favButton);
    return card;
}

function renderProducts() {
    const grid = document.getElementById("menu-grid");
    const status = document.getElementById("menu-status");
    const visible = getVisibleProducts();

    grid.innerHTML = "";
    visible.forEach(function (product) {
        grid.appendChild(createProductCard(product));
    });

    status.textContent = "Showing " + visible.length + " " +
        (visible.length === 1 ? "item" : "items") +
        (activeFilter === "all" ? "" : " in " + findCategory(activeFilter).label);
}

// Lists saved favorites. Used on products.html and contact.html.
// If onPick is given, each favorite becomes a button.
function renderFavoritesList(listId, onPick) {
    const list = document.getElementById(listId);
    if (!list) {
        return;
    }
    list.innerHTML = "";

    if (favorites.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty";
        empty.textContent = "No favorites yet. Select “Save to favorites” on any product.";
        list.appendChild(empty);
        return;
    }

    favorites.forEach(function (productId) {
        const product = findProduct(productId);
        const li = document.createElement("li");
        if (onPick) {
            const pick = document.createElement("button");
            pick.type = "button";
            pick.textContent = product.name;
            pick.setAttribute("aria-label", "Add " + product.name + " to your request");
            pick.addEventListener("click", function () {
                onPick(product);
            });
            li.appendChild(pick);
        } else {
            li.textContent = product.name + " – " + formatPrice(product.price);
        }
        list.appendChild(li);
    });
}

function clearFavorites() {
    favorites = [];
    saveToStorage(STORAGE_KEYS.favorites, favorites);
    renderProducts();
    renderFavoritesList("favorites-list");
}

function initProductsPage() {
    if (!findCategory(activeFilter)) {
        activeFilter = "all";
    }
    renderFilterButtons();
    renderProducts();
    renderFavoritesList("favorites-list");
    document.getElementById("clear-favorites").addEventListener("click", clearFavorites);
}

/* ==========================================================
   FORM VALIDATION (contact.html)
   ========================================================== */

const MIN_NOTICE_DAYS = 2;

// One rule per field, keyed by the field's id. Each rule returns
// an error message, or an empty string when the value is valid.
const validationRules = {
    "name": function (value) {
        if (value === "") return "Please enter your name.";
        if (value.length < 2) return "Your name needs at least 2 characters.";
        return "";
    },
    "email": function (value) {
        if (value === "") return "Please enter your email so we can reply.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Enter a valid email, like name@example.com.";
        return "";
    },
    "request-type": function (value) {
        if (value === "") return "Please choose Pre-Order or General Question.";
        return "";
    },
    "pickup-date": function (value, form) {
        if (value === "") return "Please choose a pickup date.";
        const pickup = parseLocalDate(value);
        const today = getToday();
        if (pickup < today) return "The pickup date can't be in the past.";
        const isPreOrder = getField(form, "request-type").value === "pre-order";
        if (isPreOrder && pickup < addDays(today, MIN_NOTICE_DAYS)) {
            return "Pre-orders need " + MIN_NOTICE_DAYS + " days' notice. Choose " +
                formatDisplayDate(addDays(today, MIN_NOTICE_DAYS)) + " or later.";
        }
        return "";
    },
    "item-details": function (value) {
        if (value === "") return "Please tell us what you would like or what your question is.";
        if (value.length < 10) return "Please add a little more detail (at least 10 characters).";
        if (value.length > 500) return "Item details can be up to 500 characters.";
        return "";
    },
    "allergy-notes": function (value) {
        if (value.length > 300) return "Allergy notes can be up to 300 characters.";
        return "";
    }
};

// Looks up a form control by its id inside the form.
function getField(form, fieldId) {
    return form.querySelector("#" + fieldId);
}

// "2026-10-27" -> Date at local midnight. new Date("2026-10-27")
// would be read as UTC midnight, which is the evening before in
// U.S. time zones and would shift every date by one day.
function parseLocalDate(isoString) {
    const parts = isoString.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function toInputDate(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function formatDisplayDate(date) {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function showError(field, message) {
    document.getElementById(field.id + "-error").textContent = message;
    field.classList.add("invalid");
    field.classList.remove("valid");
    field.setAttribute("aria-invalid", "true");
}

function clearError(field) {
    document.getElementById(field.id + "-error").textContent = "";
    field.classList.remove("invalid");
    field.setAttribute("aria-invalid", "false");
    field.classList.toggle("valid", field.value.trim() !== "");
}

// Checks one field against its rule and shows or clears its message.
function validateField(field) {
    const rule = validationRules[field.id];
    if (!rule) {
        return true;
    }
    const message = rule(field.value.trim(), field.form);
    if (message) {
        showError(field, message);
        return false;
    }
    clearError(field);
    return true;
}

// Checks every field and returns the first invalid one (or null).
function validateForm(form) {
    let firstInvalid = null;
    Object.keys(validationRules).forEach(function (fieldId) {
        const field = getField(form, fieldId);
        if (!validateField(field) && !firstInvalid) {
            firstInvalid = field;
        }
    });
    return firstInvalid;
}

function updateDetailsCount() {
    const details = document.getElementById("item-details");
    document.getElementById("item-details-count").textContent = details.value.length + " / 500";
}

/* ---------- Remembered name and email ---------- */

function prefillCustomer(form) {
    const customer = loadFromStorage(STORAGE_KEYS.customer, null);
    if (customer) {
        getField(form, "name").value = customer.name || "";
        getField(form, "email").value = customer.email || "";
    }
}

function saveCustomer(form) {
    if (getField(form, "remember").checked) {
        saveToStorage(STORAGE_KEYS.customer, {
            name: getField(form, "name").value.trim(),
            email: getField(form, "email").value.trim()
        });
    } else {
        removeFromStorage(STORAGE_KEYS.customer);
    }
}

// Adds a saved favorite to the request: switches the request type
// to Pre-Order and appends a line to Item Details.
function addFavoriteToRequest(form, product) {
    const requestType = getField(form, "request-type");
    const details = getField(form, "item-details");

    requestType.value = "pre-order";
    validateField(requestType);

    const line = "1 x " + product.name;
    details.value = details.value.trim() === "" ? line : details.value.trim() + "\n" + line;
    updateDetailsCount();
    if (details.classList.contains("invalid")) {
        validateField(details);
    }
    details.focus();
}

function handleSubmit(event) {
    event.preventDefault();   // stop the form until every field is checked
    const form = event.target;
    const success = document.getElementById("form-success");
    success.hidden = true;

    const firstInvalid = validateForm(form);
    if (firstInvalid) {
        firstInvalid.focus();  // take the user straight to the first problem
        return;
    }

    saveCustomer(form);

    const firstName = getField(form, "name").value.trim().split(" ")[0];
    const type = getField(form, "request-type").value === "pre-order" ? "pre-order request" : "question";
    const pickup = parseLocalDate(getField(form, "pickup-date").value);
    success.textContent = "Thank you, " + firstName + "! We received your " + type +
        " for pickup on " + formatDisplayDate(pickup) + ". Our team will reply by email.";
    success.hidden = false;

    // Clear the request but keep the remembered name and email.
    ["request-type", "pickup-date", "item-details", "allergy-notes"].forEach(function (fieldId) {
        const field = getField(form, fieldId);
        field.value = "";
        field.classList.remove("valid");
    });
    updateDetailsCount();
}

function initContactPage() {
    const form = document.getElementById("order-form");

    prefillCustomer(form);
    getField(form, "pickup-date").min = toInputDate(getToday());

    renderFavoritesList("order-favorites", function (product) {
        addFavoriteToRequest(form, product);
    });

    // Check a field when the user leaves it, then re-check while they
    // type so the message disappears as soon as the entry is fixed.
    Object.keys(validationRules).forEach(function (fieldId) {
        const field = getField(form, fieldId);

        field.addEventListener("blur", function (event) {
            // If focus is moving to the submit button, skip this check.
            // A new message here would push the button down mid-click,
            // so the click would miss. The submit handler checks anyway.
            if (event.relatedTarget && event.relatedTarget.type === "submit") return;
            if (field.value.trim() !== "") validateField(field);
        });

        field.addEventListener("input", function () {
            if (field.classList.contains("invalid")) validateField(field);
        });
    });

    // Changing the request type changes the date rule, so re-check the date.
    getField(form, "request-type").addEventListener("change", function () {
        const date = getField(form, "pickup-date");
        if (date.value !== "") validateField(date);
    });

    getField(form, "item-details").addEventListener("input", updateDetailsCount);
    form.addEventListener("submit", handleSubmit);
}

/* ==========================================================
   HOME PAGE: welcome-back message (index.html)
   ========================================================== */

function initHomePage() {
    const message = document.getElementById("welcome-back");
    const customer = loadFromStorage(STORAGE_KEYS.customer, null);

    if (customer && customer.name) {
        let text = "Welcome back, " + customer.name.split(" ")[0] + "!";
        if (favorites.length > 0) {
            text += " You have " + favorites.length + " saved " +
                (favorites.length === 1 ? "favorite" : "favorites") + " on the Products page.";
        }
        message.textContent = text;
        message.hidden = false;
    }
}

/* ---------- Start: run only what this page needs ---------- */

function init() {
    if (document.getElementById("menu-grid")) initProductsPage();
    if (document.getElementById("order-form")) initContactPage();
    if (document.getElementById("welcome-back")) initHomePage();
}

document.addEventListener("DOMContentLoaded", init);
