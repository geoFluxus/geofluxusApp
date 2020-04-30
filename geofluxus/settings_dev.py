from geofluxus.settings import *


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True


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
        'HOST': 'localhost',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'allow',
            },
    },
    'routing': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': ROUTING,
        'USER': DB_USER,
        'PASSWORD': DB_PASS,
        'HOST': 'localhost',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'allow',
            },
    }
}

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'bundles/dev/',
        'STATS_FILE': os.path.join(PROJECT_DIR, 'webpack-stats-dev.json'),
    }
}

