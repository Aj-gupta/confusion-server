const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const promoRouter = express.Router();
const Promotions = require('../models/promotions');
const cors = require('./cors');

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, (req, res, next)=>{
     Promotions.find({})
    .then((Promotion) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Promotion);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifiyUser, authenticate.verifyAdmin,(req, res, next)=>{
     Promotions.create(req.body)
    .then((Promotion) => {
        console.log('Promotion Created',Promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Promotion);
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifiyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /promotions");
})
.delete(cors.corsWithOptions, authenticate.verifiyUser, authenticate.verifyAdmin, (req, res, next)=>{
    Promotions.remove({})
    .then((resp) => {
        // console.log(resp);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err) => next(err))
    .catch((err) => next(err));
});

promoRouter.route('/:promoId')
.get(cors.cors, (req, res, next)=>{
    Promotions.findById(req.params.promoId)
     .then((promotion) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifiyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end("POST operation not supported on /promotions/"+ req.params.promoId);
})
.put(cors.corsWithOptions, authenticate.verifiyUser, authenticate.verifyAdmin, (req, res, next)=>{
     Promotions.findByIdAndUpdate(req.params.promoId, {
    $set: req.body
   }, { new: true })
   .then((promotion) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    },(err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifiyUser, authenticate.verifyAdmin, (req, res, next)=>{
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((promotion) =>{
        // console.log(promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    },(err) => next(err))
    .catch((err) => next(err));
});

module.exports = promoRouter;