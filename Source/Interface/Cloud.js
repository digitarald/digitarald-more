/*=
description: Customizable overlay element for unobtrusive tooltips.
require: ['Class.Extras', 'Element.Event', 'Element.Dimensions']
*/

var Cloud = new Class({

	Implements: [Options, Events],

	options: {
		position: 'center',
		alignFrom: null,
		alignTo: null,
		container: document,
		offset: {x: 0, y: 0},
		className: false,
		destroyOnClose: false,
		delayShow: 400,
		delayHide: 400,
		show: function(element) {
			element.setStyle('visibility', 'visible');
		},
		hide: function(element) {
			element.setStyle('display', 'none');
		},
		showSwap: function(swap) {
			swap.setStyles({
				'opacity': 0.01,
				'display': ''
			});
		},
		href: null,
		forwardClick: true,
		attachOnClick: false,
		onBuild: $empty,
		onShow: $empty,
		onHide: $empty,
		onAttach: $empty
	},

	initialize: function(el, content, options) {
		this.element = $(el);
		this.content = $(content) || content;
		this.setOptions(options);
		this.align = this.options.position;
		this.bound = {
			mouseenter: this.mouseenter.bind(this),
			mouseleave: this.mouseleave.bind(this)
		};
		this.moving = this.hide.bind(this);
		if (this.element) this.element.addEvents(this.bound);
	},

	build: function() {
		if ($type(this.align) == 'string'){
			var align = {x: 'center', y: 'center'};
			if ((/left|west/i).test(this.align)) align.x = 'left';
			else if ((/right|east/i).test(this.align)) align.x = 'right';
			if ((/upper|top|north/i).test(this.align)) align.y = 'top';
			else if ((/bottom|lower|south/i).test(this.align)) align.y = 'bottom';
			this.align = align;
		};
		this.body = new Element('div', {'class': 'cloud'}).setStyle('display', 'none');
		if (this.options.className) this.body.addClass(this.options.className);
		this.container = $(this.options.container);
		if (this.options.href) this.swap = new Element('a', {'href': this.options.href});
		else this.swap = new Element('div');
		this.swap.addClass('cloud-swap').addEvents(this.bound);
		if (this.options.forwardClick) {
			this.swap.addEvent('mousedown', function(e){
				this.hide();
				this.element.fireEvent('mousedown', [e]);
			}.bind(this));
		}
		if (this.options.attachOnClick) this.swap.addEvent('click', this.attach.bind(this));
		if ($type(this.content) == 'function') this.content(this.body, this.element);
		else this.content.inject(this.body);
		this.from = (this.options.alignFrom) ? this.element.getElement(this.options.alignFrom) : this.element;
		this.to = (this.options.alignTo) ? this.body.getElement(this.options.alignTo) : this.body;
		this.fireEvent('onBuild', [this.body, this.swap]);
		$(document.body).adopt(this.body, this.swap);
	},

	destroy: function() {
		this.body.destroy();
		this.swap.destroy();
		this.swap = this.body = this.from = this.to = null;
	},

	mouseenter: function() {
		$clear(this.timer);
		this.timer = this.show.delay(this.options.delayShow, this);
	},

	mouseleave: function() {
		$clear(this.timer);
		this.timer = this.hide.delay(this.options.delayHide, this);
	},

	attach: function() {
		if (!this.visible || this.attached) return false;
		this.attached = true;
		this.body.addClass('cloud-attached').addEvents(this.bound);
		this.swap.setStyle('display', 'none');
		this.fireEvent('onAttach', this.body);
		return false;
	},

	show: function() {
		if (this.visible) return this;
		this.visible = true;
		if (!this.body) this.build();
		this.body.setStyles({visibility: 'hidden', display: 'block'});
		this.reposition();
		this.options.show.call(this, this.body);
		this.options.showSwap.call(this, this.swap);
		window.addEvent('scroll', this.moving);
		return this.fireEvent('onShow', this.body);
	},

	hide: function() {
		if (!this.visible) return this;
		if (this.options.destroyOnClose) {
			this.destroy();
		} else {
			if (this.attached) this.body.removeClass('cloud-attached').removeEvents();
			this.options.hide.call(this, this.body);
			this.swap.setStyle('display', 'none');
		}
		window.removeEvent('scroll', this.moving);
		this.visible = this.attached = false;
		return this.fireEvent('onHide', this.body);
	},

	reposition: function() {
		if (!this.visible) return this;
		var from = this.from.getCoordinates();
		var to = this.to.getCoordinates();
		var coords = this.body.getCoordinates();
		switch (this.align.x) {
			case 'center': coords.left += (from.width / 2) - (to.width / 2); break;
			case 'right': coords.left += (from.width) - (to.width);
		}
		switch (this.align.y) {
			case 'center': coords.top += (from.height / 2) - (to.height / 2); break;
			case 'bottom': coords.top += (from.height) - (to.height);
		}
		var size = this.container.getSize();
		var scroll = this.container.getScroll();
		this.body.setStyles({
			'left': (coords.left + from.left + this.options.offset.x - to.left).round().limit(scroll.x, scroll.x + size.x - coords.width),
			'top': (coords.top + from.top + this.options.offset.y - to.top).round().limit(scroll.y, scroll.y + size.y - coords.height)
		});
		if (this.swap) this.swap.setStyles(this.element.getCoordinates());
		return this;
	}

});