import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {svgLabelledTextBox} from 'leaflet-text'

const map = L.map('map');

map.setView([52.5069,13.4298], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  detectRetina: true,
  attribution: 'Tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> '
}).addTo(map);

map.whenReady(function() {
  const label = 'Headline'
  const text = 'My wonderful content'
  const bounds = L.latLngBounds([52.50998775888057,13.444347381591799],[52.50611297738362,13.427524566650392]);
  svgLabelledTextBox(bounds, label, text).addTo(map)
});
