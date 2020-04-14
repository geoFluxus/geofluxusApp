define(['underscore',
        'views/common/baseview',
        'collections/collection',
        'collections/geolocation',
        'collections/flows',
        'visualizations/flowmap',
        'openlayers',
        'utils/utils',
        'leaflet',
        'leaflet-easyprint',
        'leaflet-fullscreen',
        'leaflet.markercluster',
        'leaflet.markercluster/dist/MarkerCluster.css',
        'leaflet.markercluster/dist/MarkerCluster.Default.css',
        'leaflet/dist/leaflet.css',
        'static/css/flowmap.css',
        'leaflet-fullscreen/dist/leaflet.fullscreen.css'
    ],

    function (_, BaseView, Collection, GeoLocation, Flows, FlowMap, ol, utils, L) {

        /**
         *
         * @author Christoph Franke, Vilma Jochim
         * @name module:views/FlowMapView
         * @augments module:views/BaseView
         */
        var FlowMapView = BaseView.extend(
            /** @lends module:views/FlowSankeyView.prototype */
            {

                /**
                 * view on a leaflet map with flows and nodes overlayed
                 *
                 * @param {Object} options
                 * @param {HTMLElement} options.el      element the map will be rendered in
                 * @param {string} options.template     id of the script element containing the underscore template to render this view
                 * @param {Number} options.caseStudyId  id of the casestudy
                 * @param {Number} options.keyflowId    id of the keyflow
                 * @param {Number} options.materials    materials, should contain all materials used inside the keyflow
                 *
                 * @constructs
                 * @see http://backbonejs.org/#View
                 */
                initialize: function (options) {
                    FlowMapView.__super__.initialize.apply(this, [options]);
                    _.bindAll(this, 'zoomed');

                    this.options = options;
                    this.flows = this.options.flows;

                    this.clear();
                    this.render();

                    this.rerender(this.flows);

                },

                /*
                 * dom events (managed by jquery)
                 */
                events: {},

                /*
                 * render the view
                 */
                render: function () {
                    //this.backgroundLayer = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
                    this.backgroundLayer = new L.TileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors, © CartoDB'
                    });

                    // Old center
                    //var center = [52.51, 13.36];
                    // Center of Netherlands
                    var center = [52.1326, 5.2913];


                    this.leafletMap = new L.Map(this.el, {
                            center: center,
                            zoomSnap: 0.25,
                            zoom: 10.5,
                            minZoom: 5,
                            maxZoom: 25
                        })
                        .addLayer(this.backgroundLayer);


                    this.flowMap = new FlowMap(this.leafletMap);

                    this.leafletMap.addControl(new L.Control.Fullscreen({
                        position: 'topright'
                    }));
                    this.leafletMap.addControl(new L.easyPrint({
                        position: 'topright',
                        filename: 'sankey-map',
                        exportOnly: true,
                        hideControlContainer: true,
                        sizeModes: ['A4Landscape']
                    }));
                    this.leafletMap.on("zoomend", this.zoomed);

                    var exportControls = L.control({
                            position: 'topright'
                        }),
                        exportDiv = document.createElement('div'),
                        exportImgBtn = document.createElement('button');
                    exportImgBtn.classList.add('fas', 'fa-camera', 'btn', 'btn-primary', 'inverted');
                    exportImgBtn.style.height = "30px";
                    exportImgBtn.style.width = "30px";
                    exportImgBtn.style.padding = "0px";
                    exportDiv.appendChild(exportImgBtn);
                    exportControls.onAdd = function (map) {
                        return exportDiv;
                    };
                    exportControls.addTo(this.leafletMap);
                    // easyprint is not customizable enough (buttons, remove menu etc.) and not touch friendly
                    // workaround: hide it and pass on clicks (actually strange, but easyprint was still easiest to use export plugin out there)
                    var easyprintCtrl = this.el.querySelector('.leaflet-control-easyPrint'),
                        easyprintCsBtn = this.el.querySelector('.easyPrintHolder .A4Landscape');
                    easyprintCtrl.style.visibility = 'hidden';
                    exportImgBtn.addEventListener('click', function () {
                        easyprintCsBtn.click();
                    })

                    var customControls = L.control({
                        position: 'bottomleft'
                    });
                    this.animationCheck = document.createElement('input');
                    this.actorCheck = document.createElement('input');
                    this.flowCheck = document.createElement('input');
                    this.lightCheck = document.createElement('input');
                    this.flowCheck.checked = true;
                    this.lightCheck.checked = true;

                    var div = document.createElement('div'),
                        aniLabel = document.createElement('label'),
                        actorLabel = document.createElement('label'),
                        flowLabel = document.createElement('label'),
                        lightLabel = document.createElement('label'),
                        _this = this;

                    aniLabel.innerHTML = 'Animate flows';
                    actorLabel.innerHTML = 'Show actors';
                    flowLabel.innerHTML = 'Show flows';
                    lightLabel.innerHTML = 'Light/dark';

                    [
                        this.animationCheck, this.actorCheck,
                        this.flowCheck, this.lightCheck
                    ].forEach(function (checkbox) {
                        checkbox.type = "checkbox";
                        checkbox.style.transform = "scale(2)";
                        checkbox.style.pointerEvents = "none";
                        checkbox.style.marginRight = "10px";
                    })

                    div.style.background = "rgba(255, 255, 255, 0.5)";
                    div.style.padding = "10px";
                    div.style.cursor = "pointer";

                    var actorDiv = document.createElement('div'),
                        flowDiv = document.createElement('div'),
                        aniDiv = document.createElement('div'),
                        aniCheckWrap = document.createElement('div'),
                        aniToggleDiv = document.createElement('div'),
                        lightDiv = document.createElement('div');

                    actorDiv.appendChild(this.actorCheck);
                    actorDiv.appendChild(actorLabel);
                    actorDiv.style.cursor = 'pointer';
                    flowDiv.appendChild(this.flowCheck);
                    flowDiv.appendChild(flowLabel);
                    flowDiv.style.cursor = 'pointer';
                    lightDiv.appendChild(this.lightCheck);
                    lightDiv.appendChild(lightLabel);
                    lightDiv.style.cursor = 'pointer';
                    aniCheckWrap.appendChild(this.animationCheck);
                    aniCheckWrap.appendChild(aniLabel);
                    aniDiv.appendChild(aniCheckWrap);
                    aniCheckWrap.style.cursor = 'pointer';

                    var aniLinesLabel = document.createElement('label'),
                        aniDotsLabel = document.createElement('label');

                    this.aniLinesRadio = document.createElement('input');
                    this.aniDotsRadio = document.createElement('input');
                    this.aniLinesRadio.type = 'radio';
                    this.aniDotsRadio.type = 'radio';
                    this.aniLinesRadio.name = 'animation';
                    this.aniDotsRadio.name = 'animation';
                    this.aniLinesRadio.style.transform = 'scale(1.5)';
                    this.aniLinesRadio.style.marginLeft = '5px';
                    this.aniDotsRadio.style.transform = 'scale(1.5)';
                    this.aniDotsRadio.style.marginLeft = '5px';

                    this.aniDotsRadio.checked = true;

                    aniCheckWrap.style.float = 'left';
                    aniCheckWrap.style.marginRight = '5px';
                    aniToggleDiv.style.float = 'left';
                    aniLinesLabel.style.marginRight = '3px';

                    aniLinesLabel.innerHTML = 'lines only';
                    aniDotsLabel.innerHTML = 'dotted';
                    aniLinesLabel.appendChild(this.aniLinesRadio);
                    aniDotsLabel.appendChild(this.aniDotsRadio);
                    aniToggleDiv.appendChild(aniLinesLabel);
                    aniToggleDiv.appendChild(aniDotsLabel);

                    customControls.onAdd = function (map) {
                        return div;
                    };
                    customControls.addTo(this.leafletMap);

                    flowDiv.addEventListener("click", function () {
                        _this.flowCheck.checked = !_this.flowCheck.checked;
                        _this.rerender();
                    });

                    actorDiv.addEventListener("click", function () {
                        _this.actorCheck.checked = !_this.actorCheck.checked;
                        //if (_this.actorCheck.checked) _this.stockCheck.checked = false;
                        _this.rerender();
                    });
                    lightDiv.addEventListener("click", function () {
                        _this.lightCheck.checked = !_this.lightCheck.checked;
                        _this.rerender();
                    });
                    aniCheckWrap.addEventListener("click", function () {
                        _this.animationCheck.checked = !_this.animationCheck.checked;
                        _this.flowMap.toggleAnimation(_this.animationCheck.checked);
                    });
                    aniToggleDiv.addEventListener("click", function () {
                        if (_this.aniDotsRadio.checked)
                            _this.aniLinesRadio.checked = true;
                        else
                            _this.aniDotsRadio.checked = true;
                        _this.rerender();
                    });

                    div.appendChild(actorDiv);
                    div.appendChild(document.createElement('br'));
                    div.appendChild(flowDiv);
                    div.appendChild(document.createElement('br'));
                    div.appendChild(lightDiv);
                    div.appendChild(document.createElement('br'));
                    div.appendChild(aniDiv);
                    div.appendChild(document.createElement('br'));
                    div.appendChild(aniToggleDiv);
                    div.appendChild(document.createElement('br'));

                    var legendControl = L.control({
                        position: 'bottomright'
                    });
                    this.legend = document.createElement('div');
                    this.legend.style.background = "rgba(255, 255, 255, 0.5)";
                    this.legend.style.visibility = 'hidden';
                    legendControl.onAdd = function () {
                        return _this.legend;
                    };
                    legendControl.addTo(this.leafletMap);
                    this.el.querySelector('.leaflet-right.leaflet-bottom').classList.add('leaflet-legend');
                    L.DomEvent.disableClickPropagation(this.legend);
                    L.DomEvent.disableScrollPropagation(this.legend);


                    // Smooth scroll to top of Viz
                    setTimeout(() => {
                        $("#apply-filters")[0].scrollIntoView({
                            behavior: "smooth"
                        });
                    }, 500);


                },

                toggleLight() {
                    var _this = this;
                    var darkBack = new L.TileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors, © CartoDB'
                    });
                    var lightBack = new L.TileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors, © CartoDB'
                    });
                    this.leafletMap.removeLayer(this.backgroundLayer);
                    var checked = _this.lightCheck.checked;
                    if (checked) {
                        this.leafletMap.addLayer(lightBack);
                    } else {
                        this.leafletMap.addLayer(darkBack);
                    }
                },

                updateLegend(data) {
                    var data = data || this.data,
                        _this = this;
                    this.legend.innerHTML = '';
                    var materials = data.materials;
                    // ToDo_this.lightCheck.checked: inefficient, done too often for just toggling visibility
                    Object.keys(materials).forEach(function (matId) {
                        var material = materials[matId],
                            color = material.color,
                            div = document.createElement('div'),
                            text = document.createElement('div'),
                            check = document.createElement('input'),
                            colorDiv = document.createElement('div');
                        div.style.height = '30px';
                        div.style.cursor = 'pointer';
                        text.innerHTML = material.name;
                        text.style.fontSize = '1.3em';
                        text.style.overflow = 'hidden';
                        text.style.lightSpace = 'nowrap';
                        text.style.textOverflow = 'ellipsis';
                        colorDiv.style.width = '25px';
                        colorDiv.style.height = '100%';
                        colorDiv.style.textAlign = 'center';
                        colorDiv.style.background = color;
                        colorDiv.style.float = 'left';
                        colorDiv.style.paddingTop = '5px';
                        check.type = 'checkbox';
                        check.checked = _this.showMaterials[matId] === true;
                        check.style.transform = 'scale(1.7)';
                        check.style.pointerEvents = 'none';
                        div.appendChild(colorDiv);
                        div.appendChild(text);
                        colorDiv.appendChild(check);
                        _this.legend.appendChild(div);
                        div.addEventListener('click', function () {
                            check.checked = !check.checked;
                            _this.showMaterials[matId] = check.checked;
                            _this.flowMap.toggleTag(matId, check.checked);
                            _this.rerender();
                        })
                        _this.flowMap.toggleTag(matId, check.checked)
                    });
                },

                zoomed: function () {
                    // zoomend always is triggered before clustering is done -> reset clusters
                    this.clusterGroupsDone = 0;
                },

                //        toggleClusters(){
                //            var _this = this,
                //                show = this.clusterCheck.checked;
                //            // remove cluster layers from map
                //            this.leafletMap.eachLayer(function (layer) {
                //                if (layer !== _this.backgroundLayer)
                //                    _this.leafletMap.removeLayer(layer);
                //            });
                //            this.clusterGroups = {};
                //            // no clustering without data or clustering unchecked
                //            if (!this.data || !show) return;
                //            this.flowMap.clear();
                //            var nodes = Object.values(_this.data.nodes),
                //                rmax = 30;
                //            var nClusterGroups = 0;
                //                clusterPolygons = [];
                //
                //            function drawClusters(){
                //                var data = _this.transformMarkerClusterData();
                //                // remove old cluster layers
                //                clusterPolygons.forEach(function(layer){
                //                    _this.leafletMap.removeLayer(layer);
                //                })
                //                clusterPolygons = [];
                //                _this.resetMapData(data, false);
                //            }
                //
                //            // add cluster layers
                //            nodes.forEach(function(node){
                //                if (!node.group) return;
                //                var clusterId = node.group.id,
                //                    group = _this.clusterGroups[clusterId];
                //                // create group if not existing
                //                if (!group && node.group != null){
                //                    var clusterGroup = new L.MarkerClusterGroup({
                //                        maxClusterRadius: 2 * rmax,
                //                        iconCreateFunction: function(cluster) {
                //                            return L.divIcon({ iconSize: 0 });
                //                        },
                //                        animate: false
                //                    });
                //                    group = {
                //                        color: node.group.color,
                //                        label: node.group.name,
                //                        instance: clusterGroup
                //                    };
                //                    _this.clusterGroups[clusterId] = group;
                //                    _this.leafletMap.addLayer(clusterGroup);
                //                    clusterGroup.on('animationend', function(){
                //                        _this.clusterGroupsDone++;
                //                        // all cluster animations are done -> transform data
                //                        // according to current clustering
                //                        if (_this.clusterGroupsDone === nClusterGroups){
                //                            drawClusters();
                //                        }
                //                    })
                //                    nClusterGroups++;
                //                }
                //                var marker = L.marker([node['lat'], node['lon']], {
                //                    icon: L.divIcon({ iconSize: 0 }),
                //                    opacity: 0
                //                });
                //                marker.id = node.id;
                //                group.instance.addLayer(marker);
                //            });
                //            drawClusters();
                //        },

                resetMapData: function (data, zoomToFit) {
                    this.data = data;
                    this.flowMap.clear();
                    this.flowMap.addNodes(data.nodes);

                    if (this.flowCheck.checked)
                        this.flowMap.addFlows(data.flows);

                    this.flowMap.showNodes = true;
                    this.flowMap.showFlows = true;

                    //this.flowMap.showNodes = (this.actorCheck.checked) ? true : false;
                    //this.flowMap.showFlows = (this.flowCheck.checked) ? true : false;
                    //this.flowMap.dottedLines = (this.aniDotsRadio.checked) ? true : false;
                    //this.updateLegend();
                    this.flowMap.toggleTag('actor', this.actorCheck.checked);

                    this.flowMap.resetView();
                    //if (zoomToFit) this.flowMap.zoomToFit();
                },

                rerender: function (zoomToFit) {
                    var _this = this;

                    //var data = _this.transformData(_this.flows);

                    var data = _this.transformDataNew(_this.flows);


                    if (_this.displayWarnings && data.warnings.length > 0) {
                        var msg = '';
                        data.warnings.forEach(function (warning) {
                            msg += warning + '<br>';
                        })
                        _this.alert(msg);
                    }
                    _this.resetMapData(data, zoomToFit);
                    _this.toggleLight();
                },

                /*
                additional to the usual attributes the flow should have the attribute
                'color'
                */
                addFlows: function (flows) {
                    var _this = this;
                    flows = (flows.forEach != null) ? flows : [flows];
                    flows.forEach(function (flow) {
                        _this.flows.add(flow);
                    })
                },

                getFlows: function () {
                    return this.flows.models;
                },

                removeFlows: function (flows) {
                    var flows = (flows instanceof Array) ? flows : [flows];
                    this.flows.remove(flows);
                },

                clear: function () {
                    //this.flows.reset();
                    //this.legend.innerHTML = '';
                    //this.clusterGroups = {};
                    //this.data = null;
                    if (this.flowMap) {
                        this.flowMap.clear();
                    }
                },

                // transformMarkerClusterData: function () {
                //     var clusters = [];
                //     Object.values(this.clusterGroups).forEach(function (clusterGroup) {
                //         clusterGroup.instance._featureGroup.eachLayer(function (layer) {
                //             if (layer instanceof L.MarkerCluster) {
                //                 var point = layer.getLatLng(),
                //                     cluster = {
                //                         ids: [],
                //                         color: clusterGroup.color,
                //                         label: clusterGroup.label,
                //                         lat: point.lat,
                //                         lon: point.lng
                //                     }
                //                 layer.getAllChildMarkers().forEach(function (marker) {
                //                     cluster.ids.push(marker.id);
                //                 })
                //                 clusters.push(cluster);
                //             }
                //         });
                //     })
                //     data = this.transformData(
                //         this.flows, {
                //             splitByComposition: this.materialCheck.checked,
                //             clusters: clusters
                //         }
                //     );
                //     return data;
                // },

                transformDataNew: function (flows, options) {
                    var _this = this,
                        options = options || {},
                        nodes = [],
                        links = [];


                    // * Nodes:
                    // * @param {object} nodesData
                    // * @param {string} nodesData.name - Label for the tooltips
                    // * @param {number} nodesData.lon - Longitude (first part of coordinates)
                    // * @param {number} nodesData.lat - Latitude (second part of coordinates)
                    // * @param {string} nodesData.label - Label for the tooltips
                    // * @param {number} nodesData.style - Style ID for the color
                    // * @param {number} nodesData.level - Level to use for the radius
                    // *
                    // * Flows:
                    // * @param {object} flowsData
                    // * @param {string} flowsData.id - ID for each flow
                    // * @param {number} flowsData.source - flow origin needs id that is connected to coordinates of the Data for the nodes
                    // * @param {number} flowsData.target - flow destination needs id that is connected to coordinates of the Data for the nodes
                    // * @param {number} flowsData.value - value for the widths (for seperated flows)
                    // * @param {number} flowsData.valueTotal -   total value for the widths
                    // * @param {string} flowsData.label - Label for the tooltips (for seperated flows)
                    // * @param {string} flowsData.labelTotal - Label for the tooltips
                    // * @param {number} flowsData.style - Style ID for the color
                    // *
                    // * Styles:
                    // * @param{object} styles
                    // * @param{hex} styles.nodeColor - color for the nodes
                    // * @param{number} styles.radius - radius for the node
                    // * @param{hex} styles.color - color for the flows

                    flows.forEach(function (flow, index) {

                        // Add the origin and destination to Nodes:
                        nodes.push(flow.origin, flow.destination)


                        // origin.color = utils.colorByName(origin.name);
                        // destination.color = utils.colorByName(destination.name);


                        links.push({
                            id: this[index].id,
                            source: this[index].origin.id,
                            target: this[index].destination.id,
                            value: this[index].amount,
                            //valueTotal: this[index].amount,
                            label: this[index].activityGroupName,
                            //labelTotal: "link labelTotal",
                            style: {
                                nodeColor: utils.colorByName(this[index].origin.name),
                                radius: 20,
                                color: utils.colorByName(this[index].activityGroupName),
                            },
                            color: utils.colorByName(this[index].activityGroupName),
                        })


                    }, flows);

                    // Remove all duplicates nodes:
                    nodes = _.uniq(nodes, 'id');
                    nodes.forEach(function (node, index) {
                        this[index].color = utils.colorByName(this[index].name);
                        this[index].label = this[index].name;
                    }, nodes);



                    console.log("Links:");
                    console.log(links);
                    console.log("Nodes:");
                    console.log(nodes);
                    // console.log(Object.values(nodes));

                    return {
                        flows: links,
                        nodes: nodes,
                    }
                },

                /*
                 * transform actors and flows to a json-representation
                 * readable by the sankey-diagram
                 *
                 * options.splitByComposition - split flows by their compositions (aka materials) into seperate flows
                 * options.clusters - array of objects with keys "lat", "lon" (location) and "ids" (array of actor ids that belong to that cluster)
                 */
                transformData: function (flows, options) {

                    var _this = this,
                        options = options || {},
                        nodes = {},
                        links = [],
                        clusters = options.clusters || [],
                        splitByComposition = options.splitByComposition,
                        clusterMap = {},
                        pFlows = [],
                        warnings = [],
                        maxStock = 0;

                    var i = 0;

                    // clusters.forEach(function (cluster) {
                    //     var nNodes = cluster.ids.length,
                    //         clusterId = 'cluster' + i,
                    //         label = cluster.label + ' (' + nNodes + ' ' + 'actors' + ')';
                    //     var clusterNode = {
                    //         id: clusterId,
                    //         name: label,
                    //         label: label,
                    //         color: cluster.color,
                    //         opacity: 0.8,
                    //         lon: cluster.lon,
                    //         lat: cluster.lat,
                    //         radius: Math.min(25, 10 + nNodes / 3),
                    //         innerLabel: nNodes,
                    //         cluster: cluster,
                    //         tag: 'actor'
                    //     }
                    //     nodes[clusterId] = clusterNode;
                    //     i++;
                    //     cluster.ids.forEach(function (id) {
                    //         clusterMap[id] = clusterId;
                    //     })
                    // })

                    function transformNode(node) {
                        var id = node.id,
                            clusterId = clusterMap[id];

                        // node is clustered, take cluster as origin resp. destination
                        if (clusterId != null) return nodes[clusterId];

                        // already transformed
                        var transNode = nodes[id];
                        if (transNode) return transNode;

                        var name = node.name,
                            level = node.level;
                        code = node.code || node.nace || node.activity_nace;

                        if ((_this.anonymize) && (level === 'actor'))
                            name = 'Actor';
                        name += ' (' + code + ')';

                        if (!node.geom) {
                            var warning = 'Actor referenced by flow, but missing a location: ' + name;
                            warnings.push(warning);
                            return;
                        }
                        var coords = node.geom.coordinates;
                        transNode = {
                            id: id,
                            name: name,
                            label: name,
                            color: node.color,
                            opacity: 0.8,
                            group: node.group,
                            lon: coords[0].toFixed(4),
                            lat: coords[1].toFixed(4),
                            radius: 5,
                            tag: 'actor'
                        }
                        nodes[id] = transNode;
                        return transNode;
                    }

                    var aggMap = {};

                    function aggregate(flow, source, target) {
                        var key = flow.get('waste') + source.id,
                            is_stock = flow.get('stock');
                        if (!is_stock) key += '-' + target.id;
                        var mapped = aggMap[key];
                        // not mapped yet -> create mapped flow
                        if (!mapped) {
                            mapped = {
                                id: key,
                                source: source,
                                target: target,
                                waste: flow.get('waste'),
                                amount: 1000,
                                fractions: {},
                                is_stock: is_stock
                            }
                            fractions = mapped.fractions;
                            flow.get('materials').forEach(function (material) {
                                fractions[material.material] = Object.assign({}, material);
                            })
                            aggMap[key] = mapped;
                            pFlows.push(mapped);
                        }
                        // mapped -> add to mapped flow
                        else {
                            fractions = mapped.fractions;
                            flow.get('materials').forEach(function (material) {
                                var mat = fractions[material.material];
                                if (!mat) {
                                    mat = Object.assign({}, material);
                                    fractions[material.material] = mat;
                                } else {
                                    mat.amount += material.amount;
                                }
                            })
                            mapped.amount += flow.get('amount');
                        }
                    }
                    i = 0;
                    // add the flows that don't have to be aggregated, because origin and destination are not clustered
                    flows.forEach(function (flow) {
                        var origin = flow.origin;
                        var destination = flow.destination;
                        var amount = flow.amount;

                        origin.color = utils.colorByName(origin.name);
                        destination.color = utils.colorByName(destination.name);


                        var source = transformNode(origin);
                        var target = transformNode(destination);
                        // var source = transformNode(origin),
                        //     target = (!is_stock) ? transformNode(destination) : source; // set target to source in case of stocks just for convenience, doesn't matter


                        // one node might have no geom (in case of stocks same node) -> cannot shown on map
                        if (!source || !target) return;

                        // one node is clustered (in case of stocks same node) -> aggregate
                        if (source.cluster || target.cluster) {
                            aggregate(flow, source, target);
                        } else {
                            pFlows.push({
                                id: flow.id || i,
                                source: source,
                                target: target,
                                amount: amount,
                                color: flow.color,
                                //fractions: flow.get('materials'),
                                //waste: flow.get('waste'),
                                //process: flow.get('process'),
                                description: flow.get('description')
                            });
                        }
                        i += 1;
                    })

                    var maxClusterStock = 0;
                    // posproc the aggregation (just dict to list)
                    Object.values(aggMap).forEach(function (flow) {
                        flow.fractions = Object.values(flow.fractions);
                        if (flow.is_stock)
                            maxClusterStock = Math.max(maxClusterStock, flow.amount)
                    })

                    function transformFlow(pFlow) {
                        var source = pFlow.source,
                            target = pFlow.target,
                            fractions = pFlow.fractions,
                            description = pFlow.description;

                        var descText = '<br><b>Description:</b> ';
                        description.forEach(function (d) {
                            descText += d + ', ';
                        })
                        descText = descText.substring(0, descText.length - 2);

                        var //wasteLabel = (pFlow.waste) ? gettext('Waste') : gettext('Product'),
                            //processLabel = gettext('Process') + ': ' + (pFlow.process || '-'),
                            totalAmount = pFlow.amount,
                            flowLabel = source.name + '&#10132; ' + target.name + '<br>' + descText;

                        // if (splitByComposition) {
                        //     var cl = [];
                        //     fractions.forEach(function (material) {
                        //         var amount = Math.round(material.amount),
                        //             label = flowLabel + '<br><b>Material: </b>' + material.name +
                        //             '<br><b>Amount: </b>' + _this.format(amount) + ' t/year',
                        //             color;
                        //         if (!uniqueMaterials[material.material]) {
                        //             color = utils.colorByName(material.name)
                        //             uniqueMaterials[material.material] = {
                        //                 color: color,
                        //                 name: material.name
                        //             };
                        //         } else
                        //             color = uniqueMaterials[material.material].color;
                        //         cl.push({
                        //             id: pFlow.id,
                        //             label: label,
                        //             source: source.id,
                        //             target: target.id,
                        //             value: Math.abs(amount),
                        //             material: material.material,
                        //             tag: material.material,
                        //             color: color
                        //         })
                        //     })
                        //     return cl;
                        // } else {
                        var label = flowLabel + '<br><b>Amount: </b>' + _this.format(totalAmount) + ' t/year';
                        return [{
                            id: pFlow.id,
                            label: label,
                            source: source.id,
                            target: target.id,
                            color: pFlow.color || source.color,
                            value: Math.abs(totalAmount)
                        }]
                        //}
                    }

                    // function transformStock(pFlow) {
                    //     var source = pFlow.source,
                    //         fractions = pFlow.fractions;

                    //     var wasteLabel = (pFlow.waste) ? 'Waste' : 'Product',
                    //         totalAmount = Math.round(pFlow.amount),
                    //         stockLabel = source.name + '<br>' + wasteLabel + ' ' + 'Stock';
                    //     if (splitByComposition) {
                    //         var cs = [];
                    //         fractions.forEach(function (material) {
                    //             var amount = Math.round(material.amount),
                    //                 label = stockLabel + '<br><b>Material: </b>' + material.name + '<br><b>Amount: </b>' + _this.format(amount) + ' t/year',
                    //                 color;
                    //             if (!uniqueMaterials[material.material]) {
                    //                 color = utils.colorByName(material.name)
                    //                 uniqueMaterials[material.material] = {
                    //                     color: color,
                    //                     name: material.name
                    //                 };
                    //             } else
                    //                 color = uniqueMaterials[material.material].color;
                    //             cs.push({
                    //                 id: 'stock' + pFlow.id,
                    //                 label: label,
                    //                 color: color,
                    //                 lon: source.lon,
                    //                 lat: source.lat,
                    //                 //radius: radius,
                    //                 value: Math.abs(amount),
                    //                 tag: material.material
                    //             })
                    //         })
                    //         return cs;
                    //     } else {
                    //         var label = stockLabel + '<br><b>Amount: </b>' + _this.format(totalAmount) + ' t/year';
                    //         var stock = [{
                    //             id: 'stock' + pFlow.id,
                    //             label: label,
                    //             color: source.color,
                    //             group: source.group,
                    //             lon: source.lon,
                    //             lat: source.lat,
                    //             opacity: 0.8,
                    //             //radius: radius,
                    //             value: Math.abs(totalAmount),
                    //             tag: 'stock'
                    //         }]
                    //         return stock;
                    //     }
                    // }

                    // var stocks = [];

                    // var uniqueMaterials = {};
                    // pFlows.forEach(function (pFlow) {
                    //     if (pFlow.amount == 0) return;
                    //     if (!pFlow.is_stock)
                    //         links = links.concat(transformFlow(pFlow));
                    //     else
                    //         stocks = stocks.concat(transformStock(pFlow));
                    // })


                    return {
                        flows: links,
                        nodes: Object.values(nodes),
                        //stocks: stocks,
                        //materials: uniqueMaterials,
                        //warnings: warnings
                    }
                },

                close: function () {
                    this.undelegateEvents(); // remove click events
                    this.unbind(); // Unbind all local event bindings
                    $(this.options.el).html(""); //empty the DOM element
                },

            });
        return FlowMapView;
    }
);