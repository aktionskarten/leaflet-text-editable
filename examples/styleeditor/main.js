import {L, SVGControl} from '@/index.js'
import 'leaflet/dist/leaflet.css'
import 'leaflet-path-drag'
import 'leaflet-styleeditor'
import 'leaflet-styleeditor/dist/css/Leaflet.StyleEditor.min.css'
import {InputElement, TextAreaElement} from './forms'

const map = L.map('map', {editable: true});
map.setView([52.5069,13.4298], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  detectRetina: true,
  attribution: 'Tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> '
}).addTo(map);

const styleEditor = new L.Control.StyleEditor({
  forms: {
    geometry: {
      'label': InputElement,
      'text': TextAreaElement,
      'color': true,
      //'fillColor': true, # TODO: foreground and background fo headline
      'opacity': (elem) => !(elem instanceof L.Polygon),
    }
  },
  colorRamp: [
    '#e04f9e', '#fe0000', '#ee9c00', '#ffff00', '#00e13c', '#00a54c', '#00adf0', '#7e55fc', '#1f4199', '#7d3411'
  ],
  useGrouping: false, // otherwise a change style applies to all
                      // auto-added featues
});
map.addControl(styleEditor);

const svgControl = new SVGControl()
map.addControl(svgControl);

// disable editors if you click on the map
map.on('click', e => {
  console.log("click map")
  let current = styleEditor.options.util.getCurrentElement();
  if (current && current.editor) {
    current.editor.disable();
  }
  styleEditor.hideEditor();
});

const bounds = [
  [[52.508890523658664,13.430936336517334],[52.50810470224378,13.427524566650392]],
  [[52.50998775888057,13.444347381591799],[52.50611297738362,13.427524566650392]],
]

map.whenReady(function() {
  for (let i=0; i < bounds.length; ++i) {
    const label = 'Gegenkundgebung #'+(i+1)
    const text = '12:00 | Alexanderplatz\n„Alle gegen Alle“'
    const [a,b] = bounds[i];
    const bounds_ = L.latLngBounds(a,b);
    let textBox = L.svgLabelledTextBox(bounds_, label, text).addTo(map)

    textBox.on('click', e => {
      console.log("click feature")

      let current = styleEditor.options.util.getCurrentElement();
      if (current && current.editor) {
        current.editor.disable();
      }

      textBox.enableEdit();

      styleEditor.initChangeStyle({'target': textBox});
      styleEditor.options.util.setCurrentElement(textBox);

      L.DomEvent.stopPropagation(e)
    });
  }
});
