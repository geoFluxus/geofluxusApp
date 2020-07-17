from geofluxus.settings import *
# from geofluxus.credentials import *

DEBUG = True

# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

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
        'HOST': 'gdse.h2020repair.bk.tudelft.nl',
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
        'HOST': 'gdse.h2020repair.bk.tudelft.nl',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
            },
    },
}


SPATIALITE_LIBRARY_PATH = 'mod_spatialite'

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'bundles/dev/',
        'STATS_FILE': os.path.join(PROJECT_DIR, 'webpack-stats-dev.json'),
    }
}