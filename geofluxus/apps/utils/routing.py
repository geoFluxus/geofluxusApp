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

        return connection, cursor
    except (Exception, pg.Error) as error:
        print ('Connection failed...', error)


# Close connection
def close_connection(connection, cursor):
    if connection:
        cursor.close()
        connection.close()
        print("Connection closed...")


# Fetch data
def fetch(cursor, query):
    try:
        cursor.execute(query)
        result = cursor.fetchall()

        return result
    except (Exception, pg.Error) as error:
        print('Failed to fetch...', error)


# Validate data
def validate(x):
    try:
        if x is None:
            return None
        if not isinstance(x, str):
            raise ValueError('Not WKT...')
        geom = GEOSGeometry(x)
        if not geom.valid:
            raise ValueError('Invalid geometry...')
        return geom
    except GEOSException as e:
        print(str(e))


if __name__ == "__main__":
    # Establish connection
    con, cur = open_connection()

    # Fetch flows (distinct pairs!)
    query = \
        '''
        SELECT DISTINCT origin_id,
                        destination_id
        FROM asmfa_flow
        '''
    flows = fetch(cur, query)

    base = \
        '''
        SELECT ST_AsText(geom)
        FROM asmfa_actor
        WHERE id = {id}
        '''
    for flow in flows:
        # Fetch orig / dest geometry
        orig, dest = flow[0], flow[1]
        query = base.format(id=orig)
        orig_wkt = fetch(cur, query)[0][0]
        query = base.format(id=dest)
        dest_wkt = fetch(cur, query)[0][0]

        # Fetch routing
        query = \
            '''
            WITH
    
            vertices AS (
                SELECT source as vid,
                       ST_SetSRID(ST_MakePoint(lon, lat), 4326) as geom
                FROM ways
                LEFT JOIN ways_vertices_pgr
                ON ways.source = ways_vertices_pgr.id
            ),
    
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
                       ST_GeomFromText('{orig_wkt}'),
                       true
                     ) ASC LIMIT 1),
                    (SELECT vid FROM vertices
                     ORDER BY ST_Distance(
                       geom,
                       ST_GeomFromText('{dest_wkt}'),
                       true
                     ) ASC LIMIT 1)
                ) AS dijkstra
                LEFT JOIN ways
                ON (dijkstra.edge = ways.gid)
                ORDER BY seq
            )
    
            SELECT ST_AsText(ST_LineMerge(ST_Union(lines))) as geom
            FROM route
            '''.format(orig_wkt=orig_wkt, dest_wkt=dest_wkt)
        routing = fetch(cur, query)[0][0]
        # Validate & convert to geometry
        route = validate(routing)

    # Close connection
    close_connection(con, cur)