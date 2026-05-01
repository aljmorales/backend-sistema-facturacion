const express = require("express");

const respuesta= require("../../red/respuestas");
const controlador = require("./index");

const router = express.Router();

//MOSTRAR TODOS
router.get("/", todos);
//MOSTRAR UNO
router.get("/:id", uno);
//CREAR
router.post("/", agregar);
//ACTUALIZAR
router.put("/:id", actualizar);
//ELIMINAR
router.delete("/:id", eliminar);


async function todos(req,res, next){
    try{
        const items= await controlador.todos();
        respuesta.success(req,res, items, 200);

    } catch(err){
        next(err);
    }
}
async function uno(req,res,next){
    try{
        const items= await controlador.uno(req.params.id);
        respuesta.success(req,res, items, 200);

    } catch(err){
       next(err);
    }
}
async function agregar(req,res, next){
    try{
        const items= await controlador.agregar(req.body);
        if(req.body.id==0){
            mensaje = "Item guardado con éxito";
        }else{
            mensaje = "Item actualizado con éxito";
        }
        respuesta.success(req,res, mensaje, 201);

    } catch(err){
        next(err);
    }
}
async function actualizar(req,res,next){
    try{
        const items = await controlador.actualizar(req.params.id, req.body);
        respuesta.success(req,res, "Item actualizado con éxito", 200);
    } catch(err){
        next(err);
    }
}
async function eliminar(req,res,next){
    try{
        await controlador.eliminar(req.params.id);
        respuesta.success(req,res, "Item eliminado con éxito", 200);
    } catch(err){
        next(err);
    }
}

module.exports = router;