import 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-editable'
import 'leaflet-path-drag'

import {ScaledRectangleEditor} from './rect'
import {svgTextBox, svgLabelledTextBox, SVGTextBox} from './text'

L.svgTextBox = svgTextBox
L.svgLabelledTextBox = svgLabelledTextBox

SVGTextBox.include({
  getEditorClass: function (tools) {
    return (tools && tools.options.svgTextBoxEditorClass) ? tools.options.svgTextBoxEditorClass : L.Editable.SVGTextBoxEditor;
  }
});

L.Editable.include({
  createSVGTextBox(bounds, options) {
    return this.createLayer(SVGTextBox, bounds, options);
  },
  startSVGTextBox(latlng, options) {
    const corner = latlng || L.latLng([0, 0]);
    const bounds = new L.LatLngBounds(corner, corner);
    const textBox = this.createSVGTextBox(bounds, options);
    textBox.enableEdit(this.map).startDrawing();
    return textBox;
  }
});

//L.Editable.SVGTextBoxEditor = L.Editable.RectangleEditor.extend({
L.Editable.SVGTextBoxEditor = ScaledRectangleEditor.extend({
  initialize: function(map, feature, options) {
    L.Editable.RectangleEditor.prototype.initialize.call(this, map, feature, options);

    if (this.map.currentEditor) {
      this.map.currentEditor.disable();
    }
    this.map.currentEditor = this;

    L.Handler.PathDrag.makeDraggable(feature);

    feature.on('click',(e)=>{
      if (!feature.editEnabled()) {
        feature.enableEdit(map);
      }
      console.log('bound',feature.getBounds().toBBoxString())
      L.DomEvent.stopPropagation(e)
    });

    const container = document.getElementById('container');
    const inputColor = document.getElementById('textboxColor');
    const inputText = document.getElementById('textboxLabel');
    const textbox = document.getElementById('textbox');

    feature.on('editable:drawing:commit', e=> {
      console.log("editor commit");
      this.updateRatio();
    });

    feature.on('resize', (e)=> {
      console.log('feature resize in editor')
      this.updateRatio();
    });

    feature.on('editable:enable', e=> {
      console.log("editor enable");

      // input style
      feature.setStyle({fillColor: 'transparent', color: feature.color(),  stroke: true});
      container.style.display = 'flex';

      // prefill values
      inputText.value = feature.label();
      textbox.value = feature.text();
      inputColor.value = feature.color();

      this.updateRatio();

      // register listeners for inputs
      L.DomEvent.addListener(inputColor, 'input', this.onColorChange, this);
      L.DomEvent.addListener(inputText, 'keyup', this.onLabelChange, this);
      L.DomEvent.addListener(textbox, 'keyup', this.onTextChange, this);
    });

    feature.on('editable:disable', e=> {
      console.log("editor disable");

      // restore input style
      feature.setStyle({color: 'transparent'});
      container.style.display = 'none';

      // deregister listeners for inputs
      L.DomEvent.removeListener(inputColor, 'input', this.onColorChange, this);
      L.DomEvent.removeListener(inputText, 'keyup', this.onLabelChange, this);
      L.DomEvent.removeListener(textbox, 'keyup', this.onTextChange, this);
    });

    feature.on('drag', feature.redraw, feature);
  },

  onColorChange(e) {
    const color = e.target.value;
    this.feature.setColor(color);
    L.DomEvent.stopPropagation(e)
  },

  onLabelChange(e) {
    this.feature.setLabel(e.target.value);
    this.update();
    L.DomEvent.stopPropagation(e)
  },

  onTextChange(e) {
    this.feature.setText(e.target.value);
    this.update();
    L.DomEvent.stopPropagation(e)
  },

  updateRatio() {
    this.ratio = this.feature.svgText.getRatio();
    console.log("updateratio", this.ratio)
  },

  extendBounds(e) {
    console.log("editor extend ratio");
    this.updateRatio();
    ScaledRectangleEditor.prototype.extendBounds.call(this, e);
    this.feature.overlay.setBounds(bounds)
  },

  update() {
    console.log("update");
    let bounds = this.feature.getBounds();
    const size = this.feature.getSize();
    const svgRatio = this.feature.svgText.getRatio();
    const northWest = bounds.getNorthWest();

    // Keep the inner bbox in the same ratio as our rectangle on changes
    // (like when you type someting which without resizing would exceed the
    // limits
    const topLeft = this.map.latLngToLayerPoint(northWest);
    const bottomRight = L.point(topLeft.x+size.x, topLeft.y+(size.x*svgRatio))
    const southEast = this.map.layerPointToLatLng(bottomRight);
    bounds = L.latLngBounds(northWest, southEast);
    this.ratio = svgRatio;

    this.updateBounds(bounds);
    this.updateLatLngs(bounds);
    this.refresh();
    this.reset();
  }
});

export default L
