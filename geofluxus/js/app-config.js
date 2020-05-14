define(['utils/session'],
function(Session) {

    var config = {
        URL: '/'
    };

    config.session = new Session();

    config.api = {
        base:              '/api/',
        publicationtypes:  '/api/publicationtypes/',
        publications:      '/api/publications/',
        arealevels:        '/api/levels/',
        allareas:          '/api/allareas/',
        areas:             '/api/levels/{0}/areas/',
        topojson:          '/api/levels/{0}/topojson',
        activitygroups:    '/api/activitygroups/',
        activities:        '/api/activities/',
        companies:         '/api/companies/',
        actors:            '/api/actors/',
        processgroups:     '/api/processgroups/',
        processes:         '/api/processes/',
        wastes02:          '/api/wastes02/',
        wastes04:          '/api/wastes04/',
        wastes06:          '/api/wastes06/',
        materials:         '/api/materials/',
        products:          '/api/products/',
        composites:        '/api/composites/',
        years:             '/api/years/',
        months:            '/api/months/',
        flowchains:        '/api/flowchains/',
        allflows:          '/api/allflows/',
        statusquoflows:    '/api/statusquoflows/',
        impactflows:       '/api/impactflows/',
        classifications:   '/api/classifications/',
        extradescriptions: '/api/extradescriptions/',
        routings:          '/api/routings/',
        ways:              '/api/ways/',
        vehicles:          '/api/vehicles/'
    }

    return config;
}
)