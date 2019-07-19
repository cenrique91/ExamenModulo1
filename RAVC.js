import {firebaseConfig} from "./variables.js";
// import {estiloMapa} from './variables.js';
window.onload = () => {


  firebase.initializeApp(firebaseConfig);

  let mapaGoogleIda = new google.maps.Map(document.getElementById('rutaMapa'), {
    center: { lat: -14, lng: -70},
    zoom: 8
    // styles: estiloMapa
  });
  
  var arregloIda =[], coord=[];
  let refempresas = firebase.database().ref(`empresas`);
  refempresas.on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
      console.log(childData);
      var ida = childSnapshot.val().ida;
      
      console.log(ida);
      
      
      var i=0;
      for (const clave in ida) {
        
          console.log(ida[clave].lat);
          console.log(ida[clave].lng);
          coord[0]=ida[clave].lat;
          coord[1]=ida[clave].lng;
          arregloIda[i]=coord;
          console.log("el arreglo"+arregloIda[i]);
          i++;
      }
      
      
      
      
    });
    
  });
  let refStorage = firebase.storage();
  $("rutaMapa").append(mapaGoogleIda);
}
