const express = require('express');

const PORT = process.env.PORT || 3001;

const { animals } = require('./data/animals');

// start Express
// Assign the constant app to express so methods can be chained onto it.
const app = express();

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

// Tell express which port to listen to
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`);
})