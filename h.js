const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwsl1DeyyeaxdPN5V-XSzR0-tI-OV0qMek0sixqMnoK1R7DkXvfdJWH3zbHfV0MVY8FJQ/exec';

const productGrid = document.getElementById('product-grid');
const openFormBtn = document.getElementById('open-form-btn');
const registerModal = document.getElementById('register-modal');
const closeRegBtn = document.getElementById('close-reg-btn');
const productForm = document.getElementById('product-form');
const resultsCount = document.getElementById('results-count');

const successModal = document.getElementById('success-modal');
const successOkBtn = document.getElementById('success-ok-btn');

const tipsBtn = document.getElementById('tips-btn');
const tipsModal = document.getElementById('tips-modal');
const closeTipsBtn = document.getElementById('close-tips-btn');
const tipsAmountInput = document.getElementById('tips-amount');
const payerNameInput = document.getElementById('payer-name');
const upiPayLink = document.getElementById('upi-pay-link');

const searchBtn = document.getElementById('search-btn');
const areaSearch = document.getElementById('area-search');
const productFilter = document.getElementById('product-filter');
const chips = document.querySelectorAll('.chip');

// Login & Edit Elements
const loginBtn = document.getElementById('login-btn');
const loginBtnText = document.getElementById('login-btn-text');
const loginModal = document.getElementById('login-modal');
const closeLoginBtn = document.getElementById('close-login-btn');
const loginForm = document.getElementById('login-form');

const editModal = document.getElementById('edit-modal');
const closeEditBtn = document.getElementById('close-edit-btn');
const editForm = document.getElementById('edit-form');
const deleteBtn = document.getElementById('delete-btn');

// Royal Password Modal Elements
const passwordModal = document.getElementById('password-modal');
const closePassBtn = document.getElementById('close-pass-btn');
const cancelPassBtn = document.getElementById('cancel-pass-btn');
const passwordForm = document.getElementById('password-form');
const modalPasswordInput = document.getElementById('modal-password-input');
const passTargetPhone = document.getElementById('pass-target-phone');
const passTargetAction = document.getElementById('pass-target-action');

const MY_UPI_ID = "8939717405@ybl";
const MERCHANT_NAME = "Namma Ooru 360"; 

let dataList = [];
let currentFilter = 'all';
let loggedInUserPhone = null; // Filtered Card Phone State

