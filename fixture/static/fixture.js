$(document).ready(function () {
	Fixture.bootstrap();
	$.ajaxSetup({'cache': true});
	$.getScript('//connect.facebook.net/en_US/all.js', function() {
		FB.init({
			'appId': '181581748697602',
			'xfbml': true,
			'cookie': true,
			'version': 'v2.0'
		});
		FB.getLoginStatus(onLogin);
	});
	//$.getScript('https://apis.google.com/js/platform.js');
	//$.getScript('//platform.twitter.com/widgets.js');
});

var onLogin = function (response) {
	if (response.status === 'connected') {
		// Logged into your app and Facebook.
		Fixture.userId = FB.getUserID();
		Fixture.load();
		FB.Canvas.setSize();
	} else if (response.status === 'not_authorized') {
		// The person is logged into Facebook, but not your app.
		FB.login(onLogin);
	} else {
		// The person is not logged into Facebook, so we're not sure if
		// they are logged into this app or not.
		FB.login(onLogin);
	}
};

var newElem = function (tagname, attributes) {
	return $(document.createElement(tagname)).attr(attributes || {});
};

var getCookie = function (key) {
        var m = document.cookie.match('(?:^|;\\s*)'+ key +'=(.*?)(?:;|$)');
        return (m ? decodeURIComponent(m[1]) : null);
};

var getParameterByName = function (name) {
	//name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	var results = regex.exec(location.search);
	return (results == null ? ""
		: decodeURIComponent(results[1].replace(/\+/g, " ")));
}

var Fixture = {};

Fixture.userId = null;

Fixture.data = (typeof userDataBase != 'undefined' ? userDataBase : {});

Fixture.results = [
	["BRA", "CRO", 3, 1],
	["MEX", "CMR", 1, 0],
	["ESP", "NED", 1, 5],
	["CHI", "AUS", 3, 1],
	["COL", "GRE", 3, 0],
	["CIV", "JPN", 2, 1],
	["URU", "CRC", 1, 3],
	["ENG", "ITA", 1, 2],
	["SUI", "ECU", 2, 1],
	["FRA", "HON", 3, 0],
	["ARG", "BIH", 2, 1],
	["IRN", "NGA", 0, 0],
	["GER", "POR", 4, 0],
	["GHA", "USA", 1, 2],
	["BEL", "ALG", 2, 1],
	["RUS", "KOR", 1, 1],
	["BRA", "MEX", 0, 0],
	["CMR", "CRO", 0, 4],
	["AUS", "NED", 2, 3],
	["ESP", "CHI", 0, 2],
	["COL", "CIV", 2, 1],
	["JPN", "GRE", 0, 0],
	["URU", "ENG", 2, 1],
	["ITA", "CRC", 0, 1],
	["SUI", "FRA", 2, 5],
	["HON", "ECU", 1, 2],
	["ARG", "IRN", 1, 0],
	["NGA", "BIH", 1, 0],
	["GER", "GHA", 2, 2],
	["USA", "POR", 2, 2],
	["BEL", "RUS", 1, 0],
	["KOR", "ALG", 2, 4],
	["CMR", "BRA", 1, 4],
	["CRO", "MEX", 1, 3],
	["AUS", "ESP", 0, 3],
	["NED", "CHI", 2, 0],
	["JPN", "COL", 1, 4],
	["GRE", "CIV", 2, 1],
	["ITA", "URU", 0, 1],
	["CRC", "ENG", 0, 0],
	["HON", "SUI", 0, 3],
	["ECU", "FRA", 0, 0],
	["NGA", "ARG", 2, 3],
	["BIH", "IRN", 3, 1],
	["USA", "GER", 0, 1],
	["POR", "GHA", 2, 1],
	["ALG", "RUS", 1, 1],
	["KOR", "BEL", 0, 1],
	
	["BRA", "CHI", 2, 1],
	["COL", "URU", 2, 0],
	["NED", "MEX", 2, 1],
	["CRC", "GRE", 2, 1],
	["FRA", "NGA", 2, 0],
	["GER", "ALG", 2, 1],
	["ARG", "SUI", 1, 0],
	["BEL", "USA", 2, 1],
	
	["BRA", "COL", 2, 1],
	["FRA", "GER", 0, 1],
	["NED", "CRC", 1, 0],
	["ARG", "BEL", 1, 0],
	
	["BRA", "GER", 1, 7],
	["NED", "ARG", 0, 1],
	
	["BRA", "NED", 0, 3],
	["GER", "ARG", 1, 0]
];

