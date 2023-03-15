import boto3
from django.db.utils import OperationalError

from geofluxus.aws_utils import *
from aws_secretsmanager_caching import SecretCache, SecretCacheConfig
import os
from django.contrib.gis.db.backends.postgis import base
import psycopg2


# source:
# https://github.com/aws-samples/aws-secrets-manager-credential-rotation-without-container-restart/blob/main/webapp/app/codecompose/db/backends/secretsmanager/mysql/base.py
class DatabaseCredentials:
    def __init__(self):
        session = boto3.session.Session()
        client = session.client(
            service_name='secretsmanager',
            region_name=get_region()
        )
        cache_config = SecretCacheConfig()
        self.cache_secrets_manager = SecretCache(config=cache_config, client=client)
        self.secret_id = os.environ['DATABASE_SECRETSMANAGER_ARN']

    def get_conn_params_from_secrets_manager(self, conn_params):
        secret_json = self.cache_secrets_manager.get_secret_string(self.secret_id)
        secret_dict = json.loads(secret_json)
        username = secret_dict["username"]
        password = secret_dict["password"]
        conn_params['user'] = username
        conn_params['password'] = password
        return

    def refresh_now(self):
        secret_cache_item = self.cache_secrets_manager._get_cached_secret(self.secret_id)
        secret_cache_item._refresh_needed = True
        secret_cache_item._execute_refresh()


databasecredentials=DatabaseCredentials()


class DatabaseWrapper(base.DatabaseWrapper):
    def get_new_connection(self, conn_params):
        try:
            databasecredentials.get_conn_params_from_secrets_manager(conn_params)
            conn = super(DatabaseWrapper, self).get_new_connection(conn_params)
            return conn
        except OperationalError:
            databasecredentials.refresh_now()
            databasecredentials.get_conn_params_from_secrets_manager(conn_params)
            conn = super(DatabaseWrapper, self).get_new_connection(conn_params)
            return conn