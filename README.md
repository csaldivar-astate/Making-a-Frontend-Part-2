# Making a Frontend: Part 2

Now it's time to fix up the backend and implement core features.

You will be making some new directories and files so check the directory structure at the end of the instructions to make sure you're on the right track.

The starter code is based on the solution code for the last homework assignment with some changes.

## Changes I made

First I've removed the `POST /api/word` endpoint so the client **will not** set the random word anymore. Instead, the server will use a distinct word every day. You will need to implement the functionality to support this feature. I've completely removed endpoints for the dictionary since the server will load the words into the db itself. I have also removed all validation from the route handlers.

### `hydrate-db.js`

This file will load the words lists from `allowedGuesses.txt` and `answers.txt` into the database. I've already implemented the code in this file.

### `app.js`

You may notice `app.js` is considerably smaller. This is because I've moved the route handler implementations into controllers. Now, `app.js` only contains the code necessary for creating the application object and the endpoint implementations are in separate (organized) files.

### `gameController.js`

This file is in the `Controllers/` directory. It contains the route handlers that are necessary for managing the game.


## Step 1: Updating the database

Our simple database is insufficient for the features we need to add so we'll have to update it.

### The `Dictionary` table

The files `allowedGuesses.txt` and `answers.txt` contain every valid word in the game; however, not every word is a potential answer. Only the words from `answers.txt` should be chosen as answers. You will add two new columns to the `Dictionary` table to support this functionality.

