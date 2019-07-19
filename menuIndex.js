import { firebaseConfig } from "./config.js";

window.onload = () => {

    firebase.initializeApp(firebaseConfig);
    let refUsuarios = firebase.database().ref("usuarios");

    let mostrarModal = (e) => {
        e.preventDefault()
        $("#modalIniciarSesion").modal("show");
    }

    let mostrarModalCrear = (e) => {
        e.preventDefault()
        $("#modalCrearCuenta").modal("show");
    }
    let inciarSesion = () => {
        let email = $("#inputEmail").val().trim();
        let password = $("#inputPassword").val().trim();

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                $("#modalIniciarSesion").modal("hide");

            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
            });
    }

    let crearCuenta = () => {
        let email = $("#inputEmailCrear").val().trim();
        let password = $("#inputPasswordCrear1").val().trim();
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                $("#modalCrearCuenta").modal("hide");
                console.log(email);
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    let cerrarSesion = (e) => {
        e.preventDefault();
        firebase.auth().signOut()
            .then(() => {
                // redireccionar al index cuando la sesión se cierra
                location = "./index.html";
            })
            .catch(() => {
            });
    }
    let verificarSesion = () => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                $("#btnInicio").html(user.email);
                $("#btnCrearCuenta").hide();
                $("#btnIniciarSesion").hide();
                $("#btnCerrarSesion").show();
                refUsuarios.on("value", dataSnapshot => {
                    let existe = dataSnapshot.hasChild(user.uid);
                    console.log(existe)
                    if (!existe) {
                        refUsuarios.child(user.uid).set({
                            nombre: $("#inputNombreCrear").val(),
                            email: $("#inputEmailCrear").val(),
                            password: $("#inputPasswordCrear1").val(),
                            tipo: $("#tipo").val()
                        }).then(() => {
                            alert("Usuario REGISTRADO correctamente", "success");
                        });
                    }
                    else {
                        refUsuarios.child(user.uid).on("value", dataSnapshot => {
                            let tipo = dataSnapshot.val().tipo;
                            if (tipo === "admin") {
                                console.log("es admin");
                            }
                            else {
                                console.log("es un usuario normal");
                            }
                        });
                    }
                });


            } else {
                console.log("No habia una sesion iniciada o el usuario cerró sesion");
                $("#btnUsuario").html("Iniciar Sesión");
                $("#btnRegistrar").show();
                $("#btnIniciarSesion").show();
                $("#btnCerrarSesion").hide();
            }
        });
    }
    let compararStrings = (s1, s2) => {
        return s1 == s2
    }
    verificarSesion();
    $("#btnIniciarSesion").click(mostrarModal);
    $("#btnCrearCuenta").click(mostrarModalCrear);
    $("#btnGuardadCuenta").click(crearCuenta);
    $("#btnIngresar").click(inciarSesion);
    $("#btnCerrarSesion").click(cerrarSesion);
    $("#inputPasswordCrear2").keyup(function (e) {
        let iguales = compararStrings($("#inputPasswordCrear1").val().trim(),
            $(this).val().trim());
        console.log(iguales);

        if (!iguales) {
            $("#helpPassword").html("Las Contraseñas no coinciden");
            $("#helpPassword").removeAttr("hidden");
            $("#helpPassword").attr("class", "form-text text-danger");

            $(this).attr("class", "form-control is-invalid");
            $("#btnCrearCuenta").attr("disabled", true);
        } else {
            $("#helpPassword").attr("hidden", true);
            $("#btnCrearCuenta").removeAttr("disabled");
            $(this).attr("class", "form-control is-valid");
        }
    });
}
