#! /bin/bash
nvm use 18
yarn build
# zip -r dist_spa.zip ./dist/spa
git add .
git commit -m "$1"
git push origin main

# aws s3 cp ./dist/spa s3://hanform.com --recursive --profile beyondapp
yarn deploy
#pm2 deploy dev update