async function loadDataFromSheet() {
    productGrid.innerHTML = `
        <div style="text-align:center; padding:40px; grid-column: 1/-1; color:#cda12c;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:28px; margin-bottom:10px;"></i>
            <p>விபரங்கள் லோடு ஆகிறது...</p>
        </div>`;
        
    try {
        const response = await fetch(SCRIPT_URL, { method: "GET" });
        dataList = await response.json();
        
        if (dataList.error) {
            console.error("Apps Script Error:", dataList.error);
            productGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>Apps Script பிழை ஏற்பட்டுள்ளது!</p></div>';
        } else {
            handleSearch(); 
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        productGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>டேட்டா லோடு செய்வதில் பிழை ஏற்பட்டுள்ளது!</p></div>';
    }
}

function renderCards(dataToRender = dataList) {
    productGrid.innerHTML = '';
    if (!Array.isArray(dataToRender)) return;
    
    resultsCount.textContent = `${dataToRender.length} பதிவுகள் உள்ளன`;

    if(dataToRender.length === 0) {
        productGrid.innerHTML = `
            <div style="text-align:center; padding:40px; color:#6B7280; grid-column: 1/-1;">
                <i class="fa-solid fa-folder-open" style="font-size:36px; margin-bottom:10px; color:#cbd5e1;"></i>
                <p>தற்சமயம் பதிவுகள் எதுவும் இல்லை!</p>
            </div>`;
        return;
    }

    dataToRender.forEach(item => {
        const card = document.createElement('div');
        card.className = 'expert-card';

        const title     = item.shopName  || item["shopname"]  || Object.values(item)[1] || "தலைப்பு இல்லை";
        const subTitle  = item.name      || item["name"]      || Object.values(item)[2] || "விபரம் இல்லை";
        const phone     = item.phone     || item["phone"]     || Object.values(item)[3] || "";
        const type      = item.type      || item["type"]      || Object.values(item)[4] || "cat1";
        const extraInfo = item.delivery  || item["delivery"]  || Object.values(item)[5] || "";
        const location  = item.location  || item["location"]  || Object.values(item)[6] || "இடம் இல்லை";
        
        let iconHtml = '<i class="fa-solid fa-truck-medical"></i>'; 
        let typeBadge = 'ஆம்புலன்ஸ்';
        
        if(type.toString().toLowerCase() === 'cat2') { iconHtml = '<i class="fa-solid fa-hospital"></i>'; typeBadge = 'மருத்துவமனை'; }
        if(type.toString().toLowerCase() === 'cat3') { iconHtml = '<i class="fa-solid fa-shield-halved"></i>'; typeBadge = 'போலீஸ்'; }
        if(type.toString().toLowerCase() === 'cat4') { iconHtml = '<i class="fa-solid fa-clock-medical"></i>'; typeBadge = '24H மெடிக்கல்'; }

        let ownerActions = `
            <div class="edit-delete-actions">
                <button class="edit-card-btn" onclick="verifyAndOpenEdit('${phone}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="delete-card-btn" onclick="verifyAndDelete('${phone}', this)"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        `;

        card.innerHTML = `
            <div class="card-left">
                <div class="avatar-container">${iconHtml}</div>
                <div class="expert-info">
                    <h4>${title} <span class="badge">${typeBadge}</span></h4>
                    <p class="shop-title"><i class="fa-solid fa-circle-info"></i> ${subTitle}</p>
                    <p class="delivery-tag"><i class="fa-solid fa-circle-nodes"></i> ${extraInfo}</p>
                    <p class="expert-loc"><i class="fa-solid fa-location-dot"></i> ${location}</p>
                    ${ownerActions}
                </div>
            </div>
            <div class="card-right-actions">
                ${phone ? `<a href="tel:${phone}" class="call-btn-link" title="அழைக்க"><i class="fa-solid fa-phone"></i></a>` : ''}
                ${phone ? `<a href="https://wa.me/91${phone}?text=வணக்கம், உங்களின் ${title} பதிவு குறித்து விபரம் அறிய தொடர்புகொள்கிறேன்." target="_blank" class="wa-btn-link" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function handleSearch() {
    // If a phone login filter is active, force render only that card
    if (loggedInUserPhone) {
        const foundUser = dataList.find(item => (item.phone || item["phone"] || "").toString().trim() === loggedInUserPhone);
        if (foundUser) {
            renderCards([foundUser]);
            return;
        }
    }

    const searchText = areaSearch.value.toLowerCase().trim();
    
    const filtered = dataList.filter(item => {
        const itemType = (item.type || item["type"] || Object.values(item)[4] || "cat1").toString().toLowerCase();
        const itemLoc = (item.location || item["location"] || Object.values(item)[6] || "").toString().toLowerCase();
        const itemTitle = (item.shopName || item["shopName"] || Object.values(item)[1] || "").toString().toLowerCase();
        const itemSub = (item.name || item["name"] || Object.values(item)[2] || "").toString().toLowerCase();

        const matchesType = (currentFilter === 'all' || itemType === currentFilter);
        const matchesSearch = (itemLoc.includes(searchText) || itemTitle.includes(searchText) || itemSub.includes(searchText));

        return matchesType && matchesSearch;
    });

    renderCards(filtered);
}

function updateUpiLink() {
    const amount = tipsAmountInput.value || 100;
    const name = payerNameInput.value.trim() || "Web Donor";
    const note = encodeURIComponent(`Support from ${name}`);
    upiPayLink.href = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${note}`;
}

// Phone Login / Reset Logic
loginBtn.addEventListener('click', () => {
    if (loggedInUserPhone) {
        // Reset Login / Reset state
        loggedInUserPhone = null;
        loginBtnText.textContent = 'Login';
        loginBtn.style.background = '#10B981';
        loginBtn.querySelector('i').className = 'fa-solid fa-right-to-bracket';
        handleSearch();
        return;
    }
    
    loginForm.reset();
    loginModal.style.display = 'flex';
});

closeLoginBtn.addEventListener('click', () => loginModal.style.display = 'none');
closeEditBtn.addEventListener('click', () => editModal.style.display = 'none');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phoneInput = document.getElementById('login-phone').value.trim();

    const foundUser = dataList.find(item => {
        const itemPhone = (item.phone || item["phone"] || "").toString().trim();
        return itemPhone === phoneInput;
    });

    if (foundUser) {
        loggedInUserPhone = phoneInput;
        loginModal.style.display = 'none';

        // Update Login Button state to Reset
        loginBtnText.textContent = 'Reset (Show All)';
        loginBtn.style.background = '#EF4444';
        loginBtn.querySelector('i').className = 'fa-solid fa-rotate-left';

        // Display only that user's card
        renderCards([foundUser]);
    } else {
        alert("இந்தத் தொலைபேசி எண் பதிவில் இல்லை!");
    }
});

// Royal Password Modal Opens
window.verifyAndOpenEdit = function(phone) {
    passTargetPhone.value = phone;
    passTargetAction.value = 'edit';
    modalPasswordInput.value = '';
    passwordModal.style.display = 'flex';
};

window.verifyAndDelete = function(phone, buttonElement) {
    passTargetPhone.value = phone;
    passTargetAction.value = 'delete';
    modalPasswordInput.value = '';
    passwordModal.style.display = 'flex';
};

closePassBtn.addEventListener('click', () => passwordModal.style.display = 'none');
cancelPassBtn.addEventListener('click', () => passwordModal.style.display = 'none');

passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = passTargetPhone.value;
    const action = passTargetAction.value;
    const passwordInput = modalPasswordInput.value.trim();

    const item = dataList.find(d => (d.phone || d["phone"] || "").toString() === phone.toString());
    if (!item) {
        passwordModal.style.display = 'none';
        return;
    }

    const correctPass = (item.password || item["password"] || "").toString().trim();

    if (passwordInput === correctPass) {
        passwordModal.style.display = 'none';
        if (action === 'edit') {
            document.getElementById('edit-shop-name').value = item.shopName || item["shopName"] || "";
            document.getElementById('edit-owner-name').value = item.name || item["name"] || "";
            document.getElementById('edit-phone').value = item.phone || item["phone"] || "";
            document.getElementById('edit-prod-type').value = item.type || item["type"] || "cat1";
            document.getElementById('edit-delivery-info').value = item.delivery || item["delivery"] || "";
            document.getElementById('edit-location').value = item.location || item["location"] || "";
            
            editModal.style.display = 'flex';
        } else if (action === 'delete') {
            deleteRecordDirect(phone);
        }
    } else {
        alert("தவறான கடவுச்சொல்!");
    }
});

// Submit Edit Updates
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = editForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> மாற்றங்கள் சேமிக்கப்படுகிறது...`;

    const updatedData = {
        action: 'update',
        phone: document.getElementById('edit-phone').value,
        shopName: document.getElementById('edit-shop-name').value,
        name: document.getElementById('edit-owner-name').value,
        type: document.getElementById('edit-prod-type').value,
        delivery: document.getElementById('edit-delivery-info').value,
        location: document.getElementById('edit-location').value
    };

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(updatedData)
        });
        editModal.style.display = 'none';
        
        await loadDataFromSheet();
        alert("விபரங்கள் வெற்றிகரமாக மாற்றப்பட்டு பக்கம் புதுப்பிக்கப்பட்டது!");
    } catch(err) {
        alert("மாற்றுவதில் பிழை ஏற்பட்டுள்ளது!");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Direct Delete Function
async function deleteRecordDirect(phone) {
    if(confirm("நிச்சயமாக இந்தப் பதிவை நீக்க விரும்புகிறீர்களா?")) {
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'delete', phone: phone })
            });
            
            await loadDataFromSheet();
            alert("பதிவு வெற்றிகரமாக நீக்கப்பட்டு பக்கம் புதுப்பிக்கப்பட்டது!");
        } catch(err) {
            alert("நீக்குவதில் பிழை!");
        }
    }
}

