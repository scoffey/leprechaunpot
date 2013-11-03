/*
 * Class: SokobanGame
 * ------------------
 * Represents a sokoban game, that has a level loader to load different
 * levels. It saves a global history of moves and handles key events.
 */
SokobanGame = new Class({

	// Constructor
	initialize: function (loader) {
		this.levelName = null; // current level name
		this.level = null; // currently loaded level
		this.history = new Array();
		this.loader = loader;
		var eventName = Browser.Engine.trident || Browser.Engine.webkit
				? 'keydown' : 'keypress';
		document.addEvent(eventName, this.onKeyDown.bind(this));
	},

	// Loads a level by name (and saves previous level history if such)
	loadLevel: function (name) {
		var keys = '';
		if (this.level) { // do unloading stuff
			keys = this.level.getKeys();
			this.level.getMaze().hide();
			this.history.push(this.level.getMoveHistory());
		}
		try {
			var lastLevelName = this.levelName;
			this.levelName = name;
			this.level = this.loader.load(name);

			this.onLevelUp();

			this.level.onExit = this.loadLevel.bind(this);
			this.level.setKeys(keys);
			if (lastLevelName) {
				this.level.setSpriteCloseTo(lastLevelName);
			}
		} catch (exception) {
			this.onError(exception);
		}
	},

	onLevelUp: function () {
	},
	
	levelMessage: function () {
		return 'Level ' + (this.loader.index+1);
	},

	// Key event handler for arrow keys and undo/reset keys
	onKeyDown: function (e) {
		if (e.shift || e.control || e.alt || e.meta) {
			return true; // ignore key combinations
		}
		if (!this.level) {
			return true; // ignore splash screen and similar...
		}
		var stop = true;
		try {
			if (!this.level.isComplete()) {
				stop = this.handleKey(e.key);
			} else {
				this.loadLevel(null);
			}
		} catch (exception) {
			this.onError(exception);
		}
		if (stop) { // only for handled key events
			e.stop();
		}
		return true;
	},

	handleKey: function(key) {
		var c = false;
		var stop = true; // prevent key event propagation
		switch (key) {
			case 'up': c = this.level.onMove(0, -1); break;
			case 'right': c = this.level.onMove(1, 0); break;
			case 'down': c = this.level.onMove(0, 1); break;
			case 'left': c = this.level.onMove(-1, 0); break;
			case 'u': this.level.undo(); break;
			case 'r': this.level.redo(); break;
			default: stop = false;
		}
		if (c) {
			var total = this.loader.mazeDatabase.length;
			var current = this.loader.index;
			var left = total - current -1;
			var s = left == 1? '':'s';
			this.echo(this.levelMessage() + ' / ' + total
				+ ' complete. ' + left + ' level'+ s +' to go. '
				+ 'Press any key to continue...');
		}
		return stop;
	}, 

	// Handles exceptions in game (override to customize)
	onError: function (exception) {
		if ($type(exception) != 'string') {
			this.echo('Error: ' + exception.toString());
		} else if (exception == 'YOU WIN!') {
			this.echo('You win! Walter is happy :)');
		//} else if (exception.contains('Key already lifted')) {
		//} else if (exception.contains('Get the key')) {
		//} else if (exception.contains('Put all the boxes')) {
		} else {
			this.echo('Error: ' + exception.toString());
		}
	},

	echo: function (message) {
		$('message').set('text', message);
	}
	
});

/*
 * Class: SokobanIndexedLevelLoader
 * -------------------------
 */
SokobanIndexedLevelLoader = new Class({

	// Constructor
	initialize: function (mazeDatabase, container) {
		this.mazeDatabase = mazeDatabase;
		this.container = container;
		this.index = 0;
	},

	// Loads a level by maze name
	load: function (mazeIndex) {
		if (mazeIndex == null) {
			mazeIndex = ++this.index;
		} else {
			this.index = mazeIndex;
		}
		if (mazeIndex >= this.mazeDatabase.length) {
			throw 'YOU WIN!';
		}
		var maze = this.get(mazeIndex);
		maze.render(this.container);
		return new SokobanLevel(maze);
	},

	// Returns a maze from the database by name
	get: function (mazeIndex) {
		var mazeData = this.mazeDatabase[mazeIndex];
		if (!mazeData) {
			throw 'Failed to load maze by index: ' + mazeIndex;
		}
		maze = new SokobanMaze(mazeData);
		return maze;
	}

});

