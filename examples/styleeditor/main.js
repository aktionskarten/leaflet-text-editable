import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-editable'
import 'leaflet-path-drag'
import 'leaflet-styleeditor'
import 'leaflet-styleeditor/dist/css/Leaflet.StyleEditor.min.css'
import {svgLabelledTextBox, TextControl, SVGTextBoxEditableMixin} from '@/index.js'
import {InputElement, TextAreaElement} from './forms'

L.Editable.include(SVGTextBoxEditableMixin);

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
  openOnLeafletEditable: false,
  useGrouping: false, // otherwise a change style applies to all
                      // auto-added featues
});
map.addControl(styleEditor);

const textControl = new TextControl()
map.addControl(textControl);

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

const clickHandler = function(e) {
  console.log("click feature")

  const current = styleEditor.options.util.getCurrentElement();
  if (current && current.editor) {
    current.editor.disable();
  }

  this.enableEdit();

  styleEditor.initChangeStyle({'target': this});
  styleEditor.options.util.setCurrentElement(this);

  L.DomEvent.stopPropagation(e)
}

map.on('editable:drawing:start', e => {
  const current = styleEditor.options.util.getCurrentElement();
  if (current && current.editor) {
    current.editor.disable();
  }
  styleEditor.hideEditor();
});

map.on('editable:drawing:commit', e => {
  const textBox = e.layer;
  textBox.on('click', clickHandler, textBox);
  styleEditor.initChangeStyle({'target': textBox});
  styleEditor.options.util.setCurrentElement(textBox);
});

map.whenReady(function() {
  for (let i=0; i < bounds.length; ++i) {
    const label = 'Gegenkundgebung #'+(i+1)
    const text = '12:00 | Alexanderplatz\n„Alle gegen Alle“'
    const [a,b] = bounds[i];
    const bounds_ = L.latLngBounds(a,b);
    let textBox = svgLabelledTextBox(bounds_, label, text).addTo(map)

    textBox.on('click', clickHandler, textBox);
  }
});
