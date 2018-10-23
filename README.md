# PRIVATE NOTARY BLOCK CHAIN

## Description

The application provides a RESTFul API where users can register stars on a private notary service that uses the blockchain technology.

## Data Description

### Star Block

```json
{
  "hash": "<hash of the block>",
  "height": "<integer that represents the height or the order of the block within the blockchain>",
  "body": {
    "address": "<address to which the star is registered>",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "<additional information regarding the star (like how it was found...) in hexadecimal format."
    }
  },
  "time": "<entry in the blockchain timestamp>",
  "previousBlockHash": "<hash of the previous block>"
}
```

## Functionalities offered

- Users can register stars
- Users can validate signatures
- Users can register stars on the notary service for requests that have been validated
- Users can find registered stars by:
  - address to which they belong
  - hash of the block
  - height of the block

To do so, the applications offers the following endpoints.

## Endpoints

The API is based on the **Express.js** framework and provides the endpoints:

- Validate User Request
- Verify Message Signature
- Register Star
- Find Registered Star by Hash
- Find Registered Star by Address
- Find Registered Star by Height

### Validate User Request Endpoint

#### Description

- url:`"http://localhost:8000/requestValidation"`
- params: **address** for the request
- returns:
  ```json
  {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 300
  }
  ```

#### How to test

### Verify Message Signature Endpoint

#### Description

- url:`"http://localhost:8000/message-signature/validate"`
- params:
  - **address** for the request
  - **message signature**
- returns:

  ```json
  {
    "registerStar": true,
    "status": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "requestTimeStamp": "1532296090",
      "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
      "validationWindow": 193,
      "messageSignature": "valid"
    }
  }
  ```

#### How to test

### Register Star Endpoint

#### Description

- url: `"http://localhost:8000/block"`
- params:
  - **address**: wallet address
  - **star information**:
    - **declination**
    - **right_ascension**
    - **story**
- returns:
  ```json
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  }
  ```

#### How to test

### Find Registered Star by Hash

#### Endpoint details

- url: `"http://localhost:8000/stars/address:[ADDRESS]"`
- params:
  - **ADDRESS**, the wallet address
- returns:

```json
[
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  },
  {
    "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
    "height": 2,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "17h 22m 13.1s",
        "dec": "-27° 14' 8.2",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532330848",
    "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
  }
]
```

### Find Registered Star by Address

#### Description

- url: `"http://localhost:8000/stars/hash:[HASH]"`
- params:
  - **HASH** of the block researched
- returns:

```json
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

#### How to test

### Find Registered Star by Height

#### Description

- url: `"http://localhost:8000/block/[HEIGHT]"`
- params:
  - **HEIGHT** of the block desired
- returns:
  ```json
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  }
  ```

#### How to test

## How to run

- Clone the repository `https://github.com/ivivanov18/Private_Blockchain_Notary_Service`
- Run the command `npm install` to install the dependencies
- Run the command `npm start` to start the server on `http://localhost:8000`
