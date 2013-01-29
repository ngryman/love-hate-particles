require 'coffee-script'
stitch = require 'stitch'
fs = require 'fs'

task 'build', 'Build Love & Hate', ->
  pkg = stitch.createPackage
    paths: [__dirname + '/lib']

  pkg.compile (err, source) ->
    throw err if err
    fs.writeFile 'love_hate.js', source, (err) ->
      throw err if err
      console.log 'Compiled love_hate.js'
