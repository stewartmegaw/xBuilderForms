# Front end React test

* A single page application to showcase the existing products and categories via the provided API.
* Although intuitive to understand files in need of commenting are in the ./actions and ./stores directories and also the .test.jsx files

## Getting Started

Unzip and inside directory run

```
npm install
```

* Open ./dist/index.html in web browser
* The current development build will load
* To rebuild development run
```
./node_modules/.bin/webpack --config webpack.config.js --progress --env.dev=1
```
* env.prod = 1 will create a produdcton bundle (minimized, no source maps etc.)
* Start at ./src/entry.jsx to understand the code

### Prerequisites

Node and NPM

## Running the tests

All tests should pass and show explanation with the following command
```
npm test
```


## Built With

* webpack - Bundles into a js file
* babel-loader - The default settings will transpile to es5 allow the application to run in all major browsers
* Flux pattern - Used for state management (Actions -> Dispatcher -> Stores -> Views)
* fetch - Polyfill for browsers that do not natively support fetch. Used for making API requests
* CSS modules employed for styling
* Jest and Enzyme used to run tests

Local helpers to provide coding standards:
* eslint-plugin-react - Rules available in .eslintrc (prettier used with Sublime 3 to auto format)

 
## Authors

* **Stewart Megaw**

