$(document).ready(function () {

	/*
	$.ajaxSetup({'cache': true});
	$.getScript('//connect.facebook.net/en_US/all.js', function() {
		FB.init({
			'appId': '181581748697602',
			'xfbml': true,
			'version': 'v2.0'
		});
	});
	*/

	// setup panels
	$('.panel').hide();
	var save = newElem('a', {'class': 'action', 'id': 'save'}).text('Save');
	$('#fixture').append(
		Fixture.renderGroupsStage(),
		Fixture.renderSecondStage(),
		newElem('p', {'class': 'controls'}).append(save),
		newElem('p', {'id': 'status'})
	);
	Fixture.load();
	$('#fixture').show();
	$('#fixture-tab').addClass('tab-on');
	$('#guess').append(Fixture.renderGuesses());

	// event handlers
	$('.score').change(Fixture.update);
	$('#save').click(Fixture.submit);
	$('#debug').click(Fixture.random);
	$('.tabs li a').click(function (e) {
		$('.panel').hide();
		$('#' + e.target.id.split('-')[0]).show();
		$('.tabs li a').removeClass('tab-on');
		$(e.target).addClass('tab-on');
	});
});

var newElem = function (tagname, attributes) {
	return $(document.createElement(tagname)).attr(attributes || {});
};

var getCookie = function (key) {
        var m = document.cookie.match('(?:^|;\\s*)'+ key +'=(.*?)(?:;|$)');
        return (m ? decodeURIComponent(m[1]) : null);
};

var Fixture = {};

Fixture.matches = [
	['BRA', 'CRO'],
	['MEX', 'CMR'],
	['ESP', 'NED'],
	['CHI', 'AUS'],
	['COL', 'GRE'],
	['CIV', 'JPN'],
	['URU', 'CRC'],
	['ENG', 'ITA'],
	['SUI', 'ECU'],
	['FRA', 'HON'],
	['ARG', 'BIH'],
	['IRN', 'NGA'],
	['GER', 'POR'],
	['GHA', 'USA'],
	['BEL', 'ALG'],
	['RUS', 'KOR'],
	['BRA', 'MEX'],
	['CMR', 'CRO'],
	['AUS', 'NED'],
	['ESP', 'CHI'],
	['COL', 'CIV'],
	['JPN', 'GRE'],
	['URU', 'ENG'],
	['ITA', 'CRC'],
	['SUI', 'FRA'],
	['HON', 'ECU'],
	['ARG', 'IRN'],
	['NGA', 'BIH'],
	['GER', 'GHA'],
	['USA', 'POR'],
	['BEL', 'RUS'],
	['KOR', 'ALG'],
	['CMR', 'BRA'],
	['CRO', 'MEX'],
	['AUS', 'ESP'],
	['NED', 'CHI'],
	['JPN', 'COL'],
	['GRE', 'CIV'],
	['ITA', 'URU'],
	['CRC', 'ENG'],
	['HON', 'SUI'],
	['ECU', 'FRA'],
	['NGA', 'ARG'],
	['BIH', 'IRN'],
	['USA', 'GER'],
	['POR', 'GHA'],
	['ALG', 'RUS'],
	['KOR', 'BEL'],
	['1A', '2B'],
	['1C', '2D'],
	['1B', '2A'],
	['1D', '2C'],
	['1E', '2F'],
	['1G', '2H'],
	['1F', '2E'],
	['1H', '2G'],
	['W49', 'W50'],
	['W53', 'W54'],
	['W51', 'W52'],
	['W55', 'W56'],
	['W57', 'W58'],
	['W59', 'W60'],
	['L61', 'L62'],
	['W61', 'W62']
];

Fixture.random = function () {
	var i = 0;
	$('.score').each(function (i, e) {
		var max = 13;
		var min = 2;
		var r = Math.floor(Math.random() * (max - min + 1)) + min;
		$(e).val(i++ % r);
	});
	Fixture.update();
};

