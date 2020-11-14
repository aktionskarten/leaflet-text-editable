import 'leaflet'
import 'leaflet-editable'

//
// RectangleEditor - Add option to enforce DIN A4 landscape or potrait mode
// ratios for rectangles.
//
const ScaledRectangleEditor = L.Editable.RectangleEditor.extend({
  ratio: 1,
  extendBounds(e) {
    return this.enforceRatio(e.vertex, e.latlng);
  },
  enforceRatio(selected, newLatLng) {
    console.log("enforce ratio");
    selected  = selected || this.getLatLngs()[0][0].__vertex;
    newLatLng = newLatLng || selected.getLatLng();

    // A rectangle can be defined through two points on a diagonal:
    // selected+opposite
    var oppositeIndex  = (selected.getIndex() + 2) % 4,
        oppositeLatLng = selected.latlngs[oppositeIndex],
        opposite       = oppositeLatLng.__vertex;

    // Recalculate opposite point to keep ratio
    var a = this.map.latLngToLayerPoint(newLatLng),
        b = this.map.latLngToLayerPoint(oppositeLatLng),
        width = Math.abs(b.x - a.x),
        sign = (a.y < b.y) ? +1 : -1,
        oppositeNew = new L.Point(b.x, a.y + width*this.ratio*sign);

    // Transform to WSG84 (latlng)
    oppositeLatLng = this.map.layerPointToLatLng(oppositeNew);

    // Update Vertexes in-place (markers)
    var next = selected.getNext(),
        prev = selected.getPrevious();
    opposite.latlng.update(oppositeLatLng);
    prev.latlng.update([newLatLng.lat, oppositeLatLng.lng]);
    next.latlng.update([oppositeLatLng.lat, newLatLng.lng]);
    this.refreshVertexMarkers();

    // Update and redraw Rectangle
    var bounds = new L.LatLngBounds(newLatLng, oppositeLatLng);
    this.updateBounds(bounds);
    this.refresh();
  },
  redraw() {
    var corner = L.latLng([0, 0]);
    var bounds = new L.LatLngBounds(corner, corner);
    this.updateBounds(bounds);
    this.updateLatLngs(bounds);
    this.refresh();
    this.reset()
    this.startDrawing()
  },
});

export {ScaledRectangleEditor}
