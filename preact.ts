import { h, Component, render } from 'preact';
import { renderToString} from "preact-render-to-string"

// Create your app
const app = h('h1', null, 'Hello World!');

// render(app, null);
const str = renderToString(app, null);

console.log(str)

// render(app, document.body);