"use strict";

const dictionaryModel = require("../Models/dictionaryModel");

let answer;

function checkGuess (req, res) {
    const {guess} = req.body;

    if (!dictionaryModel.isValidWord(guess)) {
        return res.sendStatus(400);
    }

    const result = checkWord(guess);

    res.json({result});
};

function getAnswer (req, res) {
    res.json({answer});
};

// This is a utility function that is only used by checkGuess(). Therefore, 
// it should not be exported from this file.
function checkWord (guess) {
    let result = "";

    for (let i = 0; i < 5; i++) {
        if (guess[i] === answer[i]) {
            result += "c";
        } else if (answer.includes(guess[i])) {
            result += "p";
        } else {
            result += "w";
        }
    }

    return result;
}

module.exports = {
    checkGuess,
    getAnswer,
};