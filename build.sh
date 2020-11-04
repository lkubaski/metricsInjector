#!/usr/bin/env bash
set -e

BUNDLE="MetricsInjector" # should match the "name" field in package.json
VERSION="1.0"
TITLE="Salesforce Communities Metrics Injector"
# http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/
OUTPUT_APP_NAME="${BUNDLE}.app"

clean_all() {
  echo "cleaning all..."
  rm -rf ./node_modules
  rm -f package-lock.json
  clean
}

clean() {
  echo "cleaning..."
  rm -rf ./output
  rm -f logs.txt
  find ./src -name \*.js -type f -delete
}

build() {
  echo "building..."
  if [ ! -d "./node_modules" ]; then
    npm install
  fi
  if [ ! -d "nwjs.app" ]; then
    echo "FATAL error: couldn't find nwjs.app. Please download it from https://nwjs.io/downloads/"
    exit 0
  fi

  tsc # typescript compiler
  mkdir -p "./output"
  cp ./resources/documentation.pdf ./output
  cp -R ./config ./output
  cp -R ./nwjs.app ./output/${OUTPUT_APP_NAME}                                           # "-R" because this is a directory from bash POV
  cp ./resources/salesforce.icns ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.icns # Note that this file already exists
  mkdir -p ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.nw
  cp ./package.json ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.nw
  cp -R ./src ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.nw
  cp -R ./node_modules ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.nw
  cp -R ./css ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.nw
  find ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.nw -name \*.ts -type f -delete
  grep -rlF "[TITLE]" ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.nw/src | xargs sed -i '' "s/\[TITLE\]/${TITLE} ${VERSION}/g"
  grep -rlF "[BUNDLE]" ./output/${OUTPUT_APP_NAME}/Contents/Resources/app.nw/src | xargs sed -i '' "s/\[BUNDLE\]/${BUNDLE}/g"
  grep -rlF "CFBundleName = \"nwjs\";" ./output/${OUTPUT_APP_NAME}/Contents/Resources | xargs sed -i '' "s/CFBundleName = \"nwjs\";/CFBundleName = \"${BUNDLE}\";/g"
  # Original copywrite: "nwjs 69.0.3497.81, Copyright 2018 The Chromium Authors, NW.js contributors, Node.js. All rights reserved."
  copyright="${BUNDLE} ${VERSION}, Built on:$(date), Contact: laurent KUBASKI (lkubaski@salesforce.com)"
  grep -rlF "NSHumanReadableCopyright = " ./output/${OUTPUT_APP_NAME}/Contents/Resources | xargs sed -i '' "s/NSHumanReadableCopyright = \".*\";/NSHumanReadableCopyright = \"${copyright}\";/g"
}

$1 # the function to invoke just needs to be provided as the first bash script parameter
