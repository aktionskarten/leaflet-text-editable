import {SVGTextBox} from 'leaflet-text'

const SVGTextBoxEditableMixin = {
  createSVGTextBox(bounds, options) {
    return this.createLayer(SVGTextBox, bounds, options);
  },
  startSVGTextBox(latlng, options) {
    const corner = latlng || L.latLng([0, 0]);
    const bounds = L.latLngBounds(corner, corner);
    const textBox = this.createSVGTextBox(bounds, options);
    textBox.enableEdit(this.map).startDrawing();
    return textBox;
  }
};

export * from 'leaflet-text'
export * from './editor'
export * from './control'

export {SVGTextBoxEditableMixin}
