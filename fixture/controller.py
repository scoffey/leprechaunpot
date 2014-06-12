#!/usr/bin/env python

import base64
import datetime
import hashlib
import hmac
import json
import logging
import os
import time
import urlparse

import webapp2
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import ndb

_FB_APP_SECRET = os.environ.get('FB_APP_SECRET')
_HERE_DIR = os.path.dirname(__file__)

# Data

_FIXTURE = [
    ['BRA', 'CRO', datetime.datetime(2014, 6, 12, 20, 0)],
    ['MEX', 'CMR', datetime.datetime(2014, 6, 13, 16, 0)],
    ['ESP', 'NED', datetime.datetime(2014, 6, 13, 19, 0)],
    ['CHI', 'AUS', datetime.datetime(2014, 6, 13, 22, 0)],
    ['COL', 'GRE', datetime.datetime(2014, 6, 14, 16, 0)],
    ['CIV', 'JPN', datetime.datetime(2014, 6, 14, 1, 0)],
    ['URU', 'CRC', datetime.datetime(2014, 6, 14, 19, 0)],
    ['ENG', 'ITA', datetime.datetime(2014, 6, 14, 22, 0)],
    ['SUI', 'ECU', datetime.datetime(2014, 6, 15, 16, 0)],
    ['FRA', 'HON', datetime.datetime(2014, 6, 15, 19, 0)],
    ['ARG', 'BIH', datetime.datetime(2014, 6, 15, 22, 0)],
    ['IRN', 'NGA', datetime.datetime(2014, 6, 16, 19, 0)],
    ['GER', 'POR', datetime.datetime(2014, 6, 16, 16, 0)],
    ['GHA', 'USA', datetime.datetime(2014, 6, 16, 22, 0)],
    ['BEL', 'ALG', datetime.datetime(2014, 6, 17, 16, 0)],
    ['RUS', 'KOR', datetime.datetime(2014, 6, 17, 22, 0)],
    ['BRA', 'MEX', datetime.datetime(2014, 6, 17, 19, 0)],
    ['CMR', 'CRO', datetime.datetime(2014, 6, 18, 22, 0)],
    ['AUS', 'NED', datetime.datetime(2014, 6, 18, 16, 0)],
    ['ESP', 'CHI', datetime.datetime(2014, 6, 18, 19, 0)],
    ['COL', 'CIV', datetime.datetime(2014, 6, 19, 16, 0)],
    ['JPN', 'GRE', datetime.datetime(2014, 6, 19, 22, 0)],
    ['URU', 'ENG', datetime.datetime(2014, 6, 19, 19, 0)],
    ['ITA', 'CRC', datetime.datetime(2014, 6, 20, 16, 0)],
    ['SUI', 'FRA', datetime.datetime(2014, 6, 20, 19, 0)],
    ['HON', 'ECU', datetime.datetime(2014, 6, 20, 22, 0)],
    ['ARG', 'IRN', datetime.datetime(2014, 6, 21, 16, 0)],
    ['NGA', 'BIH', datetime.datetime(2014, 6, 21, 22, 0)],
    ['GER', 'GHA', datetime.datetime(2014, 6, 21, 19, 0)],
    ['USA', 'POR', datetime.datetime(2014, 6, 22, 22, 0)],
    ['BEL', 'RUS', datetime.datetime(2014, 6, 22, 16, 0)],
    ['KOR', 'ALG', datetime.datetime(2014, 6, 22, 19, 0)],
    ['CMR', 'BRA', datetime.datetime(2014, 6, 23, 20, 0)],
    ['CRO', 'MEX', datetime.datetime(2014, 6, 23, 20, 0)],
    ['AUS', 'ESP', datetime.datetime(2014, 6, 23, 16, 0)],
    ['NED', 'CHI', datetime.datetime(2014, 6, 23, 16, 0)],
    ['JPN', 'COL', datetime.datetime(2014, 6, 24, 20, 0)],
    ['GRE', 'CIV', datetime.datetime(2014, 6, 24, 20, 0)],
    ['ITA', 'URU', datetime.datetime(2014, 6, 24, 16, 0)],
    ['CRC', 'ENG', datetime.datetime(2014, 6, 24, 16, 0)],
    ['HON', 'SUI', datetime.datetime(2014, 6, 25, 20, 0)],
    ['ECU', 'FRA', datetime.datetime(2014, 6, 25, 20, 0)],
    ['NGA', 'ARG', datetime.datetime(2014, 6, 25, 16, 0)],
    ['BIH', 'IRN', datetime.datetime(2014, 6, 25, 16, 0)],
    ['USA', 'GER', datetime.datetime(2014, 6, 26, 16, 0)],
    ['POR', 'GHA', datetime.datetime(2014, 6, 26, 16, 0)],
    ['ALG', 'RUS', datetime.datetime(2014, 6, 26, 20, 0)],
    ['KOR', 'BEL', datetime.datetime(2014, 6, 26, 20, 0)],
    ['1A', '2B', datetime.datetime(2014, 6, 28, 16, 0)],
    ['1C', '2D', datetime.datetime(2014, 6, 28, 20, 0)],
    ['1B', '2A', datetime.datetime(2014, 6, 29, 16, 0)],
    ['1D', '2C', datetime.datetime(2014, 6, 29, 20, 0)],
    ['1E', '2F', datetime.datetime(2014, 6, 30, 16, 0)],
    ['1G', '2H', datetime.datetime(2014, 6, 30, 20, 0)],
    ['1F', '2E', datetime.datetime(2014, 7, 1, 16, 0)],
    ['1H', '2G', datetime.datetime(2014, 7, 1, 20, 0)],
    ['W49', 'W50', datetime.datetime(2014, 7, 4, 20, 0)],
    ['W53', 'W54', datetime.datetime(2014, 7, 4, 16, 0)],
    ['W51', 'W52', datetime.datetime(2014, 7, 5, 20, 0)],
    ['W55', 'W56', datetime.datetime(2014, 7, 5, 16, 0)],
    ['W57', 'W58', datetime.datetime(2014, 7, 8, 20, 0)],
    ['W59', 'W60', datetime.datetime(2014, 7, 9, 20, 0)],
    ['L61', 'L62', datetime.datetime(2014, 7, 12, 20, 0)],
    ['W61', 'W62', datetime.datetime(2014, 7, 13, 19, 0)]
]

