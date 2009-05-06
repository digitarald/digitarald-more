/*=
description: Automatically grows and reduces the height of textareas during editing.
version: 1.0 rc3
require: ['Class.Extras', 'Element.Event']
*/

var Observer = new Class({

	Implements: [Options, Events],

	options: {
		periodical: false,
		onkey: true,
		delay: 1000
	},

	initialize: function(el, onFired, options){
		this.setOptions(options);
		this.addEvent('onFired', onFired);
		this.element = $(el) || $$(el);
		this.value = this.element.get('value');
		if (this.options.periodical) this.timer = this.changed.periodical(this.options.periodical, this);
		else this.element.addEvent((this.options.onkey) ? 'keyup' : 'blur', this.changed.bind(this));
	},

	changed: function() {
		var value = this.element.get('value');
		if (Observer.equals(this.value, value)) return;
		this.clear();
		this.value = value;
		this.timeout = this.onFired.delay(this.options.delay, this);
	},

	setValue: function(value) {
		this.value = value;
		this.element.set('value', value);
		return this.clear();
	},

	onFired: function() {
		this.fireEvent('onFired', [this.value, this.element]);
	},

	clear: function() {
		$clear(this.timeout || null);
		return this;
	}

});

var Observer.equals = function(obj1, obj2) {
	return (obj1 == obj2 || JSON.encode(obj1) == JSON.encode(obj2));
};