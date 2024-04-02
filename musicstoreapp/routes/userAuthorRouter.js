const express = require('express');
const path = require("path");
const {ObjectId} = require("mongodb");


const songsRepository = require("../repositories/songsRepository");
const userAuthorRouter = express.Router();
userAuthorRouter.use(function (req, res, next) {
    console.log("userAuthorRouter");
    let songId = path.basename(req.originalUrl);
    let filter = {_id: new ObjectId(songId)};
    songsRepository.findSong(filter, {}).then(song => {
        if (JSON.stringify(req.session.user)== JSON.stringify(song.author)) {
            next();
        } else {
            res.redirect("/shop");
        }
    }).catch(error => {
        res.redirect("/shop");
    });
});
module.exports = userAuthorRouter;

