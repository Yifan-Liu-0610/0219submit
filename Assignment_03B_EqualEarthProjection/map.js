mapboxgl.accessToken = 'pk.eyJ1IjoiaXdhbml3YW5saXUiLCJhIjoiY202ampscGt2MDFsMjJqb2o2cGJjeW04OCJ9.xNgm_C4PfUixfEfQKSCbHA';

const map = new mapboxgl.Map({
    container: 'map', // 地图容器的 ID
    style: 'mapbox://styles/iwaniwanliu/cm72o67st009z01s399uzaxbe', // 地图样式
    center: [0, 20], // 让地图居中显示全球
    zoom: 1, // 缩放级别
    projection: 'mercator' // **使用等面积投影（Equitable Projection）**
});

let popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: true }); // 创建弹出框实例

map.on('load', () => {
    // **加载全球人口数据**
    map.addSource('population', {
        type: 'geojson',
        data: '../Assignment_03A_GlobeProjection/global_population.geojson' // 确保文件路径正确
    });

    // **添加全球人口可视化图层**
    map.addLayer({
        id: 'population-layer',
        type: 'fill',
        source: 'population',
        paint: {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', '2023'], // 以2023年人口为依据
                0, '#f2f0f7',      // < 1M
                1000000, '#cbc9e2', // 1M - 5M
                5000000, '#6a51a3', // ≥ 5M （深色）
            ],
            'fill-opacity': 0.7,
            'fill-outline-color': '#FFFFFF'
        }
    });

    // **点击国家时显示人口信息**
    map.on('click', 'population-layer', (e) => {
        const country = e.features[0].properties["Country Name"];
        const population = e.features[0].properties["2023"];

        popup
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${country}</strong><br>Population: ${population.toLocaleString()}`)
            .addTo(map);
    });

    // **鼠标悬浮时变成手型，提示用户可以点击**
    map.on('mouseenter', 'population-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // **鼠标移开时恢复默认指针**
    map.on('mouseleave', 'population-layer', () => {
        map.getCanvas().style.cursor = '';
    });
});
