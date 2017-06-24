L.SimpleShapeTap = {};
/**
 * @class L.Draw.SimpleShapeTap
 * Doesn't rely on drag to complete shape
 * @aka Draw.SimpleShapeTap
 * @inherits L.Draw.Feature
 */
L.Draw.SimpleShapeTap = L.Draw.Feature.extend({
	options: {
		repeatMode: false,

		icon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon'
		}),
		touchIcon: new L.DivIcon({
			iconSize: new L.Point(20, 20),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
		}),

		zIndexOffset: 2000 // This should be > than the highest z-index any map layers

	},

	// @method initialize(): void
	initialize: function (map, options) {
		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	// @method addHooks(): void
	// Add listener hooks to this handler.
	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {

			this._marker = null;

			this._markerGroup = new L.LayerGroup();
			this._map.addLayer(this._markerGroup);

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			// this._tooltip.updateContent({ text: this._initialLabelText });

			// Make a transparent marker that will used to catch click events. These click
			// events will create the vertices. We need to do this so we can ensure that
			// we can create vertices over other map layers (markers, vector layers). We
			// also do not want to trigger any click handlers of objects we are clicking on
			// while drawing.
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40]
					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			this._mouseMarker
				.on('mouseout', this._onMouseOut, this)
				.on('mousemove', this._onMouseMove, this)
				.on('mousedown', this._onMouseDown, this)
				.on('mouseup', this._onMouseUp, this) // Necessary for 0.8 compatibility
				.addTo(this._map);

			this._map
				.on('mouseup', this._onMouseUp, this) // Necessary for 0.7 compatibility
				.on('mousemove', this._onMouseMove, this)
				.on('touchstart', this._onTouch, this)
				;

		}
	},

	// @method removeHooks(): void
	// Remove listener hooks from this handler.
	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {

			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			L.Draw.Feature.prototype.removeHooks.call(this);

			// remove markers from map
			this._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
			delete this._marker;

			this._mouseMarker
				.off('mousedown', this._onMouseDown, this)
				.off('mouseout', this._onMouseOut, this)
				.off('mouseup', this._onMouseUp, this)
				.off('mousemove', this._onMouseMove, this);
			this._map.removeLayer(this._mouseMarker);
			delete this._mouseMarker;

			this._map
				.off('mouseup', this._onMouseUp, this)
				.off('mousemove', this._onMouseMove, this)
				.off('touchstart', this._onTouch, this)
				.off('click', this._onTouch, this);
		}
	},

	_createMarker: function (latlng) {
		var marker = new L.Marker(latlng, {
			icon: this.options.icon,
			zIndexOffset: this.options.zIndexOffset * 2
		});

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_getTooltipText: function () {
		return {
			text: this._endLabelText
		};
	},

	_onMouseDown: function (e) {
		if (!this._clickHandled && !this._touchHandled && !this._disableMarkers) {
			console.log('new simpleshape: _onMouseDown');
			this._onMouseMove(e);
			this._clickHandled = true;
			this._disableNewMarkers();
			var originalEvent = e.originalEvent;
			var clientX = originalEvent.clientX;
			var clientY = originalEvent.clientY;
			this._startPoint.call(this, clientX, clientY);
		}
	},

	// disable new markers temporarily;
	// this is to prevent duplicated touch/click events in some browsers
	_disableNewMarkers: function () {
		this._disableMarkers = true;
	},

	// see _disableNewMarkers
	_enableNewMarkers: function () {
		setTimeout(function() {
			this._disableMarkers = false;
		}.bind(this), 50);
	},

	_onMouseOut: function () {
		if (this._tooltip) {
			this._tooltip._onMouseOut.call(this._tooltip);
		}
	},

	_onMouseUp: function (e) {
		console.log('new simpleshape: _onMouseUp');
		var originalEvent = e.originalEvent;
		var clientX = originalEvent.clientX;
		var clientY = originalEvent.clientY;
		this._endPoint.call(this, clientX, clientY, e);
		this._clickHandled = null;
	},


	_startPoint: function (clientX, clientY) {
		this._mouseDownOrigin = L.point(clientX, clientY);
	},

	_endPoint: function (clientX, clientY, e) {
		if (this._mouseDownOrigin) {
			if (this._marker) {
				this._finishShape(e.latlng);
			} else {
				this.addVertex(e.latlng);
			}
			this._enableNewMarkers(); // after a short pause, enable new markers
		}
		this._mouseDownOrigin = null;
	},


	// @method addVertex(): void
	// Add a vertex to the end of the polyline
	addVertex: function (latlng) {

		console.log('new simpleshape: addVertex');
		// placeholder: do error checking and setting the tooltip here

		this._marker = this._createMarker(latlng);
		this._startLatLng = latlng;
		console.log("startlatlng", latlng);
		// this._map.addLayer(this._poly);

		// this._vertexChanged(latlng, true);
	},

	// ontouch prevented by clickHandled flag because some browsers fire both click/touch events,
	// causing unwanted behavior
	_onTouch: function (e) {
		var originalEvent = e.originalEvent;
		var clientX;
		var clientY;
		if (originalEvent.touches && originalEvent.touches[0] && !this._clickHandled && !this._touchHandled && !this._disableMarkers) {
			console.log('new simpleshape: _onTouch');

			clientX = originalEvent.touches[0].clientX;
			clientY = originalEvent.touches[0].clientY;
			this._touchHandled = true;
			this._startPoint.call(this, clientX, clientY);
			this._endPoint.call(this, clientX, clientY, e);
			this._touchHandled = null;
		}
		this._clickHandled = null;
	},



	_onMouseMove: function (e) {
		var newPos = this._map.mouseEventToLayerPoint(e.originalEvent);
		var latlng = this._map.layerPointToLatLng(newPos);

		// Save latlng
		// should this be moved to _updateGuide() ?
		this._currentLatLng = latlng;

		// this._updateTooltip(latlng); // todo: add in later

		// Update the guide line
		// this._updateGuide(newPos); // todo: add in later

		// Update the mouse marker position
		this._mouseMarker.setLatLng(latlng);

		L.DomEvent.preventDefault(e.originalEvent);
	},


	// calculate if we are currently within close enough distance
	// of the closing point (first point for shapes, last point for lines)
	// this is semi-ugly code but the only reliable way i found to get the job done
	// note: calculating point.distanceTo between mouseDownOrigin and last marker did NOT work
	_calculateFinishDistance: function (potentialLatLng) {
		var lastPtDistance
		if (this._marker) {
				var finishMarker = this._marker;
				var lastMarkerPoint = this._map.latLngToContainerPoint(finishMarker.getLatLng()),
				potentialMarker = new L.Marker(potentialLatLng, {
					icon: this.options.icon,
					zIndexOffset: this.options.zIndexOffset * 2
				});
				var potentialMarkerPint = this._map.latLngToContainerPoint(potentialMarker.getLatLng());
				lastPtDistance = lastMarkerPoint.distanceTo(potentialMarkerPint);
			} else {
				lastPtDistance = Infinity;
			}
			return lastPtDistance;
	},


	_updateTooltip: function (latLng) {
		var text = this._getTooltipText();

		if (latLng) {
			this._tooltip.updatePosition(latLng);
		}

		if (!this._errorShown) {
			this._tooltip.updateContent(text);
		}
	},

	_finishShape: function (latlng) {
		this._drawShape(latlng);
		this._fireCreatedEvent();
		this.disable(); // todo: find out why this doesn't work
	},

});