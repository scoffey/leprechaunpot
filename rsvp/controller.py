#!/usr/bin/env python

import csv
import datetime
import difflib
import json
import logging
import math
import os
import time
import re
import unicodedata
import urllib

import webapp2
from google.appengine.api.mail import send_mail
from google.appengine.ext import ndb
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

_HERE_DIR = os.path.dirname(__file__)
_AUTH_TOKEN = '9249414b4b5589c7edef8349d836ba57'

# Helpers

_SLUG_STRIP = re.compile(r'[^\w\s-]')
_SLUG_HYPHENATE = re.compile(r'[-\s]+')

def slugify(value):
    if not isinstance(value, unicode):
        value = unicode(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore')
    value = _SLUG_STRIP.sub('', value).strip().lower()
    return _SLUG_HYPHENATE.sub('-', unicode(value))

def fuzzy_name_distance(a, b):
    cmp = lambda s, t: difflib.SequenceMatcher(None, s, t).ratio()
    x = 1 - cmp(a[0], b[0])
    y = 1 - cmp(a[1], b[1])
    d = math.sqrt(x * x + y * y)
    return d

# Models

class Guest(ndb.Model):
    party_id = ndb.IntegerProperty()
    firstname = ndb.StringProperty()
    lastname = ndb.StringProperty()
    firstslug = ndb.StringProperty()
    lastslug = ndb.StringProperty()
    email = ndb.StringProperty()
    attending = ndb.IntegerProperty()
    intl = ndb.BooleanProperty()
    data = ndb.JsonProperty()
    ipaddr = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty(auto_now=True)

# Request handlers

class ApiHandler(webapp2.RequestHandler):

    def get(self):
        attending = self.request.get('attending')
        if attending:
            self.post()
            return
        uid = self.request.get('uid')
        firstname = self.request.get('firstname')
        lastname = self.request.get('lastname')
        g = None
        if uid and uid.isdigit():
            g = Guest.get_by_id(uid)
            if g:
                self._output_guest(g)
            else:
                self._output_json({})
        elif firstname and lastname:
            firstslug = slugify(firstname)
            lastslug = slugify(lastname)
            g = Guest.query(Guest.firstslug == firstslug,
                    Guest.lastslug == lastslug).get()
            if g:
                self._output_guest(g)
            else:
                self._output_suggestions(firstname, lastname)
        else:
            self.abort(400)

    def _output_guest(self, g):
        result = self._guest_to_dict(g)
        if g and g.party_id:
            gs = Guest.query(Guest.party_id == g.party_id).fetch(limit=16)
            if len(gs) > 1:
                result['party'] = [self._guest_to_dict(g) for g in gs]
        self._output_json(result)

    def _output_suggestions(self, firstname, lastname):
        firstslug = slugify(firstname)
        lastslug = slugify(lastname)
        initial = lastslug[0]
        gs = Guest.query(Guest.lastslug > initial,
                Guest.lastslug < chr(ord(initial) + 1)).fetch(limit=70)
        suggestions = []
        for g in gs:
            d = fuzzy_name_distance((firstslug, lastslug),
                    (g.firstslug, g.lastslug))
            if d < 0.7:
                s = self._guest_to_dict(g)
                s['distance'] = d
                suggestions.append(s)
        self._output_json({'suggestions': suggestions})

    def post(self):
        uid = self.request.get('uid')
        g = Guest.get_by_id(uid) if uid and uid.isdigit() else None
        if not g:
            self.abort(400)
        # TODO: firstname and lastname might be edited?
        attending = self.request.get('attending')
        if attending and attending.lstrip('-').isdigit():
            g.attending = int(attending)
        email = self.request.get('email')
        if email and '@' in email:
            g.email = email
        data = self.request.get('data')
        try:
            g.data = json.loads(data)
        except Exception:
            logging.exception('Failed to deserialize JSON data: %r', data)
        g.ipaddr = self.request.remote_addr
        g.put()
        logging.info('New RSVP: %r' % g)
        self._send_mail(g)
        self._output_json(self._guest_to_dict(g))

    def _send_mail(self, g):
        sender = 'c2FudGlhZ28uY29mZmV5QGdtYWlsLmNvbQ==\n'.decode('base64')
        send_mail(sender=sender, to=sender,
                subject='New RSVP at %s' % self.request.host,
                body=repr(g.to_dict()))

    def _get_cookie(self, key, default=None):
        c = self.request.cookies
        return c[key][0] if key in c else default

    def _set_cookie(self, key, value):
        domain = self.request.host.split(':', 1)[0]
        self.response.set_cookie(key, value, max_age=60 * 86400, \
                path='/', domain=domain, secure=True)

    def _guest_to_dict(self, g):
        return {
            'uid': g.key.id(),
            'party_id': g.party_id,
            'firstname': g.firstname,
            'lastname': g.lastname,
            'attending': g.attending,
            'intl': g.intl,
            'data': g.data
        }

    def _output_json(self, data):
        output = json.dumps(data)
        callback = self.request.get('callback')
        if callback:
            callback = re.sub('[^a-zA-Z0-9_\\.]+', '', callback)
            output = '%s(%s);' % (callback, output)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(output)


class AdminHandler(webapp2.RequestHandler):

    def get(self):
        auth_token = self.request.get('auth_token')
        if auth_token != _AUTH_TOKEN:
            self.abort(400)
        h = self.response.headers
        h['Content-Type'] = 'text/plain; charset=utf-8'
        writer = csv.writer(self.response.out)
        writer.writerow(['uid', 'firstname', 'lastname', 'party_id', 'intl',
                'attending', 'data', 'email', 'ipaddr', 'timestamp'])
        gs = Guest.query().fetch(limit=500)
        gs.sort(key=lambda g: int(g.key.id()))
        for g in gs:
            writer.writerow([
                g.key.id(),
                (g.firstname or '').encode('utf-8'),
                (g.lastname or '').encode('utf-8'),
                str(g.party_id),
                '1' if g.intl else '',
                str(g.attending or ''),
                json.dumps(g.data).encode('utf-8') if g.data else '',
                g.email,
                g.ipaddr,
                g.timestamp
            ])

    def post(self):
        uid = self.request.get('uid')
        auth_token = self.request.get('auth_token')
        if not uid or auth_token != _AUTH_TOKEN:
            self.abort(400)
        g = Guest.get_by_id(uid)
        original = g.to_dict()
        g.attending = 0
        g.email = None
        g.data = {}
        g.ipaddr = None
        g.put()
        logging.info('Reset RSVP: %r', g)
        self._output_json(original)

    def put(self):
        auth_token = self.request.get('auth_token')
        if auth_token != _AUTH_TOKEN:
            self.abort(400)
        bad_rows = []
        update_count = 0
        content = urllib.unquote_plus(self.request.body.rstrip('='))
        rows = csv.reader(content.splitlines())
        keys = rows.next() # header row
        for row in rows:
            r = dict(zip(keys, [s.decode('utf-8') for s in row]))
            g = self._upsert_guest(**r)
            if not g:
                logging.warn('Skipping row: %r', row)
                bad_rows.append(row)
            else:
                #logging.info('New entity: %r', g)
                update_count += 1
        self._output_json({'updated': update_count, 'skipped': bad_rows})

    def _upsert_guest(self, **r):
        uid = r.get('uid')
        if not uid or not uid.isdigit():
            return None
        d = r.get('data')
        g = Guest.get_or_insert(uid)
        g.party_id = int(r.get('party_id') or 0)
        g.firstname = r.get('firstname')
        g.lastname = r.get('lastname')
        g.firstslug = slugify(g.firstname)
        g.lastslug = slugify(g.lastname)
        g.intl = int(r.get('intl') or g.intl or 0) != 0
        g.attending = int(r.get('attending') or g.attending or 0)
        g.data = (json.loads(d) if d else None) or g.data or {}
        g.email = r.get('email') or g.email or None
        g.ipaddr = r.get('ipaddr') or g.ipaddr or None
        g.put_async()
        return g

    def delete(self):
        uid = self.request.get('uid')
        auth_token = self.request.get('auth_token')
        if not uid or auth_token != _AUTH_TOKEN:
            self.abort(400)
        g = Guest.get_by_id(uid)
        g.key.delete()
        logging.info('Deleted entity: %r' % g)
        self._output_json(g.to_dict())

    def _output_json(self, data):
        if isinstance(data.get('timestamp'), datetime.datetime): # HACK TODO
            data['timestamp'] = data['timestamp'].isoformat()
        output = json.dumps(data)
        callback = self.request.get('callback')
        if callback:
            callback = re.sub('[^a-zA-Z0-9_\\.]+', '', callback)
            output = '%s(%s);' % (callback, output)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(output)


# App controller setup
app = webapp2.WSGIApplication([
    ('/rsvp', ApiHandler),
    ('/rsvp/admin', AdminHandler),
])

if __name__ == '__main__':
    run_wsgi_app(app)

