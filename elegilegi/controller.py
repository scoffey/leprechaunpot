#!/usr/bin/env python

import datetime
import json
import logging
import os
import re
import time
import uuid
from urlparse import parse_qs as urldecode

import webapp2
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import ndb

_HERE_DIR = os.path.dirname(__file__)

# Models

class Ballot(ndb.Model):
    user_id = ndb.StringProperty()
    data = ndb.TextProperty()
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

class ApiHandler(webapp2.RequestHandler):
    UUID_REGEXP = re.compile('^[a-f0-9-]{36}$')

    def get(self):
        user_ids = self.request.get('user_ids')
        if user_ids:
            keys = [ndb.Key(Ballot, k) for k in user_ids.split(',')]
            result = dict((b.user_id, self._ballot_to_dict(b)) for \
                    b in ndb.get_multi(keys) if b is not None)
            self._output_json(result)
        elif 'segment' in self.request.GET:
            self.post()
        else:
            self._output_json({})

    def post(self):
        user_id = self._get_cookie('uuid') or self.request.get('uuid')
        if not self.UUID_REGEXP.match(user_id):
            user_id = str(uuid.uuid1())
        b = Ballot.get_or_insert(user_id)
        b.user_id = user_id
        b.data = self._get_ballot_data()
        b.put()
        self._set_cookie('uuid', user_id)
        self._output_json(self._ballot_to_dict(b))

    def delete(self):
        user_id = self._get_cookie('uuid')
        if not user_id:
            self.abort(400)
        b = Ballot.get_by_id(user_id)
        b.key.delete()
        self._output_json(self._ballot_to_dict(b))

    def _get_cookie(self, key, default=None):
        c = self.request.cookies
        return c[key][0] if key in c else default

    def _set_cookie(self, key, value):
        domain = self.request.host.split(':', 1)[0]
        self.response.set_cookie(key, value, max_age=60 * 86400, \
                path='/', domain=domain, secure=True)

    def _get_ballot_data(self):
        lines = []
        params = self.request.POST if self.request.method == 'POST' \
                else self.request.GET
        for k in params.keys():
            is_vote = k.startswith('ley-') and k.split('-')[1].isdigit()
            if is_vote or k == 'segment':
                lines.append('%s=%s' % (k, params[k]))
        lines.sort()
        return '\n'.join(lines)

    def _ballot_to_dict(self, b):
        return {
            'user_id': b.user_id,
            'data': dict(i.split('=', 1) for i in b.data.split('\n')),
            'timestamp': time.mktime(b.timestamp.timetuple())
        }

    def _output_json(self, data):
        output = json.dumps(data)
        callback = self.request.get('callback')
        if callback:
            callback = re.sub('[^a-zA-Z0-9_\\.]+', '', callback)
            output = '%s(%s);' % (callback, output)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(output)

class ExportHandler(webapp2.RequestHandler):

    def get(self):
        limit = int(self.request.get('limit') or 100)
        offset = int(self.request.get('offset') or 0)
        result = dict((b.user_id, self._ballot_to_dict(b)) for \
                b in Ballot.query().fetch(limit=limit, offset=offset))
        self._output_json(result)

    def _ballot_to_dict(self, b):
        return {
            'user_id': b.user_id,
            'data': dict(i.split('=', 1) for i in b.data.split('\n')),
            'timestamp': time.mktime(b.timestamp.timetuple())
        }

    def _output_json(self, data):
        output = json.dumps(data)
        callback = self.request.get('callback')
        if callback:
            callback = re.sub('[^a-zA-Z0-9_\\.]+', '', callback)
            output = '%s(%s);' % (callback, output)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(output)

# App controller setup
app = webapp2.WSGIApplication([
    ('/elegilegi/', MainHandler),
    ('/elegilegi/api', ApiHandler),
    #('/elegilegi/export', ExportHandler),
])

if __name__ == '__main__':
    run_wsgi_app(app)

