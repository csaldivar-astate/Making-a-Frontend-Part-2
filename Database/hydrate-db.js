"use strict";

require('dotenv').config()          // Don't forget to set up environment variables
const fs = require("fs");           // fs module grants file system access
const db = require("../Models/db"); // We need our db connection

// Now read the schema.sql file into a string
// It is ok to do this synchronously since this script executes before loading the server

function hydrateDB (filename, isAnswer=false) {
    // First check if the words have already been added to the database.
    const {count} = db.prepare('SELECT count(*) as count FROM Dictionary').get();
    if (count === 12972) {
        return; // if so then exit the function
    }

    // Load the word list and split into an array
    const words = fs.readFileSync(__dirname + filename, "utf-8").split('\n');

    // Init the sql statement to insert the words
    const stmt = db.prepare('INSERT OR IGNORE INTO Dictionary (word, isAnswer) VALUES (@word, @isAnswer)');

    // Add each word to the db
    for (const word of words) {
        stmt.run({
            word,
            isAnswer: isAnswer ? 1 : 0, // 1 for true and 0 for false
        });
    }
}


// Add the words
hydrateDB("/allowedGuesses.txt", false);
hydrateDB("/answers.txt", true);