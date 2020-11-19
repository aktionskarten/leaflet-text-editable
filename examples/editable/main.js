import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-editable'
import 'leaflet-path-drag'
import {svgLabelledTextBox} from '@/index.js'

const map = L.map('map', {editable: true});

map.setView([52.5069,13.4298], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  detectRetina: true,
  attribution: 'Tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> '
}).addTo(map);

const TextControl = L.Control.extend({
  options: {
    kind: 'text',
    title: '',
    html: '',
    position: 'topleft',
  },
  onAdd(map) {
    const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-toolbar-editable');
    const link = L.DomUtil.create('a', 'leaflet-toolbar-editable-'+this.options.kind, container);

    link.href = '#';
    link.title = this.options.title;
    link.innerHTML = '<span class="leaflet-toolbar-editable-' + this.options.kind + '"></span>' + 'Text';

    L.DomEvent.on(container, 'click', L.DomEvent.stop)
              .on(container, 'click', ()=> this.callback(map.editTools))
    L.DomEvent.disableClickPropagation(container);

    return container;
  },
  callback(editable) {
    return editable.startSVGTextBox();
  }
});

map.addControl(new TextControl());

// disable editor if you click on the map
map.on('click', e => {
  console.log("click map")
  let tools = e.sourceTarget.editTools;
  if (map.currentEditor) {
    map.currentEditor.disable();
  }
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
    let textBox = svgLabelledTextBox(bounds_, label, text).addTo(map)

    // enable editor on click
    textBox.on('click', e => {
      if (map.currentEditor) {
        map.currentEditor.disable();
      }
      console.log("click feature")
      textBox.enableEdit();
      map.currentEditor = textBox.editor;
      L.DomEvent.stopPropagation(e)
    });

    textBox.on('add', e => {
      console.log("added feature")
      this.map.currentEditor = this;
    });

    const container = document.getElementById('container');
    const inputColor = document.getElementById('textboxColor');
    const inputText = document.getElementById('textboxLabel');
    const textarea = document.getElementById('textboxContent');

    textBox.on('editable:enable', e=> {
      let editor =  textBox.editor

      // container style
      container.style.display = 'flex';

      // prefill values
      inputText.value = textBox.label();
      textarea.value = textBox.text();
      inputColor.value = textBox.color();

      // register listeners for inputs
      L.DomEvent.addListener(inputColor, 'input', editor.onColorChange, editor);
      L.DomEvent.addListener(inputText, 'keyup', editor.onLabelChange, editor);
      L.DomEvent.addListener(textarea, 'keyup', editor.onTextChange, editor);
    });

    textBox.on('editable:disable', e=> {
      let editor =  textBox.editor

      textBox.setStyle({color: 'transparent'});

      // deregister listeners for inputs
      L.DomEvent.removeListener(inputColor, 'input', editor.onColorChange, editor);
      L.DomEvent.removeListener(inputText, 'keyup', editor.onLabelChange, editor);
      L.DomEvent.removeListener(textarea, 'keyup', editor.onTextChange, editor);
    });
  }
});
