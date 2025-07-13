# Radio Station

Radio Station is a web app that lets you explore radio stations around the world using an interactive map. It pulls data from the [radio-browser.info](https://www.radio-browser.info/) API.

The frontend is built with Angular and PrimeNG. There's also a small Node.js proxy server that handles image requests and uses `node-vibrant` to extract color palettes from station logos, since most stations result in a CORS error.

## Features

- Browse stations on a map
- Listen to live radio streams
- Proxy server handles CORS for image loading

