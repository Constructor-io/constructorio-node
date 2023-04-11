#!/bin/bash

if [ -e node_modules/minami/publish.js ]
then
  echo "Node module Minami found. Replacing taffydb with salty in publish.js"
  sed -i '' 's/require("taffydb")/require("@jsdoc\/salty")/g' node_modules/minami/publish.js
else
  echo "Node module Minami not found. Please make sure to run docs command from the root directory"
fi