var fs = require('fs');
var express = require('express');
var router = express.Router();

var topicsContent = fs.readFileSync(
  __dirname + '/../public/discussion.json', 'utf8'
);
var topicsData = JSON.parse(topicsContent);

router.get('/', function(req, res) {
 res.json(topicsData.topics);
 res.end();
});

router.post('/', function(req, res) {
  topicsData['request1'] = req.body;
  res.send('hello!')
  res.end();
});

module.exports = router;