![https://raw.githubusercontent.com/csaldivar-astate/webDev-images/main/makingTheFrontEnd-part2/dictionaryTable.png](https://raw.githubusercontent.com/csaldivar-astate/webDev-images/main/makingTheFrontEnd-part2/dictionaryTable.png)

Update the `Dictionary` table in `schema.sql` with the new schema.

### The `Users` table

We can finally add user accounts to the application. Add the `Users` table schema to `schema.sql`. This table also includes game stats for each user.

![https://raw.githubusercontent.com/csaldivar-astate/webDev-images/main/makingTheFrontEnd-part2/usersTable.png](https://raw.githubusercontent.com/csaldivar-astate/webDev-images/main/makingTheFrontEnd-part2/usersTable.png)



### The `ActiveGames` table

Add the `ActiveGames` table schema to `schema.sql`. This table will be used to track the games that are currently being played. When a user starts play you'll add their id to this table. When they guess you will decrement the number of guesses. When they finish playing - either because they're out of guesses or if they win - then you will delete them from this table.

![https://raw.githubusercontent.com/csaldivar-astate/webDev-images/main/makingTheFrontEnd-part2/activeGamesTable.png](https://raw.githubusercontent.com/csaldivar-astate/webDev-images/main/makingTheFrontEnd-part2/activeGamesTable.png)


## Step 2: Choosing the Answer

Open `dictionaryModel.js` you will notice that the `getRandomWord()` function has been removed. This is because we will retrieve a word from the database deterministically. If you open `answers.txt` you will notice that I have already shuffled the words. So they were added to the database in this pre-randomized order. 

To retrieve a word from the database you just need to get the next unused answer from the database. As long as you set the `used` flag to true (`1`) after getting an answer from the database then this method works.

Add a new function to `dictionaryModel.js` called `getAnswer()` that will retrieve an answer from the database **and** set its `used` flag to `1`. This function will need to do two queries.

```
1) get one word from database where used flag is 0 and answer flag is 1
2) update the word's used flag to 1
3) return the word (i.e. the string)
```

Recall that SQLite3 uses the integers `0`/`1` for `false`/`true` respectively. You can use the `LIMIT 1` clause to limit the query to return only a single row.

## Step 3: Setting the Answer

Now that we have a way of choosing an answer we need to set the answer in the application. Modify `gameController.js` so that it will initialize the `word` variable on line 3 using `getAnswer()`. 

> Adding this will cause the game to `getAnswer()` every time the server reloads. **Could this cause problems?**

<br>
<hr>
<br>

## Step 4: Adding the User Model

Create a new file in `Models/` called `userModel.js`. This file will contain the code for managing user accounts in the database.

### `addUser()`

Create a new function called `addUser()` that will take two parameters: `username` and `password`. It should generate a userID using the `crypto` modules `randomUUID()` function. 

You <ins style="color: #FF5252;">**should not**</ins> store the plaintext password in the database. Instead use the `argon2` module to hash the password and store the hash in the database. Don't forget to `await` the hash function.

This function should return `true` if the user was successfully added to the database and `false` otherwise. You can accomplish this by wrapping the `.run()` method in a `try/catch`.

```js
async function addUser (username, password) {

}
```


### `getUserByUsername()`

Create a new function called `getUserByUsername()` that will take a single parameter `username`. It will return an object containing the matching user's account info. 


```js
function getUserByUsername (username) {

}
```

**Note:** Recall that if the `WHERE` clause has no matches then `.get()` returns `undefined`. That means `getUserByUsername()` will **either** return an object with the user's info **or** `undefined`. Be sure to check for this when you call this function. 

<br>
<hr>
<br>

## Step 5: Creating an `userController`

Create a new file in `Controllers/` called `userController.js`. This file will implement the route handlers for managing the User resource.

### Creating Users

Add a function called `createNewUser` that will call the `addUser()` function from `userModel.js` to create a new user. Remember that `addUser()` is an async function so **you must** `await` it to get the return value.

If the user account was successfully created then respond with status `201` otherwise respond with status `409`.

The `username` and `password` will be in the request body.

```js
async function createNewUser (req, res) {

}
```

### Logging In

Add a function called `logIn` that will authenticate the user and start their session.

The `username` and `password` will be in the request body.

If the user account does not exist then respond with status `400`.

Use `argon2.verify()` to verify the provided password with the hash from the database. Don't forget to use `await` since `argon2.verify` is an async function.

If the password is correct then initialize the user's session with the info below and respond with status `200`. Don't forget to use `req.session.regenerate()`. If the function fails then respond with status `500`.

**This is not code! This is an illustrative example of what your code should include in the `req.session` object.**
```
isLoggedIn = true
user = {
    username,
    userID
}
```

If the password was incorrect then respond with status `400`.

```js
async function login (req, res) {

}
```

<br>
<hr>
<br>

## Step 6: Managing the `ActiveGames` Table

Now that we have the user accounts, `ActiveGames` table and session management you can finally implement the functionality to track the number of guesses.

Create a new file in `Models/` called `gameModel.js`. You will create four new functions:
- `getRemainingGuesses`
- `updateRemainingGuesses`
- `removeGame`
- `createNewGame`

These will all be used to manage the `ActiveGames` table.

### `getRemainingGuesses`

This function should get the remaining guesses from the `ActiveGames` table using the userID. It should return either the `remainingGuesses` (an integer) or `undefined` (if the userID doesn't match an active game).

```js
function getRemainingGuesses (userID) {

}
```

### `updateRemainingGuesses`

This function should decrement the remaining guesses from the `ActiveGames` table using the userID. It should not return anything.

```js
function updateRemainingGuesses (userID) {

}
```

### `removeGame`

This function should delete the a "game" from the `ActiveGames` table using the userID. It should not return anything.

```js
function removeGame (userID) {

}
```

### `createNewGame`

This function should check if there is an game in the `ActiveGames` table using the userID. If there is then it should return immediately. Otherwise, it should insert a new game using the userID into the table. It should not return anything.

```js
function createNewGame (userID) {

}
```

## Step 7: Updating the game logic

Now you need to update the logic in `gameController.js` so that it keeps track of the guesses and uses sessions.

### `checkGuess()`

First, this route should only be accessed by logged in users. Add a check at the start of this function to ensure the `isLoggedIn` flag is `true` on the `req.session` object. If not the send back status `403`. Otherwise, continue the game logic like normal.

Now you will need to check if the user has any remaining guesses. Use the userID from the request's session object. If `getRemainingGuesses()` returns `undefined` then that means the user hasn't started the game yet so you need to call `createNewGame()`. Otherwise, you can continue with the game logic.

Before you use send the response you need to update their remaining guesses. If this is zero then remove the game from `ActiveGames` otherwise just update the remaining guesses.

<br>
<hr>
<br>

## Step 8: Creating Validation Middleware

None of the route handlers are performing any validation so you will implement validation using `joi`.

Create a directory named `Validators` in your project's root.

### Validating Game requests

Create a file called `gameValidator.js`. Implement a validation middleware that will validate a guess in the **request body**. 

The schema should include the key `guess`.

`guess`
- a string
- 5 characters
- lowercase
- required
- **bonus:** Use the `.pattern()` rule to limit to only letters 

Be sure to send back the error messages in a JSON encoded object with the key `errors` and status `400`. Otherwise, update the body and call the next function.

Documentation Links:

* [Link to joi's string documentation](https://joi.dev/api/?v=17.6.0#string)
* [`.pattern()` documentation](https://joi.dev/api/?v=17.6.0#stringpatternregex-name--options---aliases-regex)
* [Blog on JS regular expressions](https://eloquentjavascript.net/09_regexp.html)


### Validating User requests

Create a file called `userValidator.js`. Implement a validation middleware that will validate username/password. You will use the same validation middleware for both the register and login endpoints. This is because they will both take the **username** and **password** in the request body. 

The schema should include the keys `username` and `password`.

`password`
- a string
- 3 characters
- only token characters
- lowercase
- required

`password`
- a string
- 6 characters
- required

Be sure to send back the error messages in a JSON encoded object with the key `errors` and status `400`. Otherwise, update the body and call the next function.

## Step 9: Implementing the Endpoints

Now that your validation middleware and controllers are complete you can use them for your endpoints in `app.js`.

Use the appropriate validation middleware and route handlers for the endpoints:
- `POST /api/guess`
  - The player submits their guess
- `POST /api/user`
  - Used for creating a new user
- `POST /api/login`
  - Used for logging into a user account

By the end `app.js` should only have four endpoints:
- `POST /api/guess`
- `GET /api/answer`
- `POST /api/user`
- `POST /api/login`

<br>
<hr>
<br>

## Step 10: Adding Session Management

Now that we have user accounts set up you need to implement session management in `app.js`. Follow the instructions in the videos on nextcloud for this step. You will need to install redis (the actual redis database not just the `npm` module). The instructions for WSL and MacOS are in the slides.

You can test if your redis server is turned on by using the command: `redis-cli PING` if you see `PONG` then it's on and you can proceed.

Don't forget you need to add the field `COOKIE_SECRET` to your `.env` file. You can generate a random hex string with the command `openssl rand -hex 16`. Paste that into your `.env` file. 

Make sure you register session management with the `app` before all other middleware functions.

<br>
<hr>
<br>

## Final Directory Structure

By the end of the assignment this should be your directory structure (`package-lock.json`, `node_modules/`, `tests/`, `.git/`, `README.md` and `.vscode/` are not listed)

```
.
├── Controllers
│   ├── gameController.js
│   └── userController.js
├── Database
│   ├── allowedGuesses.txt
│   ├── answers.txt
│   ├── hydrate-db.js
│   ├── init-db.js
│   ├── schema.sql
│   └── wordle.db
├── Models
│   ├── db.js
│   ├── dictionaryModel.js
│   ├── gameModel.js
│   └── userModel.js
├── Validators
│   ├── gameValidator.js
│   └── userValidator.js
├── public
│   ├── images
│   │   └── notWordle.png
│   ├── game.html
│   ├── index.html
│   ├── login.html
│   └── register.html
├── app.js
├── package.json
└── server.js
```