Fixture.matches = [
	["BRA", "CRO", "12 Jun 2014", "17:00", "S\u00e3o Paulo"],
	["MEX", "CMR", "13 Jun 2014", "13:00", "Natal"],
	["ESP", "NED", "13 Jun 2014", "16:00", "Salvador"],
	["CHI", "AUS", "13 Jun 2014", "18:00", "Cuiab\u00e1"],
	["COL", "GRE", "14 Jun 2014", "13:00", "Belo Horizonte"],
	["CIV", "JPN", "14 Jun 2014", "22:00", "Recife"],
	["URU", "CRC", "14 Jun 2014", "16:00", "Fortaleza"],
	["ENG", "ITA", "14 Jun 2014", "18:00", "Manaus"],
	["SUI", "ECU", "15 Jun 2014", "13:00", "Bras\u00edlia"],
	["FRA", "HON", "15 Jun 2014", "16:00", "Porto Alegre"],
	["ARG", "BIH", "15 Jun 2014", "19:00", "Rio de Janeiro"],
	["IRN", "NGA", "16 Jun 2014", "16:00", "Curitiba"],
	["GER", "POR", "16 Jun 2014", "13:00", "Salvador"],
	["GHA", "USA", "16 Jun 2014", "19:00", "Natal"],
	["BEL", "ALG", "17 Jun 2014", "13:00", "Belo Horizonte"],
	["RUS", "KOR", "17 Jun 2014", "18:00", "Cuiab\u00e1"],
	["BRA", "MEX", "17 Jun 2014", "16:00", "Fortaleza"],
	["CMR", "CRO", "18 Jun 2014", "18:00", "Manaus"],
	["AUS", "NED", "18 Jun 2014", "13:00", "Rio de Janeiro"],
	["ESP", "CHI", "18 Jun 2014", "16:00", "Porto Alegre"],
	["COL", "CIV", "19 Jun 2014", "13:00", "Bras\u00edlia"],
	["JPN", "GRE", "19 Jun 2014", "19:00", "Natal"],
	["URU", "ENG", "19 Jun 2014", "16:00", "S\u00e3o Paulo"],
	["ITA", "CRC", "20 Jun 2014", "13:00", "Recife"],
	["SUI", "FRA", "20 Jun 2014", "16:00", "Salvador"],
	["HON", "ECU", "20 Jun 2014", "19:00", "Curitiba"],
	["ARG", "IRN", "21 Jun 2014", "13:00", "Belo Horizonte"],
	["NGA", "BIH", "21 Jun 2014", "18:00", "Cuiab\u00e1"],
	["GER", "GHA", "21 Jun 2014", "16:00", "Fortaleza"],
	["USA", "POR", "22 Jun 2014", "18:00", "Manaus"],
	["BEL", "RUS", "22 Jun 2014", "13:00", "Rio de Janeiro"],
	["KOR", "ALG", "22 Jun 2014", "16:00", "Porto Alegre"],
	["CMR", "BRA", "23 Jun 2014", "17:00", "Bras\u00edlia"],
	["CRO", "MEX", "23 Jun 2014", "17:00", "Recife"],
	["AUS", "ESP", "23 Jun 2014", "13:00", "Curitiba"],
	["NED", "CHI", "23 Jun 2014", "13:00", "S\u00e3o Paulo"],
	["JPN", "COL", "24 Jun 2014", "16:00", "Cuiab\u00e1"],
	["GRE", "CIV", "24 Jun 2014", "17:00", "Fortaleza"],
	["ITA", "URU", "24 Jun 2014", "13:00", "Natal"],
	["CRC", "ENG", "24 Jun 2014", "13:00", "Belo Horizonte"],
	["HON", "SUI", "25 Jun 2014", "16:00", "Manaus"],
	["ECU", "FRA", "25 Jun 2014", "17:00", "Rio de Janeiro"],
	["NGA", "ARG", "25 Jun 2014", "13:00", "Porto Alegre"],
	["BIH", "IRN", "25 Jun 2014", "13:00", "Salvador"],
	["USA", "GER", "26 Jun 2014", "13:00", "Recife"],
	["POR", "GHA", "26 Jun 2014", "13:00", "Bras\u00edlia"],
	["ALG", "RUS", "26 Jun 2014", "17:00", "S\u00e3o Paulo"],
	["KOR", "BEL", "26 Jun 2014", "17:00", "Curitiba"],
	["1A", "2B", "28 Jun 2014", "13:00", "Belo Horizonte"],
	["1C", "2D", "28 Jun 2014", "17:00", "Rio de Janeiro"],
	["1B", "2A", "29 Jun 2014", "13:00", "Fortaleza"],
	["1D", "2C", "29 Jun 2014", "17:00", "Recife"],
	["1E", "2F", "30 Jun 2014", "13:00", "Bras\u00edlia"],
	["1G", "2H", "30 Jun 2014", "17:00", "Porto Alegre"],
	["1F", "2E", "01 Jul 2014", "13:00", "S\u00e3o Paulo"],
	["1H", "2G", "01 Jul 2014", "17:00", "Salvador"],
	["W49", "W50", "04 Jul 2014", "17:00", "Fortaleza"],
	["W53", "W54", "04 Jul 2014", "13:00", "Rio de Janeiro"],
	["W51", "W52", "05 Jul 2014", "17:00", "Salvador"],
	["W55", "W56", "05 Jul 2014", "13:00", "Bras\u00edlia"],
	["W57", "W58", "08 Jul 2014", "17:00", "Belo Horizonte"],
	["W59", "W60", "09 Jul 2014", "17:00", "S\u00e3o Paulo"],
	["L61", "L62", "12 Jul 2014", "17:00", "Bras\u00edlia"],
	["W61", "W62", "13 Jul 2014", "16:00", "Rio de Janeiro"]
];

