# Hi, Wikimedia Team.

### What to do

* Run npm install, and then npm start on the command line (see links before if you don't have npm or node yet)
* This server will be listening on localhost:3000. 


### About My Code 

* Most of my code can be found in `public/javascripts/client.js`, `routes/index.js`, `routes/topics.js`, `index.html` and `app.js`. 

* I used Node.js for its lightweight functionality, with a Javascript front-end using Backbone.js, jQuery, Underscore and some Twitter Bootstrap. 

* I decided to simulate making GET requests to a server by reading in the JSON file, parsing it, and putting its contents in my own server-side api. A POST request will take the request body and append it to the JSON file. I ran out of time before I could incorporate this into my new comment submission handler, which currently will not persist the new comment. 

* I had a lot of fun with this. I spent a little over three hours on it, and I was tempted to spend some more time on it (persisting the comments, for instance, adding some more jQuery embellishments).

* [node](http://nodejs.org/)
* [npm](https://www.npmjs.org/)
