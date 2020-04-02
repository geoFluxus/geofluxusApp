import psycopg2 as pg
import os
from django.contrib.gis.geos import GEOSGeometry, LineString, MultiLineString
from django.contrib.gis.geos.error import GEOSException

# Database credentials
USER = os.environ['USER']
PASSWORD = os.environ['PASSWORD']
HOST = os.environ['HOST']
PORT = os.environ['PORT']
MAIN = os.environ['MAIN']
ROUTING = os.environ['ROUTING']
FILENAME = os.environ['FILENAME']


# Establish connection
def open_connection(database):
    try:
        connection = pg.connect(user=USER,
                                password=PASSWORD,
                                host=HOST,
                                port=PORT,
                                database=database)
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
    # Establish connection to main database
    con, cur = open_connection(MAIN)

    # Fetch flows (distinct pairs!)
    query = \
        '''
        SELECT DISTINCT origin_id,
                        destination_id
        FROM asmfa_flow
        '''
    flows = fetch(cur, query)

    # Establish connection to routing
    rcon, rcur = open_connection(ROUTING)

    f = open(FILENAME, 'w')
    f.write('origin;destination;wkt\n')

    base = \
        '''
        SELECT identifier, ST_AsText(geom)
        FROM asmfa_actor
        WHERE id = {id}
        '''
    for flow in flows:
        # Fetch orig / dest geometry
        orig, dest = flow[0], flow[1]

        query = base.format(id=orig)
        actors = fetch(cur, query)[0]
        orig_name, orig_wkt = actors[0], actors[1]

        query = base.format(id=dest)
        actors = fetch(cur, query)[0]
        dest_name, dest_wkt = actors[0], actors[1]

        # Fetch routing
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
                       ST_GeomFromText('{orig_wkt}'),
                       true
                     ) ASC LIMIT 1), 
                    (SELECT vid FROM vertices
                     ORDER BY ST_Distance(
                       geom,
                       ST_GeomFromText('{dest_wkt}'),
                       true
                     ) ASC LIMIT 1),
                     FALSE
                ) AS dijkstra
                LEFT JOIN ways
                ON (dijkstra.edge = ways.gid)
                ORDER BY seq
            )
            
            SELECT ST_AsText(ST_LineMerge(ST_Union(lines))) as geom 
            FROM route
            '''.format(orig_wkt=orig_wkt, dest_wkt=dest_wkt)
        wkt = fetch(rcur, query)[0][0]
        geom = validate(wkt)
        if geom:
            print(geom.geom_type)
            line = '{};{};{}\n'.format(orig_name, dest_name, wkt)
            f.write(line)

    # Close connections
    f.close()
    close_connection(con, cur)
    close_connection(rcon, rcur)