Fixture.bootstrap = function () {
	// setup panels
	$('.panel').hide();
	var href = 'javascript:void(0);';
	var save = newElem('a', {'class': 'action', 'id': 'save'});
	save.attr('href', href).text('Save');
	var anchor = newElem('a', {'class': 'action'}).text('Challenge them!');
	anchor.click(Fixture.sendAppRequest);
	var s = "Invite friends that haven't made a prediction yet: ";
	var t = "I'm too lazy to fill in all the scores... ";
	var u = 'Auto-complete some random results';
	var v = 'Clear all results';
	var w = 'Go back';
	/*
	var autofill = newElem('a', {'href': href}).text(u);
	autofill.click(function () {
		Fixture.random();
		$('.autofill').hide();
		$('.reset').show();
	});
	var clear = newElem('a', {'href': href}).text(v);
	clear.click(function () {
		$('.score').val('');
		Fixture.update();
		$('.autofill').show();
		$('.reset').hide();
	});
	*/
	var back = newElem('a', {'class': 'back', 'href': href}).text(w);
	back.addClass('action');
	$('#fixture').append(
		// newElem('p', {'class': 'controls'}).text(s).append(anchor),
		//Fixture.renderSecondStage(),
		//Fixture.renderGroupsStage(),
		//newElem('p', {'class': 'autofill'}).text(t).append(autofill),
		//newElem('p', {'class': 'reset'}).append(clear).hide(),
		//newElem('p', {'class': 'controls'}).append(save),
		//newElem('p', {'id': 'status'})
		Fixture.renderChallenge('-global')
	);
	$('#challenge').show();
	$('#challenge-tab').addClass('tab-on');
	$('#challenge').append(Fixture.renderChallenge(''));
	$('#details').hide().append(
		newElem('p', {'class': 'controls'}).append(back),
		newElem('p', {'class': 'controls friend-name'}).text(' '),
		Fixture.renderSecondStage(),
		Fixture.renderGroupsStage(),
		newElem('p', {'class': 'controls'}).append(back.clone())
	);
	$('body').append(newElem('span', {'id': 'tooltip'}).hide());

	// event handlers
	$('.score').change(function () {
		var score = $(this);
		var n = parseInt(score.val());
		score.val(isNaN(n) ? '' : Math.abs(n).toString());

		Fixture.validateScore(score);
		Fixture.update();
	});
	//$('#save').click(Fixture.submit);
	$('.tabs li a').click(function (e) {
		$('.panel').hide();
		$('#' + e.target.id.split('-')[0]).show();
		$('.tabs li a').removeClass('tab-on');
		$(e.target).addClass('tab-on');
	});
	$('.back').click(function () {
		$('#details').slideUp(400, function () {
			$('body').scrollTop(0);
			if ($('#fixture-tab').hasClass('tab-on'))
				$('#fixture').slideDown();
			if ($('#challenge-tab').hasClass('tab-on'))
				$('#challenge').slideDown();
		});
	});

	/*
	// mobile hack
	var re = new RegExp('Android|webOS|iPhone|iPad|iPod|'
			+ 'BlackBerry|IEMobile|Opera Mini', 'i');
	if (window.navigator && re.test(window.navigator.userAgent) ) {
		$('.score').attr('type', 'number');
	}
	*/
};

Fixture.validateScore = function (score) {
	var index = parseInt(score.data('match'));
	if (!Fixture.isTimeUp(index)) return;
	score.val(''); // TODO
	var team = parseInt(score.data('team'));
	var userId = Fixture.userId;
	if (!isNaN(index) && Fixture.data && Fixture.data[userId]) {
		var fixture = Fixture.data[userId];
		var r = fixture.prediction[index];
		if (r && r.length == 4) {
			if (r[2] != null && team == 0) score.val(r[2]);
			if (r[3] != null && team == 1) score.val(r[3]);
		}
	}
};

Fixture.random = function () {
	$('.score').each(function (i, e) {
		var min = 0; var max = 2;
		var n = parseInt(this.value);
		var r = Math.floor(Math.random() * (max - min + 1)) + min;
		this.value = (isNaN(n) ? r : Math.abs(n).toString());
	});
	Fixture.update();
};

Fixture.renderGroupsStage = function () {
	var stage = newElem('div', {'class': 'groups-stage'});
	for (var i = 0; i < 8; i++) {
		var div = newElem('div', {'class': 'group-matches'});
		var groupname = String.fromCharCode('A'.charCodeAt(0) + i);
		var p = newElem('p', {'class': 'label'});
		div.append(
			p.text('GROUP ' + groupname),
			Fixture.renderMatch(2 * i + 0),
			Fixture.renderMatch(2 * i + 1),
			Fixture.renderMatch(2 * i + 16),
			Fixture.renderMatch(2 * i + 17),
			Fixture.renderMatch(2 * i + 32),
			Fixture.renderMatch(2 * i + 33)
		);
		stage.append(div);
	}
	return stage;
};

