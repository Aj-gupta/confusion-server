const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req, res, next)=>{
    Dishes.find({})
    .populate('comments.author')
    .then((dish) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifiyUser, authenticate.verifyAdmin, (req, res, next)=>{
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish Created',dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifiyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
})
.delete(authenticate.verifiyUser, authenticate.verifyAdmin, (req, res, next)=>{
    Dishes.remove({})
    .then((resp) => {
        // console.log(resp);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId')

.get((req, res, next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
     .then((dish) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifiyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/"+ req.params.dishId);
})
.put(authenticate.verifiyUser, authenticate.verifyAdmin, (req, res, next)=>{
     Dishes.findByIdAndUpdate(req.params.dishId, {
    $set: req.body
   }, { new: true })
   .then((dish) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    },(err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifiyUser, authenticate.verifyAdmin, (req, res, next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((dish) =>{
        // console.log(dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    },(err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;

dishRouter.route('/:dishId/comments')

.get((req, res, next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) =>{
        if(dish != null){
             res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else{
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
       
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifiyUser, (req, res, next)=>{
     Dishes.findById(req.params.dishId)
    .then((dish) =>{
        if(dish != null){
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) =>{
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                })
            }, (err)=> next(err));
            
        }
        else{
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifiyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes/" + req.params.dishId + '/comments');
})
.delete(authenticate.verifiyUser, authenticate.verifyAdmin, (req, res, next)=>{
    Dishes.findById(req.params.dishId)
    .then((resp) => {
       if(dish != null){
            dish.comments.remove();
            for(var i= (dish.comments.length-1);i>=0;i--)
            {
                dish.comments.id(dish.comments[i]._id).remove();
            } 
             dish.save()
            .then((dish) =>{
                 res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err)=> next(err));
            
        }
        else{
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) =>{
        if(dish != null && dish.comments.id(req.params.commentId) != null){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if(dish == null){
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Dish ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifiyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/"+ req.params.dishId +'/comments'+req.params.commentId);
})
.put(authenticate.verifiyUser, (req, res, next)=>{
     Dishes.findById(req.params.dishId)
    .then((dish) =>{
        if(dish != null && dish.comments.id(req.params.commentId) != null){
            if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                err = new Error('You are not authorized to edit this comment');
                err.status = 403;
                return next(err);
            }
            else{
                if(req.body.rating){
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if(req.body.comment){
                     dish.comments.id(req.params.commentId).comment = req.body.comment;
                }
                dish.save()
                .then((dish) =>{
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    })
                }, (err)=> next(err));
            }
            
        }
        else if(dish == null){
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Dish ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifiyUser, (req, res, next)=>{
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            // console.log(dish);
            if(dish != null && dish.comments.id(req.params.commentId) != null){
                if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
                else{
                    dish.comments.id(req.params.commentId).remove();
                    dish.save()
                    .then((dish) =>{
                        Dishes.findById(dish._id)
                        .populate('comments.author')
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        })
                    }, (err)=> next(err));
                }
            
        }
        else if(dish == null){
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Dish ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
});