/*
 * Class: SokobanLevelLoader
 * -------------------------
 * Loads (creates and renders) levels for a sokoban game according to
 * a database of mazes. Loaded mazes are saved for restoring later. 
 */
SokobanLevelLoader = new Class({

	// Constructor
	initialize: function (mazeDatabase, container) {
		this.mazeDatabase = mazeDatabase;
		this.container = container;
		this.mazeCache = {};
	},

	// Loads a level by maze name
	load: function (mazeName) {
		if (mazeName.toLowerCase() == 'z') {
			throw 'YOU WIN!';
		} 
		var maze = this.get(mazeName);
		maze.render(this.container);
		return new SokobanLevel(maze);
	},

	// Returns a maze from the database (or internal cache) by name
	// NOTE: This implementation caches all requested mazes (for
	// restoring on future requests), but always resets unfinished
	// mazes (mazes that still have boxes to be put on the goals).
	get: function (mazeName) {
		var maze = this.mazeCache[mazeName];
		if (!maze || !maze.hasAllBoxesOnGoals()) {
			var mazeData = this.mazeDatabase[mazeName];
			if (!mazeData) {
				throw 'Failed to load maze: ' + mazeName;
			}
			maze = new SokobanMaze(mazeData);
			this.mazeCache[mazeName] = maze;
		}
		return maze;
	}

});

/*
 * Class: SokobanLevel
 * -------------------
 * Represents a level in a sokoban game, with a maze and the state of
 * a sprite, including the history of moves.
 */
