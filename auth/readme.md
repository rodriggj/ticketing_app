# Authentication Service

## Create Bolierplate code for Auth Service
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
```

7. Test the `Auth Service` by running the start script. In the terminal nav to the _auth_ subfolder and run the following: 
```s
npm run start
```

## K8 Setup for Auth Service
1. Create `Dockerfile` with the `auth` subfolder
```s
touch Dockerfile
```

2. Configure `Dockerfile`
```dockerfile
FROM node:alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . . 

CMD ["npm", "start"]
```

3. Create a `.dockerignore` to prevent `node_modules` from being uploaded into docker image at impage build. 
```s
touch .dockerignore
```

4. Open the `.dockerignore` file and ensure `node_modules` is listed 
```docker
*/node_modules
./node_modules
```

5. Test the `docker` image build 

```s
docker build -t rodriggj/ticketing:auth .
```

6. Now we need to create a deployment in a directory that we will create called `infra` that will house all our deploymnet configurations in kubernetes. Run the following commands
```s
cd ..       # you want to be on same directory level as `auth`
mkdir infra
cd infra
mkdir k8s
cd k8s
touch auth-depl.yaml
```

7. We need to configure our `auth-depl.yaml` file with a `Deployment`. Enter the following code. 

```yaml
apiVersion: app/v1
kind: Deployment
metadata: 
  name: auth-depl
spec: 
  replicas: 1
  selector: 
    matchLabels: 
      app: auth
  template: 
    metadata: 
      labels: 
        app: auth
    spec: 
      containers: 
        - name: auth
          image: rodriggj/ticketing:auth
```

8. Now we need to configure our `Service` to accompany our `Deployment`. To do this, on  the same file below Step 7, enter: 

```yaml
---
apiVersion: v1
kind: Service
metadata: 
  name: auth-srv
spec: 
  selector: 
    app: auth
  ports: 
    - name: auth
      protocol: TCP
      port: 3000
      targetPort: 3000
```

9. Now we will configure a 3rd party package called `Skaffold` that will watch our `infra` folder along with any code changes committed to our `Auth` service. It will ensure that any code commits get rounted to the Docker container image we configured, and is then deployed to the `Auth` service K8 cluster. Navigate to the same directory level of the `auth` & `infra` subfolders and create a .yaml file for the `skaffold` configuration

```
cd .. & cd ..
touch skaffold.yaml
```

10. Now we want to enter the following configuration for our `skaffold.yaml` deployment

```yaml
apiVersion: skaffold/v2alpha3
kind: Config
deploy:
  kubectl: 
    manifests:
      - ./infra/k8s/*
build: 
  local:
    push: false
  artifacts:
    - image: rodriggj/ticketing:auth
      context: auth
      docker: 
        dockerfile: Dockerfile
      sync: 
        manual: 
          - src: 'src/**/*.ts'
            dest: .
```

11. Now we want to run `skaffold` and make sure we can get our `Auth` service deployed using the current configuration. 

## NGINX Ingress Controller Configuration
1. Ensure that the `nginx-ingress` controller is installed. See deployment documentation [here](https://kubernetes.github.io/ingress-nginx/deploy/#quick-start)
```s
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.2/deploy/static/provider/cloud/deploy.yaml
```

2. Inside the `infra/k8s/` folder you want to create another config file called `ingress-srv.yaml` and input the following code: 

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-service
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: ticketing.dev
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Prefix
            backend:
              service:
                name: auth-srv
                port:
                  number: 3000
```

3. You now need to open your local copy of the `nginx-host` config file and ensure that the host name you provide routes traffic to your _nginx-ingress_ server running on your host k8 cluster. To do this you need to nav to `/etc/hosts` on your local filesystem. 

```s
sudo su
nano /etc/hosts
```

When the file opens in the _nano text editor_, enter near the bottom of the file the following: 
```s
127.0.0.1 ticketing.dev
```

4. Now that we've routed traffic back through our local instance of an `nginx-ingress` controller, we need to ensure there is a route that will handle the request. In your `index.ts` file, enter the following code for a route handler: 

```javascript
app.get('/api/users/currentuser', (req, res) => {
  res.send('Hello from the Authentication current user route.')
})
```

> NOTE: You can't access this route if your server isn't running so ensure that you run `skaffold dev` in your console to initate the route.

5. In your browser navigate to a url called `ticketing.dev/api/users/currentuser` 

> NOTE: If you attempted to nav to this location in google chrome you will receive an Error. This is because the `nginx-ingress` controller is attempting to use a `self-signed` certificate to render the url location, which Google Chrome securtiy will not allow. To bypass this error click on any area of the browser screen and type `thisisunsafe`, and the route hanlder will provide the callback response. 

## Google Cloud Provider - Dev Environment Configuration

1. Need to sign-up for Google Cloud Provider (GCP) account [here](https://cloud.google.com/free)

2. Once signed up, on the Dashboard panel, scroll down to `Compute` / `Kubernetes Engine` / `Clusters` / `Enable` / `Create Cluster`

3. There are 2 modalities `Standard` & `Autopilot` Configuration. Choose `Standard`.

4. Configure `Cluster Basics` form: 
- [ ] `Name`: ticketing-dev
- [ ] `Location Type`: us-central-c
- [ ] `Master Version` / `Static Version` : 1.21.9-gke. 1002(default) 

5. Click `Node Pools` / `default pool` on the left nav pane 
- [ ] `Size` / `Number of Nodes` : 3

6. Click `Nodes` on left nav pane
- [ ] `Series` : N1
- [ ] `Machine Type`: g1-small (1 vCPU, 1.7 GB Memory)
- [ ] Click `Create`

