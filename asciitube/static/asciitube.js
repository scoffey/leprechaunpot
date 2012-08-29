AsciiFrame = new Class({
	initialize: function (text) {
		this.text = text || ''; // public instance variable
	},
	fitsIn: function (width, height) {
		lines = this.text.split('\n');
		return (lines.length <= height) && lines.every(function (line) {
			return (line.length <= width);
		});
	},
	getFitText: function (width, height) {
		lines = this.text.split('\n');
		if (lines.length < height) {
			for (var i = height; i < lines.length; i++) {
				lines.push('');
			}
		} else if (lines.length > height) {
			lines = lines.filter(function (line, index) {
				return index <= height;
			});
		}
		lines = lines.map(function (line) {
			return line.substring(0, width);
		});
		return lines.join('\n');
	},
	toString: function () {
		return this.text;
	},
});

AsciiAnimation = new Class({
	initialize: function (frames, index) {
		this.frames = frames || new Array();
		if (this.frames.length == 0) {
			this.frames.push(new AsciiFrame());
		}
		this.index = index || 0;
		this.playIntervalId = null;
	},
	getFrameIndex: function () {
		return this.index;
	},
	getFrameCount: function () {
		return this.frames.length;
	},
	getFrame: function (index) {
		var index = $chk(index) ? index : this.index;
		return this.frames[index];
	},
	goToFrame: function (index) {
		if (!(index >= 0 && index < this.frames.length)) {
			this.pause();
			return null;
		}
		var oldFrame = this.getFrame(this.index);
		var newFrame = this.getFrame(index);
		this.index = index;
		this.onFrameChange(oldFrame, newFrame);
		return newFrame;
	},
	goToFrameOffset: function (offset) {
		return this.goToFrame(this.index + offset);
	},
	goToFirstFrame: function () {
		return this.goToFrame(0);
	},
	goToLastFrame: function () {
		return this.goToFrame(this.frames.length - 1);
	},
	goToPreviousFrame: function () {
		return this.goToFrameOffset(-1);
	},
	goToNextFrame: function () {
		return this.goToFrameOffset(1);
	},
	refresh: function () {
		return this.goToFrameOffset(0);
	},
	insertFrame: function (frame, index) {
		var index = $chk(index) ? index : this.index;
		this.frames.splice(index + 1, 0, frame || new AsciiFrame());
		return this.goToFrame(index + 1); // XXX
	},
	insertFrameByCopy: function (frame, index) {
		var index = $chk(index) ? index : this.index;
		var frame = frame ? frame : new AsciiFrame();
		this.refresh(); // XXX
		var text = this.getFrame(index).text;
		frame.text = text;
		return this.insertFrame(frame, index);
	},
	deleteFrame: function (index) {
		var index = $chk(index) ? index : this.index;
		this.goToFrame(index + 1); // XXX
		this.frames.splice(index, 1);
		this.index--; // XXX
		return this.refresh(); // XXX
	},
	play: function (framerate) {
		this.pause();
		this.playIntervalId = this.goToNextFrame.periodical(
				framerate || 1000, this);
		return this.playIntervalId;
	},
	pause: function () {
		if (this.playIntervalId) {
			$clear(this.playIntervalId);
			this.playIntervalId = null;
		}
		return null;
	},
	playOrPause: function () {
		return (this.isPlaying() ? this.pause() : this.play());
	},
	isPlaying: function () {
		return (this.playIntervalId ? true : false);
	},
	onFrameChange: function (oldFrame, newFrame) {
		// Override to listen to this event
	},
});

AsciiAnimationTextareaViewport = new Class({
	initialize: function (textarea_id) {
		this.element = $(textarea_id);
	},
	getText: function () {
		return this.element.get('value');
	},
	setText: function (text) {
		this.element.set('value', text);
	},
	getSize: function () {
		return {'width': parseInt(this.element.get('cols')),
			'height': parseInt(this.element.get('rows'))};
	},
	setSize: function (width, height) {
		this.element.set('cols', width.toString());
		this.element.set('rows', height.toString());
	},
});

// Main script
var lastTotal = 0;
var slider = null;
function updateView(animation) {
	var current = animation.getFrameIndex();
	var total = animation.getFrameCount();
	$('current').set('text', (current + 1).toString());
	$('total').set('text', total.toString());
	$('viewport').focus();
	if (slider) slider.set(current);
	if (total == lastTotal) return;
	lastTotal = total;
	slider = new Slider('slider', 'knob', {
		range: [0, (total - 1) || 1],
		//offset: current,
		wheel: true,
		snap: true,
		//onTick: function (pos) {
			//this.element.setStyle('background', '#eeeeee');
			//this.knob.setStyle(this.property, pos);
		//},
		onComplete: function (step) {
			//$('framerate').set('value', step);
			//$('framewidth').set('value', $type(step));
			animation.goToFrame(parseInt(step));
			updateView(animation);
		}
	});
	slider.set(current);
}
window.addEvent('domready', function () {
	var viewport = new AsciiAnimationTextareaViewport('viewport');
	var animation = new AsciiAnimation();
	animation.onFrameChange = function (oldFrame, newFrame) {
		oldFrame.text = viewport.getText();
		// var size = this.viewport.getSize();
		// var text = frame.getFitText(size.width, size.height);
		viewport.setText(newFrame.text);
		updateView(animation);
	};
	updateView(animation);
	// Add event listeners to control buttons
	var controls = new Hash({
		'play-pause': 'playOrPause',
		'first': 'goToFirstFrame',
		'last': 'goToLastFrame',
		'next': 'goToNextFrame',
		'previous': 'goToPreviousFrame',
		'insert': 'insertFrame',
		'delete': 'deleteFrame',
		'copy': 'insertFrameByCopy',
	});
	controls.each(function (callback_name, element_id) {
		var callback = animation[callback_name].bind(animation);
		$(element_id).addEvent('click', function (e) {
			e.stop();
			try {
				callback();
			} catch (e) {
				alert(e);
			}
			return false;
		});
	});
});
