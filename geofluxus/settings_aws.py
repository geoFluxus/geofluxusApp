from geofluxus.settings import *
import boto3
from botocore.exceptions import ClientError
import json


def get_linux_ec2_private_ip():
    """Get the private IP Address of the machine if running on an EC2 linux server"""
    from urllib.request import urlopen
    try:
        response = urlopen('http://169.254.169.254/latest/meta-data/local-ipv4')
        return response.read().decode("utf-8")
    except:
        return None
    finally:
        if response:
            response.close()


# ElasticBeanstalk healthcheck sends requests with host header = internal ip
# So we detect if we are in elastic beanstalk,
# and add the instances private ip address
private_ip = get_linux_ec2_private_ip()
if private_ip:
    ALLOWED_HOSTS.append(private_ip)


def get_region():
    from urllib.request import urlopen
    try:
        response = urlopen('http://169.254.169.254/latest/meta-data/placement/region')
        return response.read().decode("utf-8")
    except:
        return None
    finally:
        if response:
            response.close()


def get_secret(secret_id, name=None):
    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=get_region()
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_id
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        raise e

    # Decrypts secret using the associated KMS key.
    secret_name = name if name is not None else secret_id
    secret = json.loads(get_secret_value_response['SecretString'])[secret_name]

    return secret


DEFAULT = os.environ['DEFAULT']
ROUTING = os.environ['ROUTING']
DB_USER = get_secret(os.environ['DB_USER'], name='username')
DB_PASS = get_secret(os.environ['DB_PASS'], name='password')
DB_HOST = get_secret(os.environ['DB_HOST'])
SECRET_KEY = get_secret(os.environ['SECRET_KEY'])

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': DEFAULT,
        'USER': DB_USER,
        'PASSWORD': DB_PASS,
        'HOST': DB_HOST,
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
        'HOST': DB_HOST,
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
            },
    },
    'routing_ovam': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'routing_ovam',
        'USER': DB_USER,
        'PASSWORD': DB_PASS,
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