Fixture.renderMatch = function (index) {
	var m = Fixture.matches[index];
	var noflag = 'static/img/null.png';
	var flag1 = newElem('img', {'class': 'flag', 'src': noflag});
	var flag2 = newElem('img', {'class': 'flag', 'src': noflag});
	var trigram1 = newElem('div', {'class': 'trigram'}).text('?');
	var trigram2 = newElem('div', {'class': 'trigram'}).text('?');
	if (index < 48) {
		Fixture.setTeam(m[0], flag1, trigram1);
		Fixture.setTeam(m[1], flag2, trigram2);
	}
	var team1 = newElem('div', {'class': 'team'});
	var team2 = newElem('div', {'class': 'team'});
	var c = (index < 48 || index >= 62);
	var left = [48, 49, 52, 53, 56, 57, 60].indexOf(index) == -1;
	team1.append(flag1, trigram1).addClass(c || left ? 'left' : 'right');
	team2.append(flag2, trigram2).addClass(!c && left ? 'left' : 'right');
	var score1 = newElem('input', {'class': 'score'});
	var score2 = newElem('input', {'class': 'score'});
	score1.attr('tabindex', (index < 48 ? 1 : (index - 48) * 2 + 2));
	score2.attr('tabindex', (index < 48 ? 1 : (index - 48) * 2 + 3));
	score1.data('match', index).data('team', 0);
	score2.data('match', index).data('team', 1);
	if (Fixture.isTimeUp(index)) {
		score1.attr('disabled', 'disabled').addClass('past');
		score2.attr('disabled', 'disabled').addClass('past');
	}
	var scores = newElem('div', {'class': 'scoreboard'});
	scores.append(score1, ' - ', score2);
	var match = newElem('div', {'class': 'match match-' + index});
	/*
	match.hover(function () {
		$('#tooltip').html('Match #' + (index + 1));
		var offset = $(this).offset();
		var width = $(this).outerWidth();
		var height = $(this).outerHeight();
		var w = $('#tooltip').outerWidth();
		$('#tooltip').finish().css({
			'top': offset.top + height + 2,
			'left': offset.left + (width - w) / 2
		}).fadeIn(200);
	}, function(){
		$('#tooltip').finish().fadeOut(100);
	});
	*/
	var loc = newElem('div', {'class': 'location'}).append(
		'#' + (index + 1) + ': ' + m[4],
		newElem('br'),
		m[2] + ', ' + m[3]
	);
	return (index < 48 ? newElem('a', {'class': 'row'}).append(
		loc, match.append(team1, scores, team2)
	) : match.append(team1, scores, team2).hover(function () {
		var round = (index < 48 + 8 ? 'Round of 16' :
			(index < 48 + 8 + 4 ? 'Quarter-finals' :
			(index < 48 + 8 + 4 + 2 ? 'Semi-finals' :
			(index == 62 ? '3rd place playoff' : 'Final'))));
		var t = 'Match #' + (index + 1) + ' (' + round + '): '
			+ m[4] + ', ' + m[2] + ', ' + m[3]
		$('.match-info').css('visibility', 'visible').text(t);
	}, function () {
		$('.match-info').css('visibility', 'hidden');
	}));
};

Fixture.renderSecondStage = function () {
	var stage = newElem('div', {'class': 'second-stage'});

	stage.append(newElem('p', {'class': 'label'}).text('KNOCKOUT STAGE'));

	stage.append(newElem('div', {'class': 'round-of-16'}).append(
		Fixture.renderMatch(6 * 8 + 0),
		Fixture.renderMatch(6 * 8 + 1),
		Fixture.renderMatch(6 * 8 + 4),
		Fixture.renderMatch(6 * 8 + 5)
	));

	stage.append(newElem('div', {'class': 'quarters'}).append(
		Fixture.renderMatch(6 * 8 + 8 + 0),
		Fixture.renderMatch(6 * 8 + 8 + 1)
	));

	stage.append(newElem('div', {'class': 'semifinals'}).append(
		Fixture.renderMatch(6 * 8 + 8 + 4 + 0)
	));

	stage.append(newElem('div', {'class': 'finals'}).append(
		Fixture.renderMatch(6 * 8 + 8 + 4 + 2 + 1),
		Fixture.renderMatch(6 * 8 + 8 + 4 + 2 + 0)
	));

	stage.append(newElem('div', {'class': 'semifinals'}).append(
		Fixture.renderMatch(6 * 8 + 8 + 4 + 1)
	));

	stage.append(newElem('div', {'class': 'quarters'}).append(
		Fixture.renderMatch(6 * 8 + 8 + 2),
		Fixture.renderMatch(6 * 8 + 8 + 3)
	));

	stage.append(newElem('div', {'class': 'round-of-16'}).append(
		Fixture.renderMatch(6 * 8 + 2),
		Fixture.renderMatch(6 * 8 + 3),
		Fixture.renderMatch(6 * 8 + 6),
		Fixture.renderMatch(6 * 8 + 7)
	));

	stage.append(newElem('p', {'class': 'match-info'}).css(
			'visibility', 'hidden').text('Knockout stage'));

	return stage;
};

