import {
  firebaseConfig
} from "./keygen.js";

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

  let crearCuenta = () => {
    let email = $("#inputEmailCrear").val().trim();
    let password = $("#inputPasswordCrear1").val().trim();



    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        $("#modalCrearCuenta").modal("hide");




      })
      .catch(function (error) {
        console.log(error);
      });
  }
  let verificarSesion = () => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // console.log("Habia una sesion iniciada");
        // console.log(user);
        // $("#btnUsuario").html(user.email);

        // $("#btnRegistrar").hide();
        // $("#btnIniciarSesion").hide();
        // $("#btnCerrarSesion").show();

        // VAMOS A VER SI EL USUARIO YA ESTABA REGISTRADO EN LA
        // BASE DE DATOS EN TIEMPO REAL para crearlo o no crearlo

        refUsuarios.on("value", dataSnapshot => {
          // existe => variable booleana
          // true si el nodo "usuarios" ya tenia ese child
          // false si el nodo "usuarios" no tenia ese child
          let existe = dataSnapshot.hasChild(user.uid);
          console.log(existe)
          if (!existe) {
            // crear al usuario en la realtimeDatabase
            // refUsuarios(user.uid).set({
              refUsuarios.child(user.uid).set({
              nombre: $("#inputNombreCrear").val(),
              email: $("#inputEmailCrear").val(),
              password: $("#inputPasswordCrear1").val(),
              tipo: $("#tipo").val()
            }).then(() => {
              alert("Usuario REGISTRADO correctamente", "success");
            })
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

  verificarSesion();

  $("#btnIniciarSesion").click(mostrarModal)
  $("#btnCrearCuenta").click(mostrarModalCrear)
  $("#btnGuardadCuenta").click(crearCuenta)

}