# Helper codec functions

def base64_url_decode(s):
    padding_factor = (4 - len(s) % 4) % 4
    s += '=' * padding_factor
    d = dict(zip(map(ord, u'-_'), u'+/'))
    return base64.b64decode(unicode(s).translate(d))

def parse_signed_request(signed_request, secret=_FB_APP_SECRET):
    encoded_sig, payload = signed_request.split('.', 2)
    sig = base64_url_decode(encoded_sig)
    data = json.loads(base64_url_decode(payload))
    if data.get('algorithm').upper() == 'HMAC-SHA256':
        expected_sig = hmac.new(secret, msg=payload, \
                digestmod=hashlib.sha256).digest()
        if sig == expected_sig:
            return data
    return None

# Models

class Fixture(ndb.Model):
    user_id = ndb.StringProperty()
    prediction = ndb.TextProperty()
    timestamp = ndb.DateTimeProperty(auto_now=True)

# Request handlers

class MainHandler(webapp2.RequestHandler):
    TEMPLATE = 'index.html'

    def get(self):
        self._render_template(self.TEMPLATE, self._get_data())

    def post(self):
        # deprecated: signed_request is no longer guaranteed to provide
        # user_id at this point; login will be forced client-side
        self.get()

    def _render_template(self, filename, data=None):
        path = os.path.join(_HERE_DIR, 'view', filename)
        self.response.out.write(template.render(path, data))

    def _get_data(self):
        return {'server_time': str(datetime.datetime.utcnow())}

    def _set_cookie(self, key, value):
        domain = self.request.host.split(':', 1)[0]
        self.response.set_cookie(key, value, max_age=86400, path='/', \
                        domain=domain, secure=True)

class ApiHandler(webapp2.RequestHandler):

    def get(self):
        user_ids = self.request.get('user_ids')
        if user_ids:
            keys = [ndb.Key(Fixture, k) for k in user_ids.split(',')]
            result = dict((f.user_id, self._fixture_to_dict(f)) for \
                f in ndb.get_multi(keys) if f is not None)
            self._output_json(result)
        else:
            self._output_json({})

    def post(self):
        user_id = self._authenticate()
        prediction = self._get_prediction()
        f = Fixture.get_or_insert(user_id)
        f.user_id = user_id
        f.prediction = prediction
        f.put()
        self.response.out.write(json.dumps(self._fixture_to_dict(f)))

    def delete(self):
        params = dict((k, v[0]) for k, v in \
                urlparse.parse_qs(self.request.body).items()) # hack
        user_id = self._authenticate(params=params)
        f = Fixture.get_by_id(user_id)
        f.key.delete()
        self.response.out.write(json.dumps(self._fixture_to_dict(f)))

    def _authenticate(self, params=None):
        if params is None:
            params = self.request
        user_id = params.get('user_id')
        if not user_id:
            self.abort(400) # bad request
        signed_request = params.get('signed_request')
        if not signed_request:
            self.abort(401) # unauthorized
        payload = parse_signed_request(signed_request)
        if payload is None:
            self.abort(401) # unauthorized
        if 'user_id' not in payload or payload['user_id'] != user_id:
            self.abort(403) # forbidden
        return user_id

    def _get_prediction(self):
        prediction = self.request.get('prediction')
        if not prediction:
            self.abort(400)
        try:
            p = json.loads(prediction)
        except ValueError:
            self.abort(400)
        if not isinstance(p, list) or len(p) != 64:
            self.abort(400)
        now = datetime.datetime.now()
        for i, m in enumerate(p):
            if m is not None:
                if not (len(m) == 4 and \
                        isinstance(m[0], basestring) and len(m[0]) == 3 and \
                        isinstance(m[1], basestring) and len(m[1]) == 3 and \
                        isinstance(m[2], int) and m[2] >= 0 and \
                        isinstance(m[3], int) and m[3] >= 0):
                    self.abort(400)
                if _FIXTURE[i][2] > now:
                    p[i] = None
                elif i < 48:
                    p[i][0] = _FIXTURE[i][0]
                    p[i][1] = _FIXTURE[i][1]
        return json.dumps(p, separators=',:')

    def _fixture_to_dict(self, f):
        return {
            'user_id': f.user_id,
            'prediction': json.loads(f.prediction),
            'timestamp': time.mktime(f.timestamp.timetuple())
        }

    def _output_json(self, data):
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(data))

# App controller setup
app = webapp2.WSGIApplication([
    ('/fixture/', MainHandler),
    ('/fixture/api', ApiHandler),
])

if __name__ == '__main__':
    run_wsgi_app(app)