Fixture.setTeam = function (team, flag, trigram) {
	var src = (team ? team.toLowerCase() + '.png' : 'null.png');
	$(flag).attr('src', 'static/img/' + src);
	$(trigram).text(team ? team : '?');
};

Fixture.update = function () {
	var rankings = {};
	for (var i = 0; i < 8; i++) {
		var groupname = String.fromCharCode('A'.charCodeAt(0) + i);
		rankings[groupname] = Fixture.rankGroupResults([
			Fixture.getGroupsMatchStats(2 * i + 0),
			Fixture.getGroupsMatchStats(2 * i + 1),
			Fixture.getGroupsMatchStats(2 * i + 16),
			Fixture.getGroupsMatchStats(2 * i + 17),
			Fixture.getGroupsMatchStats(2 * i + 32),
			Fixture.getGroupsMatchStats(2 * i + 33)
		]);
	}
	for (var i = 6 * 8; i < 6 * 8 + 8; i++) {
		Fixture.updateRoundOf16Match(rankings, i);
	}
	for (var i = 6 * 8 + 8; i < 64; i++) {
		Fixture.updateQualifyingMatch(i);
	}
};

Fixture.rankGroupResults = function (matchResults) {
	var stats = {};
	for (var i = 0; i < matchResults.length; i++) {
		for (var j = 0; j < matchResults[i].length; j++) {
			var r = matchResults[i][j];
			if (!stats[r.team]) {
				stats[r.team] = {
					'team': r.team,
					'points': 0,
					'goaldiff': 0,
					'goalcount': 0,
					'tie': false
				};
			}
			stats[r.team].points += r.points;
			stats[r.team].goalcount += r.goalcount;
			stats[r.team].goaldiff += r.goaldiff;
		}
	}
	var ranking = [];
	for (var i in stats) {
		ranking.push(stats[i]);
	}
	ranking.sort(function (a, b) {
		if (a.points != b.points)
			return b.points - a.points;
		if (a.goaldiff != b.goaldiff)
			return b.goaldiff - a.goaldiff;
		if (a.goalcount != b.goalcount)
			return b.goalcount - a.goalcount;
		a.tie = b.tie = true;
		// TODO: tie-breaker rules "between the teams concerned"
		return a.team.localeCompare(b.team);
	});
	return ranking;
};

Fixture.getGroupsMatchStats = function (index) {
	var r = Fixture.getMatchResult(index);
	if (!r) return [];
	var score1 = r[2];
	var score2 = r[3];
	var scorecmp = function (infavor, against) {
		return (infavor > against ? 3 : (infavor == against ? 1 : 0));
	};
	return [{
		'team': Fixture.matches[index][0],
		'points': scorecmp(score1, score2),
		'goaldiff': score1 - score2,
		'goalcount': score1
	}, {
		'team': Fixture.matches[index][1],
		'points': scorecmp(score2, score1),
		'goaldiff': score2 - score1,
		'goalcount': score2
	}];
};

Fixture.updateRoundOf16Match = function(rankings, index) {
	var m = Fixture.matches[index];
	var group1 = rankings[m[0].substr(-1)];
	var group2 = rankings[m[1].substr(-1)];
	var team1 = (group1.length == 4 ? group1[0].team : null);
	var team2 = (group2.length == 4 ? group2[1].team : null);
	Fixture.setMatchResult(index, team1, team2);
};

Fixture.updateQualifyingMatch = function (index) {
	var m = Fixture.matches[index];
	var team1 = Fixture.getQualifier(m[0]);
	var team2 = Fixture.getQualifier(m[1]);
	Fixture.setMatchResult(index, team1, team2);
};

Fixture.getQualifier = function (key) {
	var isWinnerRequest = (key[0] == 'W' ? true : false);
	var index = parseInt(key.substr(1)) - 1;
	var r = Fixture.getMatchResult(index);
	if (!r) return null;
	var score1 = r[2];
	var score2 = r[3];
	if (score1 > score2) return (isWinnerRequest ? r[0] : r[1]);
	if (score2 > score1) return (isWinnerRequest ? r[1] : r[0]);
	return null;
};

Fixture.submit = function () {
	/*
	var userId = Fixture.userId;
	if (!userId) {
		var message = 'Unknown user. Facebook login required.';
		$('#status').text(message).addClass('error');
		return null;
	}
	Fixture.update();
	$('#status').text('');
	var results = [];
	for (var i = 0; i < 64; i++) {
		var r  = Fixture.getMatchResult(i);
		results.push(r);
	}
	var payload = {
		'user_id': Fixture.userId,
		'prediction': JSON.stringify(results),
		'signed_request': FB.getAuthResponse().signedRequest
	};
	var onSuccess = function (data) {
		Fixture.setLastSaved(data.timestamp);
	};
	var onError = function (jqXHR, textStatus, e) {
		var code = jqXHR.status;
		var message = 'Failed to save your prediction: ';
		if (code == 400) {
			message += 'Fixture is invalid or incomplete';
		} else if (code == 401 || code == 403) {
			message += 'User authentication failed';
		} else {
			message += 'Server cannot handle your request';
		}
		message += ' (HTTP ' + code + ' ' + jqXHR.statusText + ')';
		$('#status').text(message).addClass('error');
	};
	$.ajax({
		'type': 'POST',
		'url': '/fixture/api',
		'data': payload,
		'dataType': 'json',
		'success': onSuccess,
		'error': onError
	});
	return results;
	*/
};

