export class Empresa {
    key = "";
    ida = [];
    imagen = "";
    nombre = "";
    vuelta = [];
    constructor(key,objIda,imagen,nombre,objVuelta) {
        this.key = key;
        this.ida.push(objIda);
        this.imagen = imagen;
        this.nombre = nombre;
        this.vuelta.push(objVuelta);
    }
}