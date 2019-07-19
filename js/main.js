import { firebaseConfig } from './variables.js';
import { estiloMapa } from './variables.js';
import { Empresa } from './Empresas.js';
import { Ida } from './Ida.js';

window.onload = () => {
    let coordenadaAnteriorIda;
    let coordenadaAnteriorVuelta;

    let coordenadasIda = [];
    let coordenadasVuelta = [];
    firebase.initializeApp(firebaseConfig);
    let refStorage = firebase.storage();
    // Creando la referencia a Usuarios
    let refEmpresas = firebase.database().ref("empresas");

    if (location.href.indexOf("CrearEmpresa") >= 0) {
        // ////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                CREAR Y SUBIR DATOS DE LA EMPRESA
    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    let createEmpresa = () => {
        /** 
         * 1. obtener una nueva clave o primary key para el registro que se va a insertar
         */
        let key = refEmpresas.push().key;
        /**
         * 2. Referenciar al nodo que lleva por nombre la clave generada en el paso 1
         */
        let referenciaKey = refEmpresas.child(key);
        /**
         * 3. Asignar atributos al nodo referenciado en el paso 2 a partir del metodo "set()"
         */
        referenciaKey.set({
            nombre: $("#inputNombreEmpresa").val().trim()
        }).then(() => {
            
            subirIdaVuelta(key);
        }).catch(error => {
            $.notify("Error al crear la Empresa", "danger");
            console.log(error);
        });
    }
    let subirIdaVuelta = (key) => {
        let refIda = firebase.database().ref(`empresas/${key}/ida`);
        let refVuelta = firebase.database().ref(`empresas/${key}/vuelta`);

        for (let i = 0; i < coordenadasIda.length; i++) {
            let keyIda = refIda.push().key;
            let referenciaKeyIda = refIda.child(keyIda);
            referenciaKeyIda.set({
                lat: coordenadasIda[i].lat,
                lng: coordenadasIda[i].lng
            }).then(() => {
                
            }).catch(error => {
                $.notify("Error al crear la Coordenada", "danger");
                console.log(error);
            });

        }
        for (let i = 0; i < coordenadasVuelta.length; i++) {
            let keyVuelta = refVuelta.push().key;
            let referenciaKeyVuelta = refVuelta.child(keyVuelta);
            referenciaKeyVuelta.set({
                lat: coordenadasVuelta[i].lat,
                lng: coordenadasVuelta[i].lng
            }).then(() => {
                
            }).catch(error => {
                $.notify("Error al crear la Coordenada", "danger");
                console.log(error);
            });

        }
        subirFoto(key);


    }
    let subirFoto = ((key) => {
        // SUBIENDO UNA IMAGEN AL STORAGE LUEGO DE CREAR
        // EL REGISTRO EN DATABASE
        /**
         * 1. obtener el File o archivo del input para subir archivos
         */
        let foto = document.getElementById("inputFoto").files[0];

        /**
         * 2. obtener la referencia al STORAGE
         * A continuacion hacemos referencia a un carpeta denominada "platos"
         * si la carpeta no existe será creada automaticamente
         */
        let refStorageEmpresa = refStorage.ref().child("empresas");

        /**
         * 3. Obtener el nombre del archivo
         * EJM> mi_foto.jpg
         */
        let nombre = foto.name;

        /**
         * 4. Generar un nuevo nombre que no pueda repetirse para el nombre del archivo a subir
         */
        let nombreFinal = key + "-" + nombre;

        /**
         * 5. crear la metadata indicando el tipo de archivo que se va ernviar
         */
        let metadata = {
            contentType: foto.type
        }

        /**
         * 6. subir el archivo a la referencia con el nuevo nombre a traves de la funcion "put()"
         */
        refStorageEmpresa.child(nombreFinal)
            .put(foto, metadata)
            .then(respuesta => {
                return respuesta.ref.getDownloadURL();
            })
            .then(url => {
                console.log(url);
                /**
                 * 1. crear la referencia al nodo a actualizar
                 */
                let refEmpresaCreado = refEmpresas.child(key);
                /**
                 * 2. usar la funcion update() para enviar el nuevo campo
                 * con la url de la imagen recientemente creada
                 */
                return refEmpresaCreado.update({ imagen: url });
            })
            .then(() => {
                // El registro de la base de datos ha sido actualizado 
                // con el campo de la imagen correctamente.

                $.notify("Foto Subida Correctamente", "success");
                $("#crear").trigger("reset");
            })
            .catch((error) => {
                console.log(error);
            })
    });

    // configurando click al boton "CREAR" para guardar los datos en la BD
    $("#btnCrear").click(() => {
        createEmpresa();
    });
    // ////////////////////////////////////////////////////////////////////////////////////////////////////


    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                       MAPA IDA
    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    let mapaGoogleIda;
    mapaGoogleIda = new google.maps.Map(document.getElementById('mapaIda'), {
        center: { lat: -14, lng: -70 },
        zoom: 8,
        styles: estiloMapa
    });
    let posicionActualIda = () => {
        // solicitar permiso de acceso a ubicaion al navegador
        if (navigator.geolocation) {
            // getCurrentPosition(posicion) => funcion que devuelve 
            // informacion de la ubicacion del equipo (Coordenadas, lat y long)
            navigator.geolocation.getCurrentPosition(posicion => {
                console.log(posicion);
                let { latitude, longitude } = posicion.coords;
                let marcador = new google.maps.Marker({ position: { lat: latitude, lng: longitude }, map: mapaGoogleIda });
                mapaGoogleIda.setCenter({ lat: latitude, lng: longitude });
                mapaGoogleIda.setZoom(16);
            }, error => {
                $.notify("No se ha concedido permisos para acceder a tu ubicacion...", "error");
                //alert("No se ha concedido permisos para acceder a tu ubicacion...");
                console.log(error);

            })
        } else {
            console.log("El navegador no posee Geolocalizacion");
        }
    }

    let configurarListenersIda = () => {
        // asignando un evento click al mapa e google
        mapaGoogleIda.addListener('click', (e) => {
            $.notify("Se hizo clock en el mapa", "success");
            // imprimiendo las coordenadas de donde se ha efectuado el click en el mapa
            console.log(e.latLng.lat());
            console.log(e.latLng.lng());
            coordenadasIda.push({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            // console.log(e);
            // Colocando un marcador en el mapa
            let marcadorNuevoIda = new google.maps.Marker({ position: { lat: e.latLng.lat(), lng: e.latLng.lng() }, map: mapaGoogleIda, icon: './icon/cruz.png' });

            // dibujando un polyline entre la coordenada anterior y el nuevo punto
            // en el primer click, "coordenadaAnterior", sera [undefined]
            // es por ello que debera entrar a la zona del "else"
            // del segundo en adelante 

            if (coordenadaAnteriorIda) {
                console.log("ya existe una coordenada anterior");

                let coordenadas = [
                    { lat: e.latLng.lat(), lng: e.latLng.lng() },
                    { lat: coordenadaAnteriorIda.lat, lng: coordenadaAnteriorIda.lng }
                ];

                var lineaBlanca = new google.maps.Polyline({
                    path: coordenadas,
                    geodesic: true,
                    strokeColor: '#FFFFFF',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });

                lineaBlanca.setMap(mapaGoogleIda);

                coordenadaAnteriorIda = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
            } else {
                console.log("Primer click.");
                coordenadaAnteriorIda = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
            }
        })
    }
    // //////////////////////////////////// FIN  MAPA IDA  /////////////////////////////////////////////////


    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                       MAPA VUELTA
    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    let mapaGoogleVuelta;
    mapaGoogleVuelta = new google.maps.Map(document.getElementById('mapaVuelta'), {
        center: { lat: -14, lng: -70 },
        zoom: 8,
        styles: estiloMapa
    });
    let posicionActualVuelta = () => {
        // solicitar permiso de acceso a ubicaion al navegador
        if (navigator.geolocation) {
            // getCurrentPosition(posicion) => funcion que devuelve 
            // informacion de la ubicacion del equipo (Coordenadas, lat y long)
            navigator.geolocation.getCurrentPosition(posicion => {
                console.log(posicion);
                let { latitude, longitude } = posicion.coords;
                let marcador = new google.maps.Marker({ position: { lat: latitude, lng: longitude }, map: mapaGoogleVuelta });
                mapaGoogleVuelta.setCenter({ lat: latitude, lng: longitude });
                mapaGoogleVuelta.setZoom(16);
            }, error => {
                $.notify("No se ha concedido permisos para acceder a tu ubicacion...", "error");
                //alert("No se ha concedido permisos para acceder a tu ubicacion...");
                console.log(error);

            })
        } else {
            console.log("El navegador no posee Geolocalizacion");
        }
    }

    let configurarListenersVuelta = () => {
        // asignando un evento click al mapa e google
        mapaGoogleVuelta.addListener('click', (e) => {
            $.notify("Se hizo clock en el mapa", "success");
            // imprimiendo las coordenadas de donde se ha efectuado el click en el mapa
            console.log(e.latLng.lat());
            console.log(e.latLng.lng());
            coordenadasVuelta.push({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            // console.log(e);
            // Colocando un marcador en el mapa
            let marcadorNuevoVuelta = new google.maps.Marker({ position: { lat: e.latLng.lat(), lng: e.latLng.lng() }, map: mapaGoogleIda, icon: './icon/cruz.png' });

            // dibujando un polyline entre la coordenada anterior y el nuevo punto
            // en el primer click, "coordenadaAnterior", sera [undefined]
            // es por ello que debera entrar a la zona del "else"
            // del segundo en adelante 

            if (coordenadaAnteriorVuelta) {
                console.log("ya existe una coordenada anterior");

                let coordenadas = [
                    { lat: e.latLng.lat(), lng: e.latLng.lng() },
                    { lat: coordenadaAnteriorVuelta.lat, lng: coordenadaAnteriorVuelta.lng }
                ];

                var lineaBlanca = new google.maps.Polyline({
                    path: coordenadas,
                    geodesic: true,
                    strokeColor: '#FFFFFF',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });

                lineaBlanca.setMap(mapaGoogleVuelta);

                coordenadaAnteriorVuelta = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
            } else {
                console.log("Primer click.");
                coordenadaAnteriorVuelta = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                }
            }
        })
    }
    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    posicionActualIda();
    configurarListenersIda();
    posicionActualVuelta();
    configurarListenersVuelta();
    }

    // //////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (location.href.indexOf("MostrarEmpresa") >= 0) {
        let getEmpresa = () => {
            $("main").html(`<div class="text-center">
                                    <div class="spinner-border" role="status">
                                    <span class="sr-only">Loading...</span>
                                    </div>
                                </div>`);
            refEmpresas.on("value", dataSnapshot => {
                renderizarEmpresas(dataSnapshot);
            });
        }
    
        let listaEmpresas = [];
        let listaIda=[];
        let renderizarEmpresas = (dataSnapshot) => {
            $("#listaEmpresas").html("");
            dataSnapshot.forEach(empresas => {
                let objEmpresa = new Empresa(empresas.key,
                    empresas.val().nombre,
                    empresas.val().imagen,
                    empresas.val().nombre);
                    console.log(objEmpresa);
                    
                let refEmpresasIda = firebase.database().ref(`empresas/${empresas.key}/ida`);
                refEmpresasIda.on("value", dataSnapshotIda => {
                    empresasIda(dataSnapshotIda,objEmpresa);
                });
                
            });
        }
    
        let empresasIda = (dataSnapshotIda,objEmpresa)=>{
            dataSnapshotIda.forEach(ida =>{
                let objIda = new Ida(ida.key,
                    ida.val().lat,
                    ida.val().lng);
                listaIda.push(objIda);
            })
            objEmpresa.ida=listaIda;
            listaEmpresas.push(objEmpresa);
            console.log(objEmpresa);
            
        }
    
        
        getEmpresa();
    }

    
  
    

}