Fixture.getMatchResult = function (index) {
	var match = $('#fixture .match-' + index);
	var scores = match.find('.score');
	var score1 = (scores.eq(0) ? parseInt($(scores.eq(0)).val()) : NaN);
	var score2 = (scores.eq(1) ? parseInt($(scores.eq(1)).val()) : NaN);
	if (isNaN(score1) || isNaN(score2)) return null;
	if (score1 < 0 || score2 < 0) return null;

	var team1 = Fixture.matches[index][0];
	var team2 = Fixture.matches[index][1];
	if (index >= 48) {
		var trigrams = $('#fixture .match-' + index + ' .trigram');
		team1 = (trigrams.eq(0) ? $(trigrams.eq(0)).text() : null);
		team2 = (trigrams.eq(1) ? $(trigrams.eq(1)).text() : null);
	}
	if (!team1 || !team2) return null;
	if (team1.length != 3 || team2.length != 3) return null;

	return [team1, team2, score1, score2];
};

Fixture.setMatchResult = function (index, team1, team2, score1, score2,
		isFriend, rank) {
	var panel = (isFriend ? '#details' : '#fixture');
	var match = $(panel + ' .match-' + index);
	var flags = match.find('.flag');
	var trigrams = match.find('.trigram');
	var scores = match.find('.score');

	if (index >= 6 * 8) {
		Fixture.setTeam(team1, flags.eq(0), trigrams.eq(0));
		Fixture.setTeam(team2, flags.eq(1), trigrams.eq(1));
	}
	if (isFriend) {
		scores.removeClass('exact guess fail')
		trigrams.removeClass('exact fail')
	}
	if (parseInt(score1) == score1) $(scores.eq(0)).val(score1);
	if (parseInt(score2) == score2) $(scores.eq(1)).val(score2);

	if (rank && index < Fixture.results.length && Fixture.results[index]) {
		var r = Fixture.results[index];
		var s = rank.matches[index];
		var isGuess = (s[0] != 0);
		var isExact = (s[1] != 0);

		if (index >= 6 * 8) {
			var c = (team1 == r[0] ? 'exact' : 'fail');
			if (r[0] != null) $(trigrams.eq(0)).addClass(c);
			var c = (team2 == r[1] ? 'exact' : 'fail');
			if (r[1] != null) $(trigrams.eq(1)).addClass(c);
		}

		if (r[2] != null && r[3] != null) {
			if (isExact) scores.addClass('exact');
			else if (isGuess) scores.addClass('guess');
			else scores.addClass('fail');
		}
		var msg = (isExact ? 'Exact guess! +3 points' : (isGuess
				? 'Result guess! +1 point'
				: 'No points earned'));
		var row = match.parent('.row');
		if (index < 6 * 8) row.hover(function () {
			var r = Fixture.results[index];
			row.find('.location').empty().append(
				'Actual result: ' + r[2] + ' - ' + r[3],
				newElem('br'),
				msg
			);
		}, function () {
			var m = Fixture.matches[index];
			row.find('.location').empty().append(
				'#' + (index + 1) + ': ' + m[4],
				newElem('br'),
				m[2] + ', ' + m[3]
			);
		});
	}
};

Fixture.load = function () {
	var userId = Fixture.userId;
	if (!userId) return false;
	/*
	$.getJSON('/fixture/api?user_ids=' + userId, function (data) {
		var fixture = data[userId];
		if (!fixture || !fixture.prediction) return;
		if (!Fixture.data) Fixture.data = {};
		Fixture.data[userId] = fixture;
		//$('.autofill').hide();
		//$('.reset').hide();
		Fixture.doLoad(fixture);
		Fixture.setLastSaved(fixture.timestamp);
		Fixture.update();
	});
	*/
	/*
	var fixture = Fixture.data[userId];
	if (fixture) {
		Fixture.doLoad(fixture);
		Fixture.setLastSaved(fixture.timestamp);
		Fixture.update();
	}
	*/

	FB.api('/v2.0/me/friends?fields=name,picture', Fixture.renderFriends);

	var onLoad = function (rows) {
		rows.sort(Fixture.rowCompare);
		for (var i = 0; i < rows.length; i++) {
			var id = $(rows[i]).attr('id').split('-')[1];
			Fixture.renderFriendStats(Fixture.data[id], rows[i]);
		}
		$('#leaderboard-global tbody').append(rows);
	};
	var rows = [];
	var uids = [
		"1037229780",
		"1556820465",
		"100002604420998",
		"1185566086",
		"702005268",
		"644139729",
		"1210843607",
		"572169698",
		"607746756",
		"1558017095",
		"1069504673",
		"620876500",
		"100003547311028",
		"100008025731734",
		"1423179652",
		"100000005526870",
		"100000049992875",
		"564411285",
		"1290256494",
		"724438643"
	];
	var pending = uids.length;
	for (var i = 0; i < uids.length; i++) {
		var qs = '?fields=name,picture';
		FB.api('/v2.0/' + uids[i] + qs, function (response) {
			rows.push(Fixture.renderFriendRow(response));
			if (--pending == 0) onLoad(rows);
		});
	}

	var requestIds = getParameterByName('request_ids').split(',');
	for (var i = 0; i < requestIds.length; i++) {
		if (!$.isNumeric(requestIds[i])) continue;
		var key = requestIds[i] + '_' + userId;
		FB.api(key, 'delete', function (response) {
			// console.log(response);
		});
	}
	return true;
};

