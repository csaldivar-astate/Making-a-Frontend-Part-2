"use strict";
require("dotenv").config();

const express = require("express");
const app = express();
const dictionaryModel = require("./Models/dictionaryModel");

// The maximum request body size is 100 kilobytes; however, my word list was
// ~150kb. So I just doubled the request body size limit
app.use(express.json({limit: '200kb'}));

let word;

app.post("/api/guess", (req, res) => {
    if (!word) {
        return res.sendStatus(400);
    }
    const {guess} = req.body;

    if (!guess || guess.length !== 5) {
        return res.sendStatus(400);
    }

    const result = checkWord(guess);
    res.json({result});
});

app.post("/api/dictionary", (req, res) => {
    const {words} = req.body;

    if (!words || words.length < 0) {
        return res.sendStatus(400);
    }

    dictionaryModel.addManyWords(words);
    res.sendStatus(201);
});

app.delete("/api/dictionary", (req, res) => {
    const {word} = req.body;

    if (!word) {
        return res.sendStatus(400);
    }

    dictionaryModel.removeWord(word);
    res.sendStatus(204);
});

app.get("/api/word", (req, res) => {
    res.json({word});
});

app.post("/api/word", (req, res) => {
    word = dictionaryModel.getRandomWord();

    res.sendStatus(200);
});

function checkWord (guess) {
    let result = "";

    for (let i = 0; i < 5; i++) {
        if (guess[i] === word[i]) {
            result += "c";
        } else if (word.includes(guess[i])) {
            result += "p";
        } else {
            result += "w";
        }
    }

    return result;
}

module.exports = app;