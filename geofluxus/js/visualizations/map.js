define(['openlayers',
        'turf',
    ],
    function (ol, turf) {
        class Map {
            constructor(options) {
                var _this = this;
                this.idCounter = 0;
                this.mapProjection = options.projection || 'EPSG:3857';
                this.center = options.center || [13.4, 52.5];
                this.center = ol.proj.transform(this.center, 'EPSG:4326', this.mapProjection);
                var showControls = (options.showControls != false) ? true : false,
                    enableZoom = (options.enableZoom != false) ? true : false,
                    enableDrag = (options.enableDrag != false) ? true : false;

                this.view = new ol.View({
                    projection: this.mapProjection,
                    center: this.center,
                    zoom: options.zoom || 10
                });
                this.layers = {};
                var initlayers = [];

                var cartodb = new ol.Attribution({
                        html: '© <a style="color:#0078A8" href="http://cartodb.com/attributions">CartoDB</a>'
                    }),
                    openlayers = new ol.Attribution({
                        html: '© <a style="color:#0078A8" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    });

                // blank map
                if (options.renderOSM != false) {
                    var source = new ol.source.OSM({
                        crossOrigin: 'anonymous'
                    });
                    if (options.source == 'light') {
                        source = new ol.source.XYZ({
                            url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                            attributions: [cartodb],
                            crossOrigin: "Anonymous"
                        })
                    } else if (options.source == 'dark') {
                        source = new ol.source.XYZ({
                            url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
                            attributions: [cartodb],
                            crossOrigin: "Anonymous"
                        })
                    }
                    var background = new ol.layer.Tile({
                        source: source,
                        crossOrigin: 'anonymous',
                        opacity: options.opacity || 1,
                        tileOptions: {
                            crossOriginKeyword: 'anonymous'
                        },
                    })
                    initlayers.push(background);
                }

                var basicLayer = new ol.layer.Vector({
                    source: new ol.source.Vector()
                });
                initlayers.push(basicLayer);

                var controls = ol.control.defaults({
                        attribution: true
                    })
                    .extend([new ol.control.FullScreen({
                        source: options.el
                    })]);

                var interactOptions = {
                    doubleClickZoom: enableZoom,
                    keyboardZoom: enableZoom,
                    mouseWheelZoom: enableZoom,
                    dragZoom: enableZoom
                };

                if (!enableDrag) {
                    interactOptions.keyboardPan = false;
                    interactOptions.dragPan = false;
                }

                var interactions = ol.interaction.defaults(interactOptions);
                this.layers = {
                    basic: basicLayer
                };

                this.map = new ol.Map({
                    layers: initlayers,
                    interactions: interactions,
                    target: options.el,
                    controls: controls,
                    view: this.view
                });

                var _this = this;
                this.map.on('pointermove', function (e) {
                    if (e.dragging) return;

                    var pixel = _this.map.getEventPixel(e.originalEvent);
                    var hit = _this.map.hasFeatureAtPixel(pixel);

                    _this.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
                });

                this.div = options.el;

                var tooltip = this.div.querySelector('.oltooltip');
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.classList.add('oltooltip');
                    this.div.appendChild(tooltip);
                }
                var overlay = new ol.Overlay({
                    element: tooltip,
                    offset: [10, 0],
                    positioning: 'bottom-center'
                });
                this.map.addOverlay(overlay);

                function displayTooltip(evt) {
                    var pixel = evt.pixel;
                    var feature = _this.map.forEachFeatureAtPixel(pixel, function (feature) {
                        return feature;
                    });
                    if (feature && feature.get('tooltip')) {
                        overlay.setPosition(evt.coordinate);
                        tooltip.innerHTML = feature.get('tooltip');
                        tooltip.style.display = 'block';
                        tooltip.style.color = 'black';
                        tooltip.style.backgroundColor = 'rgb(139, 138, 138)';
                        tooltip.style.opacity = '0.8';
                        tooltip.style.borderRadius = '1.5rem';
                        tooltip.style.padding = '0.75rem';
                        tooltip.style.font = 'small Montserrat, sans-serif';
                    } else tooltip.style.display = 'none';
                };

                this.map.on('pointermove', displayTooltip);
            }

            toMapProjection(coordinate, projection) {
                return ol.proj.transform(coordinate, projection, this.mapProjection);
            }

            toProjection(coordinate, projection) {
                return ol.proj.transform(coordinate, this.mapProjection, projection);
            }

            addLayer(name, options) {

                if (this.layers[name] != null) this.removeLayer(name)

                var options = options || {},
                    sourceopt = options.source || {},
                    source,
                    _this = this;
                if (sourceopt.url) {
                    var source = new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: sourceopt.url,
                        projection: sourceopt.projection || this.mapProjection,
                    })
                }
                if (options.icon) {
                    var image = new ol.style.Icon({
                        scale: .08,
                        src: options.icon,
                        anchor: options.anchor
                    });
                } else {
                    var image = new ol.style.Circle({
                        radius: options.radius || 5,
                        fill: new ol.style.Fill({
                            color: options.fill || 'rgb(100, 150, 250)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: options.stroke || 'rgba(100, 150, 250, 0.1)',
                            width: options.strokeWidth || 3
                        })
                    });
                }

                function labelStyle(feature, resolution) {
                    var fontSize = options.labelFontSize || '15px';
                    var text = feature.get('label');
                    if (_this.labelZoom && _this.map.getView().getZoom() < _this.labelZoom)
                        text = '';
                    return new ol.style.Text({
                        font: fontSize + ' Open Sans,sans-serif',
                        fill: new ol.style.Fill({
                            color: options.labelColor || '#4253f4'
                        }),
                        stroke: new ol.style.Stroke({
                            color: options.labelOutline || 'white',
                            width: 3
                        }),
                        text: text,
                        overflow: false,
                        offsetY: options.labelOffset || 0
                    })
                }

                var layer = new ol.layer.Vector({
                    opacity: options.opacity || 1,
                    source: source || new ol.source.Vector(),
                    style: (options.colorRange != null) ? colorRangeStyle : defaultStyle
                });

                this.layers[name] = layer;
                this.map.addLayer(layer);
                if (options.zIndex) layer.setZIndex(options.zIndex);

                var select = options.select || {};

                if (select.selectable) {
                    if (options.select.icon) {
                        var selectImage = new ol.style.Icon({
                            scale: .08,
                            src: options.select.icon,
                            anchor: options.select.anchor
                        });
                    } else if (options.icon) {
                        var selectImage = new ol.style.Icon({
                            scale: .08,
                            src: options.icon,
                            anchor: options.anchor
                        });
                    } else {
                        var selectImage = new ol.style.Circle({
                            radius: options.radius || 5,
                            fill: new ol.style.Fill({
                                color: select.fill || 'rgb(230, 230, 0)'
                            }),
                            stroke: new ol.style.Stroke({
                                color: select.stroke || 'rgba(100, 150, 250, 0.1)',
                                width: select.strokeWidth || 3
                            })
                        });
                    }

                    function selectLabelStyle(feature, resolution) {
                        return new ol.style.Text({
                            font: '15px Open Sans,sans-serif',
                            fill: new ol.style.Fill({
                                color: select.labelColor || '#e69d00'
                            }),
                            stroke: new ol.style.Stroke({
                                color: select.labelOutline || 'white',
                                width: 3
                            }),
                            text: feature.get('label'),
                        })
                    }
                    layer.selectStyle = function (feature, resolution) {
                        return new ol.style.Style({
                            image: selectImage,
                            stroke: new ol.style.Stroke({
                                color: select.stroke || 'rgb(230, 230, 0)',
                                width: select.strokeWidth || 3
                            }),
                            fill: new ol.style.Fill({
                                color: select.fill || 'rgba(230, 230, 0, 0.1)'
                            }),
                            text: selectLabelStyle(feature, resolution)
                        });
                    }
                    var multi = options.select.multi;
                    if (multi == null) multi = true;

                    var interaction = new ol.interaction.Select({
                        toggleCondition: (multi) ? ol.events.condition.always : ol.events.condition.click,
                        features: layer.selected,
                        layers: [layer],
                        style: layer.selectStyle,
                        multi: multi
                    });
                    this.map.addInteraction(interaction);
                    layer.select = interaction;
                    if (select.onChange) {
                        interaction.on('select', function (evt) {
                            var selected = evt.selected,
                                deselected = evt.deselected,
                                ret = [];
                            // callback with all currently selected
                            interaction.getFeatures().forEach(function (feat) {
                                ret.push({
                                    id: feat.get('id'),
                                    label: feat.get('label')
                                });
                            })
                            select.onChange(ret);
                            layer.getSource().dispatchEvent('change');
                        })
                    }
                }

                function defaultStyle(feature, resolution, strokeColor, fillColor) {
                    if (feature.selected) return layer.selectStyle(feature, resolution);
                    return new ol.style.Style({
                        image: image,
                        stroke: new ol.style.Stroke({
                            color: strokeColor || options.stroke || 'rgb(100, 150, 250)',
                            width: options.strokeWidth || 1
                        }),
                        fill: new ol.style.Fill({
                            color: fillColor || options.fill || 'rgba(100, 150, 250, 0.1)'
                        }),
                        text: labelStyle(feature, resolution)
                    });
                }

                var alpha = options.alphaFill || 1;

                function colorRangeStyle(feature, resolution) {
                    var value = feature.get('value');
                    if (value == null) return defaultStyle(feature, resolution);
                    return defaultStyle(
                        feature, resolution,
                        options.stroke || options.colorRange(value).rgba(),
                        options.colorRange(value).alpha(alpha).rgba()
                    );
                }

                return layer;
            }

            setVisible(layername, visible) {
                var layer = this.layers[layername];
                layer.setVisible(visible);
            }

            addServiceLayer(name, options) {
                var options = options || {};
                var layer = new ol.layer.Tile({
                    opacity: options.opacity || 1,
                    visible: (options.visible != null) ? options.visible : true,
                    source: new ol.source.TileWMS({
                        url: options.url,
                        params: options.params,
                        serverType: 'geoserver',
                        // Countries have transparency, so do not fade tiles:
                        transition: 0
                    })
                })
                if (options.zIndex != null) layer.setZIndex(options.zIndex);
                this.layers[name] = layer;
                this.map.addLayer(layer);
            }

            setVisible(layername, visible) {
                var layer = this.layers[layername];
                layer.setVisible(visible);
            }

            setOpacity(layername, opacity) {
                var layer = this.layers[layername];
                layer.setOpacity(opacity);
            }

            setZIndex(layername, zIndex) {
                var layer = this.layers[layername];
                if (layer) layer.setZIndex(zIndex);
                else console.log(layername + ' not found');
            }

            addPolygon(coordinates, options) {
                return this.addGeometry(coordinates, options);
            }

            addGeometry(geometry, options) {
                var options = options || {},
                    type = options.type.toLowerCase() || 'polygon',
                    proj = options.projection || this.mapProjection,
                    style = options.style || null;
                if (!((geometry instanceof ol.geom.MultiPolygon) ||
                        (geometry instanceof ol.geom.Polygon) ||
                        (geometry instanceof ol.geom.LineString) ||
                        (geometry instanceof ol.geom.MultiLineString) ||
                        (geometry instanceof ol.geom.Point)
                    )) {
                    if (type === 'multipolygon') {
                        geometry = new ol.geom.MultiPolygon(geometry);
                    } else if (type === 'point') {
                        geometry = new ol.geom.Point(geometry)
                    } else if (type === 'linestring') {
                        geometry = new ol.geom.LineString(geometry)
                    } else if (type === 'multilinestring') {
                        geometry = new ol.geom.MultiLineString(geometry)
                    } else if (type === 'polygon') {
                        geometry = new ol.geom.Polygon(geometry)
                    } else {
                        throw "Unknown type, supported: MultiPolygon, Polygon, Point, Linestring";
                    }
                }
                var ret = geometry.clone();
                var layername = options.layername || 'basic',
                    layer = this.layers[layername];

                if (!layer) layer = this.addLayer(layername);
                var feature = new ol.Feature({
                    geometry: geometry.transform(proj, this.mapProjection)
                });
                if (style) {
                    var style = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: style.strokeColor,
                            width: style.strokeWidth
                        }),
                        zIndex: style.zIndex
                    });
                    feature.setStyle(style);
                }
                feature.set('label', options.label);
                feature.set('tooltip', options.tooltip);
                feature.set('id', options.id);
                feature.set('value', options.value);
                layer.getSource().addFeature(feature);
                return ret;
            }

            getFeatures(layername) {
                var layer = this.layers[layername];
                return layer.getSource().getFeatures();
            }

            addFeatures(layername, features) {
                var layer = this.layers[layername],
                    source = layer.getSource();
                features.forEach(function (feature) {
                    source.addFeature(feature);
                })
            }

            getFeature(layername, id) {
                var features = this.getFeatures(layername);
                for (var i = 0; i < features.length; i++) {
                    var feature = features[i];
                    if (feature.get('id') == id) return feature
                }
                return null;
            }

            selectFeature(layername, id) {
                var feature = this.getFeature(layername, id),
                    layer = this.layers[layername];

                layer.select.getFeatures().push(feature);
                layer.select.dispatchEvent({
                    type: 'select',
                    selected: [feature],
                    deselected: []
                });
            }

            addMarker(coordinates, options) {
                var _this = this;
                var options = options || {};
                var proj = options.projection || this.mapProjection,
                    draggable = (options.draggable != null) ? options.draggable : true;
                var layername = options.layername || 'basic',
                    layer = this.layers[layername];

                var template = '({x}, {y})';

                var feature = new ol.Feature({
                    type: 'removable',
                    // transform to map projection
                    geometry: new ol.geom.Point(
                        this.toMapProjection(coordinates, proj))
                });
                if (options.icon) {
                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon({
                            scale: .08,
                            src: options.icon,
                            anchor: options.anchor
                        }),
                        text: new ol.style.Text({
                            offsetY: 25,
                            text: options.name,
                            font: '15px Open Sans,sans-serif',
                            fill: new ol.style.Fill({
                                color: '#111'
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#eee',
                                width: 2
                            })
                        })
                    });
                    feature.setStyle(iconStyle);
                }
                var dragStyle;
                if (options.dragIcon) {
                    dragStyle = new ol.style.Style({
                        image: new ol.style.Icon({
                            scale: .08,
                            src: options.dragIcon
                        })
                    })
                }

                if (options.draggable) {
                    // Drag and drop feature
                    var dragInteraction = new ol.interaction.Modify({
                        features: new ol.Collection([feature]),
                        style: dragStyle,
                        pixelTolerance: 20
                    });

                    // Add the event to the drag and drop feature
                    dragInteraction.on('modifyend', function () {
                        var coordinate = feature.getGeometry().getCoordinates();
                        var transformed = ol.proj.transform(coordinate, _this.mapProjection, proj);
                        layer.changed();
                        if (options.onDrag) {
                            options.onDrag(transformed);
                        }
                    }, feature);

                    this.map.addInteraction(dragInteraction);
                }
                var id = this.idCounter;
                feature.setId(id);
                // remember the interactions to access them on remove by setting them as attributes
                feature.onRemove = options.onRemove;
                feature.removable = options.removable;
                feature.interaction = dragInteraction;
                this.idCounter++;
                layer.getSource().addFeature(feature);
                return id;
            }

            moveMarker(markerId, coordinates, options) {
                var options = options || {};
                var layername = options.layername || 'basic',
                    layer = this.layers[layername];
                var feature = layer.getSource().getFeatureById(markerId);
                var proj = options.projection || this.mapProjection;
                feature.setGeometry(new ol.geom.Point(this.toMapProjection(coordinates, proj)));
            }

            clearLayer(layername, options) {
                var options = options || {};
                var layer = this.layers[layername];
                if (options.types == null) {
                    layer.getSource().clear();
                } else {
                    var source = layer.getSource();
                    // iterate features of the layer and remove those that are in given types
                    source.getFeatures().forEach(function (feature) {
                        if (options.types.includes(feature.getGeometry().getType()))
                            source.removeFeature(feature);
                    })
                }
                if (layer.select) layer.select.getFeatures().clear();
            }

            removeLayer(layername) {
                var layer = this.layers[layername];
                this.map.removeLayer(layer)
                delete this.layers[layername];
            }

            removeInteractions() {
                var _this = this;
                this.map.getInteractions().forEach(function (interaction) {
                    if (interaction instanceof ol.interaction.Modify)
                        _this.map.removeInteraction(interaction);
                });
            }

            // get the layers the given feature is in
            getAssociatedLayers(feature) {
                var associated = [];
                var _this = this;
                Object.keys(this.layers).forEach(function (layername) {
                    var layer = _this.layers[layername];
                    if (layer.getSource().getFeatureById(feature.getId()) != null)
                        associated.push(layer);
                })
                return associated;
            }

            // event to remove marker
            removeFeatureEvent(obj) {
                var feature = obj.data.feature;
                if (feature.interaction != null) this.map.removeInteraction(feature.interaction);
                if (feature.onRemove != null) feature.onRemove();

                this.layers = this.getAssociatedLayers(feature);
                this.layers.forEach(function (layer) {
                    layer.getSource().removeFeature(feature);
                })
            }

            addContextMenu(contextmenuItems) {
                if (this.contextmenu != null)
                    this.map.removeControl(this.contextmenu);
                var contextmenu = new ContextMenu({
                    width: 180,
                    items: contextmenuItems
                });
                this.contextmenu = contextmenu;
                this.map.addControl(contextmenu);

                var removeFeatureItem = {
                    text: 'Remove',
                    classname: 'feature',
                    callback: this.removeFeatureEvent
                };

                var _this = this;
                contextmenu.on('open', function (evt) {
                    var feature = _this.map.forEachFeatureAtPixel(evt.pixel, ft => ft);

                    if (feature && feature.get('type') === 'removable' && feature.removable) {
                        contextmenu.clear();
                        removeFeatureItem.data = {
                            feature: feature
                        };
                        contextmenu.push(removeFeatureItem);
                    } else {
                        contextmenu.clear();
                        contextmenu.extend(contextmenuItems);
                        contextmenu.extend(contextmenu.getDefaultItems());
                    }
                });
            }

            centerOnPoint(coordinate, options) {
                var options = options || {};
                var zoom;
                if (options.projection)
                    coordinate = this.toMapProjection(coordinate, options.projection)
                if (options.extent) {
                    var extent = options.extent;
                    if (options.projection) {
                        var min = this.toMapProjection(extent.slice(0, 2), options.projection);
                        var max = this.toMapProjection(extent.slice(2, 4), options.projection);
                        extent = min.concat(max);
                    }
                    var resolution = this.view.getResolutionForExtent(extent);
                    zoom = this.view.getZoomForResolution(resolution);
                    var zoomOffset = options.zoomOffset || 0;
                    zoom += zoomOffset;
                }
                this.view.animate({
                    center: coordinate,
                    zoom: zoom
                }); //, {zoom: 10});
            }

            centerOnPolygon(polygon, options) {
                var options = options || {};
                var type = polygon.getType();
                var interior = (type == 'MultiPolygon') ? polygon.getInteriorPoints().getCoordinates()[0] : polygon.getInteriorPoint().getCoordinates();
                var centroid = interior.slice(0, 2);
                var extent = polygon.getExtent();
                options.extent = extent;
                this.centerOnPoint(centroid, options);
                return centroid;
            }

            centerOnCoordinates(coordinates, options) {
                var poly = new ol.geom.Polygon(coordinates);
                this.centerOnPolygon(poly, options);
            }

            centerOnLayer(layername) {
                var layer = this.layers[layername],
                    source = layer.getSource();

                this.map.getView().fit(source.getExtent(), this.map.getSize());
                //console.log(ol.proj.transform(this.map.getView().getCenter(), this.mapProjection, 'EPSG:4326'));
                //console.log(this.map.getView().getZoom());
            }

            toggleDrawing(layername, options) {
                var layer = this.layers[layername],
                    options = options || {},
                    type = options.type || 'None',
                    freehand = options.freehand;

                if (layer.drawingInteraction)
                    this.map.removeInteraction(layer.drawingInteraction);
                layer.drawingInteraction = null;
                if (type === 'None') return;

                // doesn't work with freehand, so not set atm
                function oneFingerCondition(olBrowserEvent) {
                    var touchEvent = olBrowserEvent.originalEvent.touches;
                    if (touchEvent)
                        return touchEvent.length === 1;
                    return true;
                }
                var drawIntersect = options.intersectionLayer && this.layers[options.intersectionLayer];

                var source = layer.getSource();

                // draw in a temporary source and add it to layer after intersecting
                // if intersection requested, draw directly on layer else
                if (drawIntersect) {
                    source = new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: source.getUrl(),
                        projection: source.getProjection()
                    })
                }
                var draw = new ol.interaction.Draw({
                    source: source,
                    type: type,
                    freehand: freehand
                });

                layer.drawingInteraction = draw;
                this.map.addInteraction(draw);
                if (drawIntersect) {
                    var intersectionLayer = this.layers[options.intersectionLayer],
                        geojsonFormat = new ol.format.GeoJSON();
                    draw.on('drawend', function (event) {
                        var poly1 = geojsonFormat.writeFeatureObject(event.feature),
                            extent1 = event.feature.getGeometry().getExtent(),
                            source = intersectionLayer.getSource(),
                            features = source.getFeatures();
                        features.forEach(function (feature) {
                            if (!ol.extent.intersects(extent1, feature.getGeometry().getExtent())) {
                                return;
                            }
                            var poly2 = geojsonFormat.writeFeatureObject(feature),
                                intersection;
                            try {
                                intersection = turf.intersect(poly1, poly2);
                            } catch (e) {
                                console.log(e);
                                _this.alert('Self-intersection in polygon. Please try again');
                            }
                            if (intersection) {
                                layer.getSource().addFeature(geojsonFormat.readFeature(intersection));
                            }
                        });
                        if (options.onDrawEnd) {
                            options.onDrawEnd(features);
                        }
                    });
                }

            }

            enableDragBox(layername, enabled) {
                var layer = this.layers[layername];
                if (!layer.select) return;
                if (enabled == null || enabled === true) {
                    // it's already there
                    if (layer.dragBox) return;
                    layer.dragBox = new ol.interaction.DragBox();
                    this.map.addInteraction(layer.dragBox);
                    layer.dragBox.on('boxend', function () {
                        var extent = layer.dragBox.getGeometry().getExtent();
                        layer.select.getFeatures().clear();
                        layer.getSource().forEachFeatureIntersectingExtent(extent, function (feature) {
                            layer.select.getFeatures().push(feature);
                            layer.select.dispatchEvent({
                                type: 'select',
                                selected: [feature],
                                deselected: []
                            });
                        });
                    });
                } else if (layer.dragBox) {
                    this.map.removeInteraction(layer.dragBox);
                    layer.dragBox = null;
                }
            }

            enableSelect(layername, enable) {
                var layer = this.layers[layername];
                if (!layer.select) return;
                if (enable === false) this.map.removeInteraction(layer.select);
                else this.map.addInteraction(layer.select);
            }

            removeSelectedFeatures(layername) {
                var layer = this.layers[layername],
                    source = layer.getSource();
                if (!layer.select) return;
                layer.select.getFeatures().forEach(function (feat) {
                    source.removeFeature(feat);
                })
                layer.select.getFeatures().clear();
            }

            getFeatures(layername) {
                var layer = this.layers[layername],
                    source = layer.getSource();
                return source.getFeatures();
            }

            getLayer(layername) {
                return this.layers[layername];
            }

            close() {
                this.map.setTarget(null);
                this.map = null;
                this.div.innerHTML = '';
            }
        };

        return Map;
    });