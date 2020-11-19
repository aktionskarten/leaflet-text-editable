import L from 'leaflet'

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

export { TextControl }
