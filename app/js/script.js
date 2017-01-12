var modal = document.getElementsByClassName('modal')[0];
document.body.onclick = function(e) {
    if (e.target === modal)
        modal.style.display = '';
}

function login() {
    var form = document.forms[0];
    displayError('');
    var emptyFields = checkRequired(form);
    if (emptyFields.length)
        return emptyFields.forEach(error);
    var data = {
        email: form.email.value,
        password: form.password.value
    };

    fetch('/login', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) return errorHandler(res);
        res.json().then(loginSuccess);
    }).catch(errorHandler);
}

function loginSuccess(res) {
    if (modal) modal.style.display = '';
    localStorage.token = res.token;
    var payload = JSON.parse(atob(res.token.split('.')[1]));
    loginInit(payload);
}

function loginInit(info) {
    var navbar = document.getElementById('navbar').childNodes[0];

    // greet
    if (info.firstName || info.email) {
        var greeting = document.createElement('div');
        greeting.setAttribute('class', 'navbar-item');
        greeting.innerHTML = 'Hello, ' + (info.firstName || info.email) + '!';
        if (info.isAdmin) {
            var items = document.createElement('a');
            items.setAttribute('class', 'quiet-link navbar-item');
            items.href = '/admin/items';
            items.innerHTML = 'Manage Items'
            var users = document.createElement('a');
            users.setAttribute('class', 'quiet-link navbar-item');
            users.href = '/admin/users';
            users.innerHTML = 'Manage Users'
            navbar.insertBefore(users, navbar.firstChild);
            navbar.insertBefore(items, navbar.firstChild);
        }
        navbar.insertBefore(greeting, navbar.firstChild);
    }

    // replace register/login with logout
    for (var i = 0; i < navbar.childNodes.length; i++) {
        var c = navbar.childNodes[i];
        if (c.innerHTML === 'Login' || c.innerHTML === 'Register')
            c.style.display = 'none';
    }
    var logout = document.createElement('a');
    logout.setAttribute('class', 'quiet-link navbar-item');
    logout.href = '/logout';
    logout.innerHTML = 'Logout';
    navbar.appendChild(logout);
}
    

function register() {
    var form = document.forms[0];
    displayError('');
    clearError(form.password);
    clearError(form.passwordConfirm);
    var data = getFormData(form);
    if (data.password !== form.passwordConfirm.value) {
        var errorMessage = "<br />Passwords don't match";
        error(form.password);
        error(form.passwordConfirm);
    }
    else var errorMessage = '';
    var emptyFields = checkRequired(form);
    if (emptyFields.length) {
        emptyFields.forEach(function(element) {
            error(element);
            errorMessage += '<br />' + element.getAttribute('data-message');
        });
    }
    if (errorMessage)
        return displayError(errorMessage.substr(6));

    fetch('/register', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(function(res) {
        if (!res.ok) return errorHandler(res);
        res.json().then(loginSuccess);
        window.location = '/';
    }).catch(errorHandler);
}

function successHandler(res) {
    if (!res.ok) return errorHandler(res);
    location.reload(true);
}

function errorHandler(err, message) {
    if (err.status >= 400 && err.status < 500)
        return err.text().then(function(message) { displayError(message) });
    if (message) return displayError(message);
    return displayError('There was a problem submitting your form. Please try again later');
}

function validateElement(target, showError) {
    if (target.hasAttribute('data-regex'))
        var regex = new RegExp(target.getAttribute('data-regex').replace('\\', '\\\\'));
    else var regex = /^.+/;
    var isValid = regex.test(target.value);
    if (showError && !isValid) {
        error(target);
        displayError(target.getAttribute('data-message'));
    }
    return isValid;
}

function displayError(message) {
    var errorDiv = document.getElementById('js-error-message');
    if(!displayError) {
        return errorDiv.style.visibility = ''
    }
    if (!errorDiv) return console.log(message);
    errorDiv.innerHTML = message;
    errorDiv.style.visibility = 'visible';
}

function checkRequired(target, emptyFields) {
    var emptyFields = emptyFields || [];
    var children = target.childNodes;
    for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (c.nodeType !== 1) continue;
        if (c.hasAttribute('data-regex'))
            var regex = new RegExp(c.getAttribute('data-regex').replace('\\', '\\\\'));
        else var regex = /^.+/;
        if (c.hasAttribute('required') && !regex.test(c.value)) emptyFields.push(c);
        checkRequired(c, emptyFields);
    };
    return emptyFields;
}

function error(target) {
    target.style.border = '3px solid #f00';
}

function clearError(target, alsoClearError) {
    target.style.border = '';
    if (alsoClearError) displayError('');
}

