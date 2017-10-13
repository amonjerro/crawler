
//Dependencias
const express = require('express');
const router = express.Router();
const Promise = require('promise');
const request = require('request');
const bodyParser = require('body-parser');

//Capa de Base de Datos;
const sql = require('../utilities/sql.js');
const SQL_CONN = new sql();

//Capa Modelos;
const Sec = require('../models/Security.js');
const Admin = require('../models/Admin.js');

const ComSec = new Sec(SQL_CONN,'accesos','sys_id','sys_hash');
const Adm 	= new Admin(SQL_CONN);



router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}))

router.use(function(req,resp,next){
	if (req.query.sys_id == null || req.query.sys_token == null){
		return resp.json({message:'Authorization Denied'});
	}
	ComSec.verify(req.query.sys_id,req.query.sys_token).then(function(){
		next();
	}).catch(function(error_message){
		return resp.json(error_message);
	})
})


router.get('/entities',function(req,resp){
	Adm.getEntidades().then(function(values){
		resp.json(values)
	}).catch(function(err){
		console.log(err)
		resp.json({error:true,error_object:err});
	})
})


module.exports = router;