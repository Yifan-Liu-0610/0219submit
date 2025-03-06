mapboxgl.accessToken = "pk.eyJ1IjoiaXdhbml3YW5saXUiLCJhIjoiY202ampscGt2MDFsMjJqb2o2cGJjeW04OCJ9.xNgm_C4PfUixfEfQKSCbHA";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/iwaniwanliu/cm72nxsds009501s893og40ay",
    zoom: 13,
    center: [-73.845, 40.754],
    maxZoom: 18, // 允许更大缩放
    minZoom: 10, // 允许更小缩放
    maxBounds: [[-74.45, 40.45], [-73.55, 41]]
});

// 捕捉地图错误
map.on('error', function (e) {
    console.error('Map error:', e);
});

map.on('load', function () {
    let layers = map.getStyle().layers;
    let firstSymbolId, landuseLayerId, waterLayerId;

    // 获取层的 ID
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

    // 添加收入数据图层（Household Income Data）
    if (landuseLayerId && waterLayerId) {
        map.addLayer({
            'id': 'Household Income Data',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': 'data/medianIncome.geojson' // 🚨 确保路径正确
            },
            'paint': {
                'fill-color': [
                    'step', ['get', 'MHHI'],
                    '#ffffff', 20000, '#ccedf5',
                    50000, '#99daea',
                    75000, '#66c7e0',
                    100000, '#33b5d5',
                    150000, '#00a2ca'
                ],
                'fill-opacity': ['case', ['==', ['get', 'MHHI'], null], 0, 0.65]
            }
        }, waterLayerId);
    } else {
        console.error("❌ Household Income Data 未成功加载");
    }

    // 让收入图层可点击
    map.on('click', 'Household Income Data', function (e) {
        let income = e.features[0].properties.MHHI;
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h4>Median Household Income</h4><p>$${income}</p>`)
            .addTo(map);
    });

    map.on('mouseenter', 'Household Income Data', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'Household Income Data', function () {
        map.getCanvas().style.cursor = '';
    });

    // 添加公交站点图层（Bus Stops）
    map.addLayer({
        'id': 'Bus Stops',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': './data/nyct2020.geojson'  // 🚨 确保路径正确
        },
        'paint': {
            'circle-color': '#ff0000',
            'circle-radius': 5,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });

    // 让公交站点图层可点击
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

    // 让圈圈图层可点击
    map.on('click', 'turnstileData', function (e) {
        let entriesDiff = e.features[0].properties.ENTRIES_DIFF;
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<h4>Turnstile Data</h4><p>Entries Change: ${Math.round(entriesDiff * 1000) / 10}%</p>`)
            .addTo(map);
    });

    map.on('mouseenter', 'turnstileData', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'turnstileData', function () {
        map.getCanvas().style.cursor = '';
    });

    // 添加图层切换菜单
    var toggleableLayerIds = ['MTA Station Data', 'Household Income Data', 'Bus Stops', 'turnstileData'];

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