SokobanLevel = new Class({

	// Constructor. Sets maze and initializes internal state
	initialize: function (maze) {
		this.maze = maze;
		this.moveHistory = '';
		this.moveCount = 0;
		this.keys = '';
		this.spriteTile = this.maze.getSpriteTile();
	},

	// Handler for each move event
	// dx, dy are the coordinate offsets (0, 1 or -1)
	// options is an optional argument with data for undo/redo moves
	onMove: function (dx, dy, options) {
		var retval = false;
		var sprite = this.spriteTile;
		var target = this.maze.getTile(sprite.x + dx, sprite.y + dy);
		if (!target) return;
		var state = target.getState();
		var logOptions = {};
		if ('([{\u00a1\u00bf'.contains(state)) { // key
			if (this.liftKey(target)) {
				logOptions.key = state;
			} else {
				throw 'Key already lifted';
			}
		} else if (')]}!?'.contains(state)) { // door
			if (this.openDoor(target)) {
				logOptions.door = state;
			} else {
				throw 'Get the key that opens this door';
			}
		}
		state = target.getState(); // update state due to key or door
		switch (state) {
		case ' ': // floor
		case '.': // goal
			sprite.moveTo(target);
			this.spriteTile = target;
			if (!options) { // do not log on undo/redo
				this.logMove(dx, dy, logOptions);
			} else if (options.boxPushed) {
				// boxes may have to be moved back on undo
				var lastTarget = this.maze.getTile(sprite.x -
						dx, sprite.y - dy);
				lastTarget.moveTo(sprite);
			} else if (options.key) {
				// key may have to reappear on undo
				sprite.setState(options.key);
				this.keys = this.keys.replace(options.key, '');
			} else if (options.door) {
				// doors may have to be closed back on undo
				sprite.setState(options.door);
				var d = ')]}!?'.indexOf(options.door); 
				this.keys += '([{\u00a1\u00bf'.charAt(d);
			}
			this.onStep(sprite, target, logOptions);
			break;
		case '$': // box
		case '*': // box on goal
			var farTarget = this.maze.getTile(sprite.x + 2 * dx,
					sprite.y + 2 * dy);
			// boxes cannot move if another box is behind
			if (farTarget && ' .'.contains(farTarget.getState())) {
				var logOptions = {boxPushed: true};
				target.moveTo(farTarget);
				sprite.moveTo(target);
				this.spriteTile = target;
				if (!options) { // do not log on undo/redo
					this.logMove(dx, dy, logOptions);
				}
				if (this.isComplete()) {
					this.maze.openExitDoors();
					retval = true;
				} else {
					this.maze.closeExitDoors();
				}
				this.onPush(sprite, target, logOptions);
			}
			break;
		default:
			if (state.test(/^[a-z]$/)) { // exit door
				this.logMove(dx, dy); // assumes no undo/redo
				this.onExit(state);
			} else if (state.test(/^[A-Z]$/)) { // exit door
				// conditional exit (only if level is done)
				if (this.isComplete()) {
					this.logMove(dx, dy); // no undo/redo
					this.onExit(state.toLowerCase());
				} else {
					throw 'Put all the boxes on the goals '
						+ 'to open this door';
				}
			} else if (!('#)]}!?'.contains(state))) {
				throw 'Unknown state "' + state
					+ '" of maze tile at (' + target.x
					+ ', ' + target.y + ')';
			}
			break;
		}
		return retval;
	},

	// Logs a move in the game history
	// options is an optional argument for undo data (boxPushed, key, door)
	logMove: function (dx, dy, options) {
		if (!options) options = {};
		var map = {
			' ': 'urdl', '$': 'URDL',
			'(': 'vsem', ')': 'VSEM',
			'[': 'wtfn', ']': 'WTFN',
			'{': 'xzgo', '}': 'XZGO',
			'\u00a1': 'abch', '!': 'ABCH',
			'\u00bf': 'ijkp', '?': 'IJKP'
		};
		var direction = dx ? 2 - dx : dy + 1; // 0: up, 1: right, ...
		var target = ' ';
		if (options.boxPushed) target = '$';
		else if (options.key) target = options.key;
		else if (options.door) target = options.door;
		var log = map[target].charAt(direction);
		this.moveHistory = this.moveHistory.substr(0, this.moveCount);
		this.moveHistory += log;
		this.moveCount = this.moveHistory.length;
		return log;
	},

	// Undoes one move according to the state in the game history
	undo: function () {
		if (this.moveCount < 1)
			return false;
		this.moveCount--;
		var allKeys = '([{\u00a1\u00bf';
		var log = this.moveHistory.charAt(this.moveCount);
		var map = 'urdlvsemwtfnxzgoabchijkpURDLVSEMWTFNXZGOABCHIJKP';
		var i = map.indexOf(log);
		var dx = (i % 2) == 0 ? 0 : (i % 4) - 2;
		var dy = (i % 2) == 0 ? 1 - (i % 4) : 0;
		var j = Math.floor(i / 4);
		var options = {};
		options.boxPushed = (j == 6);
		options.key = (j > 0 && j < 6) ? allKeys.charAt(j - 1) : false;
		options.door = (j > 6) ? ')]}!?'.charAt(j - 7) : false;
		this.onMove(dx, dy, options);
		if (options.boxPushed) {
			if (this.isComplete()) {
				this.maze.openExitDoors();
			} else {
				this.maze.closeExitDoors();
			}
		}
		return true;
	},

	// Redoes one move according to the state in the game history
	redo: function () {
		if (this.moveCount >= this.moveHistory.length)
			return false;
		var log = this.moveHistory.charAt(this.moveCount);
		this.moveCount++;
		var map = 'urdlvsemwtfnxzgoabchijkpURDLVSEMWTFNXZGOABCHIJKP';
		var i = map.indexOf(log);
		var dx = (i % 2) == 0 ? 0 : 2 - (i % 4);
		var dy = (i % 2) == 0 ? (i % 4) - 1 : 0;
		var options = {};
		this.onMove(dx, dy, options);
		return true;
	},

	// Returns the number of moves (up to the current state in history)
	getMoveCount: function () {
		return this.moveCount;
	},

	// Returns the move history log (with an internal encoding convention)
	getMoveHistory: function () {
		return this.moveHistory;
	},

	// Returns the maze of this level
	getMaze: function () {
		return this.maze;
	},

	// Returns whether level is complete (all boxes on goals)
	isComplete: function () {
		return this.maze.hasAllBoxesOnGoals();
	},

	// Lifts a new key. Returns false if already available or invalid
	liftKey: function (target) {
		var key = target.getState();
		var allKeys = '([{\u00a1\u00bf';
		if (!allKeys.contains(key) || this.keys.contains(key))
			return false;
		this.keys += key;
		target.setState(' '); // allow to move
		return true;
	},

	// Returns a string with the codes of the lifted keys
	getKeys: function () {
		return this.keys;
	},

	// Sets the lifted keys (string with key codes)
	setKeys: function (keys) {
		this.keys = keys;
	},

	// Moves the sprite to a free tile adjacent to the first one with
	// the given state code (case insensitive comparison)
	setSpriteCloseTo: function (state) {
		if (!state) return;
		var tile = this.maze.findTile(state);
		if (!tile) return;
		var target = null;
		for (var i = 0; i < 4; i++) {
			var dx = (i % 2) == 0 ? 0 : 2 - i;
			var dy = (i % 2) == 0 ? i - 1 : 0;
			target = this.maze.getTile(tile.x + dx, tile.y + dy);
			if (target && ' .'.contains(target.getState())) {
				this.spriteTile.moveTo(target);
				this.spriteTile = target;
				return true;
			}
		}
		return false;
	},

	// Opens a door that blocks the sprite's way. Returns false if
	// the door is invalid or the sprite hasn't got the key for it.
	openDoor: function (target) {
		var door = target.getState();
		var key = '([{\u00a1\u00bf'.charAt(')]}!?'.indexOf(door));
		if (!key || !this.keys.contains(key))
			return false;
		this.keys = this.keys.replace(key, '');
		target.setState(' '); // allow to move
		return true;
	},

	// NOTE: the remaining are convenience methods to override in
	// particular implementations that extend this generic class.

	onStep: function (sprite, target, options) {
	},

	onPush: function (sprite, target, options) {
	},

	onExit: function (mazeName) {
	}

});

