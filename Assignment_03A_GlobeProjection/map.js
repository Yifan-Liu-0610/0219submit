mapboxgl.accessToken = 'pk.eyJ1IjoiaXdhbml3YW5saXUiLCJhIjoiY202ampscGt2MDFsMjJqb2o2cGJjeW04OCJ9.xNgm_C4PfUixfEfQKSCbHA';

const map = new mapboxgl.Map({
    container: 'map', // 地图容器的 ID
    style: 'mapbox://styles/iwaniwanliu/cm7cm1ngv003e01qo4zqzescx', // 地图样式
    center: [-73.94, 40.70], // 纽约市的经纬度
    zoom: 1 // 缩放级别
});

let popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: true }); // 创建弹出框实例

map.on('load', () => {
    // 加载全球人口数据
    map.addSource('population', {
        type: 'geojson',
        data: './global_population.geojson' // 确保文件路径正确
    });

    // 添加人口可视化图层
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

    // 点击国家时显示信息框
    map.on('click', 'population-layer', (e) => {
        const country = e.features[0].properties["Country Name"];
        const population = e.features[0].properties["2023"];

        popup
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${country}</strong><br>Population: ${population.toLocaleString()}`)
            .addTo(map);
    });

    // 鼠标悬浮时变成手型（提示可以点击）
    map.on('mouseenter', 'population-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // 鼠标离开时恢复默认指针
    map.on('mouseleave', 'population-layer', () => {
        map.getCanvas().style.cursor = '';
    });
});
