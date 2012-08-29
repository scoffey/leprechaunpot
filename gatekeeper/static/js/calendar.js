var CalendarMonthView = new Class({

	date: null,
	container: null,
	days: ['Domingo', 'Lunes', 'Martes', 'Miercoles',
			'Jueves', 'Viernes', 'Sabado'],
	months: ['Enero', 'Febrero', 'Marzo', 'Abril',
		'Mayo', 'Junio', 'Julio', 'Agosto',
		'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
	classes: {hover: 'hover'},

	initialize: function (date, container) {
		this.date = date || new Date();
		this.container = container || document.body;
		this.display();
	},

	display: function () {
		var year = this.date.getFullYear();
		var month = this.date.getMonth();

		// 1. header
		this.container.empty();

		var div = new Element('div').injectInside(this.container); // a wrapper div to help correct browser css problems with the caption element

		var caption = new Element('caption')
		var arrow = new Element('a').addEvents({'click': this.prev.bind(this)}).appendText('\u25C0');
		arrow.injectInside(caption);
		caption.appendText(' ' + this.months[month] + ' ' + year + ' ');
		var arrow = new Element('a').addEvents({'click': this.next.bind(this)}).appendText('\u25B6');
		arrow.injectInside(caption);
		var table = new Element('table').injectInside(div).adopt(caption);
				
		// 2. day names		
		var thead = new Element('thead').injectInside(table);

		var tr = new Element('tr').injectInside(thead);
		
		for (var i = 0; i <= 6; i++) {
			var th = this.days[i % 7];
			
			tr.adopt(new Element('th', { 'title': th }).appendText(th.substr(0, 1)));
		}

		// 3. day numbers
		var tbody = new Element('tbody').injectInside(table);
		var tr = new Element('tr').injectInside(tbody);

		var d = new Date(year, month, 1);
		var offset = d.getDay() % 7; // day of the week (offset)
		var last = new Date(year, month + 1, 0).getDate(); // last day of this month
		var prev = new Date(year, month, 0).getDate(); // last day of previous month
		//var active = this.value(cal); // active date (if set and within curr month)
		//var valid = [];//cal.days; // valid days for curr month
		//for (var i = 1; i <= last; i++) valid.push(i); 
		//var inactive = []; // active dates set by other calendars
		//var hilited = [];
		//var hilited = this.defaults.map(function (d) {return d[0] == cal.month ? d[1] : undefined;}).clean();
		var d = new Date();
		var today = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); // today obv 
		
		for (var i = 1; i < 43; i++) { // 1 to 42 (6 x 7 or 6 weeks)
			var day = i - offset;
			var date = new Date(year, month, day);
			
			if ((i - 1) % 7 == 0) {
				if (day > last) break;
				tr = new Element('tr').injectInside(tbody);
			} // each week is it's own table row

			var td = new Element('td').injectInside(tr);
						
			//var cls = '';
			
			//if (day === active) { cls = this.classes.active; } // active
			//else if (inactive.contains(day)) { cls = this.classes.inactive; } // inactive
			//else if (valid.contains(day)) { cls = this.classes.valid; } // valid
			//else if (day >= 1 && day <= last) { cls = this.classes.invalid; } // invalid

			//if (date.getTime() == today) { cls = cls + ' ' + this.classes.today; } // adds class for today

			//if (hilited.contains(day)) { cls = cls + ' ' + this.classes.hilite; } // adds class if hilited

			//td.addClass(cls);

//			if (valid.contains(day)) { // if it's a valid - clickable - day we add interaction
				td.setProperty('title', date.toString());//this.format(date, 'D M jS Y'));
				
				td.addEvents({
					'click': function(td, day, date) { 
						this.clicked(td, day, date); 
					}.pass([td, day, date], this),
					'mouseover': function(td, cls) { 
						td.addClass(cls); 
					}.pass([td, 'hover']),
					'mouseout': function(td, cls) { 
						td.removeClass(cls); 
					}.pass([td, 'hover'])
				});
//			}

			// pad calendar with last days of prev month and first days of next month
			if (day < 1) { day = prev + day; }
			else if (day > last) { day = day - last; }

			td.appendText(day);
		}
	},

	prev: function () {
		var m = this.date.getMonth() - 1;
		if (m < 0) {
			this.date.setMonth(11);
			this.date.setFullYear(this.date.getFullYear() - 1);
		} else {
			this.date.setMonth(m);
		}
		this.display();
	},

	next: function () {
		var m = this.date.getMonth() + 1;
		if (m > 11) {
			this.date.setMonth(0);
			this.date.setFullYear(this.date.getFullYear() + 1);
		} else {
			this.date.setMonth(m);
		}
		this.display();
	},

	clicked: function (td, day, date) {
		alert('Clicked ' + date.toString());
	} 

});
