# Leaflet-Text-Editable

This plugin adds support for editing leaflet-text geometries throug Leaflet
Editable.


## Demo

See the following examples for demonstration:

* https://aktionskarten.github.io/leaflet-text-editable/editable.html
* https://aktionskarten.github.io/leaflet-text-editable/styleeditor.html


## Install

```
$ npm install leaflet-text-editable
```


## Quickstart

```javascript
import 'leaflet-text-editable'

const map = L.map('map').setView([52.5069,13.4298], 15);

//...

map.whenReady(function() {
  const label = 'Headline'
  const text = '12:00 | Alexanderplatz\n„Alle gegen Alle“'
  const bounds = L.latLngBounds([52.50998775888057,13.444347381591799],[52.50611297738362,13.427524566650392]);
  L.svgLabelledTextBox(bounds, label, text).addTo(map)
});
```
