mapboxgl.accessToken = 'pk.eyJ1IjoiaXdhbml3YW5saXUiLCJhIjoiY202ampscGt2MDFsMjJqb2o2cGJjeW04OCJ9.xNgm_C4PfUixfEfQKSCbHA';

const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/light-v11', // 你的 Mapbox Studio 自定义样式
    center: [-98, 38.88], 
    zoom: 3,
    minZoom: 2
});

const zoomThreshold = 4; // 设定 zoom 级别阈值

map.on('load', () => {
    // **州级失业率数据源**
    map.addSource('state-unemployment', {
        'type': 'geojson',
        'data': 'us-state-unemployment.geojson' // 确保这个文件能被正确加载
    });

    // **县级失业率数据源**
    map.addSource('county-unemployment', {
        'type': 'geojson',
        'data': './us-county-unemployment.geojson' // 确保这个文件能被正确加载
    });

    // **州级失业率图层**
    map.addLayer({
        'id': 'state-unemployment-layer',
        'source': 'state-unemployment',
        'maxzoom': zoomThreshold,
        'type': 'fill',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'Unemployment Rate'],
                0, '#f0f9e8',   // 失业率最低 - 浅绿
                2, '#bae4bc',
                4, '#7bccc4',
                6, '#43a2ca',
                8, '#0868ac',
                10, '#084081'    // 失业率最高 - 深蓝
            ],
            'fill-opacity': 0.75
        }
    });

    // **县级失业率图层**
    map.addLayer({
        'id': 'county-unemployment-layer',
        'source': 'county-unemployment',
        'minzoom': zoomThreshold,
        'type': 'fill',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'Unemployment Rate'],
                0, '#f7fcfd',   // 失业率最低 - 浅蓝
                2, '#deebf7',
                4, '#c6dbef',
                6, '#9ecae1',
                8, '#6baed6',
                10, '#3182bd',
                12, '#08519c'   // 失业率最高 - 深蓝
            ],
            'fill-opacity': 0.75
        }
    });
});

// 处理图例切换
const stateLegendEl = document.getElementById('state-legend');
const countyLegendEl = document.getElementById('county-legend');

map.on('zoom', () => {
    if (map.getZoom() > zoomThreshold) {
        stateLegendEl.style.display = 'none';
        countyLegendEl.style.display = 'block';
    } else {
        stateLegendEl.style.display = 'block';
        countyLegendEl.style.display = 'none';
    }
});

