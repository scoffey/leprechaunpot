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
            fs = ndb.get_multi(keys)
            result = dict((f.user_id, self._fixture_to_dict(f)) for f in fs)
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
        if not auth_token:
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
        for i in p:
            if len(i) != 4 or \
                    not isinstance(i[0], basestring) or len(i[0]) != 3 or \
                    not isinstance(i[1], basestring) or len(i[1]) != 3 or \
                    not isinstance(i[2], int) or i[2] < 0 or \
                    not isinstance(i[3], int) or i[3] < 0:
                self.abort(400)
        return prediction

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

