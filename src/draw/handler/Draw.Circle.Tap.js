/**
 * @class L.Draw.CircleTap
 * Doesn't rely on drag to complete shape
 * @aka Draw.CircleTap
 * @inherits L.Draw.SimpleShapeTap
 */
L.Draw.CircleTap = L.Draw.SimpleShapeTap.extend({
	statics: {
		TYPE: 'circle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#3388ff',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showRadius: true,
		metric: true, // Whether to use the metric measurement system or imperial
		feet: true, // When not metric, use feet instead of yards for display
		nautic: false // When not metric, not feet use nautic mile for display
	},

	// @method initialize(): void
	initialize: function (map, options) {
		// if touch, switch to touch icon
		if (L.Browser.touch) {
			this.options.icon = this.options.touchIcon;
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.CircleTap.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.circleTap.tooltip.start;
		this._endLabelText = L.drawLocal.draw.handlers.circleTap.tooltip.end;

		L.Draw.SimpleShapeTap.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Circle(this._startLatLng, this._startLatLng.distanceTo(latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setRadius(this._startLatLng.distanceTo(latlng));
		}
	},

	_fireCreatedEvent: function () {
		var circle = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
		L.Draw.SimpleShapeTap.prototype._fireCreatedEvent.call(this, circle);
	},

});
