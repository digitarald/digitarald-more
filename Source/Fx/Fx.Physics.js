/*=
description: Applies and controls gravity for an element.
require: ['Class.Extras', 'Element.Dimensions']
credits: Physics derived from http://www.spoono.com/flash/tutorials/tutorial.php?url=gravity
*/

Fx.Physics = new Class({
		
	Implements: Options,
	
	options: {
		gravity: 1,
		restitution: 0.6,
		friction: 0.9,
		unit: 'px',
		fps: 25	
	},
	
	initialize: function(element, container, options){
		this.element = $(element);
		this.container = $(container);
		
		this.setOptions(options);

		this.velocity = {
			x: 0,
			y: 0
		};
		
		this.position = this.element.getPosition();
	},
	
	step: function(){
		this.velocity.y += this.options.gravity;
	
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		
		var isOnGround = false;
	
		if (this.position.y + this.element.offsetHeight > this.container.offsetHeight){ //touches bottom
			this.position.y = this.container.offsetHeight - this.element.offsetHeight;
			this.velocity.y *= -this.options.restitution;
			if (!this.options.airFriction) this.velocity.x *= this.options.friction;
			
			isOnGround = true;
		}
		
		if (isOnGround) {
			this.isOnGround = true;
			if (this.element.onGround) this.element.onGround();
		}
		else {
			if (this.element.onAir) this.element.onAir();
			this.isOnGround = false;
		}
	
		if (this.position.y < 0){ //touches top
			this.position.y = 0;
			this.velocity.y *= -this.options.restitution;
			
			this.isOnTop = true;
		} else {
			this.isOnTop = false;
		}
	
		if (this.position.x + this.element.offsetWidth > this.container.offsetWidth){ //touches right
			this.position.x = this.container.offsetWidth - this.element.offsetWidth;
			this.velocity.x *= -this.options.restitution;
			this.isOnRight = true;
		} else {
			this.isOnRight = false;
		}
	
		if (this.position.x < 0){ //touches left
			this.position.x = 0;
			this.velocity.x *= -this.options.restitution;
			
			this.isOnLeft = true;
		} else {
			this.isOnLeft = false;
		}
		
		if (this.options.airFriction){
			this.velocity.y *= this.options.friction;
			this.velocity.x *= this.options.friction;
		}
		
		this.element.style.left = this.position.x + 'px';
		this.element.style.top = this.position.y + 'px';
	},
	
	start: function(){
		this.timer = this.step.periodical(Math.round(1000 / this.options.fps), this);
		return this;
	},
	
	custom: function(velx, vely){
		this.velocity.x += velx;
		this.velocity.y += vely;
	},
	
	cancel: function(){
		this.stopTimer();
	},
	
	stopTimer: function(){
		this.timer = $clear(this.timer);
	}
});