const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const csvtojson = require("csvtojson");
const request = require("request");
var rand = require("generate-key");

const app = express();
const port = 3000;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("welcome");
});

app.post("/csv", (req, res) => {
  const { csv } = req.body;
  let { url, select_fields } = csv;

  const finalArr = [];

  csvtojson()
    .fromStream(request.get(url))

    .subscribe(
      (json) => {
        finalArr.push(json);
      },
      onError,
      onComplete
    );

  function onComplete() {
    const key = rand.generateKey();

    const newArr = finalArr.map((user) => {
      console.log("users", user);
      let newResult = {};

      if (select_fields.length > 0) {
        select_fields.forEach((field) => {
          newResult[field] = user[field];
        });
      } else {
        newResult = user;
      }
      return newResult;
    });

    res.status(200).json({
      conversion_key: key,
      json: newArr,
    });
  }

  function onError(err) {
    console.log(err);
  }
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