Fixture.doLoad = function (fixture, isFriend) {
	$('#details .score').val('');
	$('#details .second-stage .trigram').text('?');
	$('#details .second-stage .flag').attr('src', 'static/img/null.png');
	if (!fixture) return;
	var rank = Fixture.evaluate(fixture);
	for (var i = 0; i < 64; i++) {
		var r = fixture.prediction[i];
		if (!r || r.length != 4) continue;
		Fixture.setMatchResult(i, r[0], r[1], r[2], r[3],
				isFriend, rank);
	}
};

Fixture.setLastSaved = function (timestamp) {
	if (timestamp) {
		var date = new Date(1000 * timestamp);
		$('#status').text('Last saved: ' + date); //prettyDate(date));
		$('#status').removeClass('error');
	}
};

Fixture.delete = function () {
	/*
	var userId = Fixture.userId;
	if (!userId) return false;
	var payload = {
		'user_id': userId,
		'signed_request': FB.getAuthResponse().signedRequest
	};
	var onSuccess = function (data) {
		console.log(data);
	};
	$.ajax({
		'type': 'DELETE',
		'url': '/fixture/api',
		'data': payload,
		'success': onSuccess
	});
	return true;
	*/
};

Fixture.renderChallenge = function (n) {
	var table = newElem('table', {'id': 'leaderboard' + n}).append(
		newElem('thead').append(newElem('tr').append(
			newElem('th').text('Leaderboard'),
			newElem('th').text('Final match prediction'),
			newElem('th').text('Total points'),
			newElem('th').text('')
		)),
		newElem('tbody')
	);
	return newElem('div', {'class': 'wrapper'}).append(table);
};

Fixture.sendAppRequest = function () {
	var t = "I bet you can't predict the World Cup better than me!";
	FB.ui({
		'method': 'apprequests',
		//'filters': ['app_non_users'],
		'message': t
	}, function (response) {
		// console.log(response);
	});
};

Fixture.sendPredictionRequest = function (userId) {
	var t = "Hurry up! Complete your World Cup prediction!";
	FB.ui({
		'method': 'apprequests',
		'to': userId,
		'message': t
	}, function (response) {
		// console.log(response);
	});
};

Fixture.rowCompare = function (a, b) {
	var cmp = function (a, b) {
		return (a ? 2 : 0) + (b ? 1 : 0);
	};
	var data = Fixture.data;
	var id1 = $(a).attr('id').split('-')[1];
	var id2 = $(b).attr('id').split('-')[1];
	var r1 = Fixture.evaluate(data[id1]).points;
	var r2 = Fixture.evaluate(data[id2]).points;
	if (r1 != r2) return (r2 - r1);
	var b = cmp(data[id1], data[id2]);
	if (b == 3) {
		var p1 = data[id1].prediction;
		var p2 = data[id2].prediction;
		var b = cmp(p1 ? p1[63] : 0, p2 ? p2[63] : 0);
		if (b == 3 || b == 0) {
			var t1 = data[id1].timestamp;
			var t2 = data[id2].timestamp;
			return t1 - t2;
		} else {
			return (b == 2 ? -1 : 1);
		}
	} else if (b == 0) {
		return parseInt(id1) - parseInt(id2);
	}
	return (b == 2 ? -1 : 1);
};

Fixture.renderFriends = function (response) {
	var friends = (response ? response.data : []);
	FB.api('/v2.0/me?fields=name,picture', function (me) {
		if (me) friends.unshift(me);
		Fixture.renderFriendsHelper(friends);
	});
};

