var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res) {
  var pathname = path.resolve('views/index.html');
  res.sendfile(pathname);
});

module.exports = router;
