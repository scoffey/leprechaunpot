import os
import datetime
import json

import webapp2
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

class MainPage(webapp2.RequestHandler):
    TEMPLATE_PATH = ('index.html',)
    def get(self):
        data = {'server_time': str(datetime.datetime.utcnow())}
        path = os.path.join(os.path.dirname(__file__), *self.TEMPLATE_PATH)
        output = template.render(path, data)
        self.response.out.write(output)

class CrowdDjController(MainPage):
    TEMPLATE_PATH = ('crowddj', 'view', 'index.html')

class GateKeeperController(MainPage):
    TEMPLATE_PATH = ('gatekeeper', 'view', 'index.html')

class PostaSokobanMainController(MainPage):
    TEMPLATE_PATH = ('postasokoban', 'view', 'index.html')

class PostaSokobanLevelController(PostaSokobanMainController):
    TEMPLATE_PATH = ('postasokoban', 'view', 'level.html')
    def get(self):
        data = dict((i, self.request.get(i)) for i in self.request.arguments())
        path = os.path.join(os.path.dirname(__file__), *self.TEMPLATE_PATH)
        output = template.render(path, data)
        self.response.out.write(output)

routes = {
    '/': MainPage,
    '/crowddj/*': CrowdDjController,
    '/gatekeeper/*': GateKeeperController,
    '/postasokoban/': PostaSokobanMainController,
    '/postasokoban/level': PostaSokobanLevelController,
}
app = webapp.WSGIApplication(routes.items(), debug=True)

def main():
    run_wsgi_app(app)

if __name__ == '__main__':
    main()