deleteBtn.addEventListener('click', () => {
    const phone = document.getElementById('edit-phone').value;
    if (phone) {
        editModal.style.display = 'none';
        deleteRecordDirect(phone);
    }
});

searchBtn.addEventListener('click', handleSearch);
productFilter.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    chips.forEach(c => {
        if(c.getAttribute('data-filter') === currentFilter) c.classList.add('active');
        else c.classList.remove('active');
    });
    handleSearch();
});

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter');
        productFilter.value = currentFilter;
        handleSearch();
    });
});

openFormBtn.addEventListener('click', () => registerModal.style.display = 'flex');
closeRegBtn.addEventListener('click', () => registerModal.style.display = 'none');
tipsBtn.addEventListener('click', () => { tipsModal.style.display = 'flex'; updateUpiLink(); });
closeTipsBtn.addEventListener('click', () => tipsModal.style.display = 'none');
successOkBtn.addEventListener('click', () => successModal.style.display = 'none');

tipsAmountInput.addEventListener('input', updateUpiLink);
payerNameInput.addEventListener('input', updateUpiLink);

window.addEventListener('click', (e) => {
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === tipsModal) tipsModal.style.display = 'none';
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === editModal) editModal.style.display = 'none';
    if (e.target === passwordModal) passwordModal.style.display = 'none';
});

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = productForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> பதிவாகிறது...`;

    const formData = {
        shopName: document.getElementById('shop-name').value, 
        name: document.getElementById('owner-name').value,     
        phone: document.getElementById('phone').value,         
        type: document.getElementById('prod-type').value,       
        delivery: document.getElementById('delivery-info').value,
        location: document.getElementById('location').value,
        password: document.getElementById('reg-password').value 
    };

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        registerModal.style.display = 'none';
        productForm.reset();
        successModal.style.display = 'flex';
        loadDataFromSheet();
    } catch (error) {
        console.error("Error:", error);
        alert("பதிவு செய்வதில் தோல்வி!");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

document.addEventListener('DOMContentLoaded', loadDataFromSheet);


