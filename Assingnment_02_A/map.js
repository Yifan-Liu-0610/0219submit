mapboxgl.accessToken = "pk.eyJ1IjoiaXdhbml3YW5saXUiLCJhIjoiY202ampscGt2MDFsMjJqb2o2cGJjeW04OCJ9.xNgm_C4PfUixfEfQKSCbHA";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/iwaniwanliu/cm7ea86k600g301qvgcnu3yjg",
    zoom: 13,
    center: [-73.845, 40.754],
    maxZoom: 18,
    minZoom: 10,
    maxBounds: [[-74.45, 40.45], [-73.55, 41]]
});

map.on('error', function (e) {
    console.error('Map error:', e);
});

map.on('load', function () {
    let layers = map.getStyle().layers;
    let firstSymbolId, landuseLayerId, waterLayerId;

    for (let layer of layers) {
        if (layer.type === 'symbol' && !firstSymbolId) {
            firstSymbolId = layer.id;
        }
        if (layer.id.includes('landuse')) {
            landuseLayerId = layer.id;
        }
        if (layer.id.includes('water') && !waterLayerId) {
            waterLayerId = layer.id;
        }
    }

    console.log("Landuse Layer:", landuseLayerId);
    console.log("Water Layer:", waterLayerId);
    console.log("First Symbol Layer:", firstSymbolId);

    // 添加 Parks Properties 图层（绿色）
    map.addLayer({
        'id': 'Parks Properties',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': './data/Parks_Properties.geojson'
        },
        'paint': {
            'fill-color': '#4CAF50',
            'fill-opacity': 0.4,
            'fill-outline-color': '#2E7D32'
        }
    }, firstSymbolId);

    // 添加 NYC Parks Structures 图层（蓝色）
    map.addLayer({
        'id': 'NYC Parks Structures',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': './data/NYC_Parks_Structures.geojson'
        },
        'paint': {
            'fill-color': '#00a2ca',
            'fill-opacity': 0.5,
            'fill-outline-color': '#004f66'
        }
    }, firstSymbolId);

    map.on('click', 'NYC Parks Structures', function (e) {
        let props = e.features[0].properties;
        let html = '<h4>Structure Info</h4><ul>';
        for (let key in props) {
            html += `<li><strong>${key}:</strong> ${props[key]}</li>`;
        }
        html += '</ul>';
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
    });

    map.on('mouseenter', 'NYC Parks Structures', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'NYC Parks Structures', function () {
        map.getCanvas().style.cursor = '';
    });

    map.on('click', 'Parks Properties', function (e) {
        let props = e.features[0].properties;
        let html = '<h4>Park Property Info</h4><ul>';
        for (let key in props) {
            html += `<li><strong>${key}:</strong> ${props[key]}</li>`;
        }
        html += '</ul>';
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
    });

    map.on('mouseenter', 'Parks Properties', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'Parks Properties', function () {
        map.getCanvas().style.cursor = '';
    });

        // 添加圈圈图层（Turnstile Data）
        map.addLayer({
            'id': 'turnstileData',
            'type': 'circle',
            'source': {
                'type': 'geojson',
                'data': 'data/turnstileData.geojson'  // 🚨 确保路径正确
            },
            'paint': {
                'circle-color': ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
                    -1, '#ff4400',
                    -0.7, '#ffba31',
                    -0.4, '#ffffff'
                ],
                'circle-stroke-color': '#4d4d4d',
                'circle-stroke-width': 0.5,
                'circle-radius': ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
                    -1, 10,
                    -0.4, 1
                ]
            }
        }, firstSymbolId);

    map.on('click', 'Bus Stops', function (e) {
        let stopName = e.features[0].properties.stop_name;
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h4>Bus Stop</h4><p>${stopName}</p>`)
            .addTo(map);
    });

    map.on('mouseenter', 'Bus Stops', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'Bus Stops', function () {
        map.getCanvas().style.cursor = '';
    });

    // 图层切换菜单
    var toggleableLayerIds = ['NYC Parks Structures', 'Parks Properties', 'Bus Stops'];

    for (var id of toggleableLayerIds) {
        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = id;

        link.onclick = function (e) {
            var clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();

            if (map.getLayer(clickedLayer)) {
                var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
                if (visibility === 'visible') {
                    map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                    this.className = '';
                } else {
                    this.className = 'active';
                    map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                }
            } else {
                console.error(`❌ 图层 ${clickedLayer} 不存在`);
            }
        };

        var menu = document.getElementById('menu');
        if (menu) {
            menu.appendChild(link);
        } else {
            console.error("❌ Menu div not found!");
        }
    }
});
