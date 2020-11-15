import 'leaflet'
import 'leaflet-editable'

//
// ScaledRectangleEditor
//
// Enforce a ratio for rectangles
//
const ScaledRectangleEditor = L.Editable.RectangleEditor.extend({
  ratio: 1,
  extendBounds(e) {
    const selected  = e.vertex || this.getLatLngs()[0][0].__vertex;
    const newLatLng = e.latlng || selected.getLatLng();

    // A rectangle can be defined through two points on a diagonal:
    // selected+opposite
    const oppositeIndex = (selected.getIndex() + 2) % 4;
    var oppositeLatLng  = selected.latlngs[oppositeIndex];
    const opposite      = oppositeLatLng.__vertex;

    // Recalculate opposite point to keep ratio
    const a = this.map.latLngToLayerPoint(newLatLng);
    const b = this.map.latLngToLayerPoint(oppositeLatLng);
    const width = Math.abs(b.x - a.x);
    const sign = (a.y < b.y) ? +1 : -1;
    const oppositeNew = new L.Point(b.x, a.y + width*this.ratio*sign);

    // Transform to WSG84 (latlng)
    oppositeLatLng = this.map.layerPointToLatLng(oppositeNew);

    // Update Vertexes in-place (markers)
    const next = selected.getNext();
    const prev = selected.getPrevious();
    opposite.latlng.update(oppositeLatLng);
    prev.latlng.update([newLatLng.lat, oppositeLatLng.lng]);
    next.latlng.update([oppositeLatLng.lat, newLatLng.lng]);
    this.refreshVertexMarkers();

    // Update and redraw rectangle
    const bounds = new L.LatLngBounds(newLatLng, oppositeLatLng);
    this.updateBounds(bounds);
    this.refresh();
  }
});

export {ScaledRectangleEditor}
