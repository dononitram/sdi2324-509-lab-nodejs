const {ObjectId} = require('mongodb');

module.exports = function (app, favoriteSongsRepository, songsRepository) {

    app.get('/songs/favorites', function (req, res) {

        let filter = {userId: req.session.user};
        let options = {sort: {title: 1}};

        favoriteSongsRepository.getFavorites(filter, options).then(favorites => {

            let total = favorites.reduce((total, favorite) => total + parseFloat(favorite.price), 0);

            res.render("songs/favorites.twig", {favorites: favorites, total: total})

        }).catch(error => {
            res.send("Se ha producido un error al listar los favoritos " + error)
        });

    })

    app.get('/songs/favorites/add/:songId', function (req, res) {

            let filter = {_id: new ObjectId(req.params.songId)};
            let options = {};

            songsRepository.findSong(filter, options).then(song => {

                if (song == null) {
                    res.send("No se ha encontrado la canción")
                }
                else {

                    let favorite = {
                        songId: song._id,
                        userId: req.session.user,
                        date: new Date(),
                        price: song.price,
                        title: song.title,
                    };

                    favoriteSongsRepository.insertFavorite(favorite, function (result) {
                        if (result.songId !== null && result.songId !== undefined) {
                            res.send("Agregada la canción a favoritos ID: " + result.songId)
                        }
                        else {
                            res.send("Error al agregar la canción a favoritos")
                        }
                    })
                }
            }).catch(error => {
                res.send("Se ha producido un error al agregar la canción a favoritos " + error)
            });

    })

    app.get('/songs/favorites/delete/:id', function (req, res) {

            let filter = {_id: new ObjectId(req.params.id)};
            let options = {usersId: req.session.user};

            favoriteSongsRepository.findFavorite(filter, options).then(favorite => {

                if (favorite == null) {
                    res.send("No se ha encontrado el favorito")
                }
                else {
                    favoriteSongsRepository.deleteFavorite(favorite, function (result) {
                        if (result.result.n > 0) {
                            res.send("Eliminado el favorito ID: " + req.params.id)
                        }
                        else {
                            res.send("Error al eliminar el favorito")
                        }
                    })
                }
            }).catch(error => {
                res.send("Se ha producido un error al eliminar el favorito " + error);
            });

    })

}