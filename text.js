//http://www.crmarsh.com/svg-performance/
import 'leaflet'




const SVGText = L.SVGOverlay.extend({
  svg: null,
  debug: false,

  initialize: function(bounds, options) {
    options = options || {};
    this.svg = this._createSVG(50, 100)
    this.svg.setAttribute('overflow', 'visible')
    this.color = options.color || '#FF0000';

    this.setLabel('Headline')
    this.setText('Dummy content')

    L.SVGOverlay.prototype.initialize.call(this, this.svg, bounds, options);

    this.on('add', this.redraw, this);
  },

  _createSVG(width, height) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    elem.setAttribute('viewBox', `0 0 ${width} ${height}`);
    return elem;
  },

  render(elem) {
    let innerHTML = ''

    // debug rectangle
    if (this.debug) {
      innerHTML += `<rect style="fill:none; stroke: black" x="0" y="0" width="100%" height="100%" />\n`
    }

    // label (with colored halo effect powered by css (as svg filters don't
    // perform well)
    if (this.label) {
      const coords = [[2,2,],[2,-2],[-2,2],[-2,-2]];
      const shadows = coords.map(coords => `${coords[0]}px ${coords[1]}px 5px ${this.color}`);
      innerHTML += `<text y="1em" class="label" style="text-shadow: ${shadows.join(',')}"><tspan>${this.label}</tspan></text>`
    }

    // content
    if (this.text) {
      const lines = this.text.split('\n');
      const tspans = lines.map(line => `<tspan x="0" dy="1em">${line.length>0?line:'&nbsp;'}</tspan>`);
      innerHTML += `<text x="0" y="1.5em" class="content">${tspans.join('')}</text>`
    }

    elem.innerHTML = innerHTML;
  },

  redraw() {
    this.render(this.svg);

    // update viewport so everything fits
    let sizes = this.getSize();
    this.svg.setAttribute('viewBox', `0 0 ${sizes.x} ${sizes.y}`);

    this.fire('text:update', this.getRatio());

    return this;
  },

  setLabel(label) {
    if (label != this.label) {
      this.label = label;
      this.redraw();
    }
    return this;
  },

  setText(text) {
    if (text != this.text) {
      this.text = text;
      this.redraw();
    }
    return this;
  },

  setColor(color) {
    if (color != this.color) {
      this.color = color;
      this.redraw();
    }
    return this;
  },

  getSize() {
    if (!this._map) {
      return L.point(0, 0);
    }

    // use viewbox which is definitely too small, so the resulting bbox will
    // exceed the viewbox sizes. Through this we end up with the minimized bbox
    // of our svg
    const elem = this._createSVG(10, 10);

    // don't actually show our intermediate svg
    elem.setAttribute('visibility', 'hidden')

    const container = this._map._container
    container.appendChild(elem)
    this.render(elem);
    const bbox = elem.getBBox();
    container.removeChild(elem)

    return L.point(bbox.width, bbox.height);
  },

  getRatio() {
    const sizes = this.getSize();
    if (sizes.x == 0) {
      return 1;
    }
    return sizes.y/sizes.x;
  },
});




const SVGTextBox = L.Rectangle.extend({
  initialize(latlng, scale, options) {
    options = options || {}

    this.scale = scale || 1;

    // Use embedded text functionaliy of SVG element to render text
    // Display it then with help of SVG overlay.
    const bounds = L.latLngBounds(latlng, latlng);
    this.overlay = new SVGText(bounds)

    // Rectangle for resizing text
    options['color'] = "transparent"
    L.Rectangle.prototype.initialize.call(this, bounds, options);

    // add/remove overlay automatically
    this.on('remove', this.overlay.remove, this)
    this.on('add',(e) => {
      this.overlay.addTo(this._map)
      this.refresh();
    })

    // Bubble change events up
    this.overlay.on('text:update', this.fire, this);
  },

  refresh() {
    this.setBounds(this.getBounds())
  },

  setBounds(bounds) {
    if (bounds.equals(L.latLngBounds([[0,0], [0,0]]))) {
      console.log("bounds", bounds)
      console.warn("invalid bounds");
      return;
    }

    const northWest = bounds.getNorthWest();
    const topLeft = this._map.latLngToLayerPoint(northWest);
    const svgSize = this.overlay.getSize().multiplyBy(this.scale);
    const bottomRight = topLeft.add(svgSize);
    const southEast = this._map.layerPointToLatLng(bottomRight);
    bounds = L.latLngBounds(northWest, southEast);
    this.overlay.setBounds(bounds);

    L.Rectangle.prototype.setBounds.call(this, bounds);
  },

  redraw() {
    L.Rectangle.prototype.redraw.call(this);
    if (this._map && this._map.hasLayer(this.overlay)) {
      const bounds = L.latLngBounds(this.getLatLngs()[0])
      this.overlay.setBounds(bounds);
    }
  },

  label() {
    return this.overlay.label;
  },

  text() {
    return this.overlay.text;
  },

  setLabel(text) {
    this.overlay.setLabel(text);
    return this;
  },

  setText(text) {
    this.overlay.setText(text);
    return this;
  },

  color() {
    return this.overlay.color;
  },

  setColor(color) {
    this.overlay.setColor(color);
    this.setStyle({color: color});
    return this;
  },

  getSize() {
    if (!this._map) {
      return L.point(0,0);
    }

    const bounds = this._bounds;
    const bottomLeft = this._map.latLngToLayerPoint(bounds.getSouthWest());
    const topRight = this._map.latLngToLayerPoint(bounds.getNorthEast());
    const width = Math.abs(bottomLeft.x-topRight.x);
    const height = Math.abs(bottomLeft.y-topRight.y);

    return L.point(width, height);
  }
});


const svgText = (text, options) => new SVGText(text, options)
const svgTextBox = (latlng, text, options) => (new SVGTextBox(latlng, options)).setText(text)
const svgLabelledTextBox = (latlng, scale, label, text, options) => (new SVGTextBox(latlng, scale, options)).setLabel(label).setText(text)

export {svgLabelledTextBox, svgTextBox, SVGTextBox, svgText, SVGText}
