/*
var lastfm = {
	'key': '3ceab258c236a29ac9a00d119e82811a',
	'secret': '618a89072533cde012882bd277023df4'
};
*/
$(document).ready(function () {
	var timeout = null;
	var lastq = null;
	$('#search-box').keyup(function () {
		timeout = setTimeout(function () {
			$('#search-form').trigger('submit');
		}, 300);
		return true;
	}).keydown(function (e) {
		if (timeout) clearTimeout(timeout);
		if (e.which == 13) $('#search-form').trigger('submit');
		if (e.which == 27) $('#search-box').val('');
		return true;
	});
	$('#search-form').submit(function () {
		var q = $('#search-box').val();
		if (q && q != lastq) search(q);
		lastq = q;
		return false;
	});
	$('#search-box').focus(function () {
		$('#results').fadeIn(100); //.css('display', 'block');
	});
	$('#search-box').blur(function () {
		$('#results').fadeOut(300); //.css('display', 'none');
	});
});
function search(q) {
	var base_url = 'http://ws.audioscrobbler.com/2.0/'
		+ '?api_key=3ceab258c236a29ac9a00d119e82811a&format=json';
	var url = base_url + '&method=track.search&limit=16&track=' + escape(q);
	$.getJSON(url, function (data) {
		var items = [];
		var tracks = data.results.trackmatches.track || [];
		$.each(tracks, function(i, track) {
			items.push(formatTrack(track));
		});
		$('#results').empty();
		$('#results').html(items.join(''));
	});
}
function escapeHTML(s) {
	return escape(s)
		.replace(/%u[0-9A-F]{4}/g, unescape)
		.replace(/%([0-9A-F]{2})/g, "&#x$1;");
}
function onTrackClick(anchor) {
	var li = $(anchor).parent().get(0);
	var track = $(li).data('track');
	var thumb = (track.image ? track.image.pop()['#text'] : '');
	$('#track-tab div.track-thumb img').attr('src', thumb);
	$('#track-tab div.track-name').text(track.name);
	$('#track-tab div.track-artist').text(track.artist);
}
function formatTrack(track) {
	return [
		'<li class="track-item" data-track="' + escapeHTML(JSON.stringify(track)) + '">',
		'<a class="track-anchor" onclick="onTrackClick(this); return false;">',
		'<div class="track-thumb">',
		'<img src="' + (track.image ? track.image[0]['#text'] : '') + '" width="34" height="34" />',
		'</div>',
		'<div class="track-description">',
		'<div class="track-name">' + escapeHTML(track.name) + '</div>',
		'<div class="track-artist">' + escapeHTML(track.artist) + '</div>',
		'</div>',
		'</a>',
		'</li>',
	].join('');
}
