/*=
description: Applies the famous interactive Lens or Fisheye effect for images.
require: ['Fx', 'Fx.Transitions', 'Element.Event', 'Element.Dimensions']
provide: 'Fx.Lens.css'
*/

Fx.Lens = new Class({

	Implements: [Options, Events],

	options: {
		unit: 'px',
		snap: 150,
		factor: 0.8,
		sense: {x: 1, y: 0.4},
		compute: false,
		ease: Fx.Transitions.Sine.easeInOut,
		link: 'cancel',
		onOver: $empty,
		onOut: $empty
	},

	initialize: function(elements, options) {
		this.setOptions(options);
		this.bound = {
			compute: this.compute.bind(this)
		};
		this.nodes = $$(elements).map(function(el) {
			return {
				element: el.addEvents({
					'mouseenter': this.fireEvent.bind(this, ['onOver', el]),
					'mouseleave': this.fireEvent.bind(this, ['onOut', el])
				}),
				width: el.getStyle('width').toInt(),
				distance: -1
			};
		}, this);
		document.addEvent('mousemove', this.bound.compute);
	},

	compute: function(e) {
		var cursor = e.page, sense = this.options.sense, compute = this.options.compute;
		for (var i = this.nodes.length; i--;) {
			var node = this.nodes[i];
			var coords = node.coords || (node.coords = node.element.getCoordinates());
			var distance = 1 - (Math.sqrt(
				Math.pow(coords.left + coords.width / 2 - cursor.x, 2) / sense.x +
				Math.pow(coords.top + coords.height / 2 - cursor.y, 2) / sense.y
			) / this.options.snap);
			if (distance < 0) distance = 0;
			if (node.distance != distance) {
				node.distance = distance;
				node.coords = null;
				var factor = 1 + this.options.ease(distance) * this.options.factor;
				var width = Math.round(node.width * factor);
				if (width != node.element.offsetWidth) {
					node.element.width = width;
					if (compute) compute.call(this, node.element, factor);
				}
			}
		}
	}

});