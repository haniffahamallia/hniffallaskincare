const products = [...document.querySelectorAll('.product-card')];
const searchToggle = document.getElementById('searchToggle');
const searchPanel = document.getElementById('searchPanel');
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');
const emptyState = document.getElementById('emptyState');
const sortSelect = document.getElementById('sortSelect');
const productGrid = document.getElementById('productGrid');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const cartDrawer = document.getElementById('cartDrawer');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const cart = new Map();
const waNumber = '6285159977358';
const money = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);

document.getElementById('year').textContent = new Date().getFullYear();
searchToggle.addEventListener('click', () => {
  searchPanel.hidden = !searchPanel.hidden;
  if (!searchPanel.hidden) searchInput.focus();
});
searchInput.addEventListener('input', filterProducts);
sortSelect.addEventListener('change', () => {
  const cards = [...products];
  if (sortSelect.value === 'name') cards.sort((a,b)=>a.dataset.name.localeCompare(b.dataset.name));
  else cards.sort((a,b)=>products.indexOf(a)-products.indexOf(b));
  cards.forEach(card=>productGrid.appendChild(card));
  filterProducts();
});
function filterProducts(){
  const term = searchInput.value.trim().toLocaleLowerCase('id');
  let visible = 0;
  products.forEach(card=>{
    const match = card.dataset.name.toLocaleLowerCase('id').includes(term) || card.textContent.toLocaleLowerCase('id').includes(term);
    card.hidden = !match;
    if(match) visible++;
  });
  resultCount.textContent = `${visible} produk`;
  emptyState.hidden = visible !== 0;
}
menuToggle.addEventListener('click',()=>{
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded',String(open));
});
mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mainNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}));

function openCart(){
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden','false');
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}
function hideCart(){
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden','true');
  overlay.hidden = true;
  document.body.style.overflow = '';
}
cartToggle.addEventListener('click',openCart);
closeCart.addEventListener('click',hideCart);
overlay.addEventListener('click',hideCart);
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{
  const name = button.dataset.add, price = Number(button.dataset.price);
  const existing = cart.get(name);
  cart.set(name,{price,qty:existing?existing.qty+1:1});
  renderCart();
  button.textContent = '✓ Ditambahkan';
  setTimeout(()=>button.textContent='+ Keranjang',1100);
}));
function renderCart(){
  const entries = [...cart.entries()];
  const count = entries.reduce((sum,[,item])=>sum+item.qty,0);
  const total = entries.reduce((sum,[,item])=>sum+item.price*item.qty,0);
  cartCount.textContent = count;
  cartTotal.textContent = money(total);
  if(!entries.length){
    cartItems.innerHTML='<p class="cart-empty">Keranjangmu masih kosong. Yuk pilih produk favorit!</p>';
    return;
  }
  cartItems.innerHTML = entries.map(([name,item])=>`
    <div class="cart-item">
      <div><strong>${escapeHTML(name)}</strong><small>${money(item.price)} / produk</small>
        <div class="quantity-controls"><button data-qty="-1" data-name="${escapeHTML(name)}" aria-label="Kurangi jumlah">−</button><span>${item.qty}</span><button data-qty="1" data-name="${escapeHTML(name)}" aria-label="Tambah jumlah">+</button></div>
      </div>
      <div style="text-align:right"><strong>${money(item.price*item.qty)}</strong><button class="remove-item" data-remove="${escapeHTML(name)}">Hapus</button></div>
    </div>`).join('');
  cartItems.querySelectorAll('[data-qty]').forEach(button=>button.addEventListener('click',()=>{
    const name=button.dataset.name, item=cart.get(name);
    if(!item)return;
    item.qty+=Number(button.dataset.qty);
    if(item.qty<=0)cart.delete(name);
    renderCart();
  }));
  cartItems.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{cart.delete(button.dataset.remove);renderCart();}));
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
checkoutButton.addEventListener('click',()=>{
  if(!cart.size){
    const url=`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo kak aku mau order hampers 1packet ya;')}`;
    window.open(url,'_blank','noopener');
    return;
  }
  const entries=[...cart.entries()];
  const lines=entries.map(([name,item])=>`- ${name} x${item.qty}: ${money(item.price*item.qty)}`);
  const total=entries.reduce((sum,[,item])=>sum+item.price*item.qty,0);
  const message=`Halo kak aku mau order hampers 1packet ya;\n\nPilihan produk:\n${lines.join('\n')}\n\nTotal sementara: ${money(total)}\nMohon info ketersediaan dan pilihan hampers hari raya ya.`;
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`,'_blank','noopener');
});