Fixture.renderFriendsHelper = function (friends) {
	var uids = [];
	var rows = [];
	for (var i = 0; i < friends.length; i++) {
		var id = friends[i].id;
		if (Fixture.data[id]) {
			uids.push(id);
			rows.push(Fixture.renderFriendRow(friends[i]));
		}
	}
	/*
	$.getJSON('/fixture/api?user_ids=' + uids.join(','), function (data) {
		Fixture.data = data;
		rows.sort(Fixture.rowCompare);
		for (var i = 0; i < rows.length; i++) {
			var id = $(rows[i]).attr('id').split('-')[1];
			Fixture.renderFriendStats(data[id], rows[i]);
		}
		$('#leaderboard tbody').append(rows);
	});
	*/
	rows.sort(Fixture.rowCompare);
	for (var i = 0; i < rows.length; i++) {
		var id = $(rows[i]).attr('id').split('-')[1];
		Fixture.renderFriendStats(Fixture.data[id], rows[i]);
	}
	$('#leaderboard tbody').append(rows);
};

Fixture.renderFriendRow = function (friend, row) {
	var src = (friend.picture ? friend.picture.data.url : '');
	/*
	var anchor = newElem('a', {'href': 'javascript:void(0);'});
	anchor.click(function () {
		Fixture.sendPredictionRequest(friend.id);
	}).text('Ask your friend to make a prediction');
	*/
	var anchor = newElem('span').text('N/A');
	var more = newElem('a', {'href': 'javascript:void(0);'});
	more.click(function () {
		var panel = $('#challenge-tab').hasClass('tab-on')
				? '#challenge' : '#fixture';
		$(panel).slideUp(400, function () {
			Fixture.doLoad(Fixture.data[friend.id], true);
			$('#details .friend-name').empty().append(
				newElem('img', {'src': src}),
				newElem('span').text(friend.name)
			);
			$('#details').slideDown();
		});
	}).text('More details');
	return newElem('tr', {'id': 'user-' + friend.id}).append(
		newElem('td', {'class': 'friend-name'}).append(
			newElem('img', {'src': src}),
			newElem('span').text(friend.name)
		),
		newElem('td', {'class': 'friend-pred'}).append(anchor),
		newElem('td', {'class': 'total-points'}).text('0'),
		newElem('td', {'class': 'more-details'}).append(more)
	);
};

Fixture.renderFriendStats = function (fixture, row) {
	if (!fixture || !fixture.prediction) return;
	var flag = function (team) {
		var img = newElem('img', {'class': 'flag'});
		var src = (team ? team.toLowerCase() + '.png' : 'null.png');
		return img.attr('src', 'static/img/' + src);
	};
	var r = fixture.prediction[63];
	if (r && r.length == 4) {
		var s = r[0] + ' ' + r[2] + ' - ' + r[3] + ' ' + r[1];
		var td = $(row).find('.friend-pred').empty();
		td.append(flag(r[0]), newElem('span').text(s), flag(r[1]));
	}
	var rank = Fixture.evaluate(fixture);
	$(row).find('.total-points').text(rank.points);
};

Fixture.evaluate = function (fixture) {
	var rank = {'points': 0, 'matches': []};
	if (!fixture || !fixture.prediction) return rank;
	var ds = [3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 7];
	for (var i = 0; i < 64; i++) {
		rank.matches.push([0, 0, 0, 0]);
		var r = fixture.prediction[i];
		var s = Fixture.results[i];
		if (!r || r.length != 4 || !s || s.length != 4) continue;

		var q1 = q2 = 0;
		if (i >= 6 * 8 && i < 6 * 8 + 8) {
			if (r[0] == s[0]) q1 = 2;
			if (r[1] == s[1]) q2 = 2;
		}
		rank.matches[i] = [0, 0, q1, q2];
		rank.points += q1 + q2;

		if (s[2] == null || s[3] == null) continue;
		var diffr = (r[3] - r[2]) / Math.max(1, Math.abs(r[3] - r[2]));
		var diffs = (s[3] - s[2]) / Math.max(1, Math.abs(s[3] - s[2]));
		var w = e = 0;
		if (r[2] == s[2] && r[3] == s[3]) { // exact guess
			e = (i < 48 ? 2 : 3);
		}
		if (diffr == diffs) { // winner guess
			if (i < 48) {
				w = 1;
			} else {
				if (diffs < 0 && r[0] == s[0]) w = ds[i - 48];
				if (diffs > 0 && r[1] == s[1]) w = ds[i - 48];
			}
		}
		rank.matches[i] = [w, e, q1, q2];
		rank.points += w + e;
	}
	return rank;
};

Fixture.isTimeUp = function (index) {
	return Fixture.getTimeToMatch(index) < 3600000;
};

Fixture.getTimeToMatch = function (index) {
	var m = Fixture.matches[index];
	var date = m[2];
	var time = m[3];
	var tz = (["Cuiab\u00e1", "Manaus"].indexOf(m[4]) != -1 ? 4 : 3);
	var monthIndex = (date.substr(3, 3) == 'Jul' ? 6 : 5);
	var day = parseInt(date.substr(0, 2));
	var hour = parseInt(time.substr(0, 2));
	var min = parseInt(time.substr(3, 2));
	var timestamp = Date.UTC(2014, monthIndex, day, hour + tz, min, 0, 0);
	var now = new Date().getTime();
	return (timestamp - now);
};

/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 * //
function prettyDate(date){
	var diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);

	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
		return date.toDateString();

	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}
*/
