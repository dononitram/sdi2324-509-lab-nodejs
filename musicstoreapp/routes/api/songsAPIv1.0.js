const {ObjectId} = require("mongodb");
module.exports = function (app, songsRepository, usersRepository) {
    app.get("/api/v1.0/songs", function (req, res) {
        let filter = {};
        let options = {};
        songsRepository.getSongs(filter, options).then(songs => {
            res.status(200);
            res.send({songs: songs})
        }).catch(error => {
            res.status(500);
            res.json({ error: "Se ha producido un error al recuperar las canciones." })
        });
    });

    app.post('/api/v1.0/songs', function (req, res) {
        try {
            let song = {
                title: req.body.title,
                kind: req.body.kind,
                price: parseFloat(req.body.price),
                author: req.session.user
            }

            console.log(song);

            if (song.title === null || song.title === undefined || song.title.length > 40 || song.title.length < 4) {
                res.status(409);
                res.json({error: "El título es inválido"});
                console.log("El título es inválido");
                return;
            }

            if (song.kind === null || song.kind === undefined || song.kind.length < 4) {
                res.status(409);
                res.json({error: "El género es inválido"});
                console.log("El género es inválido");
                return;
            }

            if (song.price === null || song.price === undefined || song.price < 0) {
                res.status(409);
                res.json({error: "El precio es inválido"});
                console.log("El precio es inválido");
                return;
            }

            if (song.author === null || song.author === undefined) {
                res.status(409);
                res.json({error: "Debe autenticarse para realizar esta petición"});
                console.log("Debe autenticarse para realizar esta petición");
                return;
            }

            songsRepository.insertSong(song, function (songId) {
                if (songId === null) {
                    res.status(409);
                    res.json({error: "No se ha podido crear la canción. El recurso ya existe."});
                } else {
                    res.status(201);
                    res.json({
                        message: "Canción añadida correctamente.",
                        _id: songId
                    })
                }
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar crear la canción: " + e})
        }
    }) ;

    app.get("/api/v1.0/songs/:id", function (req, res) {
        try {
            let songId = new ObjectId(req.params.id)
            let filter = {_id: songId};
            let options = {};
            songsRepository.findSong(filter, options).then(song => {
                if (song === null) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe"})
                } else {
                    res.status(200);
                    res.json({song: song})
                }
            }).catch(error => {
                res.status(500);
                res.json({error: "Se ha producido un error a recuperar la canción."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error :" + e})
        }
    });

    app.delete('/api/v1.0/songs/:id', function (req, res) {
        try {
            let songId = new ObjectId(req.params.id)
            let filter = {_id: songId}
            songsRepository.deleteSong(filter, {}).then(result => {
                if (result === null || result.deletedCount === 0) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe, no se ha borrado el registro."});
                } else {
                    res.status(200);
                    res.send(JSON.stringify(result));
                }
            }).catch(error => {
                res.status(500);
                res.json({error: "Se ha producido un error al eliminar la canción."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error, revise que el ID sea válido."})
        }
    });

    app.put('/api/v1.0/songs/:id', function (req, res) {
        try {
            let songId = new ObjectId(req.params.id);
            let filter = {_id: songId};

            songsRepository.findSong(filter, {}).then(song => {
                if (song === null) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe"});
                    return;
                }

                console.log(req.session.user);
                console.log(song.author);
                if (JSON.stringify(song.author) !== JSON.stringify(req.session.user)) {
                    res.status(403);
                    res.json({error: "No tiene permiso para modificar esta canción"});
                    return;
                }

                // Continue with the update if the author matches the logged in user
                const options = {upsert: false};
                let updatedSong = {
                    author: req.session.user
                }
                if (typeof req.body.title !== "undefined" && req.body.title !== null)
                    updatedSong.title = req.body.title;
                if (typeof req.body.kind !== "undefined" &&  req.body.kind !== null)
                    updatedSong.kind = req.body.kind;
                if (typeof req.body.price !== "undefined" &&  req.body.price !== null)
                    updatedSong.price = req.body.price;

                songsRepository.updateSong(updatedSong, filter, options).then(result => {
                    if (result === null) {
                        res.status(404);
                        res.json({error: "ID inválido o no existe, no se ha actualizado la canción."});
                    }
                    //La _id No existe o los datos enviados no difieren de los ya almacenados.
                    else if (result.modifiedCount == 0) {
                        res.status(409);
                        res.json({error: "No se ha modificado ninguna canción."});
                    }
                    else{
                        res.status(200);
                        res.json({
                            message: "Canción modificada correctamente.",
                            result: result
                        })
                    }
                }).catch(error => {
                    res.status(500);
                    res.json({error : "Se ha producido un error al modificar la canción."})
                });
            }).catch(error => {
                res.status(500);
                res.json({error: "Se ha producido un error al intentar modificar la canción: "+ error})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar modificar la canción: "+ e})
        }
    });

    app.post('/api/v1.0/users/login', function (req, res) {
        // Importante: Acordarse de pasar los parámetros al POST como JSON y no como texto plano
        try {
            let securePassword = app.get("crypto").createHmac("sha256", app.get('clave'))
                .update(req.body.password).digest("hex");

            let filter = {
                email: req.body.email,
                password: securePassword
            }

            let options = {};

            usersRepository.findUser(filter,options).then(user => {
                if (user == null) {
                    res.status(401); // Unauthorized
                    res.json({
                      message: "usuario no autorizado",
                      authenticated: false
                    })
                } else {
                    let token = app.get('jwt').sign(
                        {user: user.email, time: Date.now() / 1000}, "secreto"
                    );

                    const jwt = require('jsonwebtoken');
                    try {
                        let decoded = jwt.verify(token, 'secreto'); // replace 'secreto' with your secret key
                        req.session.user = decoded.user;
                    } catch (err) {
                        res.status(401).json({ error: 'Invalid token' });
                    }

                    res.status(200);
                    res.json({
                        message: "usuario autorizado",
                        authenticated: true,
                        token: token
                    })

                }
            }).catch(error => {
                res.status(401);
                console.log(error);
                res.json({
                    message: "Se ha producido un error al verificar las credenciales",
                    authenticated: false
                })
            })
        } catch (e) {
            console.log(e);
            res.status(500);
            res.json({
                message: "Se ha producido un error al verificar credenciales",
                authenticated: false
            })
        }
    });

}