function getFormData(form, data) {
    data = data || {};
    var children = form.childNodes;
    for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (c.nodeType !== 1) continue;
        if (c.value && c.name && !data[c.name]) data[c.name] = c.value;
        getFormData(c, data);
    };
    return data;
}

function fetchUsers() {
    if(!localStorage.token) window.location = '/';
    fetch('/admin/getusers', { headers: { 'x-access-token': localStorage.token } })
    .then(function(res) {
        if (!res.ok)
            return adminErrorHandler(res, document.getElementById('js-users'));
        res.json().then(function(users) { populateUsersPage(users) })
    }).catch(adminErrorHandler);
}

function populateUsersPage(users) {
    var userDiv = document.getElementById('js-users');
    users.forEach(function(u) {
        var div = document.createElement('div');
        div.setAttribute('class', 'user');
        var email = document.createElement('div');
        email.setAttribute('class', 'user-email');
        email.innerHTML = u.email;
        div.appendChild(email);
        var admin = document.createElement('div');
        admin.setAttribute('class', 'user-button button button-inline');
        if (u.isAdmin) {
            admin.innerHTML = 'Remove Admin';
            admin.setAttribute('onclick', 'removeAdmin("' + u._id + '", this)');
        } else {
            admin.innerHTML = 'Make Admin';
            admin.setAttribute('onclick', 'makeAdmin("' + u._id + '", this)');
        }
        div.appendChild(admin);
        var del = document.createElement('div');
        del.setAttribute('class', 'user-button button button-inline warning');
        del.innerHTML = 'Delete';
        del.setAttribute('onclick', 'deleteUser("' + u._id + '", this)');
        div.appendChild(del);
        userDiv.appendChild(div);
    });
}

function fetchItems() {
    if(!localStorage.token) window.location = '/';
    fetch('/admin/getitems', { headers: { 'x-access-token': localStorage.token } })
    .then(function(res) {
        if (!res.ok)
            return adminErrorHandler(res, document.getElementById('items'));
        res.json().then(function(users) { populateItemsPage(users) })
    }).catch(adminErrorHandler);
}

function populateItemsPage(items) {
    var itemDiv = document.getElementById('items');
    items.forEach(function(i) {
        var div = document.createElement('div');
        div.setAttribute('class', 'item');
        var imgWrap = document.createElement('div')
        imgWrap.setAttribute('class', 'item-img-wrap');
        var img = document.createElement('img');
        img.setAttribute('class', 'item-img');
        img.src = i.img || defaultImg;
        imgWrap.appendChild(img);
        div.appendChild(imgWrap);
        var info = document.createElement('div');
        info.setAttribute('class', 'item-info-wrap');
        var name = document.createElement('div');
        name.setAttribute('class', 'item-name');
        name.innerHTML = i.name;
        info.appendChild(name);
        var price = document.createElement('div');
        price.setAttribute('class', 'item-price');
        price.innerHTML = '$' + i.price;
        info.appendChild(price);
        var edit = document.createElement('div');
        edit.setAttribute('class', 'item-buy-button button button-inline');
        edit.onclick = function() { editItem(i); };
        edit.innerHTML = 'Edit';
        info.appendChild(edit);
        var del = document.createElement('div');
        del.setAttribute('class', 'item-buy-button button button-inline warning');
        del.setAttribute('onclick', 'deleteItem("' + i._id + '", this)');
        del.innerHTML = 'Delete';
        info.appendChild(del);
        div.appendChild(info);
        itemDiv.appendChild(div);
    });
}

function fetchPending() {
    if(!localStorage.token) window.location = '/';
    fetch('/admin/getpending', { headers: { 'x-access-token': localStorage.token } })
    .then(function(res) {
        if (!res.ok)
            return adminErrorHandler(res, document.getElementById('js-pending'));
        res.json().then(function(pending) { populatePendingPage(pending) })
    }).catch(adminErrorHandler);
}

function populatePendingPage(pending) {
    var pendingDiv = document.getElementById('js-pending');
    console.log(pending);
    pending.forEach(function(u) {
        var div = document.createElement('div');
        div.setAttribute('class', 'pending-user');
        var email = document.createElement('h3');
        email.setAttribute('class', 'pending-user-email center');
        email.innerHTML = u.email;
        div.appendChild(email);
        var wrap = document.createElement('div');
        wrap.setAttribute('class', 'pending-wrap');
        u.purchases.forEach(function(p) {
            var pending = document.createElement('div');
            pending.setAttribute('class', 'pending');
            var item = document.createElement('h4');
            item.setAttribute('class', 'pending-item');
            item.innerHTML = p.name;
            var quantity = document.createElement('div');
            quantity.setAttribute('class', 'pending-quantity');
            quantity.innerHTML = 'x' + p.quantity;
            var price = document.createElement('div');
            price.setAttribute('class', 'pending-price');
            price.innerHTML = 'Total: $' + (p.quantity * p.price);
            var paid = document.createElement('div');
            paid.setAttribute('class', 'button button-inline pending-button');
            paid.innerHTML = 'Mark Paid';
            var delivered = document.createElement('div');
            delivered.setAttribute('class', 'button button-inline pending-button');
            delivered.innerHTML = 'Mark Delivered';
            pending.appendChild(item);
            pending.appendChild(quantity);
            pending.appendChild(price);
            pending.appendChild(paid);
            pending.appendChild(delivered);
            wrap.appendChild(pending);
        });
        div.appendChild(wrap);
        pendingDiv.appendChild(div);
    });
}

function adminErrorHandler(err, target) {
    if (err.status && err.status >= 400 && err.status < 500)
        return window.location = '/';

    var error = document.createElement('h2');
    error.setAttribute('class', 'error center');
    error.innerHTML = 'Error fetching data';
    target.appendChild(error);
}

function showAddItem() {
    showModal(true);
    document.forms[0].firstChild.innerHTML = 'Add Item';
}

function submitItem() {
    var form = document.forms[0];
    displayError('');
    var emptyFields = checkRequired(form);
    if (emptyFields.length)
        return emptyFields.forEach(error);
    var data = getFormData(form);
    
    if (!data.id) {
        fetch('/admin/items', {
            headers: headers(),
            method: 'POST',
            body: JSON.stringify(data)
        }).then(successHandler)
        .catch(errorHandler);
    } else {
        fetch('/admin/items', {
            headers: headers(),
            method: 'PUT',
            body: JSON.stringify(data)
        }).then(successHandler)
        .catch(errorHandler);
    }
}

function editItem(item) {
    showModal(true);
    var form = document.forms[0];
    form.firstChild.innerHTML = 'Edit Item';
    form.name.value = item.name;
    form.img.value = item.img || '';
    form.description.value = item.description || '';
    form.price.value = item.price;
    // TODO fix race condition using relative numbers
    form.inventory.value = item.inventory || '';
    form.id.value = item._id;
}

function deleteItem(id, div) {
    fetch('/admin/deleteitem', {
        headers: headers(),
        method: 'POST',
        body: JSON.stringify({ id: id })
    }).then(function(res) {
        if (!res.ok) throw new Error('There was an error deleting that item');
        var removeNode = div.parentNode.parentNode;
        removeNode.parentNode.removeChild(removeNode);
    }).catch(function(err) { console.log(err); });
}

function makeAdmin(id, button) {
    fetch('/admin/makeadmin', {
        headers: headers(),
        method: 'POST',
        body: JSON.stringify({ id: id })
    }).then(function(res) {
        if (!res.ok) throw new Error('There was an error removing admin privs');
        button.innerHTML = 'Remove Admin';
        button.setAttribute('onclick', 'removeAdmin("' + id + '", this)');
    }).catch(function (err) { console.log(err); });
}

// removes admin privs
function removeAdmin(id, button) {
    fetch('/admin/removeadmin', {
        headers: headers(),
        method: 'POST',
        body: JSON.stringify({ id: id })
    }).then(function(res) {
        if (!res.ok) throw new Error('There was an error remove admin privs');
        button.innerHTML = 'Make Admin';
        button.setAttribute('onclick', 'makeAdmin("' + id + '", this)');
    }).catch(function (err) { console.log(err); });
}

function deleteUser(id, button) {
    fetch('/admin/deleteuser', {
        headers: headers(),
        method: 'POST',
        body: JSON.stringify({ id: id })
    }).then(function(res) {
        if (!res.ok) throw new Error('There was an error deleting the user');
        var removeNode = button.parentNode;
        removeNode.parentNode.removeChild(removeNode);
    }).catch(function(err) { console.log(err) });
}

function headers() {
    return {
        'x-access-token': localStorage.token,
        'Content-Type': 'application/json'
    };
}

// ==========================================================
// Buy page
// ==========================================================

function buy(id, quantity) {
    if (!localStorage.token)
        return modal.style.display = 'block';
    quantity = quantity || 1;
    console.log(id);

    fetch('/buy', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ id: id, quantity: quantity })
    }).then(buySuccess)
    .catch(buyError);
}

function buySuccess(res) {
    if (!res.ok) return buyError(res);
    console.log('success!');
}

function buyError(err) {
    if (err.status >= 400 && err.status < 500)
        return err.text().then(function(message) { console.log(message) });
    return console.log('There was a problem submitting your form. Please try again later');
}

// ==========================================================
// Modal
// ==========================================================

function showModal(toClearForm) {
    modal.style.display = 'block';
    if (toClearForm) document.forms[0].reset();
}
function hideModal() { modal.style.display = ''; }