Fixture.renderGroupsStage = function () {
	var stage = newElem('div', {'class': 'groups-stage'});
	for (var i = 0; i < 8; i++) {
		var div = newElem('div', {'class': 'group-matches'});
		div.append(
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
	var opps = Fixture.matches[index];
	var flag1 = newElem('img', {'class': 'flag', 'src': 'static/img/null.png'});
	var flag2 = newElem('img', {'class': 'flag', 'src': 'static/img/null.png'});
	var trigram1 = newElem('div', {'class': 'trigram'}).text('?');
	var trigram2 = newElem('div', {'class': 'trigram'}).text('?');
	if (index < 48) {
		Fixture.setTeam(opps[0], flag1, trigram1);
		Fixture.setTeam(opps[1], flag2, trigram2);
	}
	var team1 = newElem('div', {'class': 'team'});
	var team2 = newElem('div', {'class': 'team'});
	if ([48, 49, 52, 53, 56, 57, 60].indexOf(index) == -1) {
		team1.append(flag1, trigram1);
	} else {
		team1.append(trigram1, flag1);
	}
	if ([50, 51, 54, 55, 58, 59, 61].indexOf(index) == -1) {
		team2.append(trigram2, flag2);
	} else {
		team2.append(flag2, trigram2);
	}
	var score1 = newElem('input', {'class': 'score'});
	var score2 = newElem('input', {'class': 'score'});
	var scores = newElem('div', {'class': 'scoreboard'});
	scores.append(score1, ' - ', score2);
	var match = newElem('a', {'class': 'match', 'id': 'match-' + index});
	return match.append(team1, scores, team2);
};

Fixture.renderSecondStage = function () {
	var stage = newElem('div', {'class': 'second-stage'});

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

	return stage;
};

Fixture.setTeam = function (team, flag, trigram) {
	var src = 'static/img/' + (team ? team.toLowerCase() + '.png' : 'null.png');
	$(flag).attr('src', src);
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
	// TODO: hook guess updates
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
	var scores = $('#match-' + index + ' .score');
	var score1 = (scores.eq(0) ? parseInt($(scores.eq(0)).val()) : NaN);
	var score2 = (scores.eq(1) ? parseInt($(scores.eq(1)).val()) : NaN);
	if (isNaN(score1) || isNaN(score2)) return [];
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
	var opps = Fixture.matches[index];
	var group1 = opps[0].substr(-1);
	var group2 = opps[1].substr(-1);
	if (rankings[group1].length && rankings[group2].length) {
		var team1 = rankings[group1][0].team;
		var team2 = rankings[group2][1].team;
		var flags = $('#match-' + index + ' .flag');
		var trigrams = $('#match-' + index + ' .trigram');
		Fixture.setTeam(team1, flags.eq(0), trigrams.eq(0));
		Fixture.setTeam(team2, flags.eq(1), trigrams.eq(1));
	}
};

Fixture.updateQualifyingMatch = function (index) {
	var opps = Fixture.matches[index];
	var team1 = Fixture.getQualifier(opps[0]);
	var team2 = Fixture.getQualifier(opps[1]);
	if (team1 && team2) {
		var flags = $('#match-' + index + ' .flag');
		var trigrams = $('#match-' + index + ' .trigram');
		Fixture.setTeam(team1, flags.eq(0), trigrams.eq(0));
		Fixture.setTeam(team2, flags.eq(1), trigrams.eq(1));
	}
};

Fixture.getQualifier = function (key) {
	var isWinner = (key[0] == 'W' ? true : false);
	var index = parseInt(key.substr(1)) - 1;
	var scores = $('#match-' + index + ' .score');
	var score1 = (scores.eq(0) ? parseInt($(scores.eq(0)).val()) : NaN);
	var score2 = (scores.eq(1) ? parseInt($(scores.eq(1)).val()) : NaN);
	if (isNaN(score1) || isNaN(score2)) return null;
	var trigrams = $('#match-' + index + ' .trigram');
	var q = null;
	if (score1 > score2) q = $(trigrams.eq(isWinner ? 0 : 1)).text();
	if (score2 > score1) q = $(trigrams.eq(isWinner ? 1 : 0)).text();
	return (q == '?' ? null : q);
};

Fixture.submit = function () {
	var userId = getCookie('fb_user_id');
	if (!userId) {
		var message = 'Unknown user. Facebook login required.';
		$('#status').text(message).addClass('error');
		return null;
	}
	var results = [];
	for (var i = 0; i < 64; i++) {
		var r  = Fixture.getMatchResult(i);
		if (!r) {
			var message = 'Fixture is invalid or incomplete.';
			$('#status').text(message).addClass('error');
			return null;
		}
		results.push(r);
	}
	var payload = {
		'user_id': userId,
		'prediction': JSON.stringify(results),
		'auth_token': getCookie('auth_token')
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
};

Fixture.getMatchResult = function (index) {
	var scores = $('#match-' + index + ' .score');
	var score1 = (scores.eq(0) ? parseInt($(scores.eq(0)).val()) : NaN);
	var score2 = (scores.eq(1) ? parseInt($(scores.eq(1)).val()) : NaN);
	if (isNaN(score1) || isNaN(score2)) return null;
	if (score1 < 0 || score2 < 0) return null;
	var trigrams = $('#match-' + index + ' .trigram');
	var team1 = (trigrams.eq(0) ? $(trigrams.eq(0)).text() : null);
	var team2 = (trigrams.eq(1) ? $(trigrams.eq(1)).text() : null);
	if (!team1 || !team2) return null;
	if (team1.length != 3 || team2.length != 3) return null;
	return [team1, team2, score1, score2];
};

Fixture.setMatchResult = function (index, team1, team2, score1, score2) {
	var scores = $('#match-' + index + ' .score');
	$(scores.eq(0)).val(score1);
	$(scores.eq(1)).val(score2);
	if (index >= 6 * 8) {
		var flags = $('#match-' + index + ' .flag');
		var trigrams = $('#match-' + index + ' .trigram');
		Fixture.setTeam(team1, flags.eq(0), trigrams.eq(0));
		Fixture.setTeam(team2, flags.eq(1), trigrams.eq(1));
	}
};

Fixture.load = function () {
	var userId = getCookie('fb_user_id');
	if (!userId) return false;
	$.getJSON('/fixture/api?user_ids=' + userId, function (data) {
		var fixture = data[userId];
		if (!fixture || !fixture.prediction) return;
		for (var i = 0; i < 64; i++) {
			var r = fixture.prediction[i];
			if (!r || r.length != 4) continue;
			Fixture.setMatchResult(i, r[0], r[1], r[2], r[3]);
		}
		Fixture.setLastSaved(fixture.timestamp);
	});
	return true;
};

Fixture.setLastSaved = function (timestamp) {
	if (timestamp) {
		var date = new Date(1000 * timestamp);
		$('#status').text('Last saved: ' + prettyDate(date));
		$('#status').removeClass('error');
	}
};

Fixture.delete = function () {
	var userId = getCookie('fb_user_id');
	if (!userId) return false;
	var payload = {
		'user_id': userId,
		'auth_token': getCookie('auth_token')
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
};

Fixture.renderGuesses = function () {
	return newElem('div', {'class': 'wrapper'}).append(
		newElem('div', {'class': 'box'}).text('Groups stage').append(
			Fixture.renderGuessItem('round qualifiers', 2 * 8, 2),
			Fixture.renderGuessItem('exact scores', 6 * 8, 2),
			Fixture.renderGuessItem('wins or ties', 6 * 8, 1)
		),
		newElem('div', {'class': 'box'}).text('Round of 16').append(
			Fixture.renderGuessItem('quarter-finalists', 8, 3),
			Fixture.renderGuessItem('exact scores', 8, 3)
		),
		newElem('div', {'class': 'box'}).text('Quarter-finals').append(
			Fixture.renderGuessItem('semi-finalists', 4, 4),
			Fixture.renderGuessItem('exact scores', 4, 3)
		),
		newElem('div', {'class': 'box'}).text('Semi-finals').append(
			Fixture.renderGuessItem('finalists', 2, 5),
			Fixture.renderGuessItem('exact scores', 2, 3)
		),
		newElem('div', {'class': 'box'}).text('3rd place').append(
			Fixture.renderGuessItem('3rd place winner', 1, 6),
			Fixture.renderGuessItem('exact scores', 1, 3)
		),
		newElem('div', {'class': 'box'}).text('Final').append(
			Fixture.renderGuessItem('World Cup winner', 1, 7),
			Fixture.renderGuessItem('exact scores', 1, 3)
		),
		newElem('div', {'class': 'totalbox'}).append(
			newElem('span', {'class': 'total'}).text('0'),
			'Total Points'
		)
	);
};

Fixture.renderGuessItem = function (item, maxguesses, scalar) {
	return newElem('div').append(
		newElem('div', {'class': 'guessdata'}).append(
			newElem('span').text('You guessed '),
			newElem('span', {'class': 'guesses'}).text('0'),
			newElem('span').text(' ' + item),
			newElem('span').text(' out of ' + maxguesses)
		),
		newElem('div', {'class': 'sub'}).append(
			newElem('span').text(' x ' + scalar + ' points = '),
			newElem('span', {'class': 'subtotal'}).text('0')
		)
	);
};

/*
 * JavaScript Pretty Date
 * Copyright (c) 2011 John Resig (ejohn.org)
 * Licensed under the MIT and GPL licenses.
 */
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

