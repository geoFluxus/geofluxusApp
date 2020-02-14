import psycopg2 as pg
import os
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos.error import GEOSException

# Database credentials
USER = os.environ['USER']
PASSWORD = os.environ['PASSWORD']
HOST = os.environ['HOST']
PORT = os.environ['PORT']
DATABASE = os.environ['DATABASE']


# Establish connection
def open_connection():
    try:
        connection = pg.connect(user=USER,
                                password=PASSWORD,
                                host=HOST,
                                port=PORT,
                                database=DATABASE)
        cursor = connection.cursor()
        print('Connection established...')
    except (Exception, pg.Error) as error:
        print ('Connection failed...', error)

    return connection, cursor


# Close connection
def close_connection(connection=None, cursor=None):
    if connection:
        cursor.close()
        connection.close()
        print("Connection closed...")


# Query database
def fetch_data(cursor=None):
    query = \
            '''
            WITH
    
            vertices AS (
            SELECT source as vid,
                   ST_SetSRID(ST_MakePoint(lon, lat), 4326) as geom
            FROM ways
            LEFT JOIN ways_vertices_pgr
            ON ways.source = ways_vertices_pgr.id),
    
            route AS (
                SELECT ways.the_geom as lines FROM pgr_dijkstra('
                    SELECT gid AS id,
                           source,
                           target,
                           cost_s AS cost,
                           reverse_cost_s as reverse_cost
                    FROM ways',
                    (SELECT vid FROM vertices
                     ORDER BY ST_Distance(
                       geom,
                       ST_SetSRID(ST_MakePoint(5.9956, 53.1812), 4326),
                       true
                     ) ASC LIMIT 1),
                    (SELECT vid FROM vertices
                     ORDER BY ST_Distance(
                       geom,
                       ST_SetSRID(ST_MakePoint(5.85625, 53.19575), 4326),
                       true
                     ) ASC LIMIT 1)
                ) AS dijkstra
                LEFT JOIN ways
                ON (dijkstra.edge = ways.gid)
                ORDER BY seq
            )
    
            SELECT ST_AsText(ST_LineMerge(ST_Union(lines))) as geom
            FROM route
            '''
    cursor.execute(query)
    result = cursor.fetchall()

    return result


# Validate data
def validate(x):
    try:
        if not isinstance(x, str):
            raise ValueError('Not WKT...')
        geom = GEOSGeometry(x)
        if not geom.valid:
            raise ValueError('Invalid geometry...')
        print('Valid geometry....')
        return geom
    except GEOSException as e:
        print(str(e))


if __name__ == "__main__":
    # Establish connection
    con, cur = open_connection()

    # Fetch data
    data = fetch_data(cur)[0][0]
    # Validate & convert to geometry
    route = validate(data)

    # Close connection
    close_connection(con, cur)