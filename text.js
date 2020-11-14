//http://www.crmarsh.com/svg-performance/
import 'leaflet'

const SVGText = L.Evented.extend({
  svg: null,
  debug: true,

  initialize: function(options) {
    options = options || {};
    this.svg = this._createSVG(50, 100)
    this.svg.setAttribute('overflow', 'visible')
    this.color = options.color || '#FF0000';
    this.lineHeight = 1
    this.setLabel('Headline')
    this.setText('Dummy content')
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

    // label
    if (this.label) {
      const coords = [[2,2,],[2,-2],[-2,2],[-2,-2]];
      const shadows = coords.map(coords => `${coords[0]}px ${coords[1]}px 5px ${this.color}`);
      innerHTML += `<text y="${this.lineHeight}em" class="label" style="text-shadow: ${shadows.join(',')}"><tspan>${this.label}</tspan></text>`
    }

    // content
    if (this.text) {
      const lines = this.text.split('\n');
      const tspans = lines.map(line => `<tspan x="0" dy="${this.lineHeight}em">${line.length>0?line:'&nbsp;'}</tspan>`);
      innerHTML += `<text x="0" y="2em" class="content">${tspans.join('')}</text>`
    }

    elem.innerHTML = innerHTML;
  },

  redraw() {
    this.render(this.svg);

    // update viewport so everything fits
    let sizes = this.getSize();
    this.svg.setAttribute('viewBox', `0 0 ${sizes.x} ${sizes.y}`);

    console.log("rendered");

    this.fire('resize', this.getRatio());

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
    // use viewbox which is definitely too small, so the resulting bbox will
    // exceed the viewbox sizes. Through this we end up with the minimized bbox
    // of our svg
    const elem = this._createSVG(10, 10);

    // don't actually show our intermediate svg
    elem.setAttribute('visibility', 'hidden')

    const map = document.getElementById('map')
    map.appendChild(elem)
    this.render(elem);
    const bbox = elem.getBBox();
    map.removeChild(elem)
    return L.point(bbox.width, bbox.height);
  },

  getRatio() {
    const sizes = this.getSize();
    return sizes.y/sizes.x;
  },
});


const SVGTextBox = L.Rectangle.extend({
  initialize(bounds, options) {
    options = options || {}

    this.svgText = new SVGText()

    // Use embedded text functionaliy of SVG element to render text
    // Display it then with help of SVG overlay.
    this.overlay = L.svgOverlay(this.svgText.svg, bounds, options);

    // Rectangle for resizing text
    options['color'] = "transparent"
    L.Rectangle.prototype.initialize.call(this, bounds, options);

    // add/remove overlay automatically
    this.on('add',(e) => {

      let bounds = this.getBounds();
      const scale = this.scale()
      const northWest = bounds.getNorthWest()
      const topLeft = this._map.latLngToLayerPoint(northWest);
      const svgSize = this.svgText.getSize().multiplyBy(scale);
      const bottomRight = topLeft.add(svgSize);
      const southEast = this._map.layerPointToLatLng(bottomRight);
      bounds = L.latLngBounds(northWest, southEast);
      this.setBounds(bounds);
      this.overlay.setBounds(bounds);

      this.overlay.addTo(this._map)
      //this.svgText.redraw();
      //this.svgText.setSize(this.getSize());
      console.log("added", scale);
    })
    //this.on('remove',(e) => this.overlay.remove())

    // Update bounds of rectangle if svg changes
    this.svgText.on('resize', this.fire, this);
    this.svgText.on('resize', (e)=>{
      //this.setBounds();
      //this.redraw();
    });
  },

  setBounds(bounds) {
    bounds = bounds || this._bounds;

    console.log("feature set Bounds")

    const size = this.getSize();
    if (!size.x || !size.y) {
      console.warn("invalid size");
      return;
    }

    const svgRatio = this.svgText.getRatio();
    const northWest = bounds.getNorthWest();

    // Keep the inner bbox in the same ratio as our rectangle on changes
    // (like when you type someting which without resizing would exceed the
    // limits
    const topLeft = this._map.latLngToLayerPoint(northWest);
    const bottomRight = L.point(topLeft.x+size.x, topLeft.y+(size.x*svgRatio))
    const southEast = this._map.layerPointToLatLng(bottomRight);
    bounds = L.latLngBounds(northWest, southEast);

    this.overlay.setBounds(bounds);
    L.Rectangle.prototype.setBounds.call(this, bounds);
  },

  scale() {
    const scale = Math.pow(2, this._map.getZoom());
    const scaledSizes = this.getSize().divideBy(scale);
    const scaledRatio = scaledSizes.scaleBy(this.svgText.getSize())
    return scaledRatio.x/this.svgText.getRatio();
  },

  redraw() {
    L.Rectangle.prototype.redraw.call(this);
    if (this._map && this._map.hasLayer(this.overlay)) {
      const bounds = L.latLngBounds(this.getLatLngs()[0])
      this.overlay.setBounds(bounds);
    }
  },

  label() {
    return this.svgText.label;
  },

  text() {
    return this.svgText.text;
  },

  setLabel(text) {
    this.svgText.setLabel(text);
    return this;
  },

  setText(text) {
    this.svgText.setText(text);
    return this;
  },

  color() {
    return this.svgText.color;
  },

  setColor(color) {
    this.svgText.setColor(color);
    this.setStyle({color: color});
    return this;
  },

  getSize() {
    if (!this._map) {
      return L.point(0,0);
    }
    const bounds = this.getBounds();
    const bottomLeft = this._map.latLngToLayerPoint(bounds.getSouthWest());
    const topRight = this._map.latLngToLayerPoint(bounds.getNorthEast());
    const width = Math.abs(bottomLeft.x-topRight.x);
    const height = Math.abs(bottomLeft.y-topRight.y);
    return L.point(width, height);
  }
});


const svgText = (text, options) => new SVGText(text, options)
const svgTextBox = (bounds, text, options) => (new SVGTextBox(bounds, options)).setText(text)
const svgLabelledTextBox = (bounds, label, text, options) => (new SVGTextBox(bounds, options)).setLabel(label).setText(text)

export {svgLabelledTextBox, svgTextBox, SVGTextBox, svgText, SVGText}
