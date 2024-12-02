#!/bin/bash

TARGET_DIR="./docs"
SCRIPT="<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{\"token\": \"16ad6c356b37426cb31816318ed5a42d\"}'></script>"

find "$TARGET_DIR" -type f -name "*.html" | while read -r FILE; do
  sed -i "s|</head>|$SCRIPT</head>|g" "$FILE"
done
