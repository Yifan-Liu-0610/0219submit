mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // 替换为你的 Mapbox 访问令牌

const map = new mapboxgl.Map({
    container: 'map', // 地图容器的 ID
    style: 'mapbox://styles/mapbox/light-v10', // 你可以换成其他 Mapbox 样式
    center: [0, 20], // 让地图居中（世界视角）
    zoom: 2
});

map.on('load', () => {
    // 加载 GeoJSON 数据
    map.addSource('population', {
        type: 'geojson',
        data: './global_population.geojson'
    });

    // 添加地图图层
    map.addLayer({
        id: 'population-layer',
        type: 'fill',
        source: 'population',
        paint: {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', '2023'], // 以2023年人口为依据
                1000000, '#f2f0f7',
                5000000, '#cbc9e2',
                10000000, '#9e9ac8',
                50000000, '#6a51a3',
                1000000000, '#3f007d'
            ],
            'fill-opacity': 0.7,
            'fill-outline-color': '#FFFFFF'
        }
    });

    // 添加鼠标悬停交互效果
    map.on('mousemove', 'population-layer', (e) => {
        const country = e.features[0].properties["Country Name"];
        const population = e.features[0].properties["2023"];

        map.getCanvas().style.cursor = 'pointer';

        // 显示浮动信息框
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${country}</strong><br>Population: ${population.toLocaleString()}`)
            .addTo(map);
    });

    // 鼠标移开时恢复
    map.on('mouseleave', 'population-layer', () => {
        map.getCanvas().style.cursor = '';
    });
});
