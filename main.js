document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('songs_normalize.json');
    const data = await response.json();
    console.log("Data Loaded:", data);

    const metricSelect = document.getElementById('metricSelect');
    const chartTypeSelect = document.getElementById('chartType');
    const mainCtx = document.getElementById('mainChart').getContext('2d');

    let mainChart;

    function renderChart(metric, chartType) {
        if (chartType === 'scatter') {
            if (mainChart) mainChart.destroy();

            mainChart = new Chart(mainCtx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Songs',
                        data: data.map(d => ({
                            x: d.energy ?? 0,
                            y: d.danceability ?? 0,
                            title: d.song || '(No Title)',
                            artist: d.artist || '(Unknown Artist)'
                        })),
                        backgroundColor: 'rgba(59,130,246,0.7)',
                        borderColor: 'rgba(59,130,246,1)',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: 'Energy vs Danceability (Scatter Plot)', color: '#1e293b', font: { size: 18, weight: '600' } },
                        tooltip: { 
                            callbacks: {
                                label: ctx => `${ctx.raw.title} — ${ctx.raw.artist}`
                            },
                            backgroundColor: '#1e293b',
                            titleColor: '#f8fafc',
                            bodyColor: '#f8fafc'
                        },
                        legend: { display: false }
                    },
                    scales: {
                        x: { title: { display: true, text: 'Energy', color: '#334155' }, min: 0, max: 1 },
                        y: { title: { display: true, text: 'Danceability', color: '#334155' }, min: 0, max: 1 }
                    }
                }
            });
            return;
        }

        // Untuk Bar / Line
        const sorted = [...data].sort((a, b) => b[metric] - a[metric]);
        const top = sorted.slice(0, 10);

        const labels = top.map(d => `${d.song || "(No Title)"} — ${d.artist || "(Unknown Artist)"}`);
        const values = top.map(d => d[metric]);

        if (mainChart) mainChart.destroy();

        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;
        const suggestedMin = Math.max(minValue - range * 0.3, 0);
        const suggestedMax = maxValue * 1.05;

        mainChart = new Chart(mainCtx, {
            type: chartType,
            data: {
                labels,
                datasets: [{
                    label: metric.toUpperCase(),
                    data: values,
                    backgroundColor: [
                        '#3b82f6','#8b5cf6','#ef4444','#22c55e','#f59e0b',
                        '#06b6d4','#a855f7','#ec4899','#10b981','#f97316'
                    ],
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    fill: chartType === 'line' ? false : true,
                    tension: chartType === 'line' ? 0.4 : 0
                }]
            },
            options: {
                indexAxis: chartType === 'bar' ? 'y' : 'x',
                responsive: true,
                maintainAspectRatio: false,
                scales: chartType === 'pie' ? {} : {
                    x: { beginAtZero: false, suggestedMin, suggestedMax, ticks: { color: '#334155' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                    y: { beginAtZero: false, suggestedMin, suggestedMax, ticks: { color: '#334155' }, grid: { color: 'rgba(0,0,0,0.05)' } }
                },
                plugins: {
                    title: { display:true, text:`Top 10 Lagu berdasarkan ${metric}`, color:'#1e293b', font:{ size:18, weight:'600' } },
                    legend: { display: chartType === 'pie' },
                    tooltip: { backgroundColor:'#1e293b', titleColor:'#f8fafc', bodyColor:'#f8fafc' }
                },
                animation: { duration: 900, easing: 'easeInOutQuart' }
            }
        });
    }

    // Default chart
    renderChart('popularity', 'bar');

    metricSelect.addEventListener('change', () => renderChart(metricSelect.value, chartTypeSelect.value));
    chartTypeSelect.addEventListener('change', () => renderChart(metricSelect.value, chartTypeSelect.value));
});
