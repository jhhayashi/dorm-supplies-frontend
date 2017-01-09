var modal = document.getElementsByClassName('modal')[0];
document.body.onclick = function(e) {
    if (e.target === modal)
        modal.style.display = '';
}

function showModal() { modal.style.display = 'block'; }
function hideModal() { modal.style.display = ''; }
