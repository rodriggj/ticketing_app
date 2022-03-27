# Authentication Service

## Dependencies
1. Create a `package.json` file with the command: 
```s
npm init -y
```

2. Install the following dependencies: 
```s
npm i typescript ts-node-dev express @types/express colors --save
```

3. Create a typescript configuration file with the following command: 
```s
tsc --init
```

4. Within `auth` subfolder create a new folder called `src`, and create an `index.ts` file within this folder
```s
mkdir src && touch index.ts
```

5. Import the following boilerplate code to initialize an `Auth` service
```javascript
import  express from 'express';
import {json} from 'body-parser';

const app = express()
app.use(json())

app.listen(3000, ()=>{
  console.log(`Auth service is up and listening on port 3000`)
})
```

6. Modify the `start` script in the _package.json_ file
```json
  "scripts": {
    "start": "ts-node-dev src/index.ts"
  },

7. Test the `Auth Service` by running the start script. In the terminal nav to the _auth_ subfolder and run the following: 
```s
npm run start
```