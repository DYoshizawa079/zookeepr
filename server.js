const express = require('express');

// Use port that Heroku wants to use. Otherwise use port 3001
const PORT = process.env.PORT || 3001;

// Destructure the json file so that only the "animals" array is extracted for use
const { animals } = require('./data/animals');

// Filesystem module
const fs = require('fs');
// Path module that makes working with file systems more predictable
const path = require('path');

// start Express
// Assign the constant app to express so methods can be chained onto it.
const app = express();

// Express middleware. Needed to handle POST requests
// Middleware are Functions that process requests before it reaches endpoint
// parse incoming POST string or array data
app.use(express.urlencoded({ extended: true })); //"{extended: true}" tells that there may be arrays nested in the data
// parse incoming JSON data
app.use(express.json());

// Needed to ensure that static files (i.e: stylesheets) are loaded from the correct folder
app.use(express.static('public'));

// Use query given from client to search the appropriate animal / data item to return
function filterByQuery(query, animalsArray) {
    let filteredResults = animalsArray;
    let personalityTraitsArray = [];
    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save.
        if (typeof query.personalityTraits === 'string') {
          personalityTraitsArray = [query.personalityTraits];
        } else {
          personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
          // Check the trait against each animal in the filteredResults array.
          // Remember, it is initially a copy of the animalsArray,
          // but here we're updating it for each trait in the .forEach() loop.
          // For each trait being targeted by the filter, the filteredResults
          // array will then contain only the entries that contain the trait,
          // so at the end we'll have an array of animals that have every one 
          // of the traits when the .forEach() loop is finished.
          filteredResults = filteredResults.filter(
            animal => animal.personalityTraits.indexOf(trait) !== -1
          );
        });
    }
    if (query.diet) {
      filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
      filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
      filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    console.log(filteredResults);
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

// Param 1 is for POST request. 
// Param 2 is the exiting array that lists all the animals
function createNewAnimal(body, animalsArray) { 
    console.log(body);

    const animal = body;
    animalsArray.push(animal);

    // Writes the new animal to the JSON file
    fs.writeFileSync(
        // _dirname represents the dire of the file we execute the code in
        path.join(__dirname, './data/animals.json'),
        //
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
  
    // return finished code to post route for response
    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
      return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
      return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
      return false;
    }
    return true;
}

// First "GET" route
/* get() requires two arguments:
- String that instructs where the needed data is. (below, go to http://localhost:3001/api/animals to see results)
- Callback function that runs when the GET request tries to access the data in the way specified by first argument */
app.get('/api/animals', (req, res) => {

    // Display the GET query that was entered in the client side
    // Note that the query parameter has become a JSON object
    console.log(req.query)

    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }

    // send() is good for receiving snippets of data. 
    //res.send('Hello!');
    // json() is for sending JSON files
    res.json(results);
});

// Second "GET" route
// Alternative path to get response from server by entering an animal's ID number
// Parameters come after ":" 
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);

    // Give 404 error if user sends invalid data
    if (result) {
      res.json(result);
    } else {
      res.send(404);
    }
});


// "POST" route to get data from server
app.post('/api/animals', (req, res) => {
    // req.body is where our incoming content will be
    // data received is processed by middleware (see further up code) before it's processed as req.body
    console.log(req.body);

    // set a unique ID number on new animal based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
    }
});

// When user goes to the homepage, serve up (contents of) index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// When user goes to the url ./animals, serve up (contents of) animals.html
app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

// Likewise for ./zookeepers
app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

// Any other unspecified / wildcard route will be served contents of index.html
// Wildcard routes must be placed after other routes. Otherwise this one will take precedence over them.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// Tell express which port to listen to
// Common practice to put app.listen() at the end - tho it doesn't have to be down here
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`);
})