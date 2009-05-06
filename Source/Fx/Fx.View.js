/*=
description: Scrolls an element into viewport if it is not fully visible.
require: ['Fx.Scroll', 'Element.Dimensions']
*/

Fx.View = new Class({

	Extends: Fx.Scroll,

	options: {
		chain: 'cancel'
	},

	initialize: function(options){
		this.parent(document.body, options);
	},

	toElement: function(element) {
		var scroll = document.getScroll(),
			size = document.getSize(),
			coords = $(element).getCoordinates();
		if (coords.right > scroll.x + size.x) scroll.x = coords.right - size.x;
		if (coords.bottom > scroll.y + size.y) scroll.y = coords.bottom - size.y;
		return this.start(Math.min(scroll.x, coords.left), Math.min(scroll.y, coords.top));
	}

});
