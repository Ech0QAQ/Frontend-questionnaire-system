// 将图表初始化逻辑分离出来
function initCharts() {
    const colorPalette = [
        '#FCBBCF',
        '#C4B4E1',
        '#80CBF2',
        '#87e885',
        '#FFEC71',
        '#FFC37B',
        '#e88282',
    ];

    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        const chartData = JSON.parse(container.dataset.chartData);
        const chart = echarts.init(container);
        
        let options;
        
        switch(chartData.type) {
            case 'radio':
                options = {
                    color: colorPalette,  // 设置颜色
                    title: {
                        text: '选项统计',
                        left: 'center',
                        textStyle: {
                            color: '#333'
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                            const optionText = chartData.optionTexts[params[0].name];
                            return `${params[0].name}. ${optionText}<br/>
                                    选择人数：${params[0].value}人<br/>
                                    占比：${((params[0].value/chartData.totalResponses)*100).toFixed(1)}%`;
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: Object.keys(chartData.data),
                        axisLabel: {
                            interval: 0,
                            color: '#666'
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: '选择人数',
                        minInterval: 1,
                        axisLabel: {
                            color: '#666'
                        }
                    },
                    series: [{
                        data: Object.values(chartData.data).map((value, index) => ({
                            value: value,
                            itemStyle: {
                                color: colorPalette[index % colorPalette.length]
                            }
                        })),
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: function(params) {
                                return `${params.value}人\n(${((params.value/chartData.totalResponses)*100).toFixed(1)}%)`;
                            },
                            color: '#333'
                        }
                    }]
                };
                break;
                
            case 'checkbox':
                options = {
                    color: colorPalette,
                    title: {
                        text: '选项分布',
                        left: 'center',
                        textStyle: {
                            color: '#333'
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function(params) {
                            const optionText = chartData.optionTexts[params.name];
                            return `${params.name}. ${optionText}<br/>
                                    选择人数：${params.value}人<br/>
                                    占比：${params.percent}%`;
                        }
                    },
                    legend: {
                        orient: 'horizontal',
                        left: 'center',
                        bottom: '0',
                        formatter: function(name) {
                            return `${name}. ${chartData.optionTexts[name]}`;
                        },
                        textStyle: {
                            color: '#666'
                        }
                    },
                    series: [{
                        type: 'pie',
                        radius: '65%',
                        center: ['50%', '45%'],
                        data: Object.entries(chartData.data).map(([name, value], index) => ({
                            name,
                            value,
                            itemStyle: {
                                color: colorPalette[index % colorPalette.length]
                            }
                        })),
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        label: {
                            formatter: '{b}: {c}人\n({d}%)',
                            color: '#333'
                        }
                    }]
                };
                break;
                
            case 'text':
                options = {
                    color: ['#5470c6', '#91cc75'],  // 使用蓝色和绿色
                    title: {
                        text: '回答情况统计',
                        left: 'center',
                        textStyle: {
                            color: '#333'
                        }
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: Object.keys(chartData.data),
                        axisLabel: {
                            interval: 0,
                            rotate: 30,
                            color: '#666'
                        }
                    },
                    yAxis: {
                        type: 'value',
                        name: '回答数量',
                        minInterval: 1,
                        axisLabel: {
                            color: '#666'
                        }
                    },
                    series: [{
                        data: Object.values(chartData.data).map((value, index) => ({
                            value: value,
                            itemStyle: {
                                color: colorPalette[index % 2]  // 交替使用两种颜色
                            }
                        })),
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.1)'
                        },
                        label: {
                            show: true,
                            position: 'top',
                            color: '#333'
                        }
                    }]
                };
                break;
        }
        
        chart.setOption(options);
        
        window.addEventListener('resize', () => {
            chart.resize();
        });
    });
}

