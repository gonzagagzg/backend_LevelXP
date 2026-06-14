//Event Emmiter es modulo nativo
import { EventEmitter } from "events";
class SistemaEventos extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20)
    }
 
    emitirEvento(nombre, datos) {
        console.log('Evento ${nombre} ', datos)
        this.emit(nombre, datos)
    }
}
export const eventos = new SistemaEventos();
 
//Crear los Listeners
//Listener para el evento o la simulacion de envio de email de bienvenida
eventos.on("usuario:registrado", async (usuario) => {
    console.log("Email de bienvenida enviado a " + usuario.email);
    await new Promise((r => setTimeout(r, 500)))
    console.log('Email enviado a ' + usuario.email)
})
 
// Crear el perfil inical del usuario
eventos.on("usuario:registrado",(usuario) => {
    console.log("Creando para Id" + usuario.id)
})
 
//Auditoria de login
eventos.on("usuarios:login",(datos) => {
    console.log("Usuario " + datos.usuario + " ha iniciado sesion a las " + new Date())
})
export default eventos