import L from '@/editor.js'
import 'leaflet/dist/leaflet.css'
import 'leaflet-path-drag'

import 'leaflet-styleeditor'
import 'leaflet-styleeditor/dist/css/Leaflet.StyleEditor.min.css'


const map = L.map('map', {editable: true});

map.setView([52.5069,13.4298], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  detectRetina: true,
  attribution: 'Tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> '
}).addTo(map);

const SVGControl = L.Control.extend({
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

map.addControl(new SVGControl());


const InputElement = L.StyleEditor.formElements.FormElement.extend({
  options: {
    title: 'Label'
  },
  createContent: function () {
    let uiElement = this.options.uiElement,
        input = this.options.input = L.DomUtil.create('input', 'form-control', uiElement);
    input.type = 'text';
    L.DomEvent.addListener(input, 'keyup', this._setStyle, this);
  },
  style: function () {
    let selectedElement = this.options.styleEditorOptions.util.getCurrentElement();
    if (selectedElement && selectedElement.options) {
      this.options.input.value = selectedElement.options.label || ''
    }
  },
  _setStyle: function () {
    let elem = this.options.styleEditorOptions.util.getCurrentElement()
    let label = this.options.input.value
    if (elem && elem.setLabel && label) {
      elem.setLabel(label);
      elem.options = elem.options || {}
      elem.options.label = label
    }
    // remove
    //else if(.unbindTooltip && !label) {
    //  marker.unbindTooltip();
    //  marker.options.label = ''
    //}
    this.setStyle(label)
  }
})

const TextAreaElement = L.StyleEditor.formElements.FormElement.extend({
  options: {
    title: 'Description'
  },
  createContent: function () {
    let uiElement = this.options.uiElement,
        textArea = this.options.text = L.DomUtil.create('textarea', 'form-control', uiElement);
    L.DomEvent.addListener(textArea, 'keyup', this._setStyle, this);
  },
  style: function () {
    let selectedElement = this.options.styleEditorOptions.util.getCurrentElement();
    if (selectedElement && selectedElement.options) {
      this.options.text.value = selectedElement.options.text || ''
    }
  },
  _setStyle: function () {
    let elem = this.options.styleEditorOptions.util.getCurrentElement()
    let text = this.options.text.value
    if (elem && elem.setText && text) {
      elem.setText(text);
      elem.options = elem.options || {}
      elem.options.text = text
    }
    // remove
    //else if(.unbindTooltip && !label) {
    //  marker.unbindTooltip();
    //  marker.options.label = ''
    //}
    this.setStyle(text)
  }
})


const styleEditor = new L.Control.StyleEditor({
  forms: {
    geometry: {
      'label': InputElement,
      'text': TextAreaElement,
      'color': true,
      'fillColor': true,
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
    let textBox = L.svgLabelledTextBox(bounds_, label, text).addTo(map)

    // enable editor on click
    textBox.on('click', e => {
      if (map.currentEditor) {
        map.currentEditor.disable();
      }

      console.log("click feature")
      textBox.enableEdit();

      styleEditor.initChangeStyle({'target': textBox});
      styleEditor.options.util.setCurrentElement(textBox);

      map.currentEditor = textBox.editor;
      L.DomEvent.stopPropagation(e)
    });
  }
});
