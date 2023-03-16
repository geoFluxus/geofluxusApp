from geofluxus.settings import *
from geofluxus.aws_utils import *


# ElasticBeanstalk healthcheck sends requests with host header = internal ip
# So we detect if we are in elastic beanstalk,
# and add the instances private ip address
private_ip = get_linux_ec2_private_ip()
if private_ip:
    ALLOWED_HOSTS.append(private_ip)


DEFAULT = os.environ['DEFAULT']
ROUTING = os.environ['ROUTING']
DB_USER = get_secret(os.environ['DB_USER'], name='username')
DB_PASS = get_secret(os.environ['DB_PASS'], name='password')
DB_HOST = get_secret(os.environ['DB_HOST'])
SECRET_KEY = get_secret(os.environ['SECRET_KEY'])

DATABASES = {
    'default': {
        'ENGINE': 'geofluxus.db.backends.secretsmanager.postgis',
        'NAME': DEFAULT,
        'USER': DB_USER,
        'HOST': DB_HOST,
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
            },
    },
    'routing': {
        'ENGINE': 'geofluxus.db.backends.secretsmanager.postgis',
        'NAME': ROUTING,
        'USER': DB_USER,
        'HOST': DB_HOST,
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
            },
    },
    'routing_ovam': {
        'ENGINE': 'geofluxus.db.backends.secretsmanager.postgis',
        'NAME': 'routing_ovam',
        'USER': DB_USER,
        'HOST': DB_HOST,
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

LOGGING = {
'version': 1,
'disable_existing_loggers': False,
'filters': {
    'require_debug_false': {
        '()': 'django.utils.log.RequireDebugFalse',
    },
    'require_debug_true': {
        '()': 'django.utils.log.RequireDebugTrue',
    },
},
'formatters': {
    'django.server': {
        '()': 'django.utils.log.ServerFormatter',
        'format': '[%(server_time)s] %(message)s',
    }
},
'handlers': {
    'console': {
        'level': 'INFO',
        'filters': ['require_debug_true'],
        'class': 'logging.StreamHandler',
    },
    # Custom handler which we will use with logger 'django'.
    # We want errors/warnings to be logged when DEBUG=False
    'console_on_not_debug': {
        'level': 'WARNING',
        'filters': ['require_debug_false'],
        'class': 'logging.StreamHandler',
    },
    'django.server': {
        'level': 'INFO',
        'class': 'logging.StreamHandler',
        'formatter': 'django.server',
    },
    'mail_admins': {
        'level': 'ERROR',
        'filters': ['require_debug_false'],
        'class': 'django.utils.log.AdminEmailHandler'
    }
},
'loggers': {
    'django': {
        'handlers': ['console', 'mail_admins', 'console_on_not_debug'],
        'level': 'INFO',
    },
    'django.server': {
        'handlers': ['django.server'],
        'level': 'INFO',
        'propagate': False,
    },
}
}