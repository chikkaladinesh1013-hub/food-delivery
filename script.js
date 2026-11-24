const cart = new Map();
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
}
function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  overlay.classList.remove("show");
}
function addItem(name, price) {
  const current = cart.get(name) || { price, quantity: 0 };
  current.quantity += 1;
  cart.set(name, current);
  renderCart();
  showToast(`${name} added to your cart`);
}
function changeQuantity(name, amount) {
  const item = cart.get(name);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart.delete(name);
  renderCart();
}
function renderCart() {
  const totalItems = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = [...cart.values()].reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = totalItems;
  document.getElementById("cartTotal").textContent = `₹${subtotal}`;
  const cartItems = document.getElementById("cartItems");
  if (!cart.size) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is waiting for something delicious.</p>';
    return;
  }
  cartItems.innerHTML = [...cart.entries()].map(([name, item]) => `
    <div class="cart-row">
      <div><strong>${name}</strong><span>₹${item.price} each</span></div>
      <div class="qty-controls">
        <button type="button" data-action="minus" data-name="${name}" aria-label="Remove one ${name}">−</button>
        <b>${item.quantity}</b>
        <button type="button" data-action="plus" data-name="${name}" aria-label="Add one ${name}">+</button>
      </div>
    </div>`).join("");
}
document.querySelectorAll(".add-button").forEach(button => {
  button.addEventListener("click", () => addItem(button.dataset.item, Number(button.dataset.price)));
});
document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.getElementById("cartItems").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  changeQuantity(button.dataset.name, button.dataset.action === "plus" ? 1 : -1);
});
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.size) return showToast("Add a dish to your cart first");
  showToast("This is a demo — checkout is not connected");
});
document.getElementById("copyCoupon").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("CRAVE20");
    showToast("Coupon code copied!");
  } catch {
    showToast("Use coupon code CRAVE20 at checkout");
  }
});
document.querySelectorAll(".heart").forEach(button => button.addEventListener("click", () => {
  button.classList.toggle("saved");
  button.textContent = button.classList.contains("saved") ? "♥" : "♡";
}));
document.getElementById("categoryList").addEventListener("click", event => {
  const button = event.target.closest(".category");
  if (!button) return;
  document.querySelectorAll(".category").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  filterFood();
});
function filterFood() {
  const category = document.querySelector(".category.active")?.dataset.category || "All";
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll(".food-card").forEach(card => {
    const categoryMatch = category === "All" || card.dataset.category === category;
    const searchMatch = !query || card.dataset.name.toLowerCase().includes(query) || card.textContent.toLowerCase().includes(query);
    const show = categoryMatch && searchMatch;
    card.hidden = !show;
    if (show) visible++;
  });
  document.getElementById("emptyState").hidden = visible !== 0;
  document.getElementById("filterNote").textContent = query ? `Search: “${query}”` : category === "All" ? "Showing all favourites" : `Showing ${category}`;
}
document.getElementById("searchButton").addEventListener("click", filterFood);
document.getElementById("searchInput").addEventListener("input", filterFood);
document.getElementById("searchInput").addEventListener("keydown", event => {
  if (event.key === "Enter") filterFood();
});
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});
document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => {
  document.getElementById("mainNav").classList.remove("open");
}));
renderCart();
