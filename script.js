// Función para guardar usuario
function guardar() {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;

    if (!nombre || !email) {
        alert('Por favor completa todos los campos');
        return;
    }

    fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        cargarUsuarios();
    })
    .catch(err => console.error(err));
}


// Función para obtener usuarios
function cargarUsuarios() {
    fetch('http://localhost:3000/usuarios')
        .then(res => res.json())
        .then(data => {
            const lista = document.getElementById('lista');
            lista.innerHTML = '';

            data.forEach(user => {
                const li = document.createElement('li');
                li.textContent = user.nombre + ' - ' + user.email;
                lista.appendChild(li);
            });
        })
        .catch(err => console.error(err));
}


// Cargar usuarios al abrir la página
window.onload = cargarUsuarios;