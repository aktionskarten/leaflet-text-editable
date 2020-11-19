import L from 'leaflet'
import 'leaflet-styleeditor'

const InputElement = L.StyleEditor.formElements.FormElement.extend({
  options: {
    title: 'Label'
  },
  createContent: function () {
    let uiElement = this.options.uiElement,
        input = this.options.input = L.DomUtil.create('input', 'form-control', uiElement);
    input.type = 'text';
    input.style.width = '100%'
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
    textArea.style.width = '100%'
    textArea.setAttribute('rows', 8)
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

export {InputElement, TextAreaElement}
