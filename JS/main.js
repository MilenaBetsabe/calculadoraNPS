function goToRegister() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
}

function goToLogin() {
    document.getElementById('login').style.display = 'block';
    document.getElementById('register').style.display = 'none';
}

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

function goToDashboard(puesto) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'block';
    if (puesto === 'asesor') {
        document.getElementById('npsCalculator').style.display = 'block';
    } else if (puesto === 'supervisor') {
        document.getElementById('supervisorDashboard').style.display = 'block';
    }
}

document.getElementById('npsForm').addEventListener('submit', function(event) {
    event.preventDefault();

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

document.getElementById('agregarAsesor').addEventListener('click', function() {
    const nombreAsesor = document.getElementById('nombreAsesor').value;
    let asesores = JSON.parse(localStorage.getItem('asesores')) || [];

    if (asesores.length < 20) {
        asesores.push(nombreAsesor);
        localStorage.setItem('asesores', JSON.stringify(asesores));
        Swal.fire('Éxito', 'Asesor agregado exitosamente.', 'success');
    } else {
        Swal.fire('Error', 'No puedes agregar más de 20 asesores.', 'error');
    }
});

document.getElementById('buscarUsuario').addEventListener('click', function() {
    const dniUsuario = document.getElementById('dniUsuario').value;
    const userData = JSON.parse(localStorage.getItem(dniUsuario));
    const resultadoBusqueda = document.getElementById('resultadoBusqueda');

    if (userData) {
        resultadoBusqueda.textContent = 'El nombre de usuario es: ' + userData.usuario;
    } else {
        resultadoBusqueda.textContent = 'DNI no registrado.';
    }
});

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
