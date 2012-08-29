import os
import logging
from datetime import datetime

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

class MainPage(webapp.RequestHandler):
    TEMPLATE_DIR = os.path.dirname(__file__)
    def get(self):
        data = {'server_time': str(datetime.utcnow())}
        path = os.path.join(self.TEMPLATE_DIR, 'index.html')
        output = template.render(path, data)
        self.response.out.write(output)

class GateKeeperPage(MainPage):
    TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), \
            'gatekeeper', 'view')

routes = {
    '/': MainPage,
    '/gatekeeper/*': GateKeeperPage,
}
app = webapp.WSGIApplication(routes.items(), debug=True)

def main():
    run_wsgi_app(app)

if __name__ == '__main__':
    main()

