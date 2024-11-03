// Función para mostrar el formulario de registro
function goToRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
}

// Función para mostrar el formulario de login
function goToLogin() {
    document.getElementById('login').style.display = 'block';
    document.getElementById('register').style.display = 'none';
}

// Función para realizar el login
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const user = JSON.parse(localStorage.getItem(username));
    if (user && user.contraseña === password) {
        Swal.fire({
            title: `Bienvenido ${user.puesto}`,
            text: `${user.nombre}`,
            icon: 'success',
            confirmButtonText: 'Continuar'
        }).then(() => {
            goToDashboard(user.puesto);
        });
    } else {
        Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
    }
}

// Función para registrar un nuevo usuario
function register() {
    const nombre = document.getElementById('nombre').value;
    const dni = document.getElementById('dni').value;
    const puesto = document.getElementById('puesto').value;
    const usuario = document.getElementById('usuario').value;
    const contraseña = document.getElementById('contraseña').value;

    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
        Swal.fire('Error', 'El nombre solo puede contener letras', 'error');
        return;
    }
    if (!/^\d{7,8}$/.test(dni)) {
        Swal.fire('Error', 'El DNI debe contener entre 7 y 8 números', 'error');
        return;
    }
    if (!/^[a-zA-Z0-9]{1,8}$/.test(usuario)) {
        Swal.fire('Error', 'El usuario solo puede contener letras y números, con un máximo de 8 caracteres', 'error');
        return;
    }
    if (contraseña.length > 8) {
        Swal.fire('Error', 'La contraseña puede tener un máximo de 8 caracteres', 'error');
        return;
    }

    if (localStorage.getItem(usuario)) {
        Swal.fire('Error', 'El usuario ya está registrado', 'error');
        return;
    }

    const user = { nombre, dni, puesto, usuario, contraseña };
    localStorage.setItem(usuario, JSON.stringify(user));
    Swal.fire('Registro exitoso', `Su usuario es ${usuario} y su puesto es ${puesto}`, 'success')
        .then(() => {
            goToLogin();
        });
}

// Función para mostrar el dashboard dependiendo del puesto
function goToDashboard(puesto) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'block';
    if (puesto === 'asesor') {
        document.getElementById('npsCalculator').style.display = 'block';
    } else if (puesto === 'supervisor') {
        document.getElementById('supervisorDashboard').style.display = 'block';
        cargarDatosAsesores();  // Cargar asesores desde el JSON
    }
}

// Función para calcular el NPS desde el formulario del asesor
document.getElementById('npsForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Evita que el formulario recargue la página

    let promotores = parseInt(document.getElementById('promotores').value);
    let detractores = parseInt(document.getElementById('detractores').value);
    let neutros = parseInt(document.getElementById('neutros').value);
    let total = promotores + detractores + neutros;

    if (total === 0) {
        document.getElementById('resultado').innerText = "Los valores no pueden ser cero.";
        return;
    }

    let resultadoNPS = ((promotores - detractores) / total) * 100;
    let cumplimiento = (resultadoNPS / 80) * 100;
    let promotores_faltantes = (detractores * 9) + (neutros * 4) - promotores;
    let mensaje = cumplimiento >= 100 ? 
        "Felicitaciones, ¡estás en objetivo!" : 
        `Aún te faltan ${promotores_faltantes} promotores. Vamos por más!`;

    let clasificacion = cumplimiento > 111 ? "Sobresaliente" :
                        cumplimiento >= 100 ? "Adecuado" :
                        cumplimiento >= 70 ? "A mejorar" : "Inadecuado";

    document.getElementById('resultado').innerHTML = `
        <p>NPS: ${resultadoNPS.toFixed(2)}%</p>
        <p>Cumplimiento: ${cumplimiento.toFixed(2)}%</p>
        <p>${mensaje}</p>
        <p>Clasificación: ${clasificacion}</p>
    `;
});

// Función para cargar los asesores desde el archivo data.json
function cargarDatosAsesores() {
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            mostrarListaAsesores(data.asesores);
        })
        .catch(error => console.error('Error al cargar los datos:', error));
}

// Función para mostrar la lista de asesores en formato de tabla
function mostrarListaAsesores(asesores) {
    const resultadoAsesores = document.getElementById('resultadoAsesores');
    resultadoAsesores.innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                </tr>
            </thead>
            <tbody>
                ${asesores.map(asesor => `
                    <tr>
                        <td>${asesor.nombre}</td>
                        <td>${asesor.dni}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Función para buscar un usuario en localStorage por DNI
function buscarUsuarioPorDNI() {
    const dni = document.getElementById('dniBuscar').value;
    const keys = Object.keys(localStorage);
    let userData = null;

    // Buscar en localStorage para obtener el usuario por DNI
    for (let key of keys) {
        let storedUser = JSON.parse(localStorage.getItem(key));
        if (storedUser && storedUser.dni === dni) {
            userData = storedUser;
            break;
        }
    }

    const resultadoBusqueda = document.getElementById('resultadoBusqueda');
    if (userData) {
        resultadoBusqueda.textContent = `Usuario encontrado: ${userData.usuario}`;
    } else {
        resultadoBusqueda.textContent = 'DNI no registrado.';
    }
}

// Función para cerrar sesión
function logout() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Se cerrará tu sesión actual',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('npsCalculator').style.display = 'none';
            document.getElementById('supervisorDashboard').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'none';
            goToLogin();
            Swal.fire('Sesión cerrada', '', 'success');
        }
    });
}

// Logout automático por inactividad
let inactivityTime = function () {
    let time;
    window.onload = resetTimer;
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keydown', resetTimer);

    function logoutDueToInactivity() {
        Swal.fire({
            title: 'Inactividad detectada',
            text: 'Se cerrará la sesión por inactividad.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        }).then(() => {
            logout();
        });
    }

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logoutDueToInactivity, 300000); // 5 minutos
    }
};

window.onload = function() {
    inactivityTime(); 
};
