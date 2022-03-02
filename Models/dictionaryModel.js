"use strict";
const db = require("./db");

function addWord (word) {
    if (word.length !== 5) {
        return;
    }

    try {
        const sql = `INSERT INTO Dictionary VALUES (@word)`;
        const stmt = db.prepare(sql);
        stmt.run({
            "word": word.toLowerCase()
        });
    } catch (e) {
        console.error(e);
    }
}

function addManyWords (words) {
    for (const word of words) {
        addWord(word);
    }
}

function removeWord (word) {
    const sql = `DELETE FROM Dictionary WHERE word=@word`;
    const stmt = db.prepare(sql);
    stmt.run({word});
}

function getRandomWord () {
    const sql = `SELECT * FROM Dictionary`;
    const stmt = db.prepare(sql);
    const record = stmt.get();

    if (!record) {return;}

    return record.word;
}

function checkWord (word) {
    const sql = `SELECT * FROM Dictionary WHERE word=@word`;
    const stmt = db.prepare(sql);
    const record = stmt.get({"word": word.toLowerCase()});

    // !! isn't a special operator it is literally just two "nots"
    // the double not will turn any value into a boolean (think about it)
    return !!record;
}

module.exports = {
    addWord,
    addManyWords,
    removeWord,
    getRandomWord,
    checkWord,
};