/*
 * Class: SokobanMaze
 * ------------------
 * Represents a maze (board of tiles) for a sokoban game.
 */
SokobanMaze = new Class({

	// Constructor
	// mazeData is an array of string that determines tile states
	initialize: function (mazeData) {
		this.container = undefined; // DOM container element
		// decode maze data into an array of rows if it is a string
		if ($type(mazeData) == 'string') {
			mazeData = this.decodeMazeDataString(mazeData);
		}
		// set dimensions
		this.width = 0;
		this.height = mazeData.length;
		mazeData.each(function (row) {
			if (row.length > this.width)
				this.width = row.length;
		}.bind(this));
		// matrix setup and rendering
		this.matrix = new Array();
		mazeData.each(this.loadRow.bind(this));
	},

	// Private method. Decodes a maze data string into an array of rows
	// Read more about sokoban string encoding standards at:
	// http://sokobano.de/wiki/index.php?title=Level_format
	decodeMazeDataString: function (mazeData) {
		mazeData = mazeData.replace(/-/g, ' ');
		mazeData = mazeData.replace(/_/g, ' ');
		mazeData = mazeData.replace(/\|/g, '\n');
		var re = new RegExp('\\d+.', 'g');
		while (re.test(mazeData)) {
			var m = RegExp.lastMatch;
			var n = parseInt(m.substring(0, m.length - 1));
			var c = m.substring(m.length - 1);
			var s = '';
			for (var i = 0; i < n; i++)
				s += c;
			mazeData = mazeData.replace(m, s);
		}
		return mazeData.split('\n');
	},

	// Private method. Loads a row into the matrix of tiles of the maze
	loadRow: function(row) {
		for (var i = 0; i < row.length; i++) {
			this.appendTile(row.charAt(i));
		}
		for (; i < this.width; i++) {
			this.appendTile(' ');
		}
	},

	// Appends a new tile with the given state to the maze matrix
	appendTile: function (state) {
		var index = this.matrix.length;
		var x = index % this.width;
		var y = Math.floor(index / this.width);
		var tile = new SokobanTile(state, x, y);
		this.matrix.push(tile);
		return tile;
	},

	// Renders the maze in a container DOM element
	render: function (container) {
		this.container = $(container);
		this.container.empty();
		this.matrix.each(this.renderTile.bind(this));
		if (this.hasAllBoxesOnGoals()) {
			this.openExitDoors();
		} else {
			this.closeExitDoors();
		}
	},

	// Renders a single tile of the maze (override to customize)
	renderTile: function (tile) {
		var className = tile.getClassName();
		var el = new Element('div', {'class': className});
		el.inject(this.container);
		if (tile.x == 0)
			el.addClass('clear'); // TODO: hard-coded
		tile.setElement(el);
		return el;
	},

	// Detaches elements attached on rendering and empties the container
	hide: function () {
		this.matrix.each(function (tile) {
			tile.setElement(undefined);
		});
		if (this.container) {
			this.container.empty();
			this.container = undefined;
		}
	},

	// Returns the tile at the given (x, y) coordinates of the maze matrix
	getTile: function (x, y) {
		var i = x + y * this.width;
		var isValidIndex = (i >= 0 && i < this.matrix.length);
		return (isValidIndex ? this.matrix[i] : null);
	},

	// Returns the tile where the sprite is located
	getSpriteTile: function () {
		for (var i = 0; i < this.matrix.length; i++) {
			if (this.matrix[i].isSpriteTile())
				return this.matrix[i];
		}
		return null;
	},

	// Finds the first tile with the given state code (case insensitive)
	findTile: function (state) {
		state = (state + '').toLowerCase();
		for (var i = 0; i < this.matrix.length; i++) {
			if (this.matrix[i].getState().toLowerCase() == state)
				return this.matrix[i];
		}
		return null;
	},

	// Returns whether all boxes in the maze are on the goal tiles
	hasAllBoxesOnGoals: function () {
		for (var i = 0; i < this.matrix.length; i++) {
			if (this.matrix[i].getState() == '$')
				return false;
		}
		return true;
	},

	// Opens all exit doors (those with upper case state codes)
	openExitDoors: function () {
		var uppercase = /^[A-Z]$/g;
		for (var i = 0; i < this.matrix.length; i++) {
			if (this.matrix[i].getState().test(uppercase))
				this.matrix[i].setExitDoorClosed(false);
		}
	},

	// Closes all exit doors (those with upper case state codes)
	closeExitDoors: function () {
		var uppercase = /^[A-Z]$/g;
		for (var i = 0; i < this.matrix.length; i++) {
			if (this.matrix[i].getState().test(uppercase))
				this.matrix[i].setExitDoorClosed(true);
		}
	}

});

/*
 * Class: SokobanTile
 * ------------------
 * Represents the unit of the matrix of a sokoban maze.
 */
SokobanTile = new Class({

	// Maps tile state codes to style classes (override to customize)
	TILE_CLASS_MAPPING: {
		'#': 'wall',
		' ': 'floor',
		'@': 'sprite',
		'$': 'box',
		'.': 'goal',
		'+': 'sprite-on-goal',
		'*': 'box-on-goal',
		'(': 'red-key',
		'[': 'green-key',
		'{': 'blue-key',
		'\u00a1': 'yellow-key',
		'\u00bf': 'violet-key',
		')': 'red-door',
		']': 'green-door',
		'}': 'blue-door',
		'!': 'yellow-door',
		'?': 'violet-door',
		'closed': 'closed',
		'default': 'door'
	},

	// Constructor
	// state is the initial state of the tile
	// x, y are the coordinates of the tile in the maze
	// element (optional) is the DOM element that renders the tile
	// NOTE: x, y are public read-only instance variables
	initialize: function (state, x, y, element) {
		this.state = state;
		this.x = x;
		this.y = y;
		this.element = element;
	},

	// Sets the DOM element that renders the tile
	setElement: function (element) {
		this.element = element;
	},

	// Returns the style class name for the current state of the tile
	getClassName: function () {
		return this.TILE_CLASS_MAPPING[this.state]
				|| this.TILE_CLASS_MAPPING['default'];
	},

	// Updates the state of the tile (and sets style class accordingly)
	setState: function (state) {
		this.element.removeClass(this.getClassName());
		this.state = state;
		this.element.addClass(this.getClassName());
	},

	// Returns the state of the tile
	getState: function () {
		return this.state;
	},

	// Adds or removes 'closed' style class on the DOM element of the tile
	setExitDoorClosed: function (closed) {
		var className = this.TILE_CLASS_MAPPING['closed'];
		if (closed) {
			this.element.addClass(className);
		} else {
			this.element.removeClass(className);
		}
	},

	// Returns whether the sprite is located at this tile
	isSpriteTile: function () {
		return (this.state == '@' || this.state == '+');
	},

	// Makes the transition between this tile (where the sprite is
	// originally located) to the tile where it moves to.
	// Fails if the tile states are not consistent with game rules.
	moveTo: function (tile) {
		var map = {
			'@ ': ' @',
			'@.': ' +',
			'+ ': '.@',
			'+.': '.+',
			'$ ': ' $',
			'$.': ' *',
			'* ': '.$',
			'*.': '.*'
		};
		var t = map[this.state + tile.state];
		if (!t) throw 'Unknown transition from state "' + this.state
				+ '" to state "' + tile.state + '" state';
		this.setState(t.charAt(0));
		tile.setState(t.charAt(1));
	}

});
