var express = require('express');
var app = express();
var path = require("path");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var mongoURL = process.env.MONGOLAB_URI;


var port = process.env.PORT;

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/new/:url", function (req, res) {
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    var url = req.params["url"];
    MongoClient.connect(mongoURL, function (err, db) {
        if (err) throw err
        else {
            console.log("connection successful")
            var collection = db.collection("links")

            var Access = function (db, callback) {
                if (regex.test(url)) {
                    collection.count().then(function (number) {
                        var newElement = {
                            original_url: url,
                            short_url: "https://p4ndemictinyurl.herokuapp.com/" + (number + 1)
                        }
                        collection.insert(([newElement]))
                        res.json({
                            original_url: url,
                            short_url: "https://p4ndemictinyurl.herokuapp.com/" + (number + 1)
                        })
                    })
                } else {
                    res.json({
                        "error": "Error: You need to enter a proper url"
                    })
                }
            }
            Access(db, function () {
                db.close()
            })

        }
    })
})

app.get("/:shorturl", function (req, res) {
    var shorturl = req.params["shorturl"];
    MongoClient.connect(mongoURL, function (err, db) {
        if (err) throw err
        else {
            var collection = db.collection("links")

            var query = function (db, callback) {
                collection.findOne({
                    "short_url": "https://p4ndemictinyurl.herokuapp.com/" + shorturl,
                }, {
                        original_url: 1,
                        _id: 0
                    }, function (err, answer) {
                        if (err) throw  err
                        if (answer === null) {
                            res.json({
                                "error": "url not in db"
                            })
                        } else {
                            if (answer.original_url.split("")[0] == "w") {
                                res.redirect(301, "http//" + answer.original_url)
                            } else {
                            res.redirect(301, answer.original_url)
                        }
                    }
                
              })
}
            
            query(db, function () {
        db.close()
    })
        }
    })
})


app.listen(port, function () {
    console.log('Example app listening on port' + port);
})