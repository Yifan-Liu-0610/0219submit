mapboxgl.accessToken = "pk.eyJ1IjoiaXdhbml3YW5saXUiLCJhIjoiY202ampscGt2MDFsMjJqb2o2cGJjeW04OCJ9.xNgm_C4PfUixfEfQKSCbHA";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/iwaniwanliu/cm6p9kybr002z01qr29j68l7e",
    zoom: 10,
    center: [-74, 40.725],
    maxZoom: 15,
    minZoom: 8,
    maxBounds: [[-74.45, 40.45], [-73.55, 41]]
});

map.on('load', function () {
    let layers = map.getStyle().layers;
    let firstSymbolId, landuseLayerId, waterLayerId;

    // 找出 landuse、water 和 symbol 层的 ID
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && !firstSymbolId) {
            firstSymbolId = layers[i].id;
        }
        if (layers[i].id.includes('landuse')) {
            landuseLayerId = layers[i].id;
        }
        if (layers[i].id.includes('water') && !waterLayerId) {
            waterLayerId = layers[i].id;
        }
    }

    console.log("Landuse Layer:", landuseLayerId);
    console.log("Water Layer:", waterLayerId);
    console.log("First Symbol Layer:", firstSymbolId);

    // 添加收入数据图层，放置在 landuse 和 water 之间
    if (landuseLayerId && waterLayerId) {
        map.addLayer({
            'id': 'Household Income Data',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': 'data/medianIncome.geojson'
            },
            'paint': {
                'fill-color': ['step', ['get', 'MHHI'],
                    '#ffffff',
                    20000, '#ccedf5',
                    50000, '#99daea',
                    75000, '#66c7e0',
                    100000, '#33b5d5',
                    150000, '#00a2ca'
                ],
                'fill-opacity': ['case', ['==', ['get', 'MHHI'], null], 0, 0.65]
            }
        }, waterLayerId);
    }

    // 添加地铁站数据图层
    map.addLayer({
        'id': 'MTA Station Data',
        'type': 'circle',
        'source': {
            'type': 'geojson',
            'data': 'data/turnstileData.geojson'
        },
        'paint': {
            'circle-color': ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
                -1, '#ff4400',
                -0.7, '#ffba31',
                -0.4, '#ffffff'
            ],
            'circle-stroke-color': '#4d4d4d',
            'circle-stroke-width': 0.5,
            'circle-radius': ['interpolate', ['exponential', 2], ['zoom'],
                10, ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
                    -1, 10,
                    -0.4, 1
                ],
                15, ['interpolate', ['linear'], ['get', 'ENTRIES_DIFF'],
                    -1, 25,
                    -0.4, 12
                ]
            ],
        }
    }, firstSymbolId);
});

// 创建弹出窗口
map.on('click', 'MTA Station Data', function (e) {
    let entriesDiff = e.features[0].properties.ENTRIES_DIFF;
    let entries_06 = e.features[0].properties.ENTRIES_06;
    let entries_20 = e.features[0].properties.ENTRIES_20;
    let stationName = e.features[0].properties.stationName;
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<h4>${stationName}</h4>
            <p><b>Friday, March 6th:</b> ${entries_06} entries<br>
            <b>Friday, March 20th:</b> ${entries_20} entries<br>
            <b>Change:</b> ${Math.round(entriesDiff * 1000) / 10}%</p>`)
        .addTo(map);
});

// 鼠标进入、离开时改变光标
map.on('mouseenter', 'MTA Station Data', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'MTA Station Data', function () {
    map.getCanvas().style.cursor = '';
});

// 添加图层切换菜单
var toggleableLayerIds = ['MTA Station Data', 'Household Income Data'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var menu = document.getElementById('menu');
    if (menu) {
        menu.appendChild(link);
    } else {
        console.error("Menu div not found!");
    }
}
