/*=
description: Interactive 3D Carousel for images.
require: ['Fx', 'Fx.Transitions', 'Element.Event', 'Element.Dimensions']
provide: 'Fx.Spinner.css'
*/

Fx.Spinner = new Class({

	Extends: Fx,

	options: {
		velocity: 5000,
		transition: Fx.Transitions.linear,
		factors: {
			x: 600,
			y: -100,
			size: 0.5,
			opacity: 0.6
		},
		transitions: {
			arc: Fx.Transitions.linear,
			x: Fx.Transitions.linear,
			y: Fx.Transitions.linear,
			size: Fx.Transitions.linear,
			opacity: Fx.Transitions.linear
		},
		images: true,
		link: 'cancel',
		zIndex: 99,
		container: null,
		center: null
	},

	initialize: function(elements, options) {
		this.parent(options);
		this.items = $$(elements).map(function(item) {
			return {
				'element': item.setStyle('position', 'absolute'),
				'width': item.getStyle('width').toInt() || item.width,
				'height': item.getStyle('height').toInt() || item.height
			};
		});
		this.distance = 1 / this.items.length;
		this.container = $(this.options.container) || this.items[0].element.getParent();
		this.center = this.options.center;
		if (!this.center) {
			var size = this.container.getSize();
			this.center = {'x': size.x / 2, 'y': size.y / 2};
		}
		this.set(0).onComplete();
	},

	set: function(now) {
		var factors = this.options.factors,
			transitions = this.options.transitions,
			zIndex = this.options.zIndex,
			imgs = this.options.images,
			pi = Math.PI;
		now = this.now = (now > 1 || now < 0) ? now - Math.floor(now) : now;
		for (var i = 0, j = this.items.length; i < j; i++) {
			var item = this.items[i],
				el = item.element,
				width = item.width,
				height = item.height,
				diff = i / j - now,
				base = diff + (diff < 0),
				// rel = Math.abs(base - 0.5) * 2,
				arc = Math.cos(base * pi - pi / 2);

			if (factors.size) {
				var factor = 1 - factors.size * transitions.size(arc);
				height = Math.round(height * factor);
				width = Math.round(width * factor);
				if (imgs) {
					el.width = width; // images only
				} else {
					el.style.width = width;
					el.style.height = height;
				}
			}
			if (base == 0) {
				this.focused = item;
			} else {
				if (this.focused == item) {
					this.fireEvent('onBlur', [el]);
					this.focused = null;
				}
			}
			el.style.left = Math.round(this.center.x + (Math.sin(base * 2 * pi) * factors.x - width) / 2) + 'px';
			el.style.top = Math.round(this.center.y + (Math.cos(base * 2 * pi + pi) * factors.y - height) / 2) + 'px';
			el.style.zIndex	= zIndex + Math.round(100 - transitions.size(arc) * 100);
			if (factors.opacity) el.set('opacity', 1 - transitions.opacity(arc) * factors.opacity, true);
		}
		return this;
	},

	onComplete: function() {
		this.parent();
		if (this.focused) this.fireEvent('onFocus', [this.focused.element]);
	},

	start: function(to, free) {
		if (!this.check(to, free)) return this;
		if ($type(to) == 'element') {
			var pos;
			var ret = this.items.some(function(item, i) {
				pos = i;
				return item.element == to;
			});
			if (!ret) return this;
			this.subject = this.items[pos].element;
			to = pos / this.items.length;
		} else {
			this.subject = to;
		}
		var from = this.now || 0;
		if (!free && to > 1) to -= to.floor();
		var abs = (from - to).abs();
		if (!free && abs > 0.5) abs = (from - (to += (to > from) ? -1 : 1)).abs()
		this.options.duration = this.options.velocity * abs;
		return this.parent(from, to);
	},

	moveBy: function(steps) {
		return this.start((this.to || 0) + (steps || 1) * this.distance);
	},

	moveByDistance: function(steps) {
		return this.start((this.to || 0) + steps, true);
	}

});