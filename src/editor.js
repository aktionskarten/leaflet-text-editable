import L from 'leaflet'
import 'leaflet-editable'
import 'leaflet-path-drag'
import {ScaledRectangleEditor} from 'leaflet-editable-scaled-rect'
import {SVGTextBox} from 'leaflet-text'

const SVGTextBoxEditor = ScaledRectangleEditor.extend({
  initialize: function(map, feature, options) {
    L.Editable.RectangleEditor.prototype.initialize.call(this, map, feature, options);

    L.Handler.PathDrag.makeDraggable(feature);

    // Once the text is added or changes, we need to adjust our editor rectangle 
    feature.on('add', this.update, this);
    feature.on('text:update', this.update, this);

    feature.on('editable:enable', e=> {
      feature.setStyle({fillColor: 'transparent', color: feature.color(),  stroke: true});
      this.updateRatio();
    });

    feature.on('editable:disable', e=> {
      feature.resetStyle();
    });

    // Leaflet-Path-Drag support
    feature.on('drag', feature.redraw, feature);
  },

  onColorChange(e) {
    const color = e.target.value;
    this.feature.setColor(color);
  },

  onLabelChange(e) {
    this.feature.setLabel(e.target.value);
    this.update();
  },

  onTextChange(e) {
    this.feature.setText(e.target.value);
    this.update();
  },

  updateRatio() {
    this.ratio = this.feature.overlay.getRatio();
  },

  update() {
    this.updateRatio();

    let bounds = this.feature.getBounds();
    const size = this.feature.getSize();
    const northWest = bounds.getNorthWest();

    // Keep the inner bbox in the same ratio as our rectangle on changes
    // (like when you type someting which without resizing would exceed the
    // limits)
    const topLeft = this.map.latLngToLayerPoint(northWest);
    const bottomRight = L.point(topLeft.x+size.x, topLeft.y+(size.x*this.ratio))
    const southEast = this.map.layerPointToLatLng(bottomRight);
    bounds = L.latLngBounds(northWest, southEast);

    this.updateBounds(bounds);
    this.updateLatLngs(bounds);
    this.refresh();
    this.reset();
  }
});

SVGTextBox.include({
  getEditorClass: function (tools) {
    return (tools && tools.options.svgTextBoxEditorClass) ? tools.options.svgTextBoxEditorClass : SVGTextBoxEditor;
  }
});

export {SVGTextBoxEditor}
