mapboxgl.accessToken = 'pk.eyJ1IjoiaXdhbml3YW5saXUiLCJhIjoiY202ampscGt2MDFsMjJqb2o2cGJjeW04OCJ9.xNgm_C4PfUixfEfQKSCbHA';

const map = new mapboxgl.Map({
    container: 'map', // 地图容器的 ID
    style: 'mapbox://styles/iwaniwanliu/cm7cm1ngv003e01qo4zqzescx', // 地图样式
    center: [-73.94, 40.70], // 纽约市的经纬度
    zoom: 1 // 缩放级别
});

map.on('load', () => {
    // 获取树木数据
    fetch('https://data.cityofnewyork.us/resource/uvpi-gqnh.json?$limit=5000') // 仅获取前 1000 条记录进行测试
        .then(response => response.json())
        .then(data => {
            // 将数据转换为 GeoJSON 格式
            const geojson = {
                type: 'FeatureCollection',
                features: data.map(tree => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(tree.longitude), parseFloat(tree.latitude)]
                    },
                    properties: {
                        species: tree.spc_common,
                        health: tree.health,
                        // 添加其他需要的属性
                    }
                }))
            };

            // 在地图中添加数据源
            map.addSource('trees', {
                type: 'geojson',
                data: geojson
            });

            // 在地图中添加图层
            map.addLayer({
                id: 'trees-layer',
                type: 'circle',
                source: 'trees',
                paint: {
                    'circle-radius': 4,
                    'circle-color': [
                        'match',
                        ['get', 'health'],
                        'Good', '#00FF00',
                        'Fair', '#FFFF00',
                        'Poor', '#FF0000',
                        /* other */ '#000000'
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#FFFFFF'
                }
            });

            // 添加弹出框
            map.on('click', 'trees-layer', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const species = e.features[0].properties.species;
                const health = e.features[0].properties.health;

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<strong>Species:</strong> ${species}<br><strong>Health:</strong> ${health}`)
                    .addTo(map);
            });

            // 更改鼠标指针样式
            map.on('mouseenter', 'trees-layer', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'trees-layer', () => {
                map.getCanvas().style.cursor = '';
            });
        })
        .catch(error => console.error('Error fetching tree data:', error));
});
