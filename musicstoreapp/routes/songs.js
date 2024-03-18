module.exports = function(app, songsRepository) {

    app.get("/songs", function(req, res) {

        let songs = [{
            "title": "Blank space",
            "price": "1.2"
        }, {
            "title": "Thriller",
            "price": "2.3"
        }, {
            "title": "Bohemian Rhapsody",
            "price": "3.4"
        }];

        let response = {
            seller: 'Tienda de canciones',
            songs: songs
        };

        res.render("shop.twig", response);
    });

    app.get('/songs/add', function (req, res) {
        res.render("add.twig");
    });

    app.post('/songs/add', function(req, res) {
        let song = {
            title: req.body.title,
            kind: req.body.kind,
            price: req.body.price
        };

        songsRepository.insertSong(song, function(result) {

            if (result.songId !== null && result.songId !== undefined) {
                res.send("Agregada la canción ID: " + result.songId);
            }

            else {
                res.send("Error al insertar canción: " + result.error);
            }
        });

    });

    app.get('/songs/:id', function(req, res) {
        let response = 'id: ' + req.params.id;
        res.send(response);
    });

    app.get('/songs/:kind/:id', function(req, res) {
        let response = 'id: ' + req.params.id + '<br>'
            + 'Tipo de música: ' + req.params.kind;
        res.send(response);
    });

    app.get('/promo*', function(req, res) {
       res.send("Respuesta al patrón promo*");
    });

    app.get('/pro*ar', function(req, res) {
       res.send("Respuesta al patrón pro*ar");
    });

};