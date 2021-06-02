from geofluxus.settings import *

DEFAULT = os.environ['DEFAULT']
ROUTING = os.environ['ROUTING']
DB_USER = os.environ['DB_USER']
DB_PASS = os.environ['DB_PASS']
SECRET_KEY = os.environ['SECRET_KEY']

DATABASES = {
    'default': {

        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': DEFAULT,
        'USER': DB_USER,
        'PASSWORD': DB_PASS,
        'HOST': 'h2020repair.bk.tudelft.nl',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
            },
    },
    'routing': {

        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': ROUTING,
        'USER': DB_USER,
        'PASSWORD': DB_PASS,
        'HOST': 'h2020repair.bk.tudelft.nl',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
            },
    },
}

DEBUG = False

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'bundles/prod/',
        'STATS_FILE': os.path.join(PROJECT_DIR, 'webpack-stats-prod.json'),
    }
}

CSRF_COOKIE_SECURE = True

SESSION_COOKIE_SECURE = True

# enables persistant db connections (if > 0)
CONN_MAX_AGE = 0

# SESSION_EXPIRE_AT_BROWSER_CLOSE = True
# SESSION_COOKIE_AGE = 15 * 60
# SESSION_SAVE_EVERY_REQUEST = True
