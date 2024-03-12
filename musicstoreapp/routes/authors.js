module.exports = function (app) {

    let roles = ["Cantante", "Trompetista", "Violinista", "Saxofonista", "Pianista", "Guitarrista", "Otro"];

    let authors = [{
        "name": "Kevin Levrone",
        "group": "The syringes",
        "role": "saxofonista"
    }, {
        "name": "La Rosalía",
        "group": "La Rosalía",
        "role": "cantante"
    }, {
        "name": "Alex Turner",
        "group": "Arctic Monkeys",
        "role": "cantante"
    }, {
        "name": "Slash",
        "group": "Guns n' Roses",
        "role": "guitarrista"
    }, {
        "name": "Paco de Lucía",
        "group": "Paco",
        "role": "guitarrista"
    }, {
        "name": "Chris Bumstead",
        "group": "The syringes",
        "role": "pianista"
    }];

    app.get("/authors", function (req, res) {

        let response = {
            seller: "Autores",
            authors: authors
        };
        res.render("authors/authors.twig", response);
    });

    app.get("/authors/add", function (req, res) {

        let response = {
            roles: roles
        }

        res.render("authors/add.twig", response);
    });

    app.get("/authors/filter/:role", function (req, res) {

        let response = {
            seller: "Autores",
            authors: authors.filter(author => author.role.toUpperCase() === req.params.role.toUpperCase())
        }

        res.render("authors/authors.twig", response);

    });

    app.post("/authors/add", function (req, res) {
        let response = "";
        if (req.body.name !== null && typeof(req.body.name) != "undefined" && req.body.name.trim() !== "") {
            response = "Nombre: " + req.body.name + "<br>";
        } else {
            response += "name no enviado en la petición" + "<br>";
        }
        if (req.body.group !== null && typeof(req.body.group) != "undefined" && req.body.group.trim() !== "") {
            response += "Grupo: " + req.body.group + "<br>";
        } else {
            response += "group no enviado en la petición" + "<br>";
        }
        if (req.body.role !== null && typeof(req.body.role) != "undefined" && req.body.role.trim() !== "") {
            response += "Rol: " + req.body.role + "<br>";
        } else {
            response += "role no enviado en la petición" + "<br>";
        }
        res.send(response);
    });

    app.get("/author*", function (req, res) {
        res.redirect("/authors");
    });

};