function viewSurvey() {
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses')) || {};
    const currentSurveyResponses = allResponses[surveyData.id] || [];
    const surveyDisplay = document.getElementById('surveyDisplay');
    const titleElement = document.getElementById('surveyTitle');

    surveyDisplay.innerHTML = '';

    if (surveyData) {
        titleElement.textContent = surveyData.title || '查看该问卷';
    
        surveyData.questions.forEach((q, index) => {
            let questionDiv = document.createElement('div');
            questionDiv.className = 'question-container';
            
            questionDiv.innerHTML = `
                <p>${index + 1}. <strong>${q.question}</strong></p>
                <div class="answer">
            `;
    
            if (q.options && q.options.length > 1) {
                // 先显示选项列表
                const optionsHtml = `
                    <div class="options-list">
                        ${q.options.map((opt, idx) => `
                            <div class="option-item">
                                <input type="${q.type === 'radio' ? 'radio' : 'checkbox'}" 
                                       name="question${index}" 
                                       value="${String.fromCharCode(65 + idx)}"
                                       disabled>
                                ${String.fromCharCode(65 + idx)}. ${opt.text}
                            </div>
                        `).join('')}
                    </div>
                `;

                questionDiv.querySelector('.answer').innerHTML = optionsHtml;

                // 统计答案
                const optionCounts = {};
                q.options.forEach((opt, idx) => {
                    optionCounts[String.fromCharCode(65 + idx)] = 0;
                });

                currentSurveyResponses.forEach(surveyResponse => {
                    if (surveyResponse.answers && surveyResponse.answers[index]) {
                        const answer = surveyResponse.answers[index];
                        if (answer.response) {
                            answer.response.forEach(optionLetter => {
                                if (optionCounts.hasOwnProperty(optionLetter)) {
                                    optionCounts[optionLetter]++;
                                }
                            });
                        }
                    }
                });

                // 创建图表
                createChart(questionDiv.querySelector('.answer'), {
                    type: q.type === 'radio' ? 'radio' : 'checkbox',
                    data: optionCounts,
                    totalResponses: currentSurveyResponses.length,
                    optionTexts: q.options.reduce((acc, opt, idx) => {
                        acc[String.fromCharCode(65 + idx)] = opt.text;
                        return acc;
                    }, {})
                });
            } else {
                // 文本题显示
                questionDiv.querySelector('.answer').innerHTML += `
                    <textarea class="length" rows="1" cols="50" placeholder="你的看法..." readonly></textarea>
                    <br>
                    <label>
                        <input type="checkbox" ${q.isRequired ? 'checked' : ''} disabled/> 此题是否必填
                    </label>
                `;

                // 文本题统计
                let validAnswers = 0;
                let invalidAnswers = 0;

                currentSurveyResponses.forEach(surveyResponse => {
                    if (surveyResponse.answers && surveyResponse.answers[index]) {
                        const answer = surveyResponse.answers[index];
                        if (answer.response && answer.response.trim() !== '') {
                            validAnswers++;
                        } else {
                            invalidAnswers++;
                        }
                    }
                });

                // 创建文本题图表
                createChart(questionDiv.querySelector('.answer'), {
                    type: 'text',
                    data: {
                        '有效回答': validAnswers,
                        '无效回答': invalidAnswers
                    }
                });
            }
    
            questionDiv.querySelector('.answer').innerHTML += '</div>';
            surveyDisplay.appendChild(questionDiv);
        });
    } else {
        surveyDisplay.innerHTML = '<p>没有找到问卷数据！</p>';
        titleElement.textContent = '没有问卷可查看';
    }
}

// 统一的图表创建函数
function createChart(container, chartData) {
    const chartWrapper = document.createElement('div');
    chartWrapper.id = 'chartWrapper';  // 添加id
    
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.style.cssText = `
        width: 500px;
        height: 250px;
        border: 1px solid #ddd;
    `;
    
    chartContainer.dataset.chartData = JSON.stringify(chartData);
    chartWrapper.appendChild(chartContainer);
    container.appendChild(chartWrapper);
}

// 页面加载完成后执行
window.onload = function() {
    viewSurvey();
    // 等待DOM渲染完成后初始化图表
    requestAnimationFrame(() => {
        setTimeout(initCharts, 100);
    });
};

// 窗口大小改变时重绘图表
window.addEventListener('resize', function() {
    const charts = document.querySelectorAll('.chart-item');
    charts.forEach((chartDiv, index) => {
        const chart = echarts.getInstanceByDom(chartDiv);
        if (chart) {
            chart.resize();
        }
    });
});

function ret(){
    window.location.href ="../1-首页（问卷列表）/1-首页（问卷列表）.html";
}

function generateCharts() {
    const surveyData = JSON.parse(localStorage.getItem('surveyData'));
    const allResponses = JSON.parse(localStorage.getItem('surveyResponses')) || {};
    const currentSurveyResponses = allResponses[surveyData.id] || [];
    
    if (!surveyData || !currentSurveyResponses.length) return;

    surveyData.questions.forEach((question, qIndex) => {
        if (question.options && question.options.length > 1) {
            // 找到对应问题的answer div
            const answerDiv = document.querySelector(`div:has(p:contains("${qIndex + 1}. ${question.question}")) .answer`);
            if (!answerDiv) return;

            // 创建图表容器
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-container';
            chartContainer.style.width = '100%';
            chartContainer.style.height = '300px';
            chartContainer.style.marginTop = '20px';
            
            // 将图表容器添加到answer div的末尾
            answerDiv.appendChild(chartContainer);

            // 初始化选项计数
            const optionCounts = {};
            question.options.forEach(opt => {
                optionCounts[opt.text] = 0;
            });

            // 统计答案
            currentSurveyResponses.forEach(response => {
                const answer = response.answers[qIndex];
                if (answer && answer.response) {
                    answer.response.forEach(selected => {
                        if (optionCounts.hasOwnProperty(selected)) {
                            optionCounts[selected]++;
                        }
                    });
                }
            });

            // 初始化图表
            const chart = echarts.init(chartContainer);
            
            // 准备图表数据
            const options = {
                title: {
                    text: '答案统计',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: Object.keys(optionCounts),
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '选择人数'
                },
                series: [{
                    data: Object.values(optionCounts),
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    },
                    label: {
                        show: true,
                        position: 'top'
                    }
                }]
            };

            // 设置图表配置
            chart.setOption(options);

            // 添加响应式支持
            window.addEventListener('resize', () => {
                chart.resize();
            });

            // 添加统计信息
            const totalResponses = currentSurveyResponses.length;
            const statsDiv = document.createElement('div');
            statsDiv.style.marginTop = '10px';
            statsDiv.style.textAlign = 'center';
            statsDiv.innerHTML = `
                <p>总回答人数: ${totalResponses}</p>
                <p>选项分布:</p>
                ${Object.entries(optionCounts).map(([option, count]) => 
                    `<p>${option}: ${count}人 (${((count/totalResponses)*100).toFixed(1)}%)</p>`
                ).join('')}
            `;
            answerDiv.appendChild(statsDiv);
        }
    });
}