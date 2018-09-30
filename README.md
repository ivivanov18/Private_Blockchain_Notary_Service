# RESTful API FOR PRIVATE BLOCKCHAIN

## Description

Restful web API that provides an interface to a simple private blockchain (for more information regarding the private blockchain project please check the repository `https://github.com/ivivanov18/Private_Blockchain`).

## Endpoints

The API is based on the **Express.js** framework and provides two endpoints:

- GET block
- POST block

### GET

The url path for the GET endpoint is `http://localhost:8000/block/{BLOCK_HEIGHT}` with _BLOCK_HEIGHT_ being an **integer** representing the height of the desired block.

### POST

The url path for the POST endpoint is `http://localhost:8000/block`.

## How to run

- Clone the repository `https://github.com/ivivanov18/RESTful-Web-API-Private-Blockchain`
- Run the command `npm install` to install the dependencies
- Run the command `npm start` to start the server on `http://localhost:8000`

## How to test the API

### GET endpoint

Through _Postman_ or run in the terminal the command `curl -i http://localhost:8000/block/{BLOCK_HEIGHT}` and replace **BLOCK_HEIGHT** (an integer) by the desired block height.

### POST ENDPOINT

Through _Postman_ or run in the terminal the command `curl -i -X "POST" "http://localhost:8000/block" -H 'Content-Type: application/json' -d $'{"body":"{BODY CONTENT}"}'` and replace **BODY CONTENT** by the desired payload.

## TODO
