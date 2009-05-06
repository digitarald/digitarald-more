/*=
description: Allows fragmenting animations on elements, like explosions or wiped fading.
require: ['Fx.CSS', 'Element.Dimensions']
*/

Fx.Split = new Class({

	Extends: Fx,

	options: {
		split: {x: 5, y: 5},
		acceleration: Fx.Transitions.linear,
		randomize: 0,
		factor: 1
	},

	initialize: function(element, options) {
		this.subject = $(element);
		this.parent(options);
	},

	start: function(type, from, to) {
		this.type = type;
		this.parent(from, to);
	},
	
	map: function(fn) {
		if (!this.chunks) this.render();
		
		var results = [];
		
		var split = this.options.split;
		for (var i = 0; i < split.x; i++) {
			for (var j = 0; j < split.y; j++) {
				results.push(fn.call(this, this.chunks[i + '-' + j], i, j));
			}
		}
		
		return results;
	},

	render: function() {
		var coords = this.subject.getCoordinates();
		var split = this.options.split;
		
		var body = this.subject.getDocument().body;
		
		var steps = {
			x: (coords.width / split.x).ceil(),
			y: (coords.height / split.y).ceil()
		};

		var clone = new Element('div', {
			styles: {
				position: 'absolute',
				overflow: 'hidden',
				width: steps.x,
				height: steps.y
			}
		}).grab(new Element('div', {
			styles: {
				position: 'absolute'
			}
		}).grab(this.subject.cloneNode(true)));

		this.chunks = {};

		for (var i = 0; i < split.x; i++) {
			for (var j = 0; j < split.y; j++) {
				var origin = {
					left: coords.left + (i * steps.x),
					top: coords.top + (j * steps.y)
				};
				
				var chunk = $(clone.cloneNode(true)).setStyles(origin);
				chunk.getFirst().setStyles({
					left: - i * steps.x,
					top: - j * steps.y
				});
				
				var distance = {
						x: ((split.x - i) / split.x - 0.5) * -2,
						y: ((split.y - j) / split.y - 0.5) * -2
				};
				chunk.store('burst:distance', distance);
				chunk.store('burst:origin', origin);
				
				this.chunks[i + '-' + j] = chunk.inject(body);
			}
		}

		this.subject.setStyle('visibility', 'hidden');
	},
	
	cancel: function() {
		if (this.running) {
			this.running.each(function(fx) {
				fx.cancel();
			});
			this.running = null;
		}
		return this;
	},
	
	reset: function(morph, options) {
		return this.start('reset', options, morph);
	},
	
	remove: function(destroy, options) {
		return this.start('remove', options, destroy);
	},
	
	start: function(actor, options) {
		if (!this.check(arguments.callee, actor, options)) return this;
		if (!(actor = Fx.Split.actors.get(actor))) return this;
		options = $merge(this.options, ($type(options) == 'object') ? options : {});
		actor.apply(this, [options].concat(Array.slice(arguments, 2)));
		return this;
	}
	
});

Fx.Split.actors = new Hash({
	
	reset: function(options, morph) {
		if (!this.chunks) return this;
		this.cancel();
	
		var running = this.map(function(chunk) {
			var origin = chunk.retrieve('burst:origin');
			if (morph) return new Fx.Morph(chunk, options).start(origin);
			chunk.setStyles(origin);
		});
		
		if (morph) {
			this.running = running;
			this.running[0].chain(this.callChain.bind(this));
		}
		
		return this;
	},
	
	remove: function(options, destroy) {
		if (!this.chunks) return this;
		this.cancel();
	
		this.map(function(chunk) {
			chunk.destroy();
		});
		this.chunks = null;
		
		if (!destroy) this.subject.setStyle('visibility', 'visible');
		else this.subject.destroy();
	
		return this;
	},
	
	explode: function(options, container) {
		var acceleration = options.acceleration;
		var randomize = options.randomize;
		
		var factor = this.options.factor;
		if ($type(factor) == 'number') {
			factor = {x: factor, y: factor};
		}
		
		this.running = this.map(function(chunk) {
			var fx = new Fx.Physics(chunk, container || document.body, options);
			
			var distance = chunk.retrieve('burst:distance');
			
			fx.velocity = {
				x: (distance.x + $random(-randomize * 100, randomize * 100) / 100) * acceleration(distance.x.abs()) * factor.x,
				y: (distance.y + $random(-randomize * 100, randomize * 100) / 100) * acceleration(distance.y.abs()) * factor.y
			};
			
			return fx.start();
		});
	},
	
	wipe: function(options) {
		var acceleration = options.acceleration;
		var randomize = options.randomize;
		
		var factor = options.factor;
		if ($type(factor) == 'number') {
			factor = {x: factor, y: factor};
		}
		var transform = {
			x: (factor.x > 0) ? 1 : -1,
			y: (factor.y > 0) ? 1 : -1
		};
		
		this.running = this.map(function(chunk) {
			var origin = chunk.retrieve('burst:origin');
			var distance = chunk.retrieve('burst:distance');
			origin.opacity = 1;
			
			var delay = (acceleration((distance.x + transform.x).abs() / 2) * factor.x.abs() + acceleration((distance.y + transform.y).abs() / 2) * factor.y.abs());
			
			var fx = new Fx.Tween(chunk, options);
			fx.start.delay(delay.round(), fx, ['opacity', [1, 0]]);
			return fx;
		});
		
		this.running[0].chain(this.callChain.bind(this));
	},
	
	expand: function(options) {
		var acceleration = options.acceleration;
		var randomize = options.randomize;
		
		var factor = this.options.factor;
		if ($type(factor) == 'number') {
			factor = {x: factor, y: factor};
		}
		
		this.running = this.map(function(chunk) {
			var origin = chunk.retrieve('burst:origin');
			var distance = chunk.retrieve('burst:distance');
			
			origin.opacity = 1;
			
			var to = {
				left: [origin.left, origin.left + (distance.x + $random(-randomize * 100, randomize * 100) / 100) * acceleration(distance.x.abs()) * factor.x],
				top: [origin.top, origin.top + (distance.y + $random(-randomize * 100, randomize * 100) / 100) * acceleration(distance.y.abs()) * factor.y],
				opacity: 0
			};
			
			return new Fx.Morph(chunk, options).start(to);
		});
	}
	
});