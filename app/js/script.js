var modal = document.getElementsByClassName('modal')[0];
document.body.onclick = function(e) {
    if (e.target === modal)
        modal.style.display = '';
}

function showModal() { modal.style.display = 'block'; }
function hideModal() { modal.style.display = ''; }

function submitItem() {
    var form = document.forms[0];
    // validation goes here
    
    var data = {
        name: form.name.value,
        img: form.img.value,
        price: form.price.value
    };
    if (form.description.value)
        data.description = form.description.value;
    if (form.inventory.value)
        data.inventory = form.inventory.value;

    // use fetch() to submit a post request to our reverse proxy
    fetch('/items', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })
    // check to make sure the request was okay. if so, extract the text from
    // the response body
    .then(function(res) {
        if (!res.ok) console.log('Error!');
        return res.text();
    })
    // take the response body and replace the current body with it. the response
    // body is the rendered pug template with either "Success" or "Error" as the
    // title
    .then(function(res) {
        console.log('Success!');
        document.body.innerHTML = res;
    })
    // console.log any error if they occur
    .catch(function(err) {
        console.log('Error!');
        console.log(err);
    });
}
