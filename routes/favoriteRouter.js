const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const favoriteRouter = express.Router();
const Favorites = require('../models/favorite');
const cors = require('./cors');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(cors.cors, authenticate.verifiyUser, (req, res, next)=>{
     Favorites.find({user:req.user._id})
     .populate('user')
     .populate('dishes')
    .then((favorite) =>{
        if(favorite.length==0){
            res.statusCode = 404;
            res.setHeader('Content-Type','text/plain');
            res.end("User doesn't have favorite dishes");
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.cors, authenticate.verifiyUser, (req, res, next)=>{
    Favorites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite)=>{
        console.log(favorite);
 
        if(favorite.length===0){
            var favdish = new Favorites({user:req.user._id});
            for(var i=0;i<req.body.length;i++)
            {
                favdish.dishes.push(req.body[i]._id);
            }
            favdish.save()
            .then((fav) => {
                 console.log(fav);
                 res.statusCode=200;
                 res.setHeader('Content-Type', 'application/json');
                 res.json(fav);
            },(err) => next(err))
            .catch((err)=>{
                 console.log(err);
             });
        }
        else{
                 res.statusCode=200;
                 res.setHeader('Content-Type', 'application/json');
                 res.json(favorite[0]);
        }
    },(err) => next(err))
    .catch((err)=>{
        console.log(err);
    })
 
 })
.delete(cors.cors, authenticate.verifiyUser, (req, res, next)=>{
    Favourites.find({})
    .populate('user')
    .populate('dishes')
    .then((favourites) => {
            var err = new Error('You do not have any favourites');
            err.status = 404;
            return next(err);
    }, (err) => next(err))
    .catch((err) => next(err));
});


favoriteRouter.route('/:favoriteDishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, (req, res, next)=>{
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/"+ req.params.favoriteId);
})
.post(cors.cors, authenticate.verifiyUser, (req, res, next)=>{
   Favorites.find({user:req.user._id})
   .populate('user')
   .populate('dishes')
   .then((favorite)=>{
       console.log(favorite);

       if(favorite.length===0){
           var favdish = new Favorites({user:req.user._id});
           favdish.dishes.push(req.params.favoriteDishId);
           favdish.save()
           .then((fav) => {
                console.log(fav);
                res.statusCode=200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
           },(err) => next(err))
           .catch((err)=>{
                console.log(err);
            });
       }
       else{
        if(favorite[0].dishes.filter((dish) => dish._id.toString()===req.params.favoriteDishId.toString())[0])
        {
            err = new Error('Dish ' + req.params.favoriteDishId + ' already exists');
            res.statusCode=404;
            return next(err);
        }
        favorite[0].dishes.push(req.params.favoriteDishId);
        favorite[0].save()
        .then((fav) => {
                res.statusCode=200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite[0]);
            },(err) => next(err))
        .catch((err)=>{
                console.log(err);
        });
                // res.statusCode=200;
                // res.setHeader('Content-Type', 'application/json');
                // res.json(favorite[0].dishes.filter((dish) => dish._id.toString() === req.params.favoriteDishId.toString())[0]);
       }
   },(err) => next(err))
   .catch((err)=>{
       console.log(err);
   })

})
.delete(cors.corsWithOptions, authenticate.verifiyUser, (req, res, next) => {
    Favourites.find({user:req.user._id})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            var user;
            if(favourites)
                user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
            if(user){
                user.dishes = user.dishes.filter((dishid) => dishid._id.toString() !== req.params.favoriteDishId);
                user.save()
                    .then((result) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);
                    }, (err) => next(err));
                
            } else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = favoriteRouter;