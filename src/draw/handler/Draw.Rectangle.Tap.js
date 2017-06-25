/**
 * @class L.Draw.RectangleTap
 * Doesn't rely on drag to complete shape
 * @aka Draw.RectangleTap
 * @inherits L.Draw.SimpleShapeTap
 */
L.Draw.RectangleTap = L.Draw.SimpleShapeTap.extend({
// L.Draw.RectangleTap = L.Draw.SimpleShapeTap.extend({
	statics: {
		TYPE: 'rectangle'
	},

	Rectangle: L.Rectangle,

	options: {
		shapeOptions: {
			stroke: true,
			color: '#3388ff',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			showArea: true,
			clickable: true
		},
		metric: true // Whether to use the metric measurement system or imperial
	},

	// @method initialize(): void
	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.RectangleTap.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.rectangleTap.tooltip.start;
		this._endLabelText = L.drawLocal.draw.handlers.rectangleTap.tooltip.end;

		L.Draw.SimpleShapeTap.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
		}
	},

	_fireCreatedEvent: function () {
		var rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
		L.Draw.SimpleShapeTap.prototype._fireCreatedEvent.call(this, rectangle);
	},


	_finishShape: function (latlng) {
		this._drawShape(latlng);
		this._fireCreatedEvent();
		this.disable(); // todo: find out why this doesn't work
	},


	_getTooltipText: function () {
		var tooltipText = L.Draw.SimpleShapeTap.prototype._getTooltipText.call(this),
			shape = this._shape,
			showArea = this.options.showArea,
			latLngs, area, subtext;

		if (shape) {
			latLngs = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs();
			area = L.GeometryUtil.geodesicArea(latLngs);
			subtext = showArea ? L.GeometryUtil.readableArea(area, this.options.metric) : ''
		}

		return {
			text: tooltipText.text,
			subtext: subtext
		};
	}
});
