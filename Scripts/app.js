/* const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "bbfdfhvk0goz",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "xGs1L02K_GEIpDJ6TfqMwhdbSnxein8SEub4Nb1OEVY"
  }); */


const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDiv = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartContent = document.querySelector('.cart-content');
const cartItems = document.querySelector('.cart-Items');
const cartTotal = document.querySelector('.cart-total');
const productsDiv = document.querySelector('.products-center');

// cart array

let cart = [];
let buttonsDom = [];

// get products 
class Products {
    async getProducts(){
            // const contentful = await client.getEntries();

            let result = await fetch('products.json');
            let data = await result.json();
            
            let products = data.items;
            // let products = contentful.items;

            products = products.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return{title, price, id, image};
            });
            return products;
    }
}

// display products
class UI {

    displayProducts(array){
        let result = '';
        
        array.forEach(item => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${item.image} alt="" class='product-img'>
                <button class="bag-btn" data-id=${item.id}>
                    <i class="fas fa-shopping-cart"></i>
                    Add To Bag
                </button>
            </div>
                <h3>${item.title}</h3>
                <h4>$${item.price}</h4>
            </article>
            `;
        })

        const productsDiv = document.querySelector('.products-center');
        productsDiv.innerHTML = result;
    }

    getBagBtn(){
        const bagBtns = [...document.querySelectorAll('.bag-btn')];
        buttonsDom = bagBtns;
        bagBtns.forEach(item => {
            const id = item.dataset.id;
            const inCart = cart.find(item => item.id === id);

            if(inCart){
                item.textContent = 'In Cart';
                item.disabled = true; 
            }

            item.addEventListener('click', (event) =>{
                // console.log(event);
                event.target.textContent = 'In Cart';
                event.target.disabled = true;

                // get product from the products
                const cartItem = {...Storage.getProduct(id), amount: 1};
                
                // Add the product to cart
                cart = [...cart, cartItem];

                // save the cart in the localstorage
                Storage.saveCart(cart);

                // set cart values
                this.setCartValues(cart);

                // Display Cart Item
                this.addCartItem(cartItem);

                // Show the cart items
                // this.showCart();
            });
        });
    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })

        const cartTotal = document.querySelector('.cart-total');
        const cartItems = document.querySelector('.cart-items');
        cartTotal.textContent = parseFloat(tempTotal.toFixed(2));
        cartItems.textContent = itemsTotal;
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>

        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;

        const cartContent = document.querySelector('.cart-content');
        cartContent.appendChild(div);
    }

    showCart(){
        const cartDiv = document.querySelector('.cart');
        const cartOverlay = document.querySelector('.cart-overlay');
        cartOverlay.classList.add('transparentBcg');
        cartDiv.classList.add('showCart');
    }

    hideCart(){
        const cartDiv = document.querySelector('.cart');
        const cartOverlay = document.querySelector('.cart-overlay');
        cartOverlay.classList.remove('transparentBcg');
        cartDiv.classList.remove('showCart');
    }

    setupApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);

        const cartBtn = document.querySelector('.cart-btn');
        const closeCartBtn = document.querySelector('.close-cart');
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic(){
        const clearCartBtn = document.querySelector('.clear-cart');
        clearCartBtn.addEventListener('click', this.clearCart.bind(this));

        const cartContent = document.querySelector('.cart-content');
        cartContent.addEventListener('click', (event) => {
            if(event.target.classList.contains('remove-item')){
                const removeBtn = event.target;
                const id = removeBtn.dataset.id;
                this.removeItem(id);
                removeBtn.parentElement.parentElement.remove();

            } else if(event.target.classList.contains('fa-chevron-up')){
                const addAmount = event.target;
                const id = addAmount.dataset.id;
                const tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                addAmount.nextElementSibling.textContent = tempItem.amount;
                Storage.saveCart(cart);
                this.setCartValues(cart);

            } else if(event.target.classList.contains('fa-chevron-down')){
                const lessAmount = event.target;
                const id = lessAmount.dataset.id;
                const tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    lessAmount.previousElementSibling.textContent = tempItem.amount;
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                } else{
                    lessAmount.parentElement.parentElement.remove();
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart(){
        const cartItemIds = cart.map(item => item.id);
        // console.log(cartItemIds);
        cartItemIds.forEach(item => this.removeItem(item));

        const cartContent = document.querySelector('.cart-content');
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(itemId){
        cart = cart.filter(item => item.id !== itemId);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(itemId);
        button.disabled = false;
        button.innerHTML = `<i class='fas fa-shopping-cart'></i> Add To Cart`;
    }

    getSingleButton(id){
        return buttonsDom.find(item => item.dataset.id === id);
    }

    smoothScroll(target, duration){
        const target1 = document.querySelector(target);
        const targetPosition = target1.getBoundingClientRect().top;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime){
            if(startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            console.log(timeElapsed);
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if(timeElapsed < duration) requestAnimationFrame(animation);
            console.log(timeElapsed, duration);
        }

        const easeInOutQuad = function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t + b;
            t--;
            return -c/2 * (t*(t-2) - 1) + b;
        };

        requestAnimationFrame(animation);
    }

    scrollButton(){
        const shopBtn = document.querySelector('.banner-btn');
        shopBtn.addEventListener('click', this.smoothScroll.bind(this, '.products-center', 1000));
    }
}

// local storage
class Storage {
    static saveProducts(array){
        localStorage.setItem('products', JSON.stringify(array));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(item => item.id === id);
    }

    static saveCart(array){
        localStorage.setItem('cartItems', JSON.stringify(array));
    }

    static getCart(){
        return localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    }
}

document.addEventListener('DOMContentLoaded', () =>{
    const Ui = new UI();
    const products = new Products();

    // Setup app
    Ui.setupApp();

    Ui.scrollButton();

    // get all products
    products.getProducts().then(data => {
      Ui.displayProducts(data);
      Storage.saveProducts(data);
    }).then(() =>{
        Ui.getBagBtn();
        Ui.cartLogic();
    });
});