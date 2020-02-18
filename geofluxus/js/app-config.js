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
        areas:             '/api/areas/',
        activitygroups:    '/api/activitygroups/',
        activities:        '/api/activities/',
        companies:         '/api/companies/',
        actors:            '/api/actors/',
        processes:         '/api/processes/',
        wastes:            '/api/wastes/',
        materials:         '/api/materials/',
        products:          '/api/products/',
        composites:        '/api/composites/',
        flowchains:        '/api/flowchains/',
        flows:             '/api/flows/',
        classifications:   '/api/classifications/',
        extradescriptions: '/api/extradescriptions/',
    }

    return